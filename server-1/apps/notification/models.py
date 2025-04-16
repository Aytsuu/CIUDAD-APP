from django.db import models
import uuid
# Create your models here.
class Notification(models.Model):
    notif_id = uuid.uuid1()
    notif_title = models.CharField(max_length=255)
    
    class Meta:
        db_fields = "notification"