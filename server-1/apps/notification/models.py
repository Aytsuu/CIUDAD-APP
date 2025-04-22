from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class FCMToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.TextField()
    
    class Meta:
        db_table = 'fcm_token'

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sender = models.CharField(max_length=255) 
    message = models.TextField()
    notification_type = models.CharField(max_length=50)
    related_object_id = models.IntegerField(null=True, blank=True) 
    related_object_type = models.CharField(max_length=50, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notification'
        
    def __str__(self):
        return f"{self.sender} to {self.user.username}: {self.message[:30]}"