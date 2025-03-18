from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import UserAccount
from .serializers import UserAccountSerializer

# View for listing and creating UserAccount objects
class UserAccountListCreateView(generics.ListCreateAPIView):
    queryset = UserAccount.objects.all()
    serializer_class = UserAccountSerializer

# View for retrieving, updating, and deleting UserAccount objects
class UserAccountRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserAccount.objects.all()
    serializer_class = UserAccountSerializer

# View for handling login functionality
class UserAccountLoginView(APIView):
    def get(self, request, *args, **kwargs):
        # Extract email and password from query parameters
        email = request.query_params.get("email")
        password = request.query_params.get("password")
        username = request.query_params.get("username")

        # Validate email and password
        if not email or not password:
            return Response(
                {"success": False, "message": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find the user with the provided email
        try:
            user = UserAccount.objects.get(email=email)
        except UserAccount.DoesNotExist:
            return Response(
                {"success": False, "message": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Compare the provided password with the stored password (plain text comparison)
        if user.password == password:  # Simple password comparison
            # Passwords match - login successful
            return Response(
                {
                    "success": True,
                    "message": "Login successful!",
                    "user": UserAccountSerializer(user).data,  # Serialize user data
                },
                status=status.HTTP_200_OK,
            )
        else:
            # Passwords do not match
            return Response(
                {"success": False, "message": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )