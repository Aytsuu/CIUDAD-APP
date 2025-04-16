from django.db import models
import uuid
from django.utils import timezone
from django.urls import reverse  # Useful for generating URLs

class Notification(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True
    )
    notif_title = models.CharField(max_length=255)
    notif_message = models.TextField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    action_url = models.URLField(blank=True, null=True)  # URL for the notification action
    
    # Example foreign key (uncomment if needed)
    # user = models.ForeignKey(
    #     'auth.User',
    #     on_delete=models.CASCADE,
    #     related_name='notifications'
    # )

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