# from django.db import models
# from datetime import date

# class GAD_Budget_Tracker(models.Model):
#     gbud_num = models.BigAutoField(primary_key=True)
#     # gbud_year = models.CharField(max_length=4)
#     # gbud_total_amt_used = models.DecimalField(max_digits=10, decimal_places=2)
#     gbud_remaining_bal = models.DecimalField(max_digits=10, decimal_places=2)
#     gbud_date = models.DateField(default=date.today)
#     gbud_particulars = models.CharField(max_length=100, null=True)
#     gbud_type = models.CharField(max_length=100, null=True)
#     gbud_amount = models.DecimalField(max_digits=10, decimal_places=2)
#     gbud_add_notes = models.CharField(max_length=200, null=True)
#     # feat_id = models.ForeignKey(Feature, on_delete=models.CASCADE)
    
#     class Meta:
#         db_table = 'gad_budget_tracker'

# gad/models.py
from django.db import models
from datetime import date
from django.conf import settings

class GAD_Budget_Tracker(models.Model):
    ENTRY_TYPES = (
        ('Income', 'Income'),
        ('Expense', 'Expense'),
    )
    
    gbud_num = models.BigAutoField(primary_key=True)
    gbud_date = models.DateField(default=date.today)
    gbud_particulars = models.CharField(max_length=100,default=0)
    gbud_type = models.CharField(max_length=10, choices=ENTRY_TYPES)
    gbud_amount = models.DecimalField(max_digits=15, decimal_places=2)
    gbud_remaining_bal = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    gbud_add_notes = models.TextField(blank=True, null=True)
    
    # Reference existing budget_plan_detail table
    budget_item = models.ForeignKey(
        'treasurer.budget_plan_detail', 
        on_delete=models.PROTECT,
        limit_choices_to={'dtl_budget_category': 'GAD Program'},
        related_name='gad_transactions',
        default=0
    )
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='gad_entries'
    )
    
    class Meta:
        db_table = 'gad_budget_tracker'
        ordering = ['-gbud_date']