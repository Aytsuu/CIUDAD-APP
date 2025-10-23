from django.db import models
from django.apps import apps
from apps.patientrecords.models import *
from apps.inventory.models import *
from apps.healthProfiling.models import *
from apps.administration.models import Staff

        
class MedicineRequest(models.Model):
    medreq_id = models.CharField(primary_key=True, max_length=20, editable=False)
    requested_at = models.DateTimeField(auto_now_add=True)
    rp_id = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE, db_column='rp_id', related_name='medicine_requests',blank=True,null=True)
    pat_id = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='pat_id', related_name='medicine_requests',blank=True,null=True)
    mode = models.CharField(default='walk-in', max_length=20) #walk-in or app 
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"MedicineRequest #{self.medreq_id}"
    def save(self, *args, **kwargs):
        if not self.medreq_id:
            today = timezone.now()
            prefix = f"MR{today.month:02d}{today.year % 100:02d}"
            
            # Get the maximum existing ID with this prefix
            max_id = MedicineRequest.objects.filter(
                medreq_id__startswith=prefix
            ).order_by('-medreq_id').first()
            
            if max_id:
                # Extract the numeric part dynamically
                numeric_part = max_id.medreq_id[len(prefix):]
                try:
                    last_num = int(numeric_part) + 1
                except ValueError:
                    # If there's an issue parsing, start from 1
                    last_num = 1
            else:
                last_num = 1
            
            # Dynamic padding based on the number of digits needed
            num_digits = len(str(last_num))
            padding = max(4, num_digits)  # At least 4 digits, but more if needed
            
            self.medreq_id = f"{prefix}{last_num:0{padding}d}"
        
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = 'medicine_request' 
        
        
class MedicineRequestItem(models.Model):
    medreqitem_id = models.BigAutoField(primary_key=True)
    medreqitem_qty = models.PositiveIntegerField(default=0)
    reason = models.TextField(blank=True, null=True)  # (OP)    
    minv_id = models.ForeignKey(MedicineInventory, on_delete=models.CASCADE, db_column='minv_id', related_name='medicine_request_items',null=True, blank=True)
    medreq_id = models.ForeignKey('MedicineRequest', on_delete=models.CASCADE, related_name='items',db_column='medreq_id')
    med= models.ForeignKey(Medicinelist, on_delete=models.CASCADE, related_name='medicine_request_items', db_column='med_id', blank=True, null=True)
    status = models.CharField(max_length=20, default='pending') #refered  or confirm
    is_archived = models.BooleanField(default=False)
    archive_reason = models.TextField(blank=True, null=True)  
    created_at = models.DateTimeField(auto_now_add=True)  


    def __str__(self):
        return f"MedicineRequestItem #{self.medreqitem_id}"
    class Meta:
        db_table = 'medicine_request_item'  

class MedicineAllocation(models.Model):
    alloc_id = models.BigAutoField(primary_key=True)
    medreqitem = models.ForeignKey(MedicineRequestItem, on_delete=models.CASCADE, related_name="allocations")
    minv= models.ForeignKey(MedicineInventory, on_delete=models.CASCADE)
    allocated_qty = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'medicine_request_allocation'

class MedicineRecord(models.Model):
    medrec_id = models.BigAutoField(primary_key=True)
    medrec_qty = models.PositiveIntegerField(default=0)
    # req_type = models.CharField(max_length=10, choices=REQ_TYPE_CHOICES)
    reason = models.TextField(blank=True, null=True)  # (OP) 
    requested_at = models.DateTimeField(auto_now_add=True)
    fulfilled_at = models.DateTimeField(null=True, blank=True)
    signature = models.TextField(blank=True, null=True)
    patrec_id = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, blank=True,null=True, db_column='patrec_id', related_name='medicine_records')
    minv_id = models.ForeignKey(MedicineInventory, on_delete=models.CASCADE, db_column='minv_id', related_name='medicine_records')
    medreq_id = models.ForeignKey(MedicineRequest, on_delete=models.CASCADE, db_column='medreq_id', related_name='medicine_records',blank=True,null=True,)
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='medicine_records', null=True, blank=True)


    def __str__(self):
        return f"MedicineRecord #{self.medrec_id}"
    class Meta:
        db_table = 'medicine_record'
        indexes = [
            models.Index(fields=['patrec_id']),
            models.Index(fields=['minv_id']),
        ]
        


        
class Medicine_File(models.Model): 

    medf_id = models.BigAutoField(primary_key=True)
    medf_name = models.CharField(max_length=255)
    medf_type = models.CharField(max_length=100)
    medf_path = models.CharField(max_length=500)
    medf_url = models.CharField(max_length=500)
    medrec= models.ForeignKey(MedicineRecord, on_delete=models.CASCADE, related_name='medicine_files', blank=True, null=True)
    medreq= models.ForeignKey(MedicineRequest, on_delete=models.CASCADE, related_name='medicine_files', blank=True, null=True)
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