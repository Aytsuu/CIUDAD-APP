from django.db import models, transaction
from django.db.models import Max
from datetime import datetime
from django.utils import timezone
from django.core.validators import MinValueValidator
from apps.patientrecords.models import Patient, PatientRecord, Spouse, VitalSigns, FollowUpVisit, BodyMeasurement, Obstetrical_History, MedicalHistory
# from apps.healthProfiling.models import Staff

# ************** prenatal **************
today = datetime.now()
month = str(today.month).zfill(2)  
year = str(today.year)

class Pregnancy(models.Model):
    pregnancy_id = models.CharField(primary_key=True, max_length=20, unique=True)
    pat_id = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='pat_id', related_name='pregnancy')
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('pregnancy loss', 'Pregnancy Loss')
    ], default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    prenatal_end_date = models.DateField(null=True, blank=True)
    postpartum_end_date = models.DateField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.pregnancy_id:
            current_yr = datetime.now().year
            current_yr_suffix = str(current_yr)[-2:] 

            prefix = f'PREG-{current_yr}-{current_yr_suffix}'

            existing_preg_max = Pregnancy.objects.filter(
                pregnancy_id__startswith=prefix
                ).aggregate(
                    max_num = Max('pregnancy_id')
                )
            
            if existing_preg_max['max_num']:
                last_preg_id = existing_preg_max['max_num']
                last_num = int(last_preg_id[-4:])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.pregnancy_id = f'{prefix}{str(new_num).zfill(4)}'
            
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = 'pregnancy'
        ordering = ['created_at']


class Prenatal_Form(models.Model):
    pf_id = models.CharField(primary_key=True, max_length=20, editable=False, unique=True)
    pf_lmp = models.DateField()
    pf_edc = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    pregnancy_id = models.ForeignKey(Pregnancy, on_delete=models.CASCADE, related_name='prenatal_form', db_column='pregnancy_id', null=True)
    patrec_id = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='prenatal_form', db_column='patrec_id', null=True) 
    spouse_id = models.ForeignKey(Spouse, on_delete=models.CASCADE, related_name='prenatal_form', db_column='spouse_id', null=True, blank=True)
    bm_id = models.ForeignKey(BodyMeasurement, on_delete=models.CASCADE, related_name='prenatal_form', db_column='bm_id', null=True, blank=True)
    # staff_id = models.ForeignKey('healthProfiling.Staff', on_delete=models.CASCADE, related_name='prenatal_form', db_column='staff_id')

    def save(self, *args, **kwargs):
        if not self.pf_id:
            prefix = f'PF{month}{year}'
            count = Prenatal_Form.objects.filter(pf_id__startswith=prefix).count() + 1
            self.pf_id = f'{prefix}{str(count).zfill(4)}'
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'prenatal_form'
        ordering = ['created_at']


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
    tts_id = models.BigAutoField(primary_key=True)
    tts_vaccine_name = models.CharField(max_length=100)
    tts_status = models.CharField(max_length=10)
    tts_date_given = models.DateField()
    tts_tdap = models.BooleanField(default=False)
    pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE, related_name='tt_status', db_column='pf_id', null=True)

    class Meta:
        db_table = 'tt_status'


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
    ppr_id = models.CharField(primary_key=True, max_length=20, unique=True, editable=False)
    # ppr_transferred_fr = models.CharField(max_length=100, default="Not Applicable")
    ppr_lochial_discharges = models.CharField(max_length=100)
    ppr_vit_a_date_given = models.DateField()
    ppr_num_of_pads = models.PositiveIntegerField()
    ppr_mebendazole_date_given = models.DateField()
    ppr_date_of_bf = models.DateField()
    ppr_time_of_bf = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    patrec_id = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='postpartum_record', null=False, db_column='patrec_id')
    spouse_id = models.ForeignKey(Spouse, on_delete=models.CASCADE, related_name='postpartum_record', db_column='spouse_id', null=True)
    vital_id = models.ForeignKey(VitalSigns, on_delete=models.CASCADE, related_name='postpartum_record', db_column='vital_id', null=False)
    followv_id = models.ForeignKey(FollowUpVisit, on_delete=models.CASCADE, related_name='postpartum_record', db_column='followv_id', null=True)
    pregnancy_id = models.ForeignKey(Pregnancy, on_delete=models.CASCADE, related_name='postpartum_record', db_column='pregnancy_id', null=True, blank=True)
    # staff_id = models.ForeignKey('healthProfiling.Staff', on_delete=models.CASCADE, related_name='postpartum_record', db_column='staff_id')

    def save(self, *args, **kwargs):
        if not self.ppr_id:
            prefix = f'PPR{month}{year}'
            count = PostpartumRecord.objects.filter(ppr_id__startswith=prefix).count() + 1
            self.ppr_id = f'{prefix}{str(count).zfill(5)}'
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'postpartum_record'  
        ordering = ['created_at']


class PostpartumDeliveryRecord(models.Model):
    ppdr_id = models.BigAutoField(primary_key=True) 
    ppdr_date_of_delivery = models.DateField()
    ppdr_time_of_delivery = models.TimeField(null=True, blank=True)
    ppdr_place_of_delivery = models.CharField(max_length=50)
    ppdr_attended_by = models.CharField(max_length=50)
    ppdr_outcome = models.CharField(max_length=50)
    ppr_id = models.ForeignKey(PostpartumRecord, on_delete=models.CASCADE, related_name='postpartum_delivery_record', db_column='ppr_id')

    class Meta:
        db_table = 'postpartum_delivery_record'


class PostpartumAssessment(models.Model):
    ppa_id = models.BigAutoField(primary_key=True)
    ppa_date_of_visit = models.DateField()
    ppa_feeding = models.CharField(max_length=50)
    ppa_findings = models.TextField()
    ppa_nurses_notes = models.TextField()
    ppr_id = models.ForeignKey(PostpartumRecord, on_delete=models.CASCADE, related_name='postpartum_assessment', db_column='ppr_id')

    class Meta: 
        db_table = 'postpartum_assessment'

