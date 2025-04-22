from django.db import models
from apps.inventory.models import VaccineStock
from apps.patientrecords.models import PatientRecord
from apps.patientrecords.models import VitalSigns
from apps.patientrecords.models import FollowUpVisit

class VaccinationRecord(models.Model):
    vacrec_id = models.BigAutoField(primary_key=True)
    patrec_id = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='vaccination_records',db_column='patrec_id')
    class Meta:
        db_table = 'vaccination_record'

# class VitalSigns(models.Model):
#     vital_id = models.BigAutoField(primary_key=True)
#     vital_bp_systolic = models.CharField(max_length=100)
#     vital_bp_diastolic = models.CharField(max_length=100)
#     vital_temp = models.CharField(max_length=100)
#     vital_RR = models.CharField(max_length=100)
#     vital_o2 = models.CharField(max_length=100)
#     created_at = models.DateTimeField(auto_now_add=True)
#     class Meta:
#         db_table = 'vital_signs'

class VaccinationHistory(models.Model):
    vachist_id = models.BigAutoField(primary_key=True)
    vachist_doseNo = models.PositiveIntegerField(default="0")
    vachist_status = models.CharField(max_length=100)
    vachist_age = models.PositiveIntegerField(default=0)
    assigned_to = models.PositiveIntegerField(null=True, blank=True)
    staff_id = models.PositiveIntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    vital= models.ForeignKey( VitalSigns,  on_delete=models.CASCADE,  null=True,   blank=True,  related_name='vaccination_histories')
    vacrec = models.ForeignKey( VaccinationRecord,  on_delete=models.CASCADE, related_name='vaccination_histories' )
    vacStck = models.ForeignKey( VaccineStock,  on_delete=models.CASCADE, related_name='vaccination_histories')
    followv = models.ForeignKey( FollowUpVisit,  on_delete=models.CASCADE, related_name='vaccination_histories', null=True, blank=True)
    class Meta:
        db_table = 'vaccination_history'