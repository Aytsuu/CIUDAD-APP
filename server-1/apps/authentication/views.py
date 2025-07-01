from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
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
from apps.profiling.models import ResidentProfile
from .serializers import UserAccountSerializer
from utils.supabase_client import supabase
from rest_framework.permissions import IsAuthenticated

logger = logging.getLogger(__name__)

# ROLE_PATHS_MAP = {
#     'admin': [
#         '/admin/dashboard',
        
#     ],
#     'Barangay Staff' : [
        
#     ],
#     'resident': [
        
#     ], 
#     'unverified': [
        
#     ],
#     "Health Staff": [
        
#     ]
# }

class AuthBaseView(APIView):
    permission_classes = [AllowAny]
    
    def validate_request_data(self, data):
        supabase_id = data.get('supabase_id')
        email = data.get('email')
        
        if not supabase_id or not email:
            raise ValueError('supabase_id and email are required')
        
        return supabase_id, email


class SignupView(APIView):
    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            username = request.data.get('username')

            if not email or not password:
                return Response(
                    {'error': 'Both email and password are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if account already exists in local database
            if Account.objects.filter(email=email).exists():
                return Response(
                    {'error': 'Account with this email already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                # Create user in Supabase
                supabase_response = supabase.auth.sign_up({
                    "email": email,
                    "password": password
                })
                
                if supabase_response.user is None:
                    return Response(
                        {'error': 'Failed to create user account'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Create account in local database
                account = Account.objects.create(
                    email=email,
                    username=username or email.split('@')[0],
                    staff=False, 
                )

                # Check if email confirmation is required
                requires_confirmation = not supabase_response.session
                
                if requires_confirmation:
                    return Response({
                        'message': 'Account created successfully. Please check your email for confirmation.',
                        'requiresConfirmation': True
                    })
                else:
                    # If no confirmation required, return user data
                    serializer = UserAccountSerializer(account)
                    return Response({
                        'message': 'Account created successfully',
                        'user': serializer.data,
                        'requiresConfirmation': False,
                        'access_token': supabase_response.session.access_token if supabase_response.session else None
                    })

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


class LoginView(APIView):
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
                    {'error': 'Account not found in system'},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = UserAccountSerializer(account)
            
            if not serializer.data.get('staff'):
                return Response(
                    {'error': "Staff Privileges Required"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Return success response
            return Response({
                'user': serializer.data,
                'access_token': supabase_response.session.access_token,
                'message': 'Login successful'
            })

        except Exception as e:
            logger.error(f"Login error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Authentication failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserView(APIView):
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
            
            # Find the corresponding account in your database
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
            
class ChangePassword(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        
        if not old_password or not new_password:
            return Response(
                {"error": "Both old and new passwords are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the authenticated user's account
        try:
            account = Account.objects.get(email=request.user.email)
        except Account.DoesNotExist:
            return Response(
                {"error": "Account not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verify old password against Django's user model
        if not check_password(old_password, request.user.password):
            return Response(
                {"error": "Current password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if new password is the same as old password
        if check_password(new_password, request.user.password):
            return Response(
                {"error": "New password must be different from current password"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Update password in Supabase first
            supabase_response = supabase.auth.update_user({
                "password": new_password
            })
            
            if supabase_response.user:
                # If Supabase update succeeds, update Django user
                request.user.set_password(new_password)
                request.user.save()
                
                # Update account last_password_change field if you have one
                account.save()
                
                return Response(
                    {"message": "Password updated successfully"},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"error": "Failed to update password in authentication service"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except Exception as e:
            logger.error(f"Password change error: {str(e)}", exc_info=True)
            return Response(
                {"error": "An error occurred while changing password"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        