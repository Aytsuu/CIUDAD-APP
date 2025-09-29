from rest_framework.views import APIView
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from apps.account.models import Account
from rest_framework.response import Response
from django.core.cache import cache
from django.core.mail import send_mail
import secrets
from rest_framework import status
from utils.otp import generate_otp

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
        print(generate_otp)
        cache.set(email, otp, timeout=300)  # Store OTP in cache for 5 minutes
        send_mail(subject="Your OTP Code", message=f"Your OTP code is {otp}", from_email=None, recipient_list=[email])
        return Response({f'message': 'Sucessfully sent an OTP to {email}'}, status=status.HTTP_200_OK)
        
class ValidateEmailOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        if otp == cache.get(email):
            return Response({'message': 'OTP is valid'}, status=status.HTTP_200_OK)
        
        return Response({'email': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)