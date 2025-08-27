from django.db import models
from apps.patientrecords.models import PatientRecord,VitalSigns,BodyMeasurement,Finding
from apps.medicineservices.models import MedicineRequest
from apps.patientrecords.models import FollowUpVisit
from apps.administration.models import Staff
# Create your models here.


class MedicalConsultation_Record(models.Model):
     medrec_id = models.BigAutoField(primary_key=True)
     medrec_status = models.CharField(max_length=100, default="pending")
     medrec_chief_complaint = models.TextField(null=True, blank=True)
     created_at =   models.DateTimeField(auto_now_add=True)
     updated_at = models.DateTimeField(auto_now=True)
#      bhw_assignment = models.IntegerField()
#      doc_id = models.IntegerField()
     patrec = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='medical_consultation_record')
     vital = models.ForeignKey(VitalSigns, on_delete=models.CASCADE, related_name='medical_consultation_record')
     bm = models.ForeignKey(BodyMeasurement, on_delete=models.CASCADE, related_name='medical_consultation_record')
     find = models.ForeignKey(Finding, on_delete=models.CASCADE, related_name='medical_consultation_record',null=True)
     medreq =models.ForeignKey(MedicineRequest,on_delete=models.CASCADE,related_name='medical_consultation_record',null=True )
     staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='medical_consultation_record',null=True)
     
    
     class Meta:
           db_table = 'medical_consultation_record'
           