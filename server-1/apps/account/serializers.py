from rest_framework import serializers
from .models import Account

class UserAccountSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = Account
        fields = ['id', 'username', 'email', 'password', 'rp']
        extra_kwargs = {
            'date_created': {'read_only': True}
        }
        
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = Account(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)