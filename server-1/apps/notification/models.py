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
    notif_type = models.CharField(max_length=100, default='info')
    sender = models.ForeignKey('account.Account', on_delete=models.CASCADE, related_name='notification')
    
    # Generic relation to link to any model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    web_route = models.CharField(max_length=255, null=True, blank=True)
    web_params = models.JSONField(null=True, blank=True)
    
    mobile_route = models.CharField(max_length=255, null=True, blank=True)
    mobile_params = models.JSONField(null=True, blank=True)
    
    class Meta:
        ordering = ['-notif_created_at']
        db_table = 'notification'
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['sender']),
        ]
    def __str__(self):
        return f"Notification {self.notif_title} - {self.notif_created_at}"

class FCMToken(models.Model):
    acc = models.ForeignKey('account.Account', on_delete=models.CASCADE, related_name="fcm_token")
    fcm_token = models.CharField(max_length=255)
    fcm_device_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'fcm_token'
        unique_together = [['acc', 'fcm_device_id']]   
        
    def __str__(self):
        return f"FCMToken for {self.acc.username} - {self.fcm_device_id}"
        
class Recipient(models.Model):
    rec_id = models.BigAutoField(primary_key=True)
    is_read = models.BooleanField(default=False)
    rp = models.ForeignKey('profiling.ResidentProfile', on_delete=models.CASCADE, null=True, blank=True)
    notif = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='recipient')
    
    class Meta: 
        db_table = 'recipient'
        
    def mark_as_read(self):
        self.is_read = True
        self.read_at = timezone.now()
        self.save()
        
    def __str__(self):
        return f"Recipient {self.rec_id} - {self.acc.username}"