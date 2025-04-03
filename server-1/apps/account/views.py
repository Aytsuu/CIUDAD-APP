from rest_framework import generics, status, permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser
from django.db.models import Q
from .models import Account
from .serializers import UserAccountSerializer, UserLoginSerializer
from rest_framework.views import APIView
import uuid
import os
from utils.supabase_client import supabase

class SignInView(generics.CreateAPIView):
    queryset = Account.objects.all()
    serializer_class = UserAccountSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Get or create a token for the user
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "user": UserAccountSerializer(user, context=self.get_serializer_context()).data,
            "token": token.key  
        }, status=status.HTTP_201_CREATED)
    
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email_or_username = request.data.get('email_or_username')
        password = request.data.get('password')
        
        if not email_or_username or not password:
            return Response(
                {"error": "Both email/username and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = Account.objects.get(
                Q(email=email_or_username) | Q(username=email_or_username)
            )
            
            if not user.check_password(password):
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "profile_image": user.profile_image,
            })
            
        except Account.DoesNotExist:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserAccountView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Account.objects.all()
    serializer_class = UserAccountSerializer
    
    def get_permissions(self):
        # implement custom permission class or authentication here
        return [permissions.AllowAny()]
    
class UserProfileView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def post(self, request, *args, **kwargs):
        print("Incoming token:", request.auth)
        print("Authenticated user:", request.user)
        
        if 'profile_image' not in request.FILES:
            return Response({"error": "No file provided"}, status=400)

        file = request.FILES['profile_image']
        user = request.user
        
        try:
            #  Delete previous image if exists
            if user.profile_image:
                try:
                    # Extract the filename from the URL
                    old_url = user.profile_image
                    old_filename = old_url.split('userimage/')[1].split('?')[0]
                    
                    print(f"Attempting to delete old image: {old_filename}")
                    delete_result = supabase.storage.from_("userimage").remove([old_filename])
                    print("Delete result:", delete_result)
                except Exception as delete_error:
                    print(f"WARNING: Failed to delete old image - {str(delete_error)}")

            #  Generate new filename and upload
            file_ext = os.path.splitext(file.name)[1]
            filename = f"user_{user.id}/{uuid.uuid4()}{file_ext}"
            file_content = file.read()
            
            print(f"Uploading new image {filename} ({len(file_content)} bytes)")
            print(f"Content type: {file.content_type}")
            
            upload_result = supabase.storage.from_("userimage").upload(
                path=filename,
                file=file_content,
                file_options={"content-type": file.content_type},
            )
            print("Upload result:", upload_result)
            
            #  Get public URL and update user
            url = supabase.storage.from_("userimage").get_public_url(filename)
            print("Generated URL:", url)

            user.profile_image = url
            user.save()
            print("User profile updated")

            return Response({
                "message": "Image uploaded successfully", 
                "url": url,
                "old_image_deleted": bool(user.profile_image) 
            }, status=200)

        except Exception as e:
            print(f"ERROR: {str(e)}")
            return Response({
                "error": "Upload failed",
                "details": str(e)
            }, status=500)