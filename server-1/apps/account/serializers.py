from rest_framework import serializers
from .models import Account

class UserAccountSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Account
        fields = '__all__'
        extra_kwargs = {
            'date_joined': {'read_only': True}
        }

    def create(self, validated_data):
        # Step 1: Extract M2M data (groups/permissions) first
        groups_data = validated_data.pop('groups', [])  # Default empty list
        permissions_data = validated_data.pop('user_permissions', [])

        # Step 2: Create the user without M2M fields
        password = validated_data.pop('password', None)
        user = Account(**validated_data)
        if password:
            user.set_password(password)
        user.save()

        # Step 3: Assign M2M relationships using .set()
        user.groups.set(groups_data)  # ← Correct way
        user.user_permissions.set(permissions_data)

        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
