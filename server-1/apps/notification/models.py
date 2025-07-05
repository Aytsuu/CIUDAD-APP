from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from supabase import create_client
from django.conf import settings

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('info', 'Information'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    )
    
    recipient = models.ForeignKey('account.Account', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='info')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Generic relation to link to any model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        ordering = ['-created_at']
        db_table = 'notification'
        
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.push_to_supabase()
        
    def push_to_supabase(self):
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        
        supabase.table('notification').insert({
            'recipient_id': self.recipient.supabase_id, 
            'title': self.title,
            'message': self.message,
            'type': self.notification_type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat(),
            'related_object_type': self.content_type.model if self.content_type else None,
            'related_object_id': self.object_id
        }).execute()

class FCMToken(models.Model):
    acc = models.OneToOneField('account.Account', on_delete=models.CASCADE, related_name="fcm_token")
    fcm_token = models.CharField(max_length=255, unique=True)
    fcm_device_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'fcm_token'
        unique_together = [['acc', 'fcm_device_id']]   
        
class Recipient(models.Model):
    rec_id = models.BigAutoField(primary_key=True)
    acc = models.ForeignKey('account.Account', on_delete=models.CASCADE, related_name="received_notification")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta: 
        db_table = 'recipient'
        
    def __str__(self):
        return f"Recipient {self.rec_id} - {self.acc.username}"
        