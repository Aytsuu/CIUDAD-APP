from django.db import models
from datetime import date
import uuid

class Donation(models.Model):
    don_num = models.CharField(primary_key=True, unique=True)
    
    def save(self, *args, **kwargs):
        if not self.don_num:  # If no ID provided
            self.don_num = f"DON-{uuid.uuid4().hex[:10].upper()}"
        
        # Automatically set status to "Allotted" if distribution date is set
        if self.don_dist_date and not self.don_status == "Allotted":
            self.don_status = "Allotted"
        # Optional: Set back to "Stashed" if distribution date is removed
        elif not self.don_dist_date and self.don_status == "Allotted":
            self.don_status = "Stashed"
            
        super().save(*args, **kwargs)
        
    don_item_name = models.CharField(max_length=100, default='')
    don_donor = models.CharField(max_length=100, default='Anonymous')
    don_qty = models.IntegerField(default=1)
    don_description = models.CharField(max_length=200, null=True, blank=True)
    don_category = models.CharField(max_length=100, default='')
    don_date = models.DateField(default=date.today)
    don_status = models.CharField(max_length=100, default='')
    don_dist_head = models.CharField(max_length=100, null=True, blank=True)
    don_dist_date = models.DateField(null=True, blank=True)

    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )

    class Meta:
        db_table = 'donation'
    
    