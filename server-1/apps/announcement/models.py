from django.db import models

class Announcement(models.Model):
    ann_id = models.AutoField(primary_key=True)
    ann_title = models.TextField()
    ann_details = models.TextField(max_length=255)
    ann_created_at = models.DateTimeField(auto_now_add=True)
    ann_start_at = models.DateTimeField(null=True, blank=True)
    ann_end_at = models.DateTimeField(null=True, blank=True)
    ann_event_start = models.DateTimeField(null=True, blank=True)
    ann_event_end = models.DateTimeField(null=True, blank=True)
    ann_type = models.CharField(max_length=50)
    ann_to_sms = models.BooleanField(default=True)
    ann_to_email = models.BooleanField(default=True)
    # ann_status = models.CharField(max_length=50, default="Inactive")
    staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        db_table = 'announcement'
        ordering = ['-ann_created_at']


class AnnouncementFile(models.Model):
    af_id = models.AutoField(primary_key=True)
    ann = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
    )
    af_name = models.TextField()
    af_type = models.CharField(max_length=50)
    af_path = models.TextField()
    af_url = models.TextField()

    class Meta:
        db_table = 'announcement_file'


class AnnouncementRecipient(models.Model):
    ar_id = models.AutoField(primary_key=True)

    ann = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
    )

    ar_type = models.CharField(max_length=50)

    class Meta:
        db_table = 'announcement_recipient'