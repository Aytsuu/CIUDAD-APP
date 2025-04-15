from django.db import models



class PatientRecord(models.Model):
    pat_id =  models.BigAutoField(primary_key=True)
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
    city    = models.CharField(max_length=100)
    province = models.CharField(max_length=100)
    pat_type = models.CharField(default="Regular", max_length=100)     
    # address = models.CharField(max_length=300)

    class Meta:
        db_table = 'patient_record'
    
class VaccinationRecord(models.Model):
    
    vacrec_id = models.BigAutoField(primary_key=True)
    pat_id = models.ForeignKey(PatientRecord, on_delete=models.CASCADE)
    class Meta:
        db_table = 'vaccination_record'

    
class VitalSigns(models.Model):
    vital_id = models.ForeignKey(VaccinationRecord, on_delete=models.CASCADE)
    vital_bp_systolic = models.CharField(max_length=100)
    vital_bp_diastolic = models.CharField(max_length=100)
    vital_temp = models.CharField(max_length=100)
    vital_RR = models.CharField(max_length=100)
    vital_o2 = models.CharField(max_length=100)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'vital_signs'
        

class VaccinationHistory(models.Model):
    vachist_id = models.BigAutoField(primary_key=True)
    vachist_doseNo = models.CharField(max_length=100)
    vachist_status = models.CharField(max_length=100)
    # vachist_signature = models.CharField(max_length=300)
    
    vachist_pulseRate   = models.CharField(max_length=100)
    vachist_bp_systolic = models.CharField(max_length=100)
    vachist_bp_systolic = models.CharField(max_length=100)

    staff_id = models.PositiveIntegerField(default=1)   
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    vital_id = models.ForeignKey(VitalSigns, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'vaccination_history'
        