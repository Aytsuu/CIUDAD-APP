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
    plan_personalService_limit= models.DecimalField(max_digits=10, decimal_places=2)
    plan_miscExpense_limit= models.DecimalField(max_digits=10, decimal_places=2)
    plan_localDev_limit= models.DecimalField(max_digits=10, decimal_places=2)
    plan_skFund_limit= models.DecimalField(max_digits=10, decimal_places=2)
    plan_calamityFund_limit= models.DecimalField(max_digits=10, decimal_places=2)
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


class Budget_Plan_History(models.Model):
    bph_id = models.BigAutoField(primary_key=True)
    plan = models.ForeignKey('Budget_Plan', on_delete=models.CASCADE, related_name='history')
    bph_change_date = models.DateTimeField(default=datetime.now)

    bph_year = models.CharField(max_length=4)
    bph_actual_income = models.DecimalField(max_digits=10, decimal_places=2)
    bph_rpt_income = models.DecimalField(max_digits=10, decimal_places=2)
    bph_balance = models.DecimalField(max_digits=10, decimal_places=2)
    bph_tax_share = models.DecimalField(max_digits=10, decimal_places=2)
    bph_tax_allotment = models.DecimalField(max_digits=10, decimal_places=2)
    bph_cert_fees = models.DecimalField(max_digits=10, decimal_places=2)
    bph_other_income = models.DecimalField(max_digits=10, decimal_places=2)
    bph_budgetaryObligations = models.DecimalField(max_digits=10, decimal_places=2)
    bph_balUnappropriated = models.DecimalField(max_digits=10, decimal_places=2)
    bph_personalService_limit = models.DecimalField(max_digits=10, decimal_places=2)
    bph_miscExpense_limit = models.DecimalField(max_digits=10, decimal_places=2)
    bph_localDev_limit = models.DecimalField(max_digits=10, decimal_places=2)
    bph_skFund_limit = models.DecimalField(max_digits=10, decimal_places=2)
    bph_calamityFund_limit = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'budget_plan_history'
        ordering = ['-bph_change_date']


class Budget_Plan_Detail_History(models.Model):
    bpdh_id = models.BigAutoField(primary_key=True)
    bph = models.ForeignKey('Budget_Plan_History', on_delete=models.CASCADE, related_name='history')

    # Snapshot fields
    bpdh_budget_item = models.CharField(max_length=200)
    bpdh_proposed_budget = models.DecimalField(max_digits=10, decimal_places=2)
    bpdh_budget_category = models.CharField(max_length=200)
    bpdh_is_changed = models.BooleanField(default=False)

    class Meta:
        db_table = 'budget_plan_detail_history'
    



#=======================================================================================

class Income_File_Folder(models.Model):
    inf_num = models.BigAutoField(primary_key=True)
    inf_year = models.CharField(max_length=4)
    inf_name = models.CharField(max_length=100, default='')
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
    infi_upload_date = models.CharField(default=date.today().strftime("%B %d, %Y"))
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
    disf_upload_date = models.CharField(default=date.today().strftime("%B %d, %Y"))
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


class Invoice(models.Model):
    inv_num=models.BigAutoField(primary_key=True)
    inv_serial_num=models.CharField(max_length=100)
    inv_date=models.DateTimeField(default=date.today)
    inv_amount=models.DecimalField(max_digits=10, decimal_places=2)
    inv_nat_of_collection=models.CharField(max_length=250)
    cr_id = models.ForeignKey(
        'clerk.ClerkCertificate', 
        on_delete=models.CASCADE, 
        db_column='cr_id'
    )
    # sr_id = FK sad siya

    class Meta:
        db_table = 'invoice'

#======================================================================================

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