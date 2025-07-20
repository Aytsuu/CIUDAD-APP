from django.db import models
from datetime import date
from django.core.validators import MaxValueValidator
from django.core.validators import MaxValueValidator

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
    plan_personalService_limit= models.DecimalField(max_digits=10, decimal_places=2)
    plan_miscExpense_limit= models.DecimalField(max_digits=10, decimal_places=2)
    plan_localDev_limit= models.DecimalField(max_digits=10, decimal_places=2)
    plan_skFund_limit= models.DecimalField(max_digits=10, decimal_places=2)
    plan_calamityFund_limit= models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'budget_plan'

class Budget_Plan_Detail(models.Model):
    dtl_id = models.BigAutoField(primary_key = True)
    dtl_budget_item = models.CharField(max_length=200)
    dtl_proposed_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    dtl_budget_category = models.CharField(max_length=200)
    plan = models.ForeignKey(Budget_Plan, on_delete=models.CASCADE, related_name='budget_detail')
 
    class Meta: 
        db_table = 'budget_plan_detail'

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
    dtl_id = models.ForeignKey('budget_plan_detail', on_delete=models.CASCADE)

    class Meta:
        db_table = "income_expense_tracking"


class Income_Particular(models.Model):
    incp_id = models.BigAutoField(primary_key=True)
    incp_item = models.CharField(max_length=200)

    class Meta:
        db_table = "income_particular"


class Income_Tracking(models.Model):
    inc_num = models.BigAutoField(primary_key=True)
    inc_serial_num = models.CharField(max_length=100, default='None') 
    inc_date = models.DateField(default=date.today)
    inc_entryType = models.CharField(max_length=100, default='Income')
    inc_amount = models.DecimalField(max_digits=10, decimal_places=2)
    inc_additional_notes = models.CharField(max_length=100)
    inc_receipt_image = models.CharField(null=False)
    inv_num = models.CharField(max_length=100, default='None')
    incp_id = models.ForeignKey('income_particular', on_delete=models.CASCADE)

    class Meta:
        db_table = "income_tracking"



class Income_Expense_Main(models.Model):
    ie_main_year = models.CharField(max_length=4)
    ie_main_tot_budget = models.DecimalField(max_digits=10, decimal_places=2)
    ie_main_inc = models.DecimalField(max_digits=10, decimal_places=2)
    ie_main_exp = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "income_expense_main"