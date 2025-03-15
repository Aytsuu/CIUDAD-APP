from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()

class LoginView(APIView):
    def get(self, request):
        """Retrieve the authenticated user's details if logged in"""
        if not request.user.is_authenticated:
            return Response(
                {"error": "User not authenticated. Please log in."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response({
            "id": request.user.id,
            "email": request.user.acc_email,
            "message": "User data retrieved successfully."
        }, status=status.HTTP_200_OK)

    def post(self, request):
        """Authenticate user and return JWT tokens"""
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=email, password=password)  # Authenticate using email

        if user is not None:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "message": "Login successful",
                    "user": {
                        "id": user.id,
                        "email": user.acc_email,
                    },
                    "access_token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )
