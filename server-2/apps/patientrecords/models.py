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
        
        
        

class VitalSigns(models.Model):
    vital_id = models.BigAutoField(primary_key=True)
    vital_bp_systolic = models.CharField(max_length=100)
    vital_bp_diastolic = models.CharField(max_length=100)
    vital_temp = models.CharField(max_length=100)
    vital_RR = models.CharField(max_length=100)
    vital_o2 = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'vital_signs'


class Obstetrical_History(models.Model):
    obs_id = models.BigAutoField(primary_key=True)
    obs_ch_born_alive = models.PositiveIntegerField()
    obs_living_ch = models.PositiveIntegerField()
    obs_abortion = models.PositiveIntegerField()
    obs_still_birth = models.PositiveIntegerField()
    obs_lg_babies = models.PositiveIntegerField()
    obs_gravida = models.PositiveIntegerField()
    obs_para = models.PositiveIntegerField()
    obs_fullterm = models.PositiveIntegerField()
    obs_preterm = models.PositiveIntegerField()
    obs_record_from = models.CharField(max_length=100)
    patrec_id = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='obstetrical_history', db_column='patrec_id')

    class Meta:
        db_table = 'obstetrical_history'


# class Spouse(models.Model):
#     spouse_id = models.BigAutoField(primary_key=True)
#     spouse_type = models.CharField(max_length=10)
#     spouse_lname = models.CharField(max_length=50)
#     spouse_fname = models.CharField(max_length=50)
#     spouse_mnane = models.CharField(max_length=50)
#     spouse_occupation = models.CharField(max_length=50)
#     spouse_dob = models.DateField()

#     class Meta:
#         db_table = 'spouse'
