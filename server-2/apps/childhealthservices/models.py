from django.db import models
from apps.patientrecords.models import PatientRecord,BodyMeasurement,VitalSigns, Finding,FollowUpVisit
from apps.inventory.models import MedicineInventory
from apps.vaccination.models import VaccinationRecord
from apps.administration.models import Staff
from apps.medicineservices.models import MedicineRequest



# Create your models here.
class ChildHealthrecord(models.Model):
    chhrec_id =models.BigAutoField(primary_key=True)
    chr_date = models.DateField(blank=True, null=True)
    ufc_no = models.CharField(max_length=100, blank=True, null=True)
    mother_occupation = models.CharField(max_length=100, blank=True, null=True)
    father_occupation = models.CharField(max_length=100, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ("check-up", "Check-up"),
            ("immunization", "Immunization"),
            ("recorded", "Recorded")
        ],
        default="recorded",
    )
    staff =models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='child_health_records', null=True, blank=True)
    patrec = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='child_health_records')
    
    class Meta:
        db_table = 'child_healthrecord'
       
    
class ChildHealth_History(models.Model):
    chhist_id = models.BigAutoField(primary_key=True)
    chh_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    vital =models.ForeignKey(VitalSigns, on_delete=models.CASCADE, related_name='child_health_histories', blank=True, null=True)
    find =models.ForeignKey(Finding, on_delete=models.CASCADE, related_name='child_health_histories', blank=True, null=True)
    chrec = models.ForeignKey(ChildHealthrecord, on_delete=models.CASCADE, related_name='child_health_histories')
    tt_status = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'child_health_history'
class ChildHealthNotes(models.Model):
    chnotes_id = models.BigAutoField(primary_key=True)
    chn_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    chhist = models.ForeignKey(ChildHealth_History, on_delete=models.CASCADE, related_name='child_health_notes')
    followv = models.ForeignKey(FollowUpVisit, on_delete=models.CASCADE, related_name='child_health_notes', null=True, blank=True)
    staff =models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='child_health_notes', null=True, blank=True) 
    class Meta:
        db_table = 'child_health_notes'
        

class ChildHealthSupplements(models.Model):
    chs_id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    anemic_seen = models.CharField(max_length=100, blank=True, null=True)
    anemic_iron_given = models.CharField(max_length=100, blank=True, null=True)
    birthwt = models.CharField(max_length=100, blank=True, null=True)
    birthwt_seen = models.CharField(max_length=100, blank=True, null=True)
    birthwt_given_iron = models.CharField(max_length=100, blank=True, null=True)
    supplement_summary = models.TextField(blank=True, null=True)
    medreq = models.ForeignKey(MedicineRequest, on_delete=models.CASCADE, related_name='child_health_supplements', blank=True, null=True)
    chhist = models.ForeignKey(ChildHealth_History, on_delete=models.CASCADE, related_name='child_health_supplements')
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='child_health_supplements', null=True, blank=True)
    class Meta:
        db_table = 'child_health_supplements'
              
class NutritionalStatus(models.Model):
    nutstat_id = models.BigAutoField(primary_key=True)
    wfa = models.CharField(max_length=100, blank=True, null=True)  # Weight-for-Age
    lhfa = models.CharField(max_length=100, blank=True, null=True)  # Length-for-Age
    wfl = models.CharField(max_length=100, blank=True, null=True)  # Weight-for-Length
    muac = models.CharField(max_length=100, blank=True, null=True)  # Mid-Upper Arm Circumference
    created_at = models.DateTimeField(auto_now_add=True)
    bm = models.ForeignKey(BodyMeasurement, on_delete=models.CASCADE, related_name='child_health_histories', blank=True, null=True)
    chhist = models.ForeignKey(ChildHealth_History, on_delete=models.CASCADE, related_name='nutritional_status', db_column='chhist_id')
    
    class Meta:
        db_table = 'nutritional_status'
        
class ExclusiveBFCheck(models.Model):
    ebf_id = models.BigAutoField(primary_key=True)
    ebf_date = models.CharField(max_length=100, blank=True, null=True)  # Date of the check
    chhist = models.ForeignKey(ChildHealth_History, on_delete=models.CASCADE, related_name='exclusive_bf_checks')
    class Meta:
        db_table = 'exclusive_bf_check'

        
class ChildHealthImmunizationHistory(models.Model):
    imt_id = models.BigAutoField(primary_key=True)
    vacrec = models.ForeignKey(VaccinationRecord, on_delete=models.CASCADE, related_name='immunization_tracking', db_column='vacrec_id')
    chhist = models.ForeignKey(ChildHealth_History, on_delete=models.CASCADE, related_name='immunization_tracking', db_column='chhist_id')
    
    class Meta:
        db_table = 'child_health_immunization_history'
        