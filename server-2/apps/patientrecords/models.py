from django.db import models
from apps.healthProfiling.models import ResidentProfile
from apps.healthProfiling.models import Personal, ResidentProfile

# Create your models here.

# class Patient(models.Model):
#     pat_id = models.BigAutoField(primary_key=True)
#     pat_type = models.CharField(max_length=100, default="Resident")
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     pat_status = models.CharField(max_length=100, default="Active")
#     rp_id = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE, related_name='patients', db_column='rp_id', null=True)
#     class Meta:
#         db_table = 'patient'
#         ordering = ['-created_at']

class Patient(models.Model):
    pat_id = models.CharField(
        max_length=15,
        primary_key=True,
        editable=False,
        unique=True
    )
    pat_id = models.CharField(
        max_length=15,
        primary_key=True,
        editable=False,
        unique=True
    )
    pat_type = models.CharField(max_length=100, default="Resident")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    pat_status = models.CharField(max_length=100, default="Active")
    rp_id = models.ForeignKey(
       ResidentProfile,
        on_delete=models.CASCADE,
        related_name='patients',
        db_column='rp_id',
        null=True
    )

    def save(self, *args, **kwargs):
        if not self.pat_id and self.rp_id and hasattr(self.rp_id, 'per') and self.rp_id.per.per_dob:
            year = self.rp_id.per.per_dob.year
            type_code = 'R' if self.pat_type.lower() == 'resident' else 'T'
            prefix = f'P{type_code}{year}'
            count = Patient.objects.filter(pat_id__startswith=prefix).count() + 1
            self.pat_id = f'{prefix}{str(count).zfill(4)}'
        super().save(*args, **kwargs)

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
    vital_bp_diastolic = models.CharField(max_length=100,default="N/A")
    vital_temp = models.CharField(max_length=100,default="N/A")
    vital_RR = models.CharField(max_length=100,default="N/A")
    vital_o2 = models.CharField(max_length=100,default="N/A")
    vital_pulse = models.CharField(max_length=100,default="N/A")
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
        
        
class FollowUpVisit(models.Model):
    followv_id = models.BigAutoField(primary_key=True)
    followv_date = models.DateField()
    followv_status = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    patrec = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='follow_up_visits')
    class Meta:
        db_table = 'follow_up_visit'
         
        
class Spouse(models.Model):
    spouse_id = models.BigAutoField(primary_key=True)
    spouse_type = models.CharField(max_length=10)
    spouse_lname = models.CharField(max_length=50, default="")
    spouse_fname = models.CharField(max_length=50, default="")
    spouse_mname = models.CharField(max_length=50, default="")
    spouse_occupation = models.CharField(max_length=50)
    spouse_dob = models.DateField()
    rp_id = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE, related_name='spouse', db_column='rp_id', null=True)

    class Meta:
        db_table = 'spouse'
        
class BodyMeasurement(models.Model):
    bm_id = models.BigAutoField(primary_key=True)  
    age = models.CharField(max_length=100 ,default="")
    height = models.IntegerField()
    weight = models.IntegerField()
    bmi = models.DecimalField(max_digits=5, decimal_places=2)
    bmi_category = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    pat = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='body_measurements', null=True)
    
    class Meta:
        db_table = 'body_measurement'
           

class Illness(models.Model):
    ill_id = models.BigAutoField(primary_key=True)
    illname = models.CharField(max_length=100,default="")
    ill_description = models.CharField(max_length=200, default="N/A")
    ill_code = models.CharField(max_length=100,default="N/A")
    created_at= models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'illness'

# FINDINGS
class Finding(models.Model):
    find_id = models.BigAutoField(primary_key=True)
    # find_description = models.TextField()   
    obj_description = models.TextField(default="")
    subj_description = models.TextField(default="")
    created_at= models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'finding'

class PhysicalExamList(models.Model):
    pel_id = models.BigAutoField(primary_key=True)
    pel_system = models.CharField(max_length=100,default="")
    pel_finding = models.TextField(default="")
    is_other = models.BooleanField(default=False)
    created_at= models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'physical_exam_list'   
        
class PhysicalExamination(models.Model):    
    pe_id = models.BigAutoField(primary_key=True)
    
    find = models.ForeignKey(Finding, on_delete=models.CASCADE, related_name='physical_examinations', null=True)
    pel = models.ForeignKey(PhysicalExamList, on_delete=models.CASCADE, related_name='physical_examinations',null=True)

    class Meta:
        db_table = 'physical_examination'
    
class Diagnosis(models.Model):
    diag_id = models.BigAutoField(primary_key=True)
    ill = models.ForeignKey(Illness, on_delete=models.CASCADE, related_name='diagnosis', null=True)
    find = models.ForeignKey(Finding, on_delete=models.CASCADE, related_name='diagnosis', null=True)
    class Meta:
        db_table = 'diagnosis'
        