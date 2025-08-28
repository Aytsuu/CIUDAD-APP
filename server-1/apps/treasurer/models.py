from django.db import models
from datetime import date, datetime
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
    plan_is_archive = models.BooleanField(default=False)

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


class BudgetPlan_File(models.Model):
    bpf_id = models.BigAutoField(primary_key=True)
    bpf_upload_date = models.DateTimeField(auto_now_add=True)
    bpf_description = models.CharField(max_length=500)
    bpf_type = models.CharField(max_length=100, null=True)
    bpf_name = models.CharField(max_length=255, null=True)
    bpf_path = models.CharField(max_length=500, null=True)
    bpf_url = models.CharField(max_length=500, null=True)

    plan_id = models.ForeignKey(
        Budget_Plan,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        db_column='plan_id'
    )

    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )

    class Meta:
        db_table = 'budget_plan_file'


class Budget_Plan_History(models.Model):
    bph_id = models.BigAutoField(primary_key=True)
    bph_date_updated = models.DateTimeField(default = date.today)
    bph_source_item = models.CharField(default="None")
    bph_to_item = models.CharField(default = "None")
    bph_from_new_balance = models.DecimalField(default = 0.00, max_digits=10, decimal_places=2 )
    bph_from_prev_balance = models.DecimalField(default = 0.00, max_digits=10, decimal_places=2 )
    bph_to_new_balance = models.DecimalField(default = 0.00, max_digits=10, decimal_places=2 )
    bph_to_prev_balance = models.DecimalField(default = 0.00, max_digits=10, decimal_places=2 )
    bph_transfer_amount = models.DecimalField(default = 0.00, max_digits=10, decimal_places=2 )
    plan = models.ForeignKey('Budget_Plan', on_delete=models.CASCADE, related_name='history')

    class Meta:
        db_table = 'budget_plan_history'
        ordering = ['-bph_date_updated']


#=======================================================================================

class Income_File_Folder(models.Model):
    inf_num = models.BigAutoField(primary_key=True)
    inf_year = models.CharField(max_length=4)
    inf_name = models.CharField(max_length=100, default='')
    inf_desc = models.CharField(default='', null=True)
    inf_is_archive = models.BooleanField(default=False)

    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )

    class Meta: 
        db_table = "income_file_folder"

class Income_Image(models.Model):
    infi_num = models.BigAutoField(primary_key=True)
    infi_upload_date = models.CharField(default=date.today)
    infi_is_archive = models.BooleanField(default=False)
    infi_type = models.CharField(max_length=100, null=True)
    infi_name = models.CharField(max_length=255, null=True)
    infi_path = models.CharField(max_length=500, null=True)
    infi_url = models.CharField(max_length=500, null=True)

    inf_num = models.ForeignKey(
        Income_File_Folder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='inf_num'
    )

    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )

    class Meta:
        db_table = "income_image"


class Disbursement_File_Folder(models.Model):
    dis_num = models.BigAutoField(primary_key=True)
    dis_year = models.CharField(max_length=4)
    dis_name = models.CharField(max_length=100, default='')
    dis_desc = models.CharField(default='', null=True)
    dis_is_archive = models.BooleanField(default=False)

    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )
    class Meta:
        db_table = "disbursement_file_folder" 

class Disbursement_Image(models.Model):
    disf_num = models.BigAutoField(primary_key=True)
    disf_upload_date = models.CharField(default=date.today)
    disf_is_archive = models.BooleanField(default=False)
    disf_type = models.CharField(max_length=100, null=True)  # File type (e.g., image/jpeg)
    disf_name = models.CharField(max_length=255, null=True)  # File name
    disf_path = models.CharField(max_length=500, null=True)  # File path
    disf_url = models.CharField(max_length=500, null=True)   # File URL

    dis_num = models.ForeignKey(
        Disbursement_File_Folder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='dis_num'
    )

    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )

    class Meta:
        db_table = "disbursement_image"

#======================================================================================

class Invoice(models.Model):
    inv_num=models.BigAutoField(primary_key=True)  
    inv_serial_num=models.CharField(max_length=100)  
    inv_date=models.DateTimeField(default=date.today)
    inv_amount=models.DecimalField(max_digits=10, decimal_places=2)
    inv_nat_of_collection=models.CharField(max_length=250)
    inv_status=models.CharField(max_length=50, default='Pending')  # Added missing field
    inv_change=models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cr_id = models.ForeignKey(
        'clerk.ClerkCertificate', 
        on_delete=models.CASCADE, 
        db_column='cr_id',
        null=True,
        blank=True,
        related_name='treasurer_invoices' 
    )
    nrc_id = models.ForeignKey(
        'clerk.NonResidentCertificateRequest',
        on_delete=models.CASCADE, 
        db_column='nrc_id',
        null=True,
        blank=True,
        related_name='treasurer_invoices' 
    )
    # sr_id = FK sad siya

    class Meta:
        db_table = 'invoice'
        managed = False

#======================================================================================

class Expense_Particular(models.Model):
    exp_id = models.BigAutoField(primary_key = True)
    exp_budget_item = models.CharField(max_length=200)
    exp_proposed_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    exp_budget_category = models.CharField(max_length=200)
    plan = models.ForeignKey(Budget_Plan, on_delete=models.CASCADE, related_name='expense_particulars')
    class Meta: 
        db_table = 'expense_particular'    
        

class Income_Expense_Tracking(models.Model):
    iet_num = models.BigAutoField(primary_key=True)
    iet_serial_num = models.CharField(max_length=100, default='DEFAULT_SERIAL') 
    iet_datetime = models.DateTimeField(null=True)
    iet_entryType = models.CharField(max_length=100)
    iet_amount = models.DecimalField(max_digits=10, decimal_places=2)
    iet_actual_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, blank=True)
    iet_additional_notes = models.CharField(max_length=100)
    iet_receipt_image = models.CharField(null=True, blank=True)
    iet_is_archive = models.BooleanField(default=False)
    exp_id = models.ForeignKey('expense_particular', on_delete=models.CASCADE, null=True)
    staff_id = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )

    class Meta:
        db_table = "income_expense_tracking"


class Expense_Log(models.Model):
    el_id = models.BigAutoField(primary_key = True)
    el_proposed_budget = models.DecimalField(max_digits=10, decimal_places=2)
    el_actual_expense = models.DecimalField(max_digits=10, decimal_places=2)
    el_return_amount = models.DecimalField(max_digits=10, decimal_places=2)
    el_datetime = models.DateTimeField(null=True)

    iet_num = models.ForeignKey(
        Income_Expense_Tracking,
        on_delete=models.CASCADE,
        null=True, 
        blank=True,
        db_column='iet_num'
    )

    class Meta: 
        db_table = 'expense_log'    


class Income_Particular(models.Model):
    incp_id = models.BigAutoField(primary_key=True)
    incp_item = models.CharField(max_length=200)

    class Meta:
        db_table = "income_particular"


class Income_Tracking(models.Model):
    inc_num = models.BigAutoField(primary_key=True)
    inc_serial_num = models.CharField(max_length=100, null=True, blank=True) 
    inc_transac_num = models.CharField(max_length=100, null=True, blank=True) 
    # inc_date = models.DateField(default=date.today)
    inc_datetime = models.DateTimeField(null=True)
    inc_entryType = models.CharField(max_length=100, default='Income')
    inc_amount = models.DecimalField(max_digits=10, decimal_places=2)
    inc_additional_notes = models.CharField(max_length=100, null=True, blank=True)
    # inc_receipt_image = models.CharField(null=True, blank=True)
    inc_is_archive = models.BooleanField(default=False)
    # inv_num = models.ForeignKey( 'invoice', on_delete=models.CASCADE, null=True, blank=True)
    incp_id = models.ForeignKey('income_particular', on_delete=models.CASCADE)
    staff_id = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )

    class Meta:
        db_table = "income_tracking"


class Income_Expense_File(models.Model):

    ief_id = models.BigAutoField(primary_key=True)
    ief_name = models.CharField(max_length=255)
    ief_type = models.CharField(max_length=100)
    ief_path = models.CharField(max_length=500)
    ief_url = models.CharField(max_length=500)

    iet_num = models.ForeignKey(
        Income_Expense_Tracking,
        on_delete=models.CASCADE,
        null=True, 
        blank=True,
        related_name='files',
        db_column='iet_num'
    )

    inc_num = models.ForeignKey(
        Income_Tracking,
        on_delete=models.CASCADE,
        null=True, 
        blank=True,
        related_name='files',
        db_column='inc_num'
    )

    class Meta:
        db_table = "income_expense_file" 


class Income_Expense_Main(models.Model):
    # ie_main_year = models.BigAutoField(primary_key=True)
    # ie_main_tot_budget = models.DecimalField(max_digits=10, decimal_places=2)
    # ie_main_inc = models.DecimalField(max_digits=10, decimal_places=2)
    # ie_main_exp = models.DecimalField(max_digits=10, decimal_places=2)
    ie_main_year = models.CharField(max_length=4, primary_key=True)     
    ie_main_tot_budget = models.DecimalField(max_digits=10, decimal_places=2)
    ie_remaining_bal = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    ie_main_inc = models.DecimalField(max_digits=10, decimal_places=2)
    ie_main_exp = models.DecimalField(max_digits=10, decimal_places=2)
    ie_is_archive = models.BooleanField(default=False)

    class Meta:
        db_table = "income_expense_main"


class Annual_Gross_Sales(models.Model):
    ags_id= models.BigAutoField(primary_key=True)
    ags_minimum=models.DecimalField(max_digits=10, decimal_places=2)
    ags_maximum=models.DecimalField(max_digits=10, decimal_places=2)
    ags_rate=models.DecimalField(max_digits=10, decimal_places=2)
    ags_date=models.DateTimeField(default=date.today)
    ags_is_archive=models.BooleanField(default=False)

    class Meta:
        db_table = 'annual_gross_sales'


class Purpose_And_Rates(models.Model):
    pr_id=models.BigAutoField(primary_key=True)
    pr_purpose=models.CharField(max_length=250)
    pr_rate=models.DecimalField(max_digits=10, decimal_places=2)
    pr_category=models.CharField(max_length=100)
    pr_date=models.DateTimeField(default=date.today)
    pr_is_archive=models.BooleanField(default=False)

    class Meta:
        db_table = 'purpose_and_rate'