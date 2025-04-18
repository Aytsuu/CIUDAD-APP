from django.db import models
from apps.inventory.models import VaccineStock

class PatientRecord(models.Model):
    pat_id = models.BigAutoField(primary_key=True)
    fname = models.CharField(max_length=100)
    lname = models.CharField(max_length=100)
    mname = models.CharField(max_length=100)
    dob = models.DateField()
    age = models.CharField(max_length=100)
    sex = models.CharField(max_length=100)
    householdno = models.CharField(max_length=100)
    street = models.CharField(max_length=100)
    sitio = models.CharField(max_length=100)
    barangay = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    province = models.CharField(max_length=100)
    pat_type = models.CharField(default="Regular", max_length=100)

    class Meta:
        db_table = 'patient_record'

   

class ServicesRecords(models.Model):
    serv_id = models.BigAutoField(primary_key=True)
    serv_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    pat_id = models.ForeignKey(
        PatientRecord, 
        on_delete=models.CASCADE, 
        related_name='services'
    )
    
    class Meta:
        db_table = 'services_records'

class VaccinationRecord(models.Model):
    vacrec_id = models.BigAutoField(primary_key=True)
    serv_id = models.ForeignKey(
        ServicesRecords, 
        on_delete=models.CASCADE, 
        related_name='vaccination_records'
    )
    
    class Meta:
        db_table = 'vaccination_record'

class VitalSigns(models.Model):
    vital_id = models.BigAutoField(primary_key=True)
    vital_bp_systolic = models.CharField(max_length=100, null=True, blank=True)
    vital_bp_diastolic = models.CharField(max_length=100, null=True, blank=True)
    vital_temp = models.CharField(max_length=100, null=True, blank=True)
    vital_RR = models.CharField(max_length=100, null=True, blank=True)
    vital_o2 = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'vital_signs'

class VaccinationHistory(models.Model):
    vachist_id = models.BigAutoField(primary_key=True)
    vachist_doseNo = models.CharField(max_length=100)
    vachist_status = models.CharField(max_length=100)
    vachist_age = models.PositiveIntegerField(default=0)
    assigned_to = models.PositiveIntegerField(null=True, blank=True)
    staff_id = models.PositiveIntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)
    vital_id = models.ForeignKey(
        VitalSigns, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='vaccination_histories'
    )
    vacrec_id = models.ForeignKey(
        VaccinationRecord, 
        on_delete=models.CASCADE,
        related_name='vaccination_histories'
    )
    vacStck_id = models.ForeignKey(
        VaccineStock, 
        on_delete=models.CASCADE,
        related_name='vaccination_histories'
    )

    class Meta:
        db_table = 'vaccination_history'