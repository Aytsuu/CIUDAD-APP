from django.db import models
from apps.patientrecords.models import PatientRecord,Patient,BodyMeasurement,VitalSigns, Finding,FollowUpVisit
from apps.inventory.models import MedicineInventory
from apps.vaccination.models import VaccinationRecord,VaccinationHistory
from apps.administration.models import Staff
from apps.medicineservices.models import MedicineRequestItem,MedicineRequest,MedicineRecord
from simple_history.models import HistoricalRecords
from simple_history.utils import update_change_reason
from django.conf import settings
from apps.maternal.models import *

# Create your models here.
class ChildHealthrecord(models.Model):  
    chrec_id =models.BigAutoField(primary_key=True)
    ufc_no = models.CharField(max_length=100, blank=True, null=True)
    family_no=models.CharField(max_length=100, blank=True, null=True)
    mother_occupation = models.CharField(max_length=100, blank=True, null=True)
    father_occupation = models.CharField(max_length=100, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    type_of_feeding=models.CharField(max_length=100, blank=True, null=True)
    newborn_screening = models.DateField(null=True, blank=True)  # Newborn screening date
    landmarks=models.CharField(max_length=100, blank=True, null=True)
    place_of_delivery_type = models.CharField(
        max_length=30,
        blank=False,
        null=False,
        default="Home"
    )
    birth_order = models.IntegerField(default=0)  # Birth order of the child
    pod_location = models.CharField(max_length=100, blank=True, null=True)  # Location of the place of delivery
    nbscreening_result = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        choices=[
            ("normal", "Normal"),
            ("referred", "Referred"),
            ("done", "Done"),
            ("with_results", "With Results"),
            ("with_positive_results", "With Positive Results"),
        ]
    )
    newbornInitiatedbf=models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    staff =models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='child_health_records', null=True, blank=True)
    patrec = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='child_health_records')
    pregnancy = models.ForeignKey(Pregnancy, on_delete=models.CASCADE, related_name='child_health_records', null=True, blank=True)
    class Meta:
        db_table = 'child_healthrecord'
        ordering = ['-created_at']
       
    
class ChildHealth_History(models.Model):
    # newborn_screening = models.DateField(null=True, blank=True)  # Newborn screening date
    chhist_id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    chrec = models.ForeignKey(ChildHealthrecord, on_delete=models.CASCADE, related_name='child_health_histories')
    tt_status = models.CharField(max_length=100, blank=True, null=True)
    assigned_to = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='child_health_histories', null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=[
            ("check-up", "Check-up"),
            ("immunization", "Immunization"),
            ("recorded", "Recorded")
        ],
        default="recorded",
    )
    
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
    history = HistoricalRecords(
        table_name='child_health_notes_history',
        cascade_delete_history=True,
        user_model='administration.Staff',
        user_db_constraint=False,
        
    )
   
    class Meta:
        db_table = 'child_health_notes'

class ChildHealthVitalSigns(models.Model):
    chvital_id = models.BigAutoField(primary_key=True)
    vital =models.ForeignKey(VitalSigns, on_delete=models.CASCADE, related_name='child_health_histories', blank=True, null=True)
    bm = models.ForeignKey(BodyMeasurement, on_delete=models.CASCADE, related_name='child_health_vital_signs', blank=True, null=True)
    find =models.ForeignKey(Finding, on_delete=models.CASCADE, related_name='child_health_vital_signs', blank=True, null=True)
    chhist = models.ForeignKey(ChildHealth_History, on_delete=models.CASCADE, related_name='child_health_vital_signs')
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'child_health_vital_signs'


class ChildHealthSupplements(models.Model):
    chsupplement_id = models.BigAutoField(primary_key=True)
    chhist = models.ForeignKey(ChildHealth_History, on_delete=models.CASCADE, related_name='child_health_supplements')
    # staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='child_health_supplements', null=True, blank=True)
    # medrec = models.ForeignKey(MedicineRecord, on_delete=models.CASCADE, related_name='child_health_supplements')
    medreqitem =models.ForeignKey(MedicineRequestItem, on_delete=models.CASCADE, related_name='child_health_supplements', null=True, blank=True)
    
    class Meta:
        db_table = 'child_health_supplements'
        
        
class ChildHealthSupplementsStatus(models.Model):
    chssupplementstat_id = models.BigAutoField(primary_key=True)
    date_completed = models.DateField(blank=True, null=True)  # Date when the status was completed
    birthwt = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    status_type = models.CharField(choices=[('birthwt', 'Birth Weight'), ('anemic', 'Anemic')])
    date_seen = models.CharField(max_length=100, blank=True, null=True)
    date_given_iron = models.CharField(max_length=100, blank=True, null=True)
    chhist = models.ForeignKey(ChildHealth_History, on_delete=models.CASCADE, related_name='supplements_statuses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True) 
    class Meta:
        db_table = 'child_health_supplements_status'
              

        
        
class ExclusiveBFCheck(models.Model):
    ebf_id = models.BigAutoField(primary_key=True)
    ebf_date = models.CharField(max_length=100, blank=True, null=True)  # Date of the check
    chhist = models.ForeignKey(ChildHealth_History, on_delete=models.CASCADE, related_name='exclusive_bf_checks')
    created_at = models.DateTimeField(auto_now_add=True)
    type_of_feeding=models.CharField(max_length=100, blank=True, null=True)
    class Meta:
        db_table = 'exclusive_bf_check'

        
class ChildHealthImmunizationHistory(models.Model):
    imt_id = models.BigAutoField(primary_key=True)
    vachist = models.ForeignKey(VaccinationHistory, on_delete=models.CASCADE, related_name='immunization_tracking', db_column='vachist_id')
    chhist = models.ForeignKey(ChildHealth_History, on_delete=models.CASCADE, related_name='immunization_tracking', db_column='chhist_id')
    hasExistingVaccination = models.BooleanField(default=False)  # Indicates if there is an existing vaccination record
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'child_health_immunization_history'
        