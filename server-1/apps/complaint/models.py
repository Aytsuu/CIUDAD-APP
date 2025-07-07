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
    comp_category = models.CharField(max_length=100, default='Low')
    comp_created_at = models.DateTimeField(auto_now_add=True)
    comp_is_archive = models.BooleanField(default=False)
    cpnt = models.ForeignKey(Complainant, related_name='complaints', on_delete=models.CASCADE)
    
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
    cf_id = models.BigAutoField(primary_key=True)
    comp = models.ForeignKey(Complaint, related_name='complaint_file', on_delete=models.CASCADE)
    file = models.ForeignKey('file.File', on_delete=models.CASCADE, related_name='complaint_complaint_files')
    
    class Meta:
        db_table = 'complaint_file'
    

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



# from django.db import models
# from django.utils import timezone

# class Complainant(models.Model):
#     cpnt_id = models.BigAutoField(primary_key=True)
#     cpnt_name = models.CharField(max_length=100)
#     cpnt_contact = models.CharField(max_length=20, blank=True, null=True)
#     cpnt_email = models.EmailField(blank=True, null=True)
#     add = models.ForeignKey('profiling.Address', on_delete=models.CASCADE, related_name='complainants')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         db_table = 'complainant'
#         verbose_name = "Complainant"
#         verbose_name_plural = "Complainants"
#         ordering = ['-created_at']

#     def __str__(self):
#         return f"{self.cpnt_name} (ID: {self.cpnt_id})"

# class Accused(models.Model):
#     acsd_id = models.BigAutoField(primary_key=True)
#     acsd_name = models.CharField(max_length=100)
#     acsd_contact = models.CharField(max_length=20, blank=True, null=True)
#     # acsd_description = models.TextField(blank=True, null=True)
#     add = models.ForeignKey('profiling.Address', on_delete=models.CASCADE, related_name='accused_list')
#     # created_at = models.DateTimeField(auto_now_add=True)
#     # updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         db_table = 'accused'
#         verbose_name = "Accused"
#         verbose_name_plural = "Accused"
#         ordering = ['-created_at']

#     def __str__(self):
#         return f"{self.acsd_name} (ID: {self.acsd_id})"

# class Complaint(models.Model):
#     comp_id = models.BigAutoField(primary_key=True)
#     comp_incident_type = models.CharField(max_length=100, choices=INCIDENT_TYPES)
#     comp_datetime = models.DateTimeField()
#     comp_location = models.CharField(max_length=255, blank=True, null=True)
#     comp_allegation = models.TextField()
#     comp_category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='low')
#     comp_resolution = models.TextField(blank=True, null=True)
#     comp_created_at = models.DateTimeField(auto_now_add=True)
#     comp_updated_at = models.DateTimeField(auto_now=True)
#     comp_is_archive = models.BooleanField(default=False)
#     cpnt = models.ForeignKey(Complainant, related_name='complaints', on_delete=models.CASCADE)
#     assigned_officer = models.ForeignKey('account.Account', related_name='assigned_complaints', 
#                                        on_delete=models.SET_NULL, null=True, blank=True)

#     class Meta:
#         db_table = 'complaint'
#         verbose_name = "Complaint"
#         verbose_name_plural = "Complaints"
#         ordering = ['-comp_created_at']
#         indexes = [
#             models.Index(fields=['comp_status']),
#             models.Index(fields=['comp_category']),
#         ]

#     def __str__(self):
#         return f"Complaint #{self.comp_id} - {self.get_comp_incident_type_display()}"

# class ComplaintAccused(models.Model):
#     ca_id = models.BigAutoField(primary_key=True)
#     comp = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='accused_parties')
#     acsd = models.ForeignKey(Accused, on_delete=models.CASCADE, related_name='complaints_against')
#     is_primary = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         db_table = 'complaint_accused'
#         unique_together = ('comp', 'acsd')

#     def __str__(self):
#         return f"{self.acsd.acsd_name} in Complaint #{self.comp.comp_id}"

# class ComplaintFile(models.Model):
#     cf_id = models.BigAutoField(primary_key=True)
#     comp = models.ForeignKey(Complaint, related_name='files', on_delete=models.CASCADE)
#     file = models.ForeignKey('file.File', related_name='complaint_files', on_delete=models.CASCADE)
#     description = models.CharField(max_length=255, blank=True, null=True)
#     uploaded_at = models.DateTimeField(auto_now_add=True)
#     uploaded_by = models.ForeignKey('account.Account', on_delete=models.SET_NULL, null=True)

#     class Meta:
#         db_table = 'complaint_file'
#         ordering = ['-uploaded_at']

#     def __str__(self):
#         return f"File {self.file.id} for Complaint #{self.comp.comp_id}"
