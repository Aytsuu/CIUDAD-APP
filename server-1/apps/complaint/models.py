from django.db import models

class Complainant(models.Model):
    cpnt_id = models.BigAutoField(primary_key=True)
    cpnt_name = models.CharField(max_length=100)
    add = models.ForeignKey('profiling.Address', on_delete=models.CASCADE, related_name='complainant')
    
    class Meta:
        db_table = 'complainant'

class Accused(models.Model):
    acsd_id = models.BigAutoField(primary_key=True)
    acsd_name = models.CharField(max_length=100)
    add = models.ForeignKey('profiling.Address', on_delete=models.CASCADE, related_name='accused')
    
    class Meta:
        db_table = 'accused'
 
class Complaint(models.Model):
    comp_id = models.BigAutoField(primary_key=True)
    comp_incident_type = models.CharField(max_length=100)
    comp_datetime = models.CharField(max_length=100)
    comp_allegation = models.TextField()
    comp_created_at = models.DateTimeField(auto_now_add=True)
    comp_is_archive = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'complaint'

class ComplaintAccused(models.Model):
    ca_id = models.BigAutoField(primary_key=True)
    comp = models.ForeignKey(Complaint, on_delete=models.CASCADE)
    acsd = models.ForeignKey(Accused, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'complaint_accused'
        unique_together = ('comp', 'acsd')  # Prevent duplicate relationships

class Complaint_File(models.Model):
    comp_file_id = models.BigAutoField(primary_key=True)
    comp_file_name = models.CharField(max_length=255)
    comp_file_type = models.CharField(max_length=10)
    comp_file_path = models.URLField(max_length=512)  # Stores Supabase URL
    supabase_path = models.CharField(max_length=255)  # Stores internal Supabase path
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    comp = models.ForeignKey(
        Complaint, 
        on_delete=models.CASCADE,
        related_name='complaint_file',
    )

    class Meta:
        db_table = 'complaint_file'
        indexes = [
            models.Index(fields=['comp_file_type']),
            models.Index(fields=['comp']),
        ]

    def __str__(self):
        return f"{self.comp_file_name} (Case #{self.comp.comp_id})"
    

class ComplaintRecipient(models.Model):
    comp_rec_id = models.BigAutoField(primary_key=True)
    comp_acc = models.ForeignKey(ComplaintAccused, on_delete=models.CASCADE, related_name="recipients")
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
        ]

    def __str__(self):
        return f"Recipient {self.recipient.username} for case #{self.comp_acc.ca_id}"
