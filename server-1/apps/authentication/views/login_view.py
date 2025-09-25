from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from apps.account.models import Account
from ..serializers import UserAccountSerializer
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)

class WebLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        phone = request.data.get("phone")
        password = request.data.get("password")

        if (not email and not phone) or not password:
            return Response(
                {"error": "Email or phone and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ✅ Authenticate user
        user = None
        if phone:
            # Lookup user by phone
            user = Account.objects.filter(phone=phone).first()
            if user is None or not user.check_password(password):
                return Response(
                    {"error": "Invalid phone or password"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
        else:
            
            user = authenticate(request, username=email, password=password)

        if user is None:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # ✅ Serialize user
        serializer = UserAccountSerializer(user)

        # ✅ Check if user has resident profile
        if not serializer.data.get("rp"):
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
            phone = request.data.get('phone')
            password = request.data.get('password')
            
            if not password:
                return Response(
                    {'error': 'Password is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user = None
            
            # Authenticate using phone or email
            if phone and not email:
                logger.info(f"Authenticating with phone: {phone}")
                try:
                    user_account = Account.objects.get(phone=phone)
                    if user_account.check_password(password):
                        # Verify user is active before proceeding
                        if user_account.is_active:
                            user = user_account
                        else:
                            return Response(
                                {'error': 'Account is disabled'},
                                status=status.HTTP_401_UNAUTHORIZED
                            )
                except Account.DoesNotExist:
                    pass 
                    
            elif email and not phone:
                logger.info(f"Authenticating with email: {email}")
                user = authenticate(request, username=email, password=password)
                
            else:
                return Response(
                    {'error': 'Please provide either email or phone, not both'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not user:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token

            # Serialize user data
            serializer = UserAccountSerializer(user)

            logger.info(f"User {user.email} logged in successfully")
            
            return Response({
                'access': str(access_token),
                'refresh': str(refresh),
                'user': serializer.data,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Login error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Authentication failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )