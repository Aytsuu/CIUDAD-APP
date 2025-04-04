from django.db import models
from datetime import date

class GAD_Budget_Tracker(models.Model):
    gbud_num = models.BigAutoField(primary_key=True)
    # gbud_year = models.CharField(max_length=4)
    # gbud_total_amt_used = models.DecimalField(max_digits=10, decimal_places=2)
    # gbud_remaining_bal = models.DecimalField(max_digits=10, decimal_places=2)
    gbud_date = models.DateField(default=date.today)
    gbud_particulars = models.CharField(max_length=100, null=True)
    gbud_type = models.CharField(max_length=100, null=True)
    gbud_amount = models.DecimalField(max_digits=10, decimal_places=2)
    gbud_add_notes = models.CharField(max_length=200, null=True)
    # feat_id = models.ForeignKey(Feature, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'gad_budget_tracker'