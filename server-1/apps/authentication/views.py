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
from apps.profiling.models import ResidentProfile, BusinessRespondent
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
            
            if not serializer.data.get('staff'):
                return Response(
                    {'error': "Staff Privileges Required"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            print(serializer.data)
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
    # permission_classes = [AllowAny]

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

class SendResetCodeView(APIView):
    """
    Send password reset verification code to user's email
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get("email")
        
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Check if user exists in Django
            user = User.objects.get(email=email)
            account = Account.objects.get(email=email)
        except (User.DoesNotExist, Account.DoesNotExist):
            return Response(
                {"message": "If the email exists, a reset code will be sent"},
                status=status.HTTP_200_OK
            )
        
        try:
            # Generate 6-digit verification code
            code = ''.join(secrets.choice(string.digits) for _ in range(6))
            
            # Store code in cache with 15-minute expiration
            cache_key = f"password_reset_code_{email}"
            cache.set(cache_key, code, timeout=900)  # 15 minutes
            
            # Send email through Supabase 
            supabase_response = supabase.auth.reset_password_email(
                email,
                options={
                    'data': {
                        'verification_code': code,
                        'type': 'password_reset'
                    }
                }
            )
            
            # Option 2: If you prefer to send custom emails, you can use your own email service
            # send_reset_code_email(email, code)  # Implement this function
            
            logger.info(f"Password reset code sent to {email}")
            
            return Response(
                {"message": "Reset code sent to your email"},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error sending reset code: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to send reset code. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VerifyResetCodeView(APIView):
    """
    Verify the password reset code
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")
        
        if not email or not code:
            return Response(
                {"error": "Email and code are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Check if user exists
            user = User.objects.get(email=email)
            account = Account.objects.get(email=email)
        except (User.DoesNotExist, Account.DoesNotExist):
            return Response(
                {"error": "Invalid email or code"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify code from cache
        cache_key = f"password_reset_code_{email}"
        stored_code = cache.get(cache_key)
        
        if not stored_code or stored_code != code:
            return Response(
                {"error": "Invalid or expired code"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate temporary token for password reset
        reset_token = secrets.token_urlsafe(32)
        reset_token_key = f"password_reset_token_{email}"
        
        # Store reset token with 30-minute expiration
        cache.set(reset_token_key, reset_token, timeout=1800)  # 30 minutes
        
        # Clear the verification code
        cache.delete(cache_key)
        
        return Response(
            {
                "message": "Code verified successfully",
                "reset_token": reset_token
            },
            status=status.HTTP_200_OK
        )

class ResetPasswordView(APIView):
    """
    Reset password using the verified token
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get("email")
        reset_token = request.data.get("reset_token")
        new_password = request.data.get("new_password")
        
        if not email or not reset_token or not new_password:
            return Response(
                {"error": "Email, reset token, and new password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate password strength (add your own validation)
        if len(new_password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters long"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Check if user exists
            user = User.objects.get(email=email)
            account = Account.objects.get(email=email)
        except (User.DoesNotExist, Account.DoesNotExist):
            return Response(
                {"error": "Invalid reset request"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify reset token
        reset_token_key = f"password_reset_token_{email}"
        stored_token = cache.get(reset_token_key)
        
        if not stored_token or stored_token != reset_token:
            return Response(
                {"error": "Invalid or expired reset token"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if new password is the same as current password
        if check_password(new_password, user.password):
            return Response(
                {"error": "New password must be different from current password"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Update password in Supabase first
            supabase_response = supabase.auth.admin.update_user_by_id(
                user.id,  # Assuming user.id matches Supabase user ID
                {"password": new_password}
            )
            
            if supabase_response.user:
                # If Supabase update succeeds, update Django user
                user.set_password(new_password)
                user.save()
                
                # Update account fields if needed
                account.last_password_change = timezone.now()
                account.save()
                
                # Clear the reset token
                cache.delete(reset_token_key)
                
                logger.info(f"Password reset successful for {email}")
                
                return Response(
                    {"message": "Password reset successfully"},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"error": "Failed to update password in authentication service"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except Exception as e:
            logger.error(f"Password reset error: {str(e)}", exc_info=True)
            return Response(
                {"error": "An error occurred while resetting password"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ResendResetCodeView(APIView):
    """
    Resend password reset verification code
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get("email")
        
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Check if user exists
            user = User.objects.get(email=email)
            account = Account.objects.get(email=email)
        except (User.DoesNotExist, Account.DoesNotExist):
            return Response(
                {"message": "If the email exists, a reset code will be sent"},
                status=status.HTTP_200_OK
            )
        
        # Check rate limiting (prevent spam)
        rate_limit_key = f"reset_code_rate_limit_{email}"
        if cache.get(rate_limit_key):
            return Response(
                {"error": "Please wait before requesting another code"},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        try:
            # Generate new 6-digit verification code
            code = ''.join(secrets.choice(string.digits) for _ in range(6))
            
            # Store code in cache with 15-minute expiration
            cache_key = f"password_reset_code_{email}"
            cache.set(cache_key, code, timeout=900)  # 15 minutes
            
            # Set rate limit (1 minute)
            cache.set(rate_limit_key, True, timeout=60)
            
            # Send email through Supabase
            supabase_response = supabase.auth.reset_password_email(
                email,
                options={
                    'data': {
                        'verification_code': code,
                        'type': 'password_reset'
                    }
                }
            )
            
            logger.info(f"Password reset code resent to {email}")
            
            return Response(
                {"message": "Reset code sent to your email"},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error resending reset code: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to send reset code. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Optional: Custom email sending function if you don't want to use Supabase emails
def send_reset_code_email(email, code):
    """
    Send reset code email using your preferred email service
    You can use Django's send_mail, Sendgrid, AWS SES, etc.
    """
    from django.core.mail import send_mail
    from django.conf import settings
    
    subject = "Password Reset Code"
    message = f"""
    Hello,
    
    Your password reset verification code is: {code}
    
    This code will expire in 15 minutes.
    
    If you didn't request this, please ignore this email.
    """
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )