from rest_framework import serializers
from .models import *

class UserAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccount
        fields = '__all__'
        extra_kwargs = {
            "password": {"write_only": True}, 
        }
