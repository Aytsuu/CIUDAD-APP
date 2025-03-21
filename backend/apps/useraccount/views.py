# from rest_framework import generics, status
# from rest_framework.response import Response
# from rest_framework_simplejwt.views import TokenObtainPairView
# from .models import UserAccount
# from .serializers import UserAccountSerializer, CustomTokenObtainPairSerializer

# # View for listing and creating UserAccount objects
# class UserAccountListCreateView(generics.ListCreateAPIView):
#     queryset = UserAccount.objects.all()
#     serializer_class = UserAccountSerializer

# # View for retrieving, updating, and deleting UserAccount objects
# class UserAccountRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = UserAccount.objects.all()
#     serializer_class = UserAccountSerializer

# # Custom JWT login view
# class CustomTokenObtainPairView(TokenObtainPairView):
#     serializer_class = CustomTokenObtainPairSerializer


from rest_framework import generics, permissions
from django.contrib.auth.models import User
from .serializers import UserSerializer

# Regular user registration
class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]  # Allow anyone to register

# Admin-only view to create superusers
class AdminUserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]  # Only admins can access

    def perform_create(self, serializer):
        # Set is_superuser for admin users
        serializer.save(is_superuser=True)

# View to retrieve, update, or delete a user
class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]  # Only authenticated users can access

    def get_object(self):
        # Return the user associated with the logged-in user
        return self.request.user