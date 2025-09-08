from rest_framework import serializers
from .models import Account, PhoneVerification
import secrets


class UserAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = Account.objects.create_user(**validated_data)
        return user

class PhoneVerificationBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhoneVerification
        fields = "__all__"

    def create(self, validated_data):
        instance = PhoneVerification(**validated_data)
        instance.pv_otp = self.generate_otp()
        instance.save()
        return instance
    
    def generate_otp(self):
        otp = str(secrets.randbelow(10 ** 6)).zfill(6)
        return otp
    