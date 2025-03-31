from django.db import models
from datetime import date


class gad_budget_tracker(models.Model):
    gbud_num = models.BigAutoField(primary_key=True)
    don_donorfname = models.CharField(max_length=100, null=True)
    don_donorlname = models.CharField(max_length=100, null=True)
    don_item_name = models.CharField(max_length=100, null=True)
    don_qty = models.IntegerField(null=True)
    don_description = models.CharField(max_length=200, null=True)
    don_category = models.CharField(max_length=100, null=True)
    don_receiver = models.CharField(max_length=100, null=True)
    don_date = models.DateField(default=date.today)
    # feat_id = models.ForeignKey(Feature, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'gad_budget_tracker'