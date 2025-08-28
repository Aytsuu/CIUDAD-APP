from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.db import transaction
from django.db.models import Q
from django.contrib.auth.models import User
from django.conf import settings
import logging
from django.http import JsonResponse
from apps.account.models import Account
from apps.profiling.models import ResidentProfile, BusinessRespondent
from apps.administration.models import Staff, Assignment
from ..serializers import UserAccountSerializer
from utils.supabase_client import supabase
import random
from django.core.mail import send_mail
import requests
import random

logger = logging.getLogger(__name__)

def generate_otp(length=6):
    return str(random.randint(10**(length-1), (10**length)-1))

def send_otp_email(email, otp):
    subject = "Your OTP Code"
    message = f"Your OTP code is: {otp}. It will expire in 5 minutes."
    send_mail(subject, message, None, [email])

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
            
class UploadImageView(APIView):

    def post(self, request):
        try:
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

            # Authenticate with Supabase
            try:
                supabase_response = supabase.auth.sign_in_with_password({
                    "email": email,
                    "password": password
                })
                supabase_user = supabase_response.user
                
                if not supabase_user or not supabase_response.session:
                    raise Exception("Authentication failed")
                    
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

            # Serialize user data
            serializer = UserAccountSerializer(account)
            
            # Check if user has resident profile
            if not serializer.data.get('resident'):
                return Response(
                    {'error': "Resident Profile Required"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
                
            # Check staff privileges
            staff_data = serializer.data.get('staff')
            if not staff_data:
                return Response(
                    {'error': "Staff Privileges Required. Contact administrator."},
                    status=status.HTTP_403_FORBIDDEN
                )


            # Create successful response
            response_data = {
                'user': serializer.data,
                'access_token': supabase_response.session.access_token,
                'message': 'Login successful'
            }
            
            response = Response(response_data, status=status.HTTP_200_OK)
            
            # Store refresh token in HttpOnly cookie (SECURE!)
            response.set_cookie(
                'refresh_token',
                supabase_response.session.refresh_token,
                max_age=60 * 60 * 24 * 7,  # 7 days
                httponly=True,  # Not accessible via JavaScript (XSS protection)
                secure=True,    # Only sent over HTTPS in production
                samesite='Lax', # CSRF protection
                domain=None     # Let Django handle domain
            )
            
            logger.info(f"Login successful for user: {supabase_user.email}")
            return response

        except Exception as e:
            logger.error(f"Login error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Authentication failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.user.get('userEmail')
        
        account = Account.objects.filter(email=user_email).first()
            
        if not account:
            return Response(
                {'error': 'Account not found in system'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Serialize and validate user data
        serializer = UserAccountSerializer(account)
        
        return Response({
            'user': serializer.data,
            
        })
        
class WebUserView(APIView):

    def get(self, request):
        try:
            # Get Authorization header
            auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
            
            if not auth_header or not auth_header.startswith('Bearer '):
                return Response(
                    {'error': 'Authorization header required'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            access_token = auth_header.split(' ')[1]
            
            # Validate token with Supabase
            try:
                user_response = supabase.auth.get_user(access_token)
                supabase_user = user_response.user
                
                if not supabase_user:
                    return Response(
                        {'error': 'Invalid or expired session'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                    
            except Exception as token_error:
                logger.warning(f"Token validation failed: {str(token_error)}")
                return Response(
                    {'error': 'Session validation failed'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Get user from database
            user_email = supabase_user.email
            account = Account.objects.filter(email=user_email).first()
            
            if not account:
                return Response(
                    {'error': 'Account not found in system'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Serialize and validate user data
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


class RefreshSessionView(APIView):
    
    def post(self, request):
        try:
            # Get refresh token from HttpOnly cookie (SECURE!)
            refresh_token = request.COOKIES.get('refresh_token')
            
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token not found. Please login again.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            logger.info("Attempting to refresh session")
            
            # Refresh session with Supabase
            try:
                refresh_response = supabase.auth.refresh_session(refresh_token)
                
                if not refresh_response.session or not refresh_response.session.access_token:
                    logger.warning("Invalid refresh token received")
                    # Clear the invalid cookie
                    response = Response(
                        {'error': 'Invalid refresh token. Please login again.'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                    response.delete_cookie('refresh_token')
                    return response
                
            except Exception as refresh_error:
                logger.error(f"Supabase refresh failed: {str(refresh_error)}")
                # Clear the invalid cookie
                response = Response(
                    {'error': 'Session refresh failed. Please login again.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
                response.delete_cookie('refresh_token')
                return response
            
            # Validate the new access token and get user data
            new_access_token = refresh_response.session.access_token
            
            try:
                user_response = supabase.auth.get_user(new_access_token)
                supabase_user = user_response.user
                
                if not supabase_user:
                    raise Exception("Invalid user from refreshed token")
                    
            except Exception as user_error:
                logger.error(f"Failed to get user from refreshed token: {str(user_error)}")
                return Response(
                    {'error': 'Invalid refreshed session'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Get updated user data from database
            account = Account.objects.filter(email=supabase_user.email).first()
            
            if not account:
                return Response(
                    {'error': 'Account not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Serialize and validate
            serializer = UserAccountSerializer(account)
            
            # Check if user still has staff privileges
            if not serializer.data.get('staff'):
                return Response(
                    {'error': "Staff Privileges Required"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Create successful response
            response_data = {
                'user': serializer.data,
                'access_token': new_access_token,
                'message': 'Session refreshed successfully'
            }
            
            response = Response(response_data, status=status.HTTP_200_OK)
            
            # Update refresh token cookie with new refresh token
            response.set_cookie(
                'refresh_token',
                refresh_response.session.refresh_token,
                max_age=60 * 60 * 24 * 7,  # 7 days
                httponly=True,
                secure=True,
                samesite='Lax',
                domain=None
            )
            
            logger.info(f"Session refreshed successfully for user: {supabase_user.email}")
            return response
                
        except Exception as e:
            logger.error(f"Refresh session error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to refresh session'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LogoutView(APIView):
    def post(self, request):
        try:
            # Get refresh token from cookie
            refresh_token = request.COOKIES.get('refresh_token')
            
            # Revoke the session on Supabase side
            if refresh_token:
                try:
                    supabase.auth.sign_out()
                    logger.info("Successfully signed out from Supabase")
                except Exception as e:
                    logger.warning(f"Failed to revoke Supabase session: {e}")
            
            # Create response and clear the cookie
            response = Response({
                'message': 'Logged out successfully'
            }, status=status.HTTP_200_OK)
            
            # Clear the refresh token cookie
            response.delete_cookie(
                'refresh_token',
                domain=None,
                samesite='Lax'
            )
            
            logger.info("User logged out successfully")
            return response
            
        except Exception as e:
            logger.error(f"Logout error: {str(e)}", exc_info=True)
            # Clear the cookie even if there's an error
            response = Response(
                {'message': 'Logged out with warnings'},
                status=status.HTTP_200_OK
            )
            response.delete_cookie('refresh_token')
            return response

class SendOTPEmail(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')       
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        otp = generate_otp()
        cache.set(email, otp, timeout=300)  # Store OTP in cache for 5 minutes
        send_otp_email(email, otp)
        return Response({'message': 'OTP sent via email'}, status=status.HTTP_200_OK)   
    
# class VerifyOTPEmail(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         logger.info("EMAIL IS HERE")
#         email = request.data.get('email')
#         otp_input = request.data.get('otp')

#         if not email or not otp_input:
#             return Response(
#                 {'error': 'Email and OTP are required'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         cached_otp = cache.get(email)
#         logger.info(f"CACHED OTP:  {cached_otp}")
#         logger.info(f"OTP INPUT:  {otp_input}")
        
#         if cached_otp is None:
#             return Response(
#                 {'error': 'OTP has expired or was never sent'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         if cached_otp == otp_input:
#             # cache.delete(email)  # Clear the OTP after successful verification
#             account = Account.objects.filter(email=email).first()
            
#             if not account:
#                 return Response(
#                     {'error': 'Account not found'},
#                     status=status.HTTP_404_NOT_FOUND
#                 )
            
#             # Serialize and validate
#             serializer = UserAccountSerializer(account)
#             logger.info(f"OTP verified successfully for email: {email}")
#             return Response({
#                 'success': True,
#                 'user': serializer.data,
#                 'refresh_token': request.COOKIES.get('refresh_token'),
#                 'message': 'OTP verified successfully', }, status=status.HTTP_200_OK)
#         else:
#             return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPEmail(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logger.info("EMAIL IS HERE")
        email = request.data.get('email')
        otp_input = request.data.get('otp')

        if not email or not otp_input:
            return Response(
                {'error': 'Email and OTP are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cached_otp = cache.get(email)
        logger.info(f"CACHED OTP:  {cached_otp}")
        logger.info(f"OTP INPUT:  {otp_input}")
        
        if cached_otp is None:
            return Response(
                {'error': 'OTP has expired or was never sent'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if cached_otp == otp_input:
            # Optionally clear OTP after verification
            # cache.delete(email)

            account = Account.objects.filter(email=email).first()
            
            response_data = {
                'success': True,
                'message': 'OTP verified successfully',
                'user': None,  # default to None if no account exists
                'refresh_token': request.COOKIES.get('refresh_token')
            }

            if account:
                serializer = UserAccountSerializer(account)
                response_data['user'] = serializer.data

            logger.info(f"OTP verified successfully for email: {email}")
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        
class SendOTP(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logger.info("SendOTP called")

        try:
            phone_number = request.data.get('phone_number')
            logger.info(f"Received phone number: {phone_number}")
            if not phone_number:
                return Response(
                    {'error': 'Phone number is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not phone_number.startswith("63"):
                phone_number = f"63{phone_number.lstrip('0')}"

            payload = {
                "apikey": settings.SEMAPHORE_API_KEY,
                "number": phone_number,
                "message": "Your OTP code is: %otp_code%", 
                "code": "numeric",
                "length": 6
            }
            logger.info(f"OTP SENT! Payload: {payload}")
            try:
                response = requests.post(
                    "https://api.semaphore.co/api/v4/otp",
                    data=payload
                )
                response.raise_for_status()
                data = response.json()
                logger.info(f"Semaphore OTP Response: {data}")
            except requests.RequestException as e:
                logger.error(f"Failed to send OTP via Semaphore: {str(e)}", exc_info=True)
                return Response(
                    {'error': 'Failed to send OTP'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            return Response({'message': 'OTP sent successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Unexpected OTP send error: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to send OTP'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyOTP(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = request.data.get('phone_number')
        otp_input = request.data.get('otp')

        if not phone_number or not otp_input:
            return Response(
                {'error': 'Phone number and OTP are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not phone_number.startswith("63"):
            phone_number = f"63{phone_number.lstrip('0')}"

        payload = {
            "apikey": settings.SEMAPHORE_API_KEY,
            "number": phone_number,
            "code": otp_input
        }

        try:
            response = requests.post(
                "https://api.semaphore.co/api/v4/otp/validate",
                data=payload
            )
            response.raise_for_status()
            data = response.json()
            logger.info(f"Semaphore OTP Verify Response: {data}")

            if data.get("status") == "success":
                return Response({'message': 'OTP verified successfully'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        except requests.RequestException as e:
            logger.error(f"Failed to verify OTP via Semaphore: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to verify OTP'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

# class send_otp_email(request):
#     email = request.data.get('email')
#     otp = request.data.get('otp')

#     if not email or not otp:
#         return Response(
#             {'error': 'Email and OTP are required'},
#             status=status.HTTP_400_BAD_REQUEST
#         )

#     subject = "Your OTP Code"
#     message = f"Your OTP code is: {otp}"
    
#     try:
#         send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
#         return Response({'message': 'OTP sent via email'}, status=status.HTTP_200_OK)
#     except Exception as e:
#         logger.error(f"Failed to send OTP email: {str(e)}", exc_info=True)
#         return Response({'error': 'Failed to send OTP email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    

