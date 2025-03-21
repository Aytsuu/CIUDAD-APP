# from rest_framework import serializers
# from django.contrib.auth import get_user_model
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# UserAccount = get_user_model()

# class UserAccountSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True)

#     class Meta:
#         model = UserAccount
#         fields = ['id', 'username', 'email', 'password']

#     def create(self, validated_data):
#         user = UserAccount.objects.create_user(
#             username=validated_data['username'],
#             email=validated_data['email'],
#             password=validated_data['password']
#         )
#         return user

# class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
#     @classmethod
#     def get_token(cls, user):
#         token = super().get_token(user)
#         token['username'] = user.username
#         token['email'] = user.email
#         return token 
    
#     def validate(self, attrs):
#         username_or_email = attrs.get('username')
#         password = attrs.get('password')

#         # Try to fetch the user by username or email
#         if '@' in username_or_email:
#             user = UserAccount.objects.filter(email=username_or_email).first()
#         else:
#             user = UserAccount.objects.filter(username=username_or_email).first()

#         # Verify the user and password
#         if user and user.check_password(password):
#             # Generate the token
#             refresh = self.get_token(user)
#             data = {
#                 'refresh': str(refresh),
#                 'access': str(refresh.access_token),
#             }
#             return data
#         else:
#             raise serializers.ValidationError("Invalid username/email or password.")
from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_superuser']
        extra_kwargs = {
            'password': {'write_only': True},  # Hide password in responses
            'is_superuser': {'read_only': True},  # Prevent non-admins from setting this field
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user