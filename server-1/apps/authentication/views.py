from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import * 
from rest_framework.decorators import api_view, permission_classes
from django.db import transaction
from rest_framework.authtoken.models import Token
from django.db.models import Q
from django.contrib.auth.models import User
from django.conf import settings
import logging
from django.http import JsonResponse
from supabase import create_client
from apps.account.models import Account
from apps.profiling.models import ResidentProfile, BusinessRespondent
from apps.administration.models import Staff, Assignment
from .serializers import UserAccountSerializer
from utils.supabase_client import supabase
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import check_password 

logger = logging.getLogger(__name__)

class SignupView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            username = request.data.get('username')
            resident_id = request.data.get('resident_id')
            br = request.data.get('br')

            if not email or not password:
                return Response(
                    {'error': 'Both email and password are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Checking if account already exists in local database
            if Account.objects.filter(email=email).exists():
                return Response(
                    {'error': 'Account with this email already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate resident_id if provided
            resident_profile = None
            if resident_id:
                try:
                    resident_profile = ResidentProfile.objects.get(rp_id=resident_id)
                except ResidentProfile.DoesNotExist:
                    return Response(
                        {'error': 'Invalid resident ID provided'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            # Validate business respondent id if provided
            business_respondent = None
            if br:
                try:
                   business_respondent = BusinessRespondent.objects.get(br_id=br)
                except Exception as e:
                    return Response(
                        {'error': 'Invalid business respondent ID provided'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            try:
                # Create user in Supabase
                supabase_response = supabase.auth.sign_up({
                    "email": email,
                    "password": password,
                    "options": {
                        "data": {
                            "username": username or email.split('@')[0],
                            "resident_id": resident_id
                        }
                    }
                })
                
                if supabase_response.user is None:
                    return Response(
                        {'error': 'Failed to create user account'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                with transaction.atomic():
                    # Create account in local database
                    account = Account.objects.create(
                        email=email,
                        username=username or email.split('@')[0],
                        supabase_id=supabase_response.user.id,  # Store Supabase ID
                        rp=resident_profile,
                        br=business_respondent
                    )

                # Check if email confirmation is required
                requires_confirmation = not supabase_response.session
                
                if requires_confirmation:
                    return Response({
                        'message': 'Account created successfully. Please check your email for confirmation.',
                        'requiresConfirmation': True,
                        'user_id': account.acc_id
                    }, status=status.HTTP_201_CREATED)
                else:
                    # If no confirmation required, return user data
                    serializer = UserAccountSerializer(account)
                    return Response({
                        'message': 'Account created successfully',
                        'user': serializer.data,
                        'requiresConfirmation': False,
                        'access_token': supabase_response.session.access_token if supabase_response.session else None
                    }, status=status.HTTP_201_CREATED)

            except Exception as supabase_error:
                logger.error(f"Supabase signup failed: {str(supabase_error)}")
                return Response(
                    {'error': 'Failed to create user account'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            logger.error(f"Signup error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Account creation failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
class MobileLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            if not email or not password:
                return Response(
                    {'error': 'Both email and password are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                supabase_response = supabase.auth.sign_in_with_password({
                    "email": email,
                    "password": password
                })
                supabase_user = supabase_response.user
                if not supabase_user:
                    return Response(
                        {'error': 'Invalid credentials'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
            except Exception as supabase_error:
                logger.error(f"Supabase authentication failed: {str(supabase_error)}")
                return Response(
                    {'error': 'Authentication failed'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Check if account exists in local database
            account = Account.objects.filter(email=email).first()
            
            if not account:
                return Response(
                    {'error': 'Account not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = UserAccountSerializer(account)

            return Response({
                'user': serializer.data,
                'access_token': supabase_response.session.access_token,
                'message': 'Login successful',
                'supabase_token': supabase_response.session.access_token
            })

        except Exception as e:
            logger.error(f"Login error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Authentication failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
            
class WebLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            logger.info("WebLoginView called")
            email = request.data.get('email')
            password = request.data.get('password')
            if not email or not password:
                return Response(
                    {'error': 'Both email and password are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                supabase_response = supabase.auth.sign_in_with_password({
                    "email": email,
                    "password": password
                })
                supabase_user = supabase_response.user          
            except Exception as supabase_error:
                logger.error(f"Supabase authentication failed: {str(supabase_error)}")
                return Response(
                    {'error': 'Email not found in the system or invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Check if account exists in local database
            account = Account.objects.filter(email=supabase_user.email).first()
            
            if not account:
                return Response(
                    {'error': 'Account not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = UserAccountSerializer(account)
            if not serializer.data.get('resident'):
                return Response(
                    {'error': "Resident Profile Required"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            staff_data = serializer.data.get('staff')
            if not staff_data:
                # Staff data is None, now check why specifically
                rp = getattr(account, 'rp', None)
                if rp:
                    staff_record = Staff.objects.filter(staff_id=rp.rp_id).first()
                    if staff_record:
                        # Staff record exists, check what's missing
                        has_assignments = Assignment.objects.filter(staff=staff_record).exists()
                        has_position = staff_record.pos is not None
                        
                        if not has_assignments and not has_position:
                            return Response(
                                {'error': "No position and assignments assigned. Contact administrator."},
                                status=status.HTTP_403_FORBIDDEN
                            )
                        elif not has_assignments:
                            return Response(
                                {'error': "No assignments assigned. Contact administrator."},
                                status=status.HTTP_403_FORBIDDEN
                            )
                        elif not has_position:
                            return Response(
                                {'error': "Position is none. Contact administrator."},
                                status=status.HTTP_403_FORBIDDEN
                            )
                else:
                    # No staff record found
                    return Response(
                        {'error': "Staff Privileges Required"},
                        status=status.HTTP_403_FORBIDDEN
                    )

            return Response({
                'user': serializer.data,
                'access_token': supabase_response.session.access_token,
                'message': 'Login successful',
                'supabase_token': supabase_response.session.access_token
            })

        except Exception as e:
            logger.error(f"Login error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Authentication failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WebUserView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # Get the Supabase user from the request (set by middleware)
            supabase_user = getattr(request, 'supabase_user', None)
            
            if not supabase_user:
                return Response(
                    {'error': 'User not found in request'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            user_email = supabase_user.email
            
            # Find the corresponding account in database
            account = Account.objects.filter(email=user_email).first()
            
            if not account:
                return Response(
                    {'error': 'Account not found in system'},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = UserAccountSerializer(account)
            
            # Check if user still has staff privileges
            if not serializer.data.get('staff'):
                return Response(
                    {'error': "Staff Privileges Required"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return Response({
                'user': serializer.data,
                'message': 'User data retrieved successfully'
            })
            
        except Exception as e:
            logger.error(f"User retrieval error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to retrieve user data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
class MobileUserView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            supabase_user = getattr(request, 'supabase_user', None)
            
            if not supabase_user:
                return Response(
                    {'error': 'User not found in request'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            user_email = supabase_user.email
            
            # Find the corresponding account in database
            account = Account.objects.filter(email=user_email).first()
            
            if not account:
                return Response(
                    {'error': 'Account not found in system'},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = UserAccountSerializer(account)
            
            return Response({
                'user': serializer.data,
                'message': 'User data retrieved successfully'
            })
            
        except Exception as e:
            logger.error(f"User retrieval error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to retrieve user data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UploadImageView(APIView):
    # permission_classes = [AllowAny]

    def post(self, request):
        try:
            # Get the Supabase user from request middleware
            supabase_user = getattr(request, 'supabase_user', None)
            if not supabase_user:
                return Response(
                    {'error': 'Unauthorized access'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )

            image_url = request.data.get('image_url')
            if not image_url:
                return Response(
                    {'error': 'Image URL is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get the account tied to the Supabase ID
            account = Account.objects.filter(supabase_id=supabase_user.id).first()
            if not account:
                return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)

            # Update profile image URL
            account.profile_image = image_url
            account.save()

            return Response({
                'message': 'Profile image updated successfully',
                'image_url': image_url
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"UploadImageView error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Image update failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RefreshView(APIView):
    def post(self, request):
        try:
            # Get the Supabase user from the request (set by middleware)
            supabase_user = getattr(request, 'supabase_user', None)
            
            if not supabase_user:
                return Response(
                    {'error': 'User not found in request'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            user_email = supabase_user.email
            
            # Find the corresponding account in database
            account = Account.objects.filter(email=user_email).first()
            
            if not account:
                return Response(
                    {'error': 'Account not found in system'},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = UserAccountSerializer(account)
            
            # Check if user still has staff privileges
            if not serializer.data.get('staff'):
                return Response(
                    {'error': "Staff Privileges Required"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return Response({
                'user': serializer.data,
                'message': 'Session refreshed successfully'
            })
            
        except Exception as e:
            logger.error(f"Session refresh error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to refresh session'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LogoutView(APIView):
    def post(self, request):
        try:
            return Response({
                'message': 'Logout successful'
            })
            
        except Exception as e:
            logger.error(f"Logout error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Logout failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
