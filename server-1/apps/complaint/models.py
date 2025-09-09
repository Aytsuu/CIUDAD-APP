from django.db import models
from django.utils import timezone

class Complainant(models.Model):
    cpnt_id = models.BigAutoField(primary_key=True)
    cpnt_name = models.CharField(max_length=100)
    cpnt_gender = models.CharField(max_length=20)
    cpnt_age = models.CharField(max_length=2)
    cpnt_number = models.CharField(max_length=11)
    cpnt_relation_to_respondent = models.CharField(max_length=20)
    add = models.ForeignKey('profiling.Address', on_delete=models.CASCADE, related_name='complainant')

    class Meta:
        db_table = 'complainant'

class Accused(models.Model):
    acsd_id = models.BigAutoField(primary_key=True)
    acsd_name = models.CharField(max_length=100)
    acsd_age = models.CharField(max_length=2)
    acsd_gender = models.CharField(max_length=20)
    acsd_description = models.TextField()
    add = models.ForeignKey('profiling.Address', on_delete=models.CASCADE, related_name='accused')

    class Meta:
        db_table = 'accused'

class Complaint(models.Model):
    comp_id = models.BigAutoField(primary_key=True)
    comp_location = models.CharField(max_length=255)
    comp_incident_type = models.CharField(max_length=100)
    comp_datetime = models.CharField(max_length=100)
    comp_allegation = models.TextField()
    comp_created_at = models.DateTimeField(auto_now_add=True)
    comp_is_archive = models.BooleanField(default=False)
    # comp_status = models.CharField(
    #     max_length=20, 
    #     default='Filed',
    # )
    complainant = models.ManyToManyField(
        Complainant,
        through='ComplaintComplainant',
        related_name='complaint'
    )
    accused = models.ManyToManyField(
        Accused,
        through='ComplaintAccused',
        related_name='complaint'
    )

    class Meta:
        db_table = 'complaint'

    def save(self, *args, **kwargs):
        if not self.comp_id:
            today = timezone.now()
            date_str = today.strftime('%Y%m%d')
            
            count_today = Complaint.objects.filter(comp_created_at__date=today.date()).count() + 1
            self.comp_id = int(f"{date_str}{count_today:03d}")
        super().save(*args, **kwargs)
        
class ComplaintComplainant(models.Model):
    cc_id = models.BigAutoField(primary_key=True)
    comp = models.ForeignKey(Complaint, on_delete=models.CASCADE)
    cpnt = models.ForeignKey(Complainant, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'complaint_complainant'
        unique_together = ('comp', 'cpnt')
        
class ComplaintAccused(models.Model):
    ca_id = models.BigAutoField(primary_key=True)
    comp = models.ForeignKey(Complaint, on_delete=models.CASCADE)
    acsd = models.ForeignKey(Accused, on_delete=models.CASCADE)

    class Meta:
        db_table = 'complaint_accused'
        unique_together = ('comp', 'acsd')

class Complaint_File(models.Model):
    comp_file_id = models.BigAutoField(primary_key=True)
    comp_file_name = models.CharField(max_length=100)
    comp_file_type = models.CharField(max_length=50)
    # comp_file_url = models.URLField(max_length=500)
    comp = models.ForeignKey(
        Complaint,
        on_delete=models.CASCADE,
        related_name='complaint_file',
    )

    class Meta:
        db_table = 'complaint_file'
        indexes = [
            models.Index(fields=['comp_file_name']),
            models.Index(fields=['comp']),
        ]
        
    def __str__(self):
        return f"{self.comp_file_name} (Case #{self.comp.comp_id})"

class ComplaintRecipient(models.Model):
    comp_rec_id = models.BigAutoField(primary_key=True)
    comp = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name="complaint_recipients")
    recipient = models.ForeignKey('account.Account', on_delete=models.CASCADE, related_name="complaint_notifications")
    status = models.CharField(max_length=50, default='pending',
        choices=[('pending', 'Pending'), ('reviewed', 'Reviewed'), ('actioned', 'Actioned')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'complaint_recipient'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['recipient']),
            models.Index(fields=['comp']),
        ]

    def __str__(self):
        return f"Recipient {self.recipient.username} for Complaint #{self.comp.comp_id} ({self.status})"