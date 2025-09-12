from django.db import models
from datetime import date
import uuid

class Donation(models.Model):
    don_num = models.CharField(primary_key=True, unique=True)
    
    def save(self, *args, **kwargs):
        if not self.don_num:  # If no ID provided
            self.don_num = f"DON-{uuid.uuid4().hex[:10].upper()}"
        super().save(*args, **kwargs)
        
    don_item_name = models.CharField(max_length=100, default='')
    don_donor = models.CharField(max_length=100, default='Anonymous')
    don_qty = models.IntegerField(default=1)
    don_description = models.CharField(max_length=200, null=True, blank=True)
    don_category = models.CharField(max_length=100, default='')
    don_date = models.DateField(default=date.today)

    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )

    class Meta:
        db_table = 'donation'
    
    per_id = models.ForeignKey( #for name searching, staff-side
        'profiling.Personal',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='per_id'
    )
    