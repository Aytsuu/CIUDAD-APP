from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('info', 'Information'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    )
    
    DELIVERY_CHANNELS = (
        ('web', 'Web Notification'),
        ('mobile', 'Mobile Notification'),
        ('both', 'Mobile and Web Notification'),
    )
    
    RECIPIENT_TYPES = (
        ('user', "All Authenticated Users"),
        ('staff', "Staff Users Only"),
        ('specific', "Specific User"),
    )
    
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    
    notif_recipient_type = models.CharField(max_length=20, choices=RECIPIENT_TYPES, default='specific')
    
    notif_title = models.CharField(max_length=255)
    notif_message = models.TextField()
    notif_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default='info'
    )
    notif_delivery_channel = models.CharField(
        max_length=20,
        choices=DELIVERY_CHANNELS,
        default='both'
    )
    
    # Status Tracking
    notif_is_read = models.BooleanField(default=False)
    notif_sent_web = models.BooleanField(default=False)
    notif_sent_mobile = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'notifications'
        
    def __str__(self):
        if self.recipient:
            return f"{self.title} to {self.recipient.username}"
        return f"{self.title} ({self.get_recipient_type_display()})"


class FCMToken(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fcm_tokens')
    fcm_token = models.CharField(max_length=255, unique=True)
    fcm_device_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'fcm_tokens'
        unique_together = [['user_id', 'fcm_device_id']]  