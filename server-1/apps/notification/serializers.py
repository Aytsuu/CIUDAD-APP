from rest_framework import serializers
from .models import Notification, FCMToken

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        extra_kwargs = {
            'user_id': {'read_only': True} 
        }

class FCMTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = FCMToken
        fields = ['fcm_token']