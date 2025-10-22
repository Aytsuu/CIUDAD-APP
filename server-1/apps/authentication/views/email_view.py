from rest_framework.views import APIView
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from apps.account.models import Account
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from apps.account.models import PhoneVerification
from django.core.cache import cache
from django.core.mail import send_mail
from rest_framework import status
from ..serializers import UserAccountSerializer
from utils.otp import generate_otp
from django.http import JsonResponse 
import logging

logger = logging.getLogger(__name__)

class emailOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        auth_type = request.data.get('type')

        if auth_type == 'signin':
            if not Account.objects.filter(email=email).exists():
                raise serializers.ValidationError({"email" : "Email is not registered"})
        else:
            if Account.objects.filter(email=email).exists():
                raise serializers.ValidationError({"email" : "Email is already in use"})

        otp = generate_otp()
        print(f"Generated OTP for {email}: {otp}")
        cache.set(email, otp, timeout=300)  # Store OTP in cache for 5 minutes
        send_mail(subject="Your OTP Code", message=f"Your OTP code is {otp}", from_email=None, recipient_list=[email])
        return Response({f'message': 'Sucessfully sent an OTP to {email}'}, status=status.HTTP_200_OK)
    
class ValidateOTPWebView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        phone = request.data.get('phone')
        otp = request.data.get('otp')
        
        print(f"Received - Email: {email}, Phone: {phone}, OTP: {otp}")
        
        if not otp: 
            return Response({'error': 'OTP is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not email and not phone:
            return Response({'error': "Email or phone is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if email:
            cache_key = email
            cached_otp = cache.get(cache_key)
            print(f"Email OTP check - Key: {cache_key}, Cached OTP: {cached_otp}")
            
            if otp != cached_otp:
                return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
            
            # OTP valid, delete from cache
            cache.delete(cache_key)
        
        elif phone:
            print(f"Phone OTP check - Phone: {phone}, Provided OTP: {otp}")
            
            # Get the latest OTP for this phone from database
            try:
                phone_verification = PhoneVerification.objects.filter(
                    pv_phone_num=phone
                ).latest('pv_created_at')
                
                print(f"Database OTP: {phone_verification.pv_otp}")
                
                if otp != phone_verification.pv_otp:
                    return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
                
            except PhoneVerification.DoesNotExist:
                return Response({'error': 'OTP not found or expired'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            if email:
                user = Account.objects.get(email=email)
            else:
                user = Account.objects.get(phone=phone)
        except Account.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UserAccountSerializer(user)
        
        if not serializer.data.get('rp'):
            return Response({'error': 'Resident profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not serializer.data.get('staff'):
            return Response({'error': 'Staff privileges required. Contact administrator.'}, status=status.HTTP_403_FORBIDDEN)           
        
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        
        logger.info(f"User {user.email or user.phone} logged in successfully via OTP")
        
        res = JsonResponse(
            {
                "message": "Login Successfully",
                "access": str(access),
                "user": serializer.data,
            },
            status = status.HTTP_200_OK
        )
        res.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite='Lax',
        )
            
        return res
    
    
class ValidateOTPMobileView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        phone = request.data.get('phone')
        otp = request.data.get('otp')
        
        print(f"Received - Email: {email}, Phone: {phone}, OTP: {otp}")
        
        if not otp: 
            return Response({'error': 'OTP is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not email and not phone:
            return Response({'error': "Email or phone is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if email:
            cache_key = email
            cached_otp = cache.get(cache_key)
            print(f"Email OTP check - Key: {cache_key}, Cached OTP: {cached_otp}")
            
            if otp != cached_otp:
                return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
            
            # OTP valid, delete from cache
            cache.delete(cache_key)
        
        elif phone:
            print(f"Phone OTP check - Phone: {phone}, Provided OTP: {otp}")
            
            # Get the latest OTP for this phone from database
            try:
                phone_verification = PhoneVerification.objects.filter(
                    pv_phone_num=phone
                ).latest('pv_created_at')
                
                print(f"Database OTP: {phone_verification.pv_otp}")
                
                if otp != phone_verification.pv_otp:
                    return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
                
            except PhoneVerification.DoesNotExist:
                return Response({'error': 'OTP not found or expired'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            if email:
                user = Account.objects.get(email=email)
            else:
                user = Account.objects.get(phone=phone)
        except Account.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UserAccountSerializer(user)
        
        if not serializer.data.get('rp'):
            return Response({'error': 'Resident profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        
        logger.info(f"User {user.email or user.phone} logged in successfully via OTP")
        
        return JsonResponse(
            {
                "message": "Login Successfully",
                "access": str(access),
                "refresh": str(refresh),
                "user": serializer.data,
            },
            status = status.HTTP_200_OK
        )