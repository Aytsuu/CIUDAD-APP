from django.db import models
from abstract_classes import AbstractModels

class Announcement(AbstractModels):
    ann_id = models.AutoField(primary_key=True)
    ann_title = models.CharField(max_length=1000)
    ann_details = models.TextField()
    ann_created_at = models.DateTimeField(auto_now_add=True)
    ann_start_at = models.DateTimeField(null=True, blank=True)
    ann_end_at = models.DateTimeField(null=True, blank=True)
    ann_event_start = models.DateTimeField(null=True, blank=True)
    ann_event_end = models.DateTimeField(null=True, blank=True)
    ann_type = models.CharField(max_length=50)
    ann_to_sms = models.BooleanField(default=True)
    ann_to_email = models.BooleanField(default=True)
    ann_status = models.CharField(max_length=50, default="INACTIVE")
    staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'announcement'
        ordering = ['-ann_created_at']


class AnnouncementFile(models.Model):
    af_id = models.AutoField(primary_key=True)
    ann = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
        related_name="announcement_files"
    )
    af_name = models.TextField()
    af_type = models.CharField(max_length=50)
    af_path = models.TextField()
    af_url = models.TextField()

    class Meta:
        db_table = 'announcement_file'


class AnnouncementRecipient(AbstractModels):
    ar_id = models.AutoField(primary_key=True)

    ann = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
        related_name="announcement_recipients"
    )
    ar_category = models.CharField(max_length=50)
    ar_type = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'announcement_recipient'