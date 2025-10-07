from django.db import models
from apps.patientrecords.models import *
from apps.inventory.models import FirstAidInventory
from apps.administration.models import *

# Create your models here.
class FirstAidRecord(models.Model):
    farec_id = models.BigAutoField(primary_key=True)
    qty = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    finv = models.ForeignKey(FirstAidInventory, on_delete=models.CASCADE, related_name='first_aid_records')
    patrec = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='first_aid_records')
    signature = models.TextField(default="", blank=True, null=True)
    reason = models.TextField(default="", blank=True, null=True)
    staff = models.ForeignKey(Staff,on_delete=models.CASCADE,related_name="first_aid_records", null=True,blank=True) 
    class Meta:
        db_table = 'firstaid_record'
        
