from rest_framework import serializers
from .models import Notification, FCMToken, Recipient


class NotificationSerializer(serializers.ModelSerializer):
    recipients = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Notification
        fields = [
            'notif_id',
            'notif_title',
            'notif_message',
            'notif_type',
            'notif_created_at',
            'recipients',
            'web_route',
            'web_params',
            'mobile_route',
            'mobile_params',
        ]
        read_only_fields = ['notif_id', 'notif_created_at']


class RecipientSerializer(serializers.ModelSerializer):
    notif_id = serializers.IntegerField(source='notif.notif_id', read_only=True)
    notif_title = serializers.CharField(source='notif.notif_title', read_only=True)
    notif_message = serializers.CharField(source='notif.notif_message', read_only=True)
    notif_type = serializers.CharField(source='notif.notif_type', read_only=True)
    notif_created_at = serializers.DateTimeField(source='notif.notif_created_at', read_only=True)
    resident = serializers.SerializerMethodField()
    redirect_url = serializers.SerializerMethodField()
    mobile_route = serializers.SerializerMethodField()
    
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
            'redirect_url',
            'mobile_route',
        ]
        read_only_fields = fields

    def get_resident(self, obj):
        # Access ResidentProfile through Account (obj.acc.rp)
        if obj.acc and hasattr(obj.acc, 'rp') and obj.acc.rp:
            rp = obj.acc.rp
            name = None
            
            # Try to get name from PersonalInfo
            if hasattr(rp, 'per') and rp.per:
                name = (
                    getattr(rp.per, 'per_fullname', None)
                    or getattr(rp.per, 'full_name', None)
                    or f"{getattr(rp.per, 'first_name', '')} {getattr(rp.per, 'last_name', '')}".strip()
                    or None
                )

            return {
                "acc_id": obj.acc.acc_id,
                "rp_id": rp.rp_id,
                "name": name
            }
        
        if obj.acc:
            return {
                "acc_id": obj.acc.acc_id,
                "name": obj.acc.username or obj.acc.email
            }
        
        return None

    def get_redirect_url(self, obj):
        if obj.notif.web_route:
            return {
                'path': obj.notif.web_route,
                'params': obj.notif.web_params or {}
            }
        return None

    def get_mobile_route(self, obj):
        if obj.notif.mobile_route:
            return {
                'screen': obj.notif.mobile_route,
                'params': obj.notif.mobile_params or {}
            }
        return None


class FCMTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = FCMToken
        fields = ["fcm_token", "fcm_device_id"]
        