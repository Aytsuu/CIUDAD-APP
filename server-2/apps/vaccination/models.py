from django.db import models
from apps.inventory.models import VaccineStock,VaccineList
from apps.patientrecords.models import PatientRecord
from apps.patientrecords.models import VitalSigns
from apps.patientrecords.models import FollowUpVisit
from apps.administration.models import Staff
class VaccinationRecord(models.Model):
    vacrec_id = models.BigAutoField(primary_key=True)
    patrec_id = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='vaccination_records',db_column='patrec_id')
    vacrec_totaldose = models.PositiveIntegerField(default="0")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = 'vaccination_record'



class VaccinationHistory(models.Model):
    vachist_id = models.BigAutoField(primary_key=True)
    vachist_doseNo = models.PositiveIntegerField(default="0")
    vachist_age = models.CharField(default="", max_length=100)
    vachist_status = models.CharField(max_length=100, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    assigned_to = models.PositiveIntegerField(null=True, blank=True)
    staff= models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='vaccination_histories', null=True, blank=True)  
    vital= models.ForeignKey( VitalSigns,  on_delete=models.CASCADE,  null=True,   blank=True,  related_name='vaccination_histories')
    vacrec = models.ForeignKey( VaccinationRecord,  on_delete=models.CASCADE, related_name='vaccination_histories' )
    vacStck_id = models.ForeignKey( VaccineStock,  on_delete=models.CASCADE, related_name='vaccination_histories',db_column="vacStck_id",null=True)
    vac =models.ForeignKey( VaccineList,  on_delete=models.CASCADE, related_name='vaccination_histories', null=True, blank=True)
    followv = models.ForeignKey( FollowUpVisit,  on_delete=models.CASCADE, related_name='vaccination_histories', null=True, blank=True)
    class Meta:
        
        db_table = 'vaccination_history'
        indexes = [
            models.Index(fields=['vacrec', 'vachist_status']),
        ]
        
        