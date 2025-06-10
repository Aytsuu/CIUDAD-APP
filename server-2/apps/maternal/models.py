from django.db import models, transaction
from django.db.models import Max
from datetime import datetime
from django.utils import timezone
from django.core.validators import MinValueValidator
from apps.patientrecords.models import PatientRecord
# from apps.healthProfiling.models import Staff

# ************** prenatal **************
class Prenatal_Form(models.Model):
    pf_id = models.BigAutoField(primary_key=True)
    pf_lmp = models.DateField()
    pf_edc = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    patrec_id = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='prenatal_form', db_column='patrec_id')
    # staff_id = models.ForeignKey('healthProfiling.Staff', on_delete=models.CASCADE, related_name='prenatal_form', db_column='staff_id')

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

# class Lab_Result_Dates(models.Model):
#     pflr_id = models.BigAutoField(primary_key=True)
#     pflr_urinalysis = models.DateField()
#     pflr_cbc = models.DateField()   
#     pflr_sgot_sgpt = models.DateField()
#     pflr_creatinine_serum = models.DateField()
#     pflr_bua_bun = models.DateField()
#     pflr_syphillis = models.DateField()
#     pflr_hiv_test = models.DateField()
#     pflr_hepa_b = models.DateField()
#     pflr_ogct_50 = models.DateField()
#     pflr_ogct_100 = models.DateField()
#     pflr_lab_remarks = models.CharField(max_length=250)
#     created_at = models.DateTimeField(auto_now_add=True)
#     pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE,  related_name='pf_lab_result_dates', db_column='pf_id')

#     class Meta:
#         db_table = 'pf_lab_result_dates'

class Guide4ANCVisit(models.Model):
    pfav_id = models.BigAutoField(primary_key=True)
    pfav_1st_tri = models.DateField()
    pfav_2nd_tri = models.DateField()
    pfav_3rd_tri_one = models.DateField()
    pfav_3rd_tri_two = models.DateField()
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


# ************** postpartum **************
class PostpartumRecord(models.Model):
    ppr_id = models.CharField(primary_key=True, max_length=15, unique=True, editable=False)
    ppr_transferred_fr = models.CharField(max_length=100, default="Not Applicable")
    ppr_tor = models.CharField(max_length=100, default="Not Applicable")
    ppr_lochial_discharges = models.CharField(max_length=100)
    ppr_vit_a_date_given = models.DateField()
    ppr_num_of_pads = models.PositiveIntegerField()
    ppr_mebendazole_date_given = models.DateField()
    ppr_date_of_bf = models.DateField()
    ppr_time_of_bf = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE, null=True, related_name='postpartum_record', db_column='pf_id')
    # staff_id = models.ForeignKey('healthProfiling.Staff', on_delete=models.CASCADE, related_name='postpartum_record', db_column='staff_id')

    today = datetime.now()
    month = str(today.month).zfill(2)  
    year = str(today.year)

    def save(self, *args, **kwargs):
        if not self.ppr_id:
            prefix = f'PPR{self.month}{self.year}'
            count = PostpartumRecord.objects.filter(ppr_id__startswith=prefix).count() + 1
            self.ppr_id = f'{prefix}{str(count).zfill(5)}'
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'postpartum_record'  


class PostpartumDeliveryRecord(models.Model):
    ppdr_id = models.BigAutoField(primary_key=True) 
    ppdr_date_of_delivery = models.DateField()
    ppdr_time_of_delivery = models.TimeField()
    ppdr_place_of_delivery = models.CharField(max_length=50)
    ppdr_attended_by = models.CharField(max_length=50)
    ppdr_outcome = models.CharField(max_length=50)

    class Meta:
        db_table = 'postpartum_delivery_record'


class PostpartumAssessment(models.Model):
    ppa_id = models.BigAutoField(primary_key=True)
    ppa_date_of_visit = models.DateField()
    ppa_systolic = models.PositiveIntegerField()
    ppa_diastolic = models.PositiveIntegerField()
    ppa_feeding = models.CharField(max_length=50)
    ppa_findings = models.TextField()
    ppa_nurses_notes = models.TextField()
    ppr_id = models.ForeignKey(PostpartumRecord, on_delete=models.CASCADE, related_name='postpartum_assessment', db_column='ppr_id')

    class Meta: 
        db_table = 'postpartum_assessment'

