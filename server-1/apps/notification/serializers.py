from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'notif_title', 'notif_message', 'is_read', 
                 'created_at', 'action_url']
        read_only_fields = ['created_at']