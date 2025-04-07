from django.db import models
from datetime import date

# Create your models here.
# KANI UNA 

class Donation(models.Model):
    don_num = models.BigAutoField(primary_key=True)
    don_donorfname = models.CharField(max_length=100, null=True)
    don_donorlname = models.CharField(max_length=100, null=True)
    don_item_name = models.CharField(max_length=100, null=True)
    don_qty = models.IntegerField(null=True)
    don_description = models.CharField(max_length=200, null=True)
    don_category = models.CharField(max_length=100, null=True)
    don_receiver = models.CharField(max_length=100, null=True)
    don_date = models.DateField(default=date.today)
    # ra_id = models.ForeignKey(Resident_Account on_delete=models.CASCADE)
    # feat_id = models.ForeignKey(Feature, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'donation'