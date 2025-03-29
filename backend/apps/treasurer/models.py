from django.db import models
from datetime import date


class Budget_Plan(models.Model): 
    plan_id = models.BigAutoField(primary_key=True)
    plan_year = models.CharField(max_length=4)
    plan_actual_income = models.DecimalField(max_digits=10, decimal_places=2)
    plan_rpt_income = models.DecimalField(max_digits=10, decimal_places=2)
    plan_balance = models.DecimalField(max_digits=10, decimal_places=2)
    plan_tax_share = models.DecimalField(max_digits=10, decimal_places=2)
    plan_tax_allotment = models.DecimalField(max_digits=10, decimal_places=2)
    plan_cert_fees = models.DecimalField(max_digits=10, decimal_places=2)
    plan_other_income = models.DecimalField(max_digits=10, decimal_places=2)
    plan_budgetaryObligations = models.DecimalField(max_digits=10, decimal_places=2)
    plan_balUnappropriated = models.DecimalField(max_digits=10, decimal_places=2)
    plan_issue_date = models.DateField(default=date.today)

    class Meta:
        db_table = "Budget_Plan"

class Budget_Plan_Detail(models.Model):
    dtl_id = models.BigAutoField(primary_key = True)
    dtl_budget_item = models.CharField(max_length=200)
    dtl_proposed_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    plan = models.ForeignKey(Budget_Plan, on_delete=models.CASCADE, related_name='budget_detail')
 
    class Meta: 
        db_table = "Budget_Plan_Detail"

# class Income_File(models.Model):
#     inc_num = models.BigAutoField(primary_key=True)
#     inc_month = models.CharField(max_length=2)
#     inc_year = models.CharField(max_length=4)
#     inc_file = models.CharField(null=False)
#     inc_upload_date = models.DateField(default=date.date.today)
#     iet_num = models.ForeignKey('', on_delete=models.CASCADE)
#     feat_id = models.ForeignKey('', on_delete=models.CASCADE)

#     class Meta:
#         db_table = "Income_File"

# class Disbursement_File(models.Model):
#     dis_num = models.BigAutoField(primary_key=True)
#     dis_month = models.CharField(max_length=2)
#     dis_year = models.CharField(max_length=4)
#     dis_file = models.CharField(null=False)
#     dis_upload_date = models.DateField(default=date.date.today)
#     feat_id = models.ForeignKey('', on_delete=models.CASCADE)

#     class Meta:
#         db_table = "Disbursement_File"


class Income_Expense_Tracking(models.Model):
    iet_num = models.BigAutoField(primary_key=True)
    iet_serial_num = models.CharField(max_length=100, default='DEFAULT_SERIAL') 
    iet_date = models.DateField(default=date.today)
    iet_entryType = models.CharField(max_length=100)
    iet_amount = models.DecimalField(max_digits=10, decimal_places=2)
    iet_additional_notes = models.CharField(max_length=100)
    iet_receipt_image = models.CharField(null=False)
    # inv_num = models.ForeignKey('Invoice', on_delete=models.CASCADE, null=True, blank=True, default=None)
    inv_num = models.CharField(max_length=100, default=None)
    dtl_id = models.ForeignKey('Budget_Plan_Detail', on_delete=models.CASCADE)

    class Meta:
        db_table = "Income_Expense_Tracking"