from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Account, UserToken 
from .serializers import UserAccountSerializer, UserLoginSerializer

class UserSignupView(generics.CreateAPIView):
    queryset = Account.objects.all()
    serializer_class = UserAccountSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = UserToken.get_or_create(user=user)
        return Response({
            "user": UserAccountSerializer(user, context=self.get_serializer_context()).data,
            "token": token.token
        }, status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            try:
                user = Account.objects.get(username=username)
                if user.check_password(password):
                    token = UserToken.get_or_create(user=user)
                    return Response({
                        "token": token.token,
                        "user_id": user.id,
                        "username": user.username,
                        "email": user.email
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
        return [permissions.AllowAny()]  # Change this for real implementation

class CustomTokenAuthentication:
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '').split()
        if not auth_header or auth_header[0].lower() != 'token':
            return None
            
        if len(auth_header) == 1:
            return None
            
        token = auth_header[1]
        
        try:
            user_token = UserToken.objects.get(token=token)
            return (user_token.user, token)
        except UserToken.DoesNotExist:
            return None
            
    def authenticate_header(self, request):
        return 'Token'
