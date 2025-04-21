from django.db import models, transaction
from django.db.models import Max
from datetime import datetime
from django.utils import timezone
from django.core.validators import MinValueValidator

# Create your models here.
class Prenatal_Form(models.Model):
    pf_id = models.BigAutoField(primary_key=True)
    pf_h_lname = models.CharField(max_length=100)
    pf_h_fname = models.CharField(max_length=100)
    pf_h_mname = models.CharField(max_length=100)
    pf_lmp = models.DateField()
    pf_edc = models.DateField()
    # pat_id = models.ForeignKey('healthProfiling.Patient', on_delete=models.CASCADE,)

    class Meta:
        db_table = 'prenatal_form'
    

class Obstetrical_History(models.Model):
    obs_id = models.BigAutoField(primary_key=True)
    obs_ch_born_alive = models.PositiveIntegerField()
    obs_living_ch = models.PositiveIntegerField()
    obs_abortion = models.PositiveIntegerField()
    obs_still_birth = models.PositiveIntegerField()
    obs_lg_babies = models.PositiveIntegerField()
    obs_gravida = models.PositiveIntegerField()
    obs_para = models.PositiveIntegerField()
    obs_fullterm = models.PositiveIntegerField()
    obs_preterm = models.PositiveIntegerField()
    obs_record_from = models.CharField(max_length=100)
    # pat_id = models.ForeignKey('healthProfiling.Patient', on_delete=models.CASCADE,)

    class Meta:
        db_table = 'obstetrical_history'

# next: illness

class Previous_Hospitalization(models.Model):
    pfph_id = models.BigAutoField(primary_key=True)
    pfph_prev_hospi = models.CharField(max_length=250)
    pfph_prev_hospi_year = models.PositiveIntegerField()
    pf_id =models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE,)

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
    pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE,)
    
    class Meta:
        db_table = 'pf_previous_pregnancy'

class TT_Status(models.Model):
    pfts_id = models.BigAutoField(primary_key=True)
    pfts_vaccine_type = models.CharField(max_length=100)
    pfts_status = models.CharField(max_length=10)
    pfts_date_given = models.DateField()
    pfts_fim = models.BooleanField()
    pfts_tdap = models.BooleanField(default=False)
    pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE,)

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
    pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE,)

    class Meta:
        db_table = 'pf_lab_result'

# next: lab result docs