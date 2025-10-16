from django.db import models
from django.utils import timezone
from django.db.models import Max
import json

class Complainant(models.Model):
    cpnt_id = models.BigAutoField(primary_key=True)
    cpnt_name = models.CharField(max_length=100)
    cpnt_gender = models.CharField(max_length=20)
    cpnt_age = models.CharField(max_length=2)
    cpnt_number = models.CharField(max_length=11)
    cpnt_relation_to_respondent = models.CharField(max_length=20)
    cpnt_address = models.CharField(max_length=255, blank=True, null=True)
    rp_id = models.ForeignKey(
        'profiling.ResidentProfile', 
        on_delete=models.CASCADE, 
        db_column='rp_id',
        null = True,
        blank = True,
    )
    
    class Meta:
        db_table = 'complainant'

class Accused(models.Model):
    acsd_id = models.BigAutoField(primary_key=True)
    acsd_name = models.CharField(max_length=100)
    acsd_age = models.CharField(max_length=2)
    acsd_gender = models.CharField(max_length=20)
    acsd_description = models.TextField()
    acsd_address = models.CharField(max_length=255, blank=True, null=True)
    rp_id = models.ForeignKey(
        'profiling.ResidentProfile',
        on_delete=models.CASCADE,
        db_column='rp_id',
        null=True,
        blank=True,
    )
    class Meta:
        db_table = 'accused'

class Complaint(models.Model):
    comp_id = models.BigIntegerField(primary_key=True)
    comp_location = models.CharField(max_length=255)
    comp_incident_type = models.CharField(max_length=100)
    comp_datetime = models.CharField(max_length=100)
    comp_allegation = models.TextField()
    comp_created_at = models.DateTimeField(auto_now_add=True)
    comp_is_archive = models.BooleanField(default=False)
    comp_status = models.CharField(
        max_length=20, 
        default='Pending',
    )
    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.CASCADE,
        null=True,
        related_name='complaints',
    )
    complainant = models.ManyToManyField(
        Complainant,
        through='ComplaintComplainant',
        related_name='complaints'
    )
    accused = models.ManyToManyField(
        Accused,
        through='ComplaintAccused',
        related_name='complaints'
    )

    class Meta:
        db_table = 'complaint'

    def save(self, *args, **kwargs):
        if not self.comp_id:
            today = timezone.now()
            date_str = today.strftime('%y%m%d')

            last_id = Complaint.objects.filter(
                comp_id__startswith=date_str
            ).aggregate(max_id=Max('comp_id'))['max_id']

            if last_id:
                seq = int(str(last_id)[-3:]) + 1 
            else:
                seq = 1

            self.comp_id = int(f"{date_str}{seq:03d}") 
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        if self.comp_id:
            return f"/complaint/view?id={self.comp_id}"
        return f"/complaint/view"
    
    def get_mobile_route(self):
        return {
            'screen' : '/(my-request)/complaint-tracking/compMainView',
            'params' : {'comp_id': str(self.comp_id)}
        }
        
        
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
    comp_file_url = models.URLField(max_length=500)
    comp = models.ForeignKey(
        Complaint,
        on_delete=models.CASCADE,
        related_name='files',
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