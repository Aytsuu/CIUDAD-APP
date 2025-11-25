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
from apps.account.models import Account, PhoneVerification
from apps.profiling.models import ResidentProfile, BusinessRespondent
from apps.administration.models import Staff, Assignment
from ..serializers import UserAccountSerializer, EmailTokenObtainPairSerializer
import random
from django.core.mail import send_mail
import requests
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from utils.otp import generate_otp

logger = logging.getLogger(__name__)

class SignupView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        try:
            email = request.data.get('email')
            phone = request.data.get('phone')
            password = request.data.get('password')
            resident_id = request.data.get('resident_id')
            br = request.data.get('br')
 
            # Check if account already exists
            if Account.objects.filter(email=email).exists():
                return Response(
                    {'email': 'Account with this email already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if Account.objects.filter(phone=phone).exists():
                return Response(
                    {'phone': 'Account with this phone already exists'},
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

            # Password is hashed internally by create_user
            account = Account.objects.create_user(
                email=email,
                phone=phone,
                username=phone,
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

class VerifySignup(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email', None)
        phone = request.data.get('phone', None)
        otp = request.data.get('otp', None)

        print(email, otp)
        if email:
            cached_otp = cache.get(email)
            print(cached_otp)
            if otp != cached_otp:
                return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
            cache.delete(email)

        if phone:
            phone_verification = PhoneVerification.objects.filter(
                pv_phone_num=phone
            ).latest('pv_created_at')
            
            if otp != phone_verification.pv_otp:
                return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_200_OK)
        
# class VerifyWebAccRegistration(APIView):
#     def post(self, request):
#         phone = request.data.get('phone', None)
#         email = request.data.get('email', None)

#         if phone:
#             exists = Account.objects.filter(phone=phone).exists()
#             if exists:
#                 return Response({"error": "Phone is already in use"}, status=status.HTTP_400_BAD_REQUEST)
#         else:
#             exists = Account.objects.filter(email=email).exists()
#             if exists:
#                 return Response({"error": "Email is already in use"}, status=status.HTTP_400_BAD_REQUEST)
            
#         return Response(status=status.HTTP_200_OK)

# class CookieTokenObtainPairView(TokenObtainPairView):
#     permission_classes = [AllowAny]
#     serializer_class = TokenObtainPairSerializer
    
#     def post(self, request, *args, **kwargs):
#         response = super().post(request, *args, **kwargs)
#         data = response.data
#         email = data.get('email')
#         refresh = data.get('refresh')
#         access = data.get('access')
        
#         logger.info(email)
        
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         user = serializer.user
        
#         if not getattr(user, "rp", None):
#             return Response({'error': 'Resident Profile required. Contact administrator.'}, status=status.HTTP_403_FORBIDDEN)
        
#         if not getattr(user, "staff", None):
#             return Response({'error': 'Staff Privileges required. Contact administrator.'}, status=status.HTTP_403_FORBIDDEN)   
        
#         logger.info(f"Tokens generated - Access: {'Yes' if access else 'No'}, Refresh: {'Yes' if refresh else 'No'}")
        
#         res = JsonResponse({'access': access,
#                             'user': UserAccountSerializer(user).data,
#                             'message': 'Login successful'}, 
#                            status=status.HTTP_200_OK)
        
#         if refresh:
#             res.set_cookie(
#                 key="refresh_token",
#                 value=refresh,
#                 httponly=True,
#                 secure=True,
#                 samesite='Strict'
#             )
#         else:
#             logger.warning("No refresh token found in response data")   
#         return res
    
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

