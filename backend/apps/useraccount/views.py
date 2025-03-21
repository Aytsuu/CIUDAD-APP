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

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import login
from .authentication import SupabaseAuthenticationBackend
from .serializers import UserSerializer
from django.contrib.auth.models import User

class SupabaseLoginView(APIView):
    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate the user using the Supabase JWT
        backend = SupabaseAuthenticationBackend()
        user = backend.authenticate(request, token=token)
        if user:
            login(request, user)
            return Response({"message": "Login successful", "user_id": user.id, "is_superuser": user.is_superuser})
        else:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)