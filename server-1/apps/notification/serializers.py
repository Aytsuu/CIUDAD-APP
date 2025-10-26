from rest_framework import serializers
from .models import Notification, FCMToken, Recipient


class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_profile = serializers.CharField(source='sender.profile_image', read_only=True)
    recipients = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Notification
        fields = [
            'notif_id',
            'notif_title',
            'notif_message',
            'notif_type',
            'sender',
            'sender_name',
            'sender_profile',
            'notif_created_at',
            'recipients',
            'web_route',
            'web_params',
            'mobile_route',
            'mobile_params',
        ]
        read_only_fields = ['notif_id', 'notif_created_at', 'sender']

class RecipientSerializer(serializers.ModelSerializer):
    notif_id = serializers.IntegerField(source='notif.notif_id', read_only=True)
    notif_title = serializers.CharField(source='notif.notif_title', read_only=True)
    notif_message = serializers.CharField(source='notif.notif_message', read_only=True)
    notif_type = serializers.CharField(source='notif.notif_type', read_only=True)
    notif_created_at = serializers.DateTimeField(source='notif.notif_created_at', read_only=True)
    resident = serializers.SerializerMethodField()
    sender_name = serializers.CharField(source='notif.sender.username', read_only=True)
    sender_profile = serializers.CharField(source='notif.sender.profile_image', read_only=True)
    redirect_url = serializers.SerializerMethodField()
    mobile_screen = serializers.SerializerMethodField()
    class Meta:
        model = Recipient
        fields = [
            'notif_id',
            'notif_title',
            'notif_message',
            'notif_type',
            'is_read',
            'notif_created_at',
            'resident',
            'sender_name',
            'sender_profile',
            'redirect_url',
            'mobile_screen',
        ]
        read_only_fields = fields

    def get_resident(self, obj):
        if obj.rp:
            name = None
            if hasattr(obj.rp, 'per') and obj.rp.per:
                name = (
                    getattr(obj.rp.per, 'per_fullname', None)
                    or getattr(obj.rp.per, 'full_name', None)
                    or f"{getattr(obj.rp.per, 'first_name', '')} {getattr(obj.rp.per, 'last_name', '')}".strip()
                    or None
                )

            return {
                "rp_id": obj.rp.rp_id,
                "name": name
            }
        return None

    def get_redirect_url(self, obj):
        if obj.notif.web_route:
            return {
                'path': obj.notif.web_route,
                'params': obj.notif.web_params or {}
            }
        return None

    def get_mobile_screen(self, obj):
        if obj.notif.mobile_route:
            return {
                'path': obj.notif.mobile_route,
                'params': obj.notif.mobile_params or {}
            }
        return None

class FCMTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = FCMToken
        fields = ["fcm_token", "fcm_device_id"]
