from django.db import models
from apps.healthProfiling.models import Personal

# Create your models here.



class Patient(models.Model):
    pat_id = models.BigAutoField(primary_key=True)
    pat_type = models.CharField(max_length=100, default="Resident")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    pat_status = models.CharField(max_length=100, default="Active")
    per_id = models.ForeignKey(Personal,on_delete=models.CASCADE,related_name='patients',db_column='per_id')
    
    class Meta:
        db_table = 'patient'
        ordering = ['-created_at']

class PatientRecord(models.Model):
    patrec_id = models.BigAutoField(primary_key=True)
    patrec_type = models.CharField(max_length=100) #SERVICES  LIKE VACCINATION
    pat_id = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='patient_records',db_column='pat_id')
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'patient_record'
        ordering = ['-patrec_id']