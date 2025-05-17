from django.db import models

class Announcement(models.Model):
    ann_id = models.AutoField(primary_key=True)
    ann_title = models.CharField(max_length=255)
    ann_details = models.TextField()
    ann_created_at = models.DateTimeField(auto_now_add=True)
    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.CASCADE,
        related_name='announcements'
    )

    class Meta:
        db_table = 'announcement'
        ordering = ['-ann_created_at']

    def __str__(self):
        return self.ann_title


class AnnouncementFile(models.Model):
    af_id = models.AutoField(primary_key=True)
    ann = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
        related_name='files'
    )
    file = models.ForeignKey(
        'file.File',
        on_delete=models.CASCADE,
        related_name='announcement_files'
    )

    class Meta:
        db_table = 'announcement_file'

    def __str__(self):
        return f"File for {self.ann.ann_title}"


class AnnouncementRecipient(models.Model):
    ar_id = models.AutoField(primary_key=True)
    ann = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
        related_name='recipients'
    )
    rp = models.ForeignKey(
        'profiling.ResidentProfile',
        on_delete=models.CASCADE,
        related_name='received_announcements'
    )

    class Meta:
        db_table = 'announcement_recipient'
        unique_together = ('ann', 'rp')  # Optional: prevent duplicates

    def __str__(self):
        return f"{self.rp} -> {self.ann.ann_title}"
