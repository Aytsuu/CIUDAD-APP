from django.db import models
from datetime import datetime
# Create your models here.

class Sitio(models.Model):
    sitio_id = models.CharField(max_length=100, primary_key=True)
    sitio_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'sitio'
        managed = False 

    def __str__(self):
        return self.sitio_id

class Address(models.Model):
    add_id = models.BigAutoField(primary_key=True)  
    add_province = models.CharField(max_length=50)
    add_city = models.CharField(max_length=50)
    add_barangay = models.CharField(max_length=50)
    add_street = models.CharField(max_length=50)
    add_external_sitio = models.CharField(max_length=50, null=True, blank=True)
    sitio = models.ForeignKey(Sitio, on_delete=models.CASCADE, null=True)

    class Meta:
        db_table = 'address'
        managed = False

    def __str__(self):
        return f'{self.add_province}, {self.add_city}, {self.add_barangay}, {self.sitio if self.sitio else self.add_external_sitio}, {self.add_street}'

class Complainant(models.Model):
    cpnt_id = models.BigAutoField(primary_key=True)
    cpnt_name = models.CharField(max_length=100)
    add = models.ForeignKey('clerk.Address', on_delete=models.CASCADE, related_name='complainant')
    
    class Meta:
        db_table = 'complainant'
        managed = False

class Accused(models.Model):
    acsd_id = models.BigAutoField(primary_key=True)
    acsd_name = models.CharField(max_length=100)
    add = models.ForeignKey('clerk.Address', on_delete=models.CASCADE, related_name='accused')
    
    class Meta:
        db_table = 'accused'
        managed = False

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
        managed = False

class ComplaintAccused(models.Model):
    ca_id = models.BigAutoField(primary_key=True)
    comp = models.ForeignKey(Complaint, on_delete=models.CASCADE)
    acsd = models.ForeignKey(Accused, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'complaint_accused'
        unique_together = ('comp', 'acsd')  # Prevent duplicate relationships
        managed = False

class Complaint_File(models.Model):
    cf_id = models.BigAutoField(primary_key=True)
    comp = models.ForeignKey(Complaint, related_name='complaint_file', on_delete=models.CASCADE)
    file = models.ForeignKey('file.File', related_name='complaint_file', on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'complaint_file'
        managed = False

class ServiceChargeRequest(models.Model): 
    sr_id = models.BigAutoField(primary_key=True)
    sr_req_date = models.DateTimeField(default=datetime.now)
    sr_status = models.CharField(null=True, blank=True)
    sr_payment_status = models.CharField(null=True, blank=True)
    sr_type = models.CharField(null=True, blank=True)
    sr_decision_date = models.DateTimeField(null=True, blank=True)
    # staff_id = models.ForeignKey('administration.Staff', on_delete=models.SET_NULL, db_column='staff_id', null=True)
    comp = models.ForeignKey('clerk.Complaint', on_delete=models.SET_NULL, db_column='comp_id', null=True)
    file_action_file = models.OneToOneField(
        'CaseActivityFile', null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='file_action_for'
    )

    class Meta:
        db_table = 'service_charge_request'


class CaseActivity(models.Model):
    ca_id = models.BigAutoField(primary_key=True)
    ca_reason = models.CharField(max_length=100)
    ca_hearing_date = models.DateField(null=False)
    ca_hearing_time = models.TimeField(null=False)
    ca_date_of_issuance = models.DateTimeField(default=datetime.now)
    sr = models.ForeignKey('ServiceChargeRequest', on_delete=models.CASCADE, related_name='case')
    caf = models.ForeignKey('CaseActivityFile', on_delete=models.CASCADE, null=True, related_name='case_file')

    class Meta:
        db_table = 'case_activity'


class CaseActivityFile(models.Model):
    caf_id = models.BigAutoField(primary_key=True)
    caf_name = models.CharField(max_length=255)
    caf_type = models.CharField(max_length=100)
    caf_path = models.CharField(max_length=500)
    caf_url = models.CharField(max_length=500)
    
    class Meta:
        db_table = 'case_activity_file'