from rest_framework import generics, status, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.db.models import Q
from .models import Account
from .serializers import *
from rest_framework.views import APIView
import uuid
import os
from utils.supabase_client import supabase
from apps.administration.serializers.full import StaffFullSerializer
from apps.profiling.serializers.full import ResidentProfileFullSerializer
from apps.administration.models import Staff
from django.contrib.auth import update_session_auth_hash
import json


class SignUp(generics.CreateAPIView):
    queryset = Account.objects.all()
    serializer_class = UserAccountSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for the user
        refresh = RefreshToken.for_user(user)

        return Response({
            "user": UserAccountSerializer(user, context=self.get_serializer_context()).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    
class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        email_or_username = request.data.get('email_or_username')
        password = request.data.get('password')
        
        if not email_or_username or not password:
            return Response(
                {"error": "Both email/username and password are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Add debug print
            print(f"Attempting login for: {email_or_username}")
            
            user = Account.objects.get(
                Q(email=email_or_username) | Q(username=email_or_username)
            )
            print(f"User found: {user.username}")
            
            if not user.check_password(password):
                return Response(
                    {"error": "Invalid password"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            print("Tokens generated successfully")
            
            # Debug print serialized data
            rp_data = None
            if hasattr(user, 'rp') and user.rp:
                print(f"Serializing RP for user {user.pk}")
                rp_data = ResidentProfileFullSerializer(user.rp).data
                
            staff_data = None
            if user.rp:
                print(f"Checking staff for RP {user.rp.pk}")
                staff = Staff.objects.filter(staff_id=str(user.rp.rp_id)).first()
                if staff:
                    staff_data = StaffFullSerializer(staff).data
            
            return Response({
                "id": user.id,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "username": user.username,
                "email": user.email,
                "profile_image": user.profile_image if user.profile_image else None,
                "rp": rp_data,
                "staff": staff_data,
            })
            
        except Account.DoesNotExist:
            print("User not found")
            return Response(
                {"error": "User not found"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            print(f"Login error: {str(e)}")
            return Response(
                {"error": "Internal server error", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
                                 
class UserAccountView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Account.objects.all()
    serializer_class = UserAccountSerializer
    authentication_classes = [JWTAuthentication]
    
    def get_permissions(self):
        return [permissions.AllowAny()]
    
class UploadImage(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication] 
    
    def post(self, request, *args, **kwargs):
        print(f"Upload image request from user: {request.user}")
        print(f"Request data: {request.data}")
        
        user = request.user
        image_url = request.data.get('image_url')
        
        if not image_url:
            return Response({
                "error": "No image URL provided"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Update user with new URL
            user.profile_image = image_url
            user.save()
            
            print(f"Profile image updated successfully for user {user.username}: {image_url}")

            return Response({
                "message": "Profile image updated successfully", 
                "url": image_url
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"ERROR in UploadImage: {str(e)}")
            return Response({
                "error": "Failed to update profile image",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class ChangePassword(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def post(self, request):
        print(f"Change Password Request from user: {request.user}")
        print(f"Request Data: {json.dumps(request.data, indent=2)}")
        
        try:
            serializer = ChangePasswordSerializer(data=request.data)
            
            if serializer.is_valid():
                user = request.user
                old_password = serializer.validated_data.get('old_password')
                new_password = serializer.validated_data.get('new_password')
                
                print(f"Validating password for user: {user.username}")
                
                # Check if old password is correct
                if not user.check_password(old_password):
                    print("Old password validation failed")
                    return Response({
                        'old_password': ['Current password is incorrect.']
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Check if new password is different from old password
                if old_password == new_password:
                    print("New password same as old password")
                    return Response({
                        'new_password': ['New password must be different from current password.']
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Set the new password
                user.set_password(new_password)
                user.save()
                
                print(f"Password updated successfully for user: {user.username}")
                
                return Response({
                    'message': 'Password updated successfully'
                }, status=status.HTTP_200_OK)
            else:
                print(f"Serializer validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"Change password error: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'An error occurred while updating password',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class LogOutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({
                    "error": "Refresh token is required"
                }, status=status.HTTP_400_BAD_REQUEST)
                
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({
                "message": "Successfully logged out!"
            }, status=status.HTTP_205_RESET_CONTENT)
            
        except Exception as e:
            print(f"Logout error: {str(e)}")
            return Response({
                "error": "Failed to logout",
                "details": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)