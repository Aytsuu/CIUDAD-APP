from django.db import models, transaction
from django.db.models import Max
from datetime import datetime
from django.utils import timezone
from django.core.validators import MinValueValidator
from decimal import Decimal
from apps.patientrecords.models import Patient, PatientRecord, Spouse, VitalSigns, FollowUpVisit, BodyMeasurement, Obstetrical_History, MedicalHistory
from apps.medicineservices.models import MedicineRecord
from apps.vaccination.models import VaccinationRecord
import uuid
from apps.administration.models import Staff
from apps.healthProfiling.models import ResidentProfile

# ************** prenatal **************
today = datetime.now()
month = str(today.month).zfill(2)  
year = str(today.year)

class PrenatalAppointmentRequest(models.Model):
    par_id = models.BigAutoField(primary_key=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    requested_date = models.DateField(auto_now_add=True)
    approved_at = models.DateField(null=True, blank=True)
    cancelled_at = models.DateField(null=True, blank=True)
    completed_at = models.DateField(null=True, blank=True)
    rejected_at = models.DateField(null=True, blank=True)
    missed_at = models.DateField(null=True, blank=True)
    reason = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rejected', 'Rejected'),
        ('missed', 'Missed'),
    ], default='pending')
    rp_id = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE, db_column='rp_id', related_name='pa_request')
    pat_id = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='pat_id', related_name='pa_request', null=True)
    
    class Meta:
        db_table = 'prenatal_appointment_request'
        indexes = [
            models.Index(fields=['status', 'requested_date']),
            models.Index(fields=['pat_id', 'status']),
        ]
    
    def approve(self, staff=None):
        """Approve the appointment"""
        self.status = 'approved'
        self.approved_at = timezone.now()
        self.save()
    
    def cancel(self, reason=None, staff=None):
        """Cancel the appointment"""
        self.status = 'cancelled'
        self.cancelled_at = timezone.now()
        if reason:
            self.reason = reason
        self.save()
    
    def complete(self, staff=None):
        """Mark appointment as completed"""
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()
    
    def reject(self, reason=None, staff=None):
        """Reject the appointment"""
        self.status = 'rejected'
        self.rejected_at = timezone.now()
        if reason:
            self.reason = reason
        self.save()
    
    def mark_as_missed(self, staff=None):
        """Mark appointment as missed - no reason required"""
        self.status = 'missed'
        self.missed_at = timezone.now()
        self.save()
    
    def is_overdue(self):
        """Check if appointment date has passed and status is still approved"""
        if self.requested_date and self.status == 'approved':
            return self.requested_date < timezone.now().date()
        return False
    
    def __str__(self):
        return f"Appointment {self.par_id} - {self.status} - {self.requested_date}"

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
    pf_edc = models.DateField(null=True, blank=True)
    pf_occupation = models.CharField(max_length=100, null=True, blank=True)
    previous_complications = models.TextField(null=True, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(null=True, blank=True)

    pregnancy_id = models.ForeignKey(Pregnancy, on_delete=models.CASCADE, related_name='prenatal_form', db_column='pregnancy_id', null=True)
    patrec_id = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='prenatal_form', db_column='patrec_id', null=True) 
    spouse_id = models.ForeignKey(Spouse, on_delete=models.CASCADE, related_name='prenatal_form', db_column='spouse_id', null=True)
    bm_id  = models.ForeignKey(BodyMeasurement, on_delete=models.CASCADE, related_name='prenatal_form', db_column='bm_id', null=True)
    followv_id = models.ForeignKey(FollowUpVisit, on_delete=models.CASCADE, related_name='prenatal_form', db_column='followv_id', null=True)
    medrec_id = models.ForeignKey(MedicineRecord, on_delete=models.CASCADE, related_name='prenatal_form', db_column='medrec_id', null=True)
    vital_id = models.ForeignKey(VitalSigns, on_delete=models.CASCADE, related_name='prenatal_form', db_column='vital_id', null=False)
    vacrec_id = models.ForeignKey(VaccinationRecord, on_delete=models.CASCADE, related_name='prenatal_form', db_column='vacrec_id', null=True)
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='prenatal_form', db_column='staff_id', null=True)

    def save(self, *args, **kwargs):
        if not self.pf_id:
            with transaction.atomic():
                # Get current date
                now = timezone.now()
                month = now.strftime('%m')
                year = now.strftime('%Y')   
                
                # Create prefix
                prefix = f'PF{month}{year}'
                
                # Get count with database lock to prevent race conditions
                count = Prenatal_Form.objects.select_for_update().filter(
                    pf_id__startswith=prefix
                ).count() + 1
                
                # Generate ID
                self.pf_id = f'{prefix}{str(count).zfill(4)}'
        
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'prenatal_form'
        ordering = ['created_at']


class Previous_Hospitalization(models.Model):
    pfph_id = models.BigAutoField(primary_key=True)
    prev_hospitalization = models.CharField(max_length=250, default='', blank=True)
    prev_hospitalization_year = models.PositiveIntegerField(null=True, blank=True)
    pf_id =models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE, related_name='pf_previous_hospitalization', db_column='pf_id', null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pf_previous_hospitalization'


class Previous_Pregnancy(models.Model):
    pfpp_id = models.BigAutoField(primary_key=True)
    date_of_delivery = models.DateField(null=True, blank=True)
    outcome = models.CharField(max_length=50, default='', blank=True, null=True)
    type_of_delivery = models.CharField(max_length=50, default='', blank=True, null=True)
    babys_wt = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(Decimal('0'))], null=True, blank=True)
    gender = models.CharField(max_length=10, default='', blank=True, null=True)
    ballard_score = models.PositiveIntegerField(null=True, blank=True)
    apgar_score = models.PositiveIntegerField(null=True, blank=True)
    patrec_id = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='previous_pregnancy', db_column='patrec_id', null=True)
    
    class Meta:
        db_table = 'previous_pregnancy'


class TT_Status(models.Model):
    tts_id = models.BigAutoField(primary_key=True)
    tts_status = models.CharField(max_length=10, default='', blank=True)
    tts_date_given = models.DateField(null=True, blank=True)
    tts_tdap = models.BooleanField(null=True, blank=True)
    pat_id = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='tt_status', db_column='pat_id', null=True)
    class Meta:
        db_table = 'tt_status'


class LaboratoryResult(models.Model):
    LAB_TYPES = [
        ('urinalysis', 'Urinalysis'),
        ('cbc', 'CBC'),
        ('sgot_sgpt', 'SGOT/SGPT'),
        ('creatinine_serum', 'Creatinine Serum'),
        ('bua_bun', 'BUA/BUN'),
        ('syphilis', 'Syphilis'),
        ('hiv_test', 'HIV Test'),
        ('hepa_b', 'Hepatitis B'),
        ('blood_typing', 'Blood Typing'),
        ('ogct_50gms', 'OGCT 50gms'),
        ('ogct_100gms', 'OGCT 100gms'),
    ]

    lab_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE, related_name='lab_result', db_column='pf_id', null=True)
    lab_type = models.CharField(max_length=50, choices=LAB_TYPES, default='', blank=True)
    result_date = models.DateField(blank=True, null=True)
    is_completed = models.BooleanField(default=False, blank=True)
    to_be_followed = models.BooleanField(default=False, blank=True)
    document_path = models.TextField(blank=True, null=True)
    remarks = models.TextField(default='', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lab_result'
        ordering = ['created_at']


class LaboratoryResultImg(models.Model):
    lab_img_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lab_id = models.ForeignKey(LaboratoryResult, on_delete=models.CASCADE, related_name='lab_result_img', db_column='lab_id', null=True)
    image_url = models.TextField(default='')
    image_name = models.TextField(default='')
    image_type = models.CharField(max_length=50, default='')
    image_size = models.PositiveIntegerField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lab_result_img'
        ordering = ['created_at']
    
    def __str__(self):
        return f'{self.image_name}-{self.lab_id.lab_type}'


class Guide4ANCVisit(models.Model):
    pfav_id = models.BigAutoField(primary_key=True)
    pfav_1st_tri = models.DateField(null=True, blank=True)
    pfav_2nd_tri = models.DateField(null=True, blank=True)
    pfav_3rd_tri_one = models.DateField(null=True, blank=True)
    pfav_3rd_tri_two = models.DateField(null=True, blank=True)
    pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE, related_name='pf_anc_visit', db_column='pf_id', null=True)

    class Meta:
        db_table = 'pf_anc_visit'


class Checklist(models.Model):
    pfc_id = models.BigAutoField(primary_key=True)
    increased_bp = models.BooleanField(default=False, blank=True)
    nausea= models.BooleanField(default=False, blank=True)
    edema = models.BooleanField(default=False, blank=True)
    abno_vaginal_disch = models.BooleanField(default=False, blank=True)
    chills_fever = models.BooleanField(default=False, blank=True)
    varicosities = models.BooleanField(default=False, blank=True)
    epigastric_pain = models.BooleanField(default=False, blank=True)
    blurring_vision = models.BooleanField(default=False, blank=True)
    severe_headache = models.BooleanField(default=False, blank=True)
    vaginal_bleeding = models.BooleanField(default=False, blank=True)
    diff_in_breathing = models.BooleanField(default=False, blank=True)
    abdominal_pain = models.BooleanField(default=False, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE, related_name='pf_checklist', db_column='pf_id', null=True)

    class Meta:
        db_table = 'pf_checklist'
        ordering = ['created_at']


class BirthPlan(models.Model):
    pfbp_id = models.BigAutoField(primary_key=True)
    place_of_delivery_plan = models.CharField(max_length=100, default='', blank=True)
    newborn_screening_plan = models.BooleanField(blank=True, default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE, related_name='pf_birth_plan', db_column='pf_id', null=True)

    class Meta:
        db_table = 'pf_birth_plan'

# New models added by the user
class ObstetricRiskCode(models.Model):
    pforc_id = models.BigAutoField(primary_key=True)
    pforc_prev_c_section = models.BooleanField(default=False, help_text="Previous C-section")
    pforc_3_consecutive_miscarriages = models.BooleanField(default=False, blank=True, help_text="3 consecutive miscarriages of stillborn baby")
    pforc_postpartum_hemorrhage = models.BooleanField(default=False, blank=True, help_text="Previous postpartum hemorrhage")
    created_at = models.DateTimeField(auto_now_add=True)

    pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE, related_name='pf_obstetric_risk_code', db_column='pf_id', null=True)
    
    class Meta:
        db_table = 'pf_obstetric_risk_codes'

class PrenatalCare(models.Model):
    pfpc_id = models.BigAutoField(primary_key=True)
    pfpc_date = models.DateField(null=True, blank=True)
    pfpc_aog_wks = models.IntegerField(null=True, blank=True, help_text="Age of Gestation in weeks")
    pfpc_aog_days = models.IntegerField(null=True, blank=True, help_text="Age of Gestation in days")
    pfpc_fundal_ht = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Fundal height measurement")
    pfpc_fetal_hr = models.IntegerField(null=True, blank=True, help_text="Fetal heart rate")
    pfpc_fetal_pos = models.CharField(max_length=50, default='', blank=True, help_text="Fetal position")
    pfpc_complaints = models.TextField(default='', blank=True)
    pfpc_advises = models.TextField(default='', blank=True)
    pf_id = models.ForeignKey(Prenatal_Form, on_delete=models.CASCADE, related_name='pf_prenatal_care', db_column='pf_id', null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'pf_prenatal_care'
        ordering = ['created_at']



# ************** postpartum **************
class PostpartumRecord(models.Model):
    ppr_id = models.CharField(primary_key=True, max_length=20, unique=True, editable=False)
    ppr_lochial_discharges = models.CharField(max_length=100)
    ppr_vit_a_date_given = models.DateField(null=True, blank=True)
    ppr_num_of_pads = models.PositiveIntegerField()
    ppr_mebendazole_date_given = models.DateField(null=True, blank=True)
    ppr_date_of_bf = models.DateField()
    ppr_time_of_bf = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(null=True, blank=True)

    patrec_id = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='postpartum_record', null=False, db_column='patrec_id')
    spouse_id = models.ForeignKey(Spouse, on_delete=models.CASCADE, related_name='postpartum_record', db_column='spouse_id', null=True)
    vital_id = models.ForeignKey(VitalSigns, on_delete=models.CASCADE, related_name='postpartum_record', db_column='vital_id', null=False)
    followv_id = models.ForeignKey(FollowUpVisit, on_delete=models.CASCADE, related_name='postpartum_record', db_column='followv_id', null=True)
    pregnancy_id = models.ForeignKey(Pregnancy, on_delete=models.CASCADE, related_name='postpartum_record', db_column='pregnancy_id', null=True, blank=True)
    medrec_id = models.ForeignKey(MedicineRecord, on_delete=models.CASCADE, related_name='postpartum_record', db_column='medrec_id', null=True)
    staff_id = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='postpartum_record', db_column='staff_id')

    def save(self, *args, **kwargs):
        if not self.ppr_id:
            self.ppr_id = self.generate_unique_id()
        super().save(*args, **kwargs)

    def generate_unique_id(self):
        """Generate a unique postpartum record ID"""
        current_datetime = timezone.now()
        month = str(current_datetime.month).zfill(2)  
        year = str(current_datetime.year)[-2:]
        
        prefix = f'PPR{month}{year}'
        
        with transaction.atomic():
            existing_records = PostpartumRecord.objects.filter(
                ppr_id__startswith=prefix
            ).values_list('ppr_id', flat=True).order_by('-ppr_id')
            
            if existing_records:
                last_num = int(existing_records[0][-5:])
                new_num = last_num + 1
            else:
                new_num = 1
            
            new_id = f'{prefix}{str(new_num).zfill(5)}'
            
            while PostpartumRecord.objects.filter(ppr_id=new_id).exists():
                new_num += 1
                new_id = f'{prefix}{str(new_num).zfill(5)}'
            
            return new_id

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