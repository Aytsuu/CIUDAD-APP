from rest_framework import serializers
from .models import Account, PhoneVerification
from utils.otp import generate_otp


class UserAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = Account.objects.create_user(**validated_data)
        return user
    
class AccountInputSerializer(serializers.Serializer):
    phone = serializers.CharField(write_only=True)
    email = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True)

class PhoneVerificationBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhoneVerification
        fields = "__all__"

    def create(self, validated_data):
        instance = PhoneVerification(**validated_data)
        instance.pv_otp = generate_otp()
        instance.save()
        return instance
    