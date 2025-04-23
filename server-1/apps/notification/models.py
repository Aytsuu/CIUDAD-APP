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
        ('Mobile and Web', 'Mobile and Web Notification'),
    )
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=10, choices=NOTIFICATION_TYPES, default='info')
    deliver_channel = models.CharField(max_length=10, choices=DELIVERY_CHANNELS, default='Mobile and Web')
    
    # Optional link to related object (using generic relations)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object - GenericForeignKey('content_type', 'object_id')
    
    #Status Tracking
    is_read = models.BooleanField(default=False)
    sent_web = models.BooleanField(default=False)
    sent_mobile = models.BooleanField(default=False)
    
    #Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'notification'
        
    def __str__(self):
        return f"{self.title} to {self.recipient.username}"
    
    

class FCMToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.TextField()
    
    class Meta:
        db_table = 'fcm_token'
