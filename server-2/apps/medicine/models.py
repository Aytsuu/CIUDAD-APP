from django.db import models
from django.apps import apps
from apps.patientrecords.models import *
from apps.inventory.models import *

class MedicineRecord(models.Model):
    # Status choices
    STATUS_CHOICES = [
        ('REQUESTED', 'Requested'),
        ('REFERRED', 'Referred'),
        ('RECORDED', 'Recorded'), 
        ('PENDING', 'Pending'),
    ]

    # Request type choices
    REQ_TYPE_CHOICES = [
        ('WALK IN', 'Walk In'),
        ('APP', 'App'),
    ]

    medrec_id = models.BigAutoField(primary_key=True)
    medrec_qty = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    req_type = models.CharField(max_length=10, choices=REQ_TYPE_CHOICES)
    
    reason = models.TextField(blank=True, null=True)  # (OP)
    
    is_archived = models.BooleanField(default=False)
    
    requested_at = models.DateTimeField(auto_now_add=True)
    fulfilled_at = models.DateTimeField(null=True, blank=True)
    
    signature = models.TextField(blank=True, null=True)

    # Foreign Keys (assume models named PatientRecord and MedicineInventory)
    patrec_id = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, db_column='patrec_id')
    minv_id = models.ForeignKey(MedicineInventory, on_delete=models.CASCADE, db_column='minv_id')

    def __str__(self):
        return f"MedicineRecord #{self.medrec_id}"
    
    class Meta:
        db_table = 'medicine_record'
        