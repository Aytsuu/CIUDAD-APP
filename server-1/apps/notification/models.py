from django.db import models
import uuid
from django.utils import timezone
from django.urls import reverse 
from django.db import models
from django.conf import settings

class Notification(models.Model):
    notif_id = models.AutoField(primary_key=True) 
    notif_title = models.CharField(max_length=255)
    notif_message = models.TextField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    action_url = models.URLField(blank=True, null=True) 
    account = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='notification', 
        verbose_name='Account',
        db_column='id'  # Keeps your preferred DB column name
    )

    class Meta:
        db_table = 'notification'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notif_title} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

    def mark_as_read(self):
        self.is_read = True
        self.save()

    def get_absolute_url(self):
        return self.action_url or reverse('notifications:list')