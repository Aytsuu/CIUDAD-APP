from django.db import models, transaction
from django.db.models import Max
from datetime import datetime
from django.utils import timezone
from django.core.validators import MinValueValidator
from apps.patientrecords.models import PatientRecord

# Create your models here.
class Prenatal_Form(models.Model):
    pf_id = models.BigAutoField(primary_key=True)
    pf_lmp = models.DateField()
    pf_edc = models.DateField()
    
    class Meta:
        db_table = 'prenatal_form'

# next: illness

class Previous_Hospitalization(models.Model):
    pfph_id = models.BigAutoField(primary_key=True)
    pfph_prev_hospi = models.CharField(max_length=250)
    pfph_prev_hospi_year = models.PositiveIntegerField()
    pf_id =models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE, related_name='pf_previous_hospitalization', db_column='pf_id')

    class Meta:
        db_table = 'pf_previous_hospitalization'

class Previous_Pregnancy(models.Model):
    pfpp_id = models.BigAutoField(primary_key=True)
    pfpp_date_of_delivery = models.DateField()
    pfpp_outcome = models.CharField(max_length=50)
    pfpp_type_of_delivery = models.CharField(max_length=50)
    pfpp_babys_wt = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0)])
    pfpp_gender = models.CharField(max_length=10)
    pfpp_ballard_score = models.PositiveIntegerField()
    pfpp_apgar_score = models.PositiveIntegerField()
    pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE, related_name='pf_previous_pregnancy', db_column='pf_id')
    
    class Meta:
        db_table = 'pf_previous_pregnancy'

class TT_Status(models.Model):
    pfts_id = models.BigAutoField(primary_key=True)
    pfts_vaccine_type = models.CharField(max_length=100)
    pfts_status = models.CharField(max_length=10)
    pfts_date_given = models.DateField()
    pfts_fim = models.BooleanField()
    pfts_tdap = models.BooleanField(default=False)
    pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE, related_name='pf_tt_status', db_column='pf_id')

    class Meta:
        db_table = 'pf_tt_status'

class Lab_Result_Dates(models.Model):
    pflr_id = models.BigAutoField(primary_key=True)
    pflr_urinalysis = models.DateField()
    pflr_cbc = models.DateField()
    pflr_sgot_sgpt = models.DateField()
    pflr_creatinine_serum = models.DateField()
    pflr_bua_bun = models.DateField()
    pflr_syphillis = models.DateField()
    pflr_hiv_test = models.DateField()
    pflr_hepa_b = models.DateField()
    pflr_ogct_50 = models.DateField()
    pflr_ogct_100 = models.DateField()
    pflr_lab_remarks = models.CharField(max_length=250)
    pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE,  related_name='pf_lab_result_dates', db_column='pf_id')

    class Meta:
        db_table = 'pf_lab_result_dates'

# next: lab result docs

class Guide4ANCVisit(models.Model):
    pfav_id = models.BigAutoField(primary_key=True)
    pfav_1st_tri = models.DateField()
    pfav_2nd_tri = models.DateField()
    pfav_3rd_tri = models.DateField()
    pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE, related_name='pf_anc_visit', db_column='pf_id')

    class Meta:
        db_table = 'pf_anc_visit'

class Checklist(models.Model):
    pfc_id = models.BigAutoField(primary_key=True)
    pfc_increased_bp = models.BooleanField()
    pfc_nausea= models.BooleanField()
    pfc_edema = models.BooleanField()
    pfc_abno_vaginal_disch = models.BooleanField()
    pfc_chills_fever = models.BooleanField()
    pfc_varicosities = models.BooleanField()
    pfc_epigastric_pain = models.BooleanField()
    pfc_blurring_vision = models.BooleanField()
    pfc_severe_headache = models.BooleanField()
    pfc_vaginal_bleeding = models.BooleanField()
    pfc_diff_in_bleeding = models.BooleanField()
    pfc_abdominal_pain = models.BooleanField()
    pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE, related_name='pf_checklist', db_column='pf_id')

    class Meta:
        db_table = 'pf_checklist'

# class BirthPlan(models.Model):
#     pfbp_id = models.BigAutoField(primary_key=True)
#     pfbp_pob_plan = models.DateField()
#     pfbp_newborn_s_plan = models.DateField()
#     pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE, related_name='pf_birth_plan', db_column='pf_id')

#     class Meta:
#         db_table = 'pf_birth_plan'

