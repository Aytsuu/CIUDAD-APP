from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from django.db import transaction
from django.db.models import Q
from django.conf import settings
import logging
from django.http import JsonResponse
from apps.account.models import Account
from apps.profiling.models import ResidentProfile, BusinessRespondent
from apps.administration.models import Staff, Assignment
from ..serializers import UserAccountSerializer, EmailTokenObtainPairSerializer
import random
from django.core.mail import send_mail
import requests
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

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
            phone = request.data.get('phone')
            password = request.data.get('password')
            username = request.data.get('username')
            resident_id = request.data.get('resident_id')
            br = request.data.get('br')



            # Check if account already exists
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
                except BusinessRespondent.DoesNotExist:
                    return Response(
                        {'error': 'Invalid business respondent ID provided'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            with transaction.atomic():
                # Password is hashed internally by create_user
                account = Account.objects.create_user(
                    email=email,
                    phone=phone,
                    username=username or email.split('@')[0],
                    password=password,
                    rp=resident_profile,
                    br=business_respondent
                )

            # Return user data
            serializer = UserAccountSerializer(account)
            return Response({
                'message': 'Account created successfully',
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Signup error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Account creation failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class WebLoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Both email and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ✅ Authenticate user
        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # ✅ Serialize user
        serializer = UserAccountSerializer(user)

        # ✅ Check if user has resident profile
        if not serializer.data.get("resident"):
            return Response(
                {"error": "Resident Profile Required"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # ✅ Check staff privileges
        staff_data = serializer.data.get("staff")
        if not staff_data:
            return Response(
                {"error": "Staff Privileges Required. Contact administrator."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # ✅ Generate tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        
        res = JsonResponse(
            {
                "message": "Login successful",
                "access": str(access), 
                "user": serializer.data, 
            },
            status=status.HTTP_200_OK,
        )

        res.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=True,        # ❗ set False if testing on http://localhost
            samesite="Strict",  # or "Lax" if frontend/backend are on different domains
            max_age=7 * 24 * 60 * 60,  # 1 week
        )

        return res
    
class MobileLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            logger.info("MobileLoginView called")
            email = request.data.get('email')
            password = request.data.get('password')

            # Authenticate using Django's built-in system
            user = authenticate(request, username=email, password=password)

            if not user:
                return Response(
                    {'error': 'Invalid email or password'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Serialize user data
            serializer = UserAccountSerializer(user)

            return Response({
                'user': serializer.data,
                'message': 'Login successful'
            })

        except Exception as e:
            logger.error(f"Login error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Authentication failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LogoutView(APIView):
    def post(self, request):
        try: 
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                logger.info("Found refresh token, proceeding to logout")
            
            response = Response({
                "message": "Logout successful"
            }, status=status.HTTP_200_OK)
            
            # Clear the refresh token cookie
            response.delete_cookie(
                key="refresh_token",
                domain=None,
                samesite="Lax",
            )
            
            logger.info("User logged out successfully")
            return response
        except Exception as e:
            logger.error(f"Logout error: {str(e)}", exc_info=True)
            response =  Response(
                {'error': 'Logout failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            response.delete_cookie("refresh_token")
            return response

class SendOTPEmail(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')       

        otp = generate_otp()
        cache.set(email, otp, timeout=300)  # Store OTP in cache for 5 minutes
        send_otp_email(email, otp)
        return Response({'message': 'OTP sent via email'}, status=status.HTTP_200_OK)   
    
class VerifyOTPEmail(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logger.info("EMAIL IS HERE")
        email = request.data.get('email')
        otp_input = request.data.get('otp')
        
        cached_otp = cache.get(email)
        logger.info(f"CACHED OTP:  {cached_otp}")
        logger.info(f"OTP INPUT:  {otp_input}")
        
        if cached_otp is None:
            return Response(
                {'error': 'OTP has expired or was never sent'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if cached_otp == otp_input:
            # cache.delete(email)  # Clear the OTP after successful verification
            # account = Account.objects.filter(email=email).first()
            
            # if not account:
            #     return Response(
            #         {'error': 'Account not found'},
            #         status=status.HTTP_404_NOT_FOUND
            #     )
            
            # # Serialize and validate
            # serializer = UserAccountSerializer(account)
            # logger.info(f"OTP verified successfully for email: {email}")
            return Response({
                'success': True,
                # 'user': serializer.data,
                # 'refresh_token': request.COOKIES.get('refresh_token'),
                'message': 'OTP verified successfully', }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

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


def send_otp_email(request):
    email = request.data.get('email')
    otp = request.data.get('otp')

    if not email or not otp:
        return Response(
            {'error': 'Email and OTP are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    subject = "Your OTP Code"
    message = f"Your OTP code is: {otp}"
    
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
        return Response({'message': 'OTP sent via email'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Failed to send OTP email: {str(e)}", exc_info=True)
        return Response({'error': 'Failed to send OTP email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    



class CookieTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = TokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        print("Incoming data:", request.data)
        response = super().post(request, *args, **kwargs)
        data = response.data
        email = data.get('email')
        refresh = data.get('refresh')
        access = data.get('access')
        
        res = JsonResponse({'access': access})
        logger.info(email)
        logger.info(f"Tokens generated - Access: {'Yes' if access else 'No'}, Refresh: {'Yes' if refresh else 'No'}")
        if refresh:
            res.set_cookie(
                key="refresh_token",
                value=refresh,
                httponly=True,
                secure=True,
                samesite='Strict'
            )
        else:
            logger.warning("No refresh token found in response data")   
        return res
    
class CookieTokenRefreshView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer
    
    def post(self, request, *args, **kwargs):
        refresh = request.COOKIES.get('refresh_token')
        print("Refresh Token: ", refresh)
        
        if not refresh:
            return Response({'error': 'Refresh token not found in cookies'}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = self.get_serializer(data={'refresh': refresh})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

