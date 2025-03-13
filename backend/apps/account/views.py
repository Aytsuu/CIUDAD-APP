from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import check_password
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .models import Account
from .serializers import AccountSerializer

class LoginView(APIView):
    def post(self, request):
        username_or_email = request.data.get("username_or_email")
        password = request.data.get("password")

        # Check if user exists by email or username
        user = Account.objects.filter(acc_username=username_or_email).first() or \
               Account.objects.filter(acc_email=username_or_email).first()

        if not user:
            return Response({"error": "Account does not exist"}, status=status.HTTP_404_NOT_FOUND)

        # Verify password
        if not check_password(password, user.acc_password):
            return Response({"error": "Incorrect password"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Login successful", "user_id": user.acc_id}, status=status.HTTP_200_OK)

    def get(self, request):
        
        return 0