from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from account.Account.models import Account
from django.core.cache import cache
from django.core.mail import send_mail
import secrets

# 6 digit otp
def generate_otp():
    return str(secrets.randbelow(10**6)).zfill(6)

class SignUpEmailOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.get('email')
        
        otp = generate_otp()
        cache.set(email, otp, timeout=300)  # Store OTP in cache for 5 minutes
        
        send_email(subject="Your OTP Code", message=f"Your OTP code is {otp}", from_email=None, [email])
        
        return Response({'message': 'OTP sent to email'}, status=status.HTTP_200_OK)                 
            
class LogInEmailOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if Account.objects.filter(email=email).exists():
                
            otp = generate_otp()
            cache.set(email, otp, timeout=300)  # Store OTP in cache for 5 minutes
            send_mail(subject="Your OTP Code", message=f"Your OTP code is {otp}", from_email=None, recipient_list=[email])
            return Response({f'message': 'Sucessfully sent an OTP to {email}'}, status=status.HTTP_200_OK)
        
        return Response({'error': "Email do not exist. Signup to access the Barangay CIUDAD's services"}, status=status.HTTP_400_BAD_REQUEST)

class ValidateEmailOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.get('email')
        otp = request.get('otp')
        
        if otp == cache.get(email):
            return Response({'message': 'OTP is valid'}, status=status.HTTP_200_OK)
        
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
    

        
            
        