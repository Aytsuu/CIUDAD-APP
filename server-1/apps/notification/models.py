from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from supabase import create_client
from django.conf import settings

class Notification(models.Model):
    notif_id = models.BigAutoField(primary_key=True)
    notif_title = models.CharField(max_length=255, null=False)
    notif_message = models.TextField()
    notif_created_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True, null=False)
    sender = models.ForeignKey('account.Account', on_delete=models.CASCADE, related_name='notification')
    
    # Generic relation to link to any model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        ordering = ['-notif_created_at']
        db_table = 'notification'
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['sender']),
        ]
        
    def mark_as_read(self):
        self.is_read = True
        self.read_at = timezone.now()
        self.save()

    def push_to_supabase(self):
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        
        data = {
            'django_id': self.notif_id,
            'title': self.notif_title,
            'message': self.notif_message,
            'created_at': self.notif_created_at.isoformat(),
            'sender_id': {
                'supabase_id': self.sender.supabase_id,
                'username': self.sender.username,
                'email': self.sender.email,
                'profile_image': self.sender.profile_image if self.sender.profile_image else None,
            },
            'is_read': self.is_read,
            'metadata': self.metadata
        }
    
        supabase.table('notification').upsert(data).execute()

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
    is_read = models.BooleanField(default=False)
    acc = models.ForeignKey('account.Account', on_delete=models.CASCADE, related_name="recipient")
    notif = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='recipient')
    
    class Meta: 
        db_table = 'recipient'
        
    def __str__(self):
        return f"Recipient {self.rec_id} - {self.acc.username}"
        