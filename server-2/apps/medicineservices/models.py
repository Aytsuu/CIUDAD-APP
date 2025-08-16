from django.db import models
from django.apps import apps
from apps.patientrecords.models import *
from apps.inventory.models import *
from apps.healthProfiling.models import *
from apps.administration.models import Staff

       
       
       
       

        
class MedicineRequest(models.Model):
    medreq_id = models.BigAutoField(primary_key=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    rp_id = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE, db_column='rp_id', related_name='medicine_requests',blank=True,null=True)
    pat_id = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='pat_id', related_name='medicine_requests',blank=True,null=True)
    fullfilled_at = models.DateTimeField(null=True, blank=True) 
    status = models.CharField(max_length=20, default='pending')
   
    def __str__(self):
        return f"MedicineRequest #{self.medreq_id}"
    class Meta:
        db_table = 'medicine_request' 


class MedicineRequestItem(models.Model):
    medreqitem_id = models.BigAutoField(primary_key=True)
    medreqitem_qty = models.PositiveIntegerField(default=0)
    reason = models.TextField(blank=True, null=True)  # (OP)    
    minv_id = models.ForeignKey(MedicineInventory, on_delete=models.CASCADE, db_column='minv_id', related_name='medicine_request_items')
    medreq_id = models.ForeignKey('MedicineRequest', on_delete=models.CASCADE, related_name='items',db_column='medreq_id')

    def __str__(self):
        return f"MedicineRequestItem #{self.medreqitem_id}"
    class Meta:
        db_table = 'medicine_request_item'  


class MedicineRecord(models.Model):
    medrec_id = models.BigAutoField(primary_key=True)
    medrec_qty = models.PositiveIntegerField(default=0)
    # req_type = models.CharField(max_length=10, choices=REQ_TYPE_CHOICES)
    reason = models.TextField(blank=True, null=True)  # (OP) 
    requested_at = models.DateTimeField(auto_now_add=True)
    fulfilled_at = models.DateTimeField(null=True, blank=True)
    signature = models.TextField(blank=True, null=True),
    patrec_id = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, blank=True,null=True, db_column='patrec_id', related_name='medicine_records')
    minv_id = models.ForeignKey(MedicineInventory, on_delete=models.CASCADE, db_column='minv_id', related_name='medicine_records')
    medreq_id = models.ForeignKey(MedicineRequest, on_delete=models.CASCADE, db_column='medreq_id', related_name='medicine_records',blank=True,null=True,)
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='medicine_records', null=True, blank=True)


    def __str__(self):
        return f"MedicineRecord #{self.medrec_id}"
    class Meta:
        db_table = 'medicine_record'
        
class Medicine_File(models.Model):

    medf_id = models.BigAutoField(primary_key=True)
    medf_name = models.CharField(max_length=255)
    medf_type = models.CharField(max_length=100)
    medf_path = models.CharField(max_length=500)
    ief_url = models.CharField(max_length=500)
    medrec= models.ForeignKey(MedicineRecord, on_delete=models.CASCADE, related_name='medicine_files', blank=True, null=True)
    medreq= models.ForeignKey(MedicineRequest, on_delete=models.CASCADE, related_name='medicine_file', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'medicine_file'

    
         
class FindingsPlanTreatment(models.Model):
    fpt_id = models.BigAutoField(primary_key=True)
    medreq = models.ForeignKey(MedicineRequest, on_delete=models.CASCADE, related_name='findings_plan_treatments')
    find = models.ForeignKey(Finding, on_delete=models.CASCADE, related_name='findings_plan_treatments')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'findings_plan_treatment'



