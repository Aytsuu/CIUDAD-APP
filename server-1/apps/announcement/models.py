from django.db import models
from datetime import date

class Announcement(models.Model):
    ann_id = models.AutoField(primary_key=True)
    ann_title = models.CharField()
    ann_details = models.TextField(max_length=255)
    ann_created_at = models.DateField(default=date.today)  # Changed to DateField
    ann_start_at = models.DateTimeField()
    ann_end_at = models.DateTimeField()
    ann_type = models.CharField(
        max_length=50,
        choices=[
            ('general', 'General'),
            ('urgent', 'Urgent'),
            ('event', 'Event'),
            ('reminder', 'Reminder')
        ],
        default='general'
    )   
    # staff = models.ForeignKey(
    #     'administration.Staff',
    #     on_delete=models.CASCADE
    # )

    class Meta:
        db_table = 'announcement'
        ordering = ['-ann_created_at']




class AnnouncementFile(models.Model):
    af_id = models.AutoField(primary_key=True)
    ann = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
    )
    file = models.ForeignKey(
        'file.File',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='file_id'
    )
  
    class Meta:
        db_table = 'announcement_file'



class AnnouncementRecipient(models.Model):
    ar_id = models.AutoField(primary_key=True)
    ar_mode = models.CharField(
        max_length=50,
        choices=[
            ('email', 'Email'),
            ('sms', 'SMS'),
            ('push', 'Push Notification')
        ],
        default='email'
    )

    ar_type = models.CharField(
        max_length=50,
        choices=[
            ('individual', 'Individual'),
            ('group', 'Group')
        ],
        default='individual'
    )   

    ann = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
    )
    rp = models.ForeignKey(
        'profiling.ResidentProfile',
        on_delete=models.CASCADE,
    )

    class Meta:
        db_table = 'announcement_recipient'
        unique_together = ('ann', 'rp') 
