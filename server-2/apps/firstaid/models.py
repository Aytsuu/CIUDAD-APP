from django.db import models
from apps.patientrecords.models import *
from apps.inventory.models import FirstAidInventory

# Create your models here.
class FirstAidRecord(models.Model):
    farec_id = models.BigAutoField(primary_key=True)
    qty = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    finv = models.ForeignKey(FirstAidInventory, on_delete=models.CASCADE, related_name='first_aid_records')
    patrec = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='first_aid_records')
    is_archived = models.BooleanField(default=False)
    reason = models.TextField(default="", blank=True, null=True)
    class Meta:
        db_table = 'firstaid_record'