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
    plan_issue_date = models.DateField(default=date.today)

    class Meta:
        db_table = "Budget_Plan"


class Current_Expenditures_Personal(models.Model):
    cep_id = models.BigAutoField(primary_key=True)
    cep_official_honoraria = models.DecimalField(max_digits=10, decimal_places=2)
    cep_cash_gift = models.DecimalField(max_digits=10, decimal_places=2)
    cep_mid_year_bonus = models.DecimalField(max_digits=10, decimal_places=2)
    cep_year_end_bonus = models.DecimalField(max_digits=10, decimal_places=2)
    cep_tanod_honoraria = models.DecimalField(max_digits=10, decimal_places=2)
    cep_lupon_honoraria = models.DecimalField(max_digits=10, decimal_places=2)
    cep_brgy_workers_honoraria = models.DecimalField(max_digits=10, decimal_places=2)
    cep_enhancement_incentive = models.DecimalField(max_digits=10, decimal_places=2)
    cep_leave_credits = models.DecimalField(max_digits=10, decimal_places=2)
    plan = models.ForeignKey(Budget_Plan, on_delete=models.CASCADE)

    class Meta:
        db_table = "Current_Expenditures_Personal"


class Current_Expenditures_Maintenance(models.Model):
    cem_id = models.BigAutoField(primary_key=True)
    cem_travel_expense = models.DecimalField(max_digits=10, decimal_places=2)
    cem_training_expense = models.DecimalField(max_digits=10, decimal_places=2)
    cem_office_expense = models.DecimalField(max_digits=10, decimal_places=2)
    cem_accountable_expense = models.DecimalField(max_digits=10, decimal_places=2)
    cem_medicine_expense = models.DecimalField(max_digits=10, decimal_places=2)
    cem_water_expense = models.DecimalField(max_digits=10, decimal_places=2)
    cem_electricity_expense = models.DecimalField(max_digits=10, decimal_places=2)
    cem_telephone_expense = models.DecimalField(max_digits=10, decimal_places=2)
    cem_membership_dues = models.DecimalField(max_digits=10, decimal_places=2)
    cem_office_maintenance = models.DecimalField(max_digits=10, decimal_places=2)
    cem_vehicle_maintenance = models.DecimalField(max_digits=10, decimal_places=2) 
    plan = models.ForeignKey(Budget_Plan, on_delete=models.CASCADE)

    class Meta: 
        db_table = "Current_Expenditures_Maintenance"


class Other_Maint_And_Operating_Expense(models.Model):
    ome_id = models.BigAutoField(primary_key=True)
    ome_gad_program = models.DecimalField(max_digits=10, decimal_places=2)
    ome_senior_pwd_program = models.DecimalField(max_digits=10, decimal_places=2)
    ome_bcpc = models.DecimalField(max_digits=10, decimal_places=2)
    ome_badac_program = models.DecimalField(max_digits=10, decimal_places=2)
    ome_nutrition_program = models.DecimalField(max_digits=10, decimal_places=2)
    ome_aids_program = models.DecimalField(max_digits=10, decimal_places=2)
    ome_assembly_expense = models.DecimalField(max_digits=10, decimal_places=2)
    ome_disaster_program = models.DecimalField(max_digits=10, decimal_places=2)
    ome_fidelity_bond = models.DecimalField(max_digits=10, decimal_places=2)
    ome_insurance_expense = models.DecimalField(max_digits=10, decimal_places=2)
    ome_misc_expense = models.DecimalField(max_digits=10, decimal_places=2)
    plan = models.ForeignKey(Budget_Plan, on_delete=models.CASCADE)

    class Meta:
        db_table = "Other_Maint_And_Operating_Expense"


class Capital_Outlays_And_Non_Office(models.Model):
    con_id = models.BigAutoField(primary_key=True)
    con_capital_outlay = models.DecimalField(max_digits=10, decimal_places=2)
    con_clean_and_green = models.DecimalField(max_digits=10, decimal_places=2)
    con_street_lighting = models.DecimalField(max_digits=10, decimal_places=2)
    con_rehab_multi_purpose = models.DecimalField(max_digits=10, decimal_places=2)
    con_sk_fund = models.DecimalField(max_digits=10, decimal_places=2)
    con_quick_response = models.DecimalField(max_digits=10, decimal_places=2)
    con_disaster_training = models.DecimalField(max_digits=10, decimal_places=2)
    con_disaster_supplies = models.DecimalField(max_digits=10, decimal_places=2)
    plan = models.ForeignKey(Budget_Plan, on_delete=models.CASCADE)

    class Meta:
        db_table = "Capital_Outlays_And_Non_Office"

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


# class Income_Expense_Tracking(models.Model):
#     iet_num = models.BigAutoField(primary_key=True)
#     iet_date = models.DateField(default=date.date.today)
#     iet_particulars = models.CharField(max_length=100)
#     iet_receiver = models.CharField(max_length=100)
#     iet_additional_notes = models.CharField(max_length=100)
#     iet_receipt_image = models.CharField(null=False)
#     inv_num = models.ForeignKey('', on_delete=models.CASCADE)
#     feat_id = models.ForeignKey('', on_delete=models.CASCADE)

#     class Meta:
#         db_table = "Income_Expense_Tracking"
