from rest_framework import generics, status, permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser 
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
    
    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            try:
                user = Account.objects.get(email=email)
                if user.check_password(password):
                    token, _ = Token.objects.get_or_create(user=user)
                    return Response({
                        "token": token.key,
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "profile_image": user.profile_image,
                    })
                else:
                    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            except Account.DoesNotExist:
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
            # Generate unique filename
            file_ext = os.path.splitext(file.name)[1]
            filename = f"user_{user.id}/{uuid.uuid4()}{file_ext}"
            
            # Read file content ONCE and store in memory
            file_content = file.read()
            
            # Debug prints
            print(f"Attempting to upload {filename} ({len(file_content)} bytes)")
            print(f"Content type: {file.content_type}")
            
            # Upload to Supabase
            upload_result = supabase.storage.from_("userimage").upload(
                path=filename,
                file=file_content,  # Use the stored content
                file_options={"content-type": file.content_type},
            )
            print("Upload result:", upload_result)
            
            # Get public URL
            url = supabase.storage.from_("userimage").get_public_url(filename)
            print("Generated URL:", url)

            # Update user profile
            user.profile_image = url
            user.save()
            print("User profile updated")

            return Response({
                "message": "Image uploaded successfully", 
                "url": url
            }, status=200)

        except Exception as e:
            print(f"ERROR: {str(e)}")
            import traceback
            traceback.print_exc()  # This will show the full traceback
            return Response({
                "error": "Upload failed",
                "details": str(e)
            }, status=500)