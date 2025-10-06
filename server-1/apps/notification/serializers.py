from rest_framework import serializers
from .models import Notification, FCMToken, Recipient

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_avatar = serializers.SerializerMethodField()
    recipients = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    redirect_url = serializers.SerializerMethodField()
    class Meta:
        model = Notification
        fields = [
            'notif_id', 
            'notif_title', 
            'notif_message', 
            'sender', 
            'sender_name', 
            'sender_avatar', 
            'notif_created_at',
            'recipients'
        ]
        read_only_fields = ['notif_id', 'notif_created_at', 'sender']
    
    def get_sender_avatar(self, obj):
        # Adjust this based on your Account model's avatar field
        if hasattr(obj.sender, 'avatar') and obj.sender.avatar:
            return obj.sender.avatar.url if hasattr(obj.sender.avatar, 'url') else str(obj.sender.avatar)
        return None
    
    def get_redirect_url(self, obj):
        if obj.content_object and hasattr(obj.content_object, "get_absolute_url"):
            return obj.content_object.get_absolute_url()
        return None


class RecipientSerializer(serializers.ModelSerializer):
    notif_id = serializers.IntegerField(source='notif.notif_id', read_only=True)
    notif_title = serializers.CharField(source='notif.notif_title', read_only=True)
    notif_message = serializers.CharField(source='notif.notif_message', read_only=True)
    notif_created_at = serializers.DateTimeField(source='notif.notif_created_at', read_only=True)
    resident = serializers.SerializerMethodField()
    redirect_url = serializers.SerializerMethodField()
    sender_name = serializers.CharField(source='notif.sender.username', read_only=True)
    sender_avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = Recipient
        fields = [
            'notif_id', 
            'notif_title', 
            'notif_message', 
            'is_read', 
            'notif_created_at', 
            'resident',
            'redirect_url',
            'sender_name',
            'sender_avatar'
        ]
        read_only_fields = fields
    
    def get_sender_avatar(self, obj):
        if obj.notif.sender and hasattr(obj.notif.sender, 'avatar') and obj.notif.sender.avatar:
            return obj.notif.sender.avatar.url if hasattr(obj.notif.sender.avatar, 'url') else str(obj.notif.sender.avatar)
        return None

    def get_resident(self, obj):
        """Return resident profile information"""
        if obj.rp:
            # Get name from Personal model if available
            name = None
            if hasattr(obj.rp, 'per') and obj.rp.per:
                # Adjust based on your Personal model's name fields
                # Common patterns: full_name, first_name + last_name, etc.
                name = (
                    getattr(obj.rp.per, 'per_fullname', None) or
                    getattr(obj.rp.per, 'full_name', None) or
                    f"{getattr(obj.rp.per, 'first_name', '')} {getattr(obj.rp.per, 'last_name', '')}".strip() or
                    None
                )
            
            return {
                "rp_id": obj.rp.rp_id,
                "name": name
            }
        return None
    
    def get_redirect_url(self, obj):
        if obj.notif.content_object and hasattr(obj.notif.content_object, "get_absolute_url"):
            return obj.notif.content_object.get_absolute_url()
        return None


class FCMTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = FCMToken
        fields = ["fcm_token", "fcm_device_id"]