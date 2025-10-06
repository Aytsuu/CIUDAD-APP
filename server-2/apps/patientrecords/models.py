from django.db import models, transaction
from django.db.models import Max
from django.utils import timezone
from decimal import Decimal
from apps.healthProfiling.models import ResidentProfile
from apps.administration.models import Staff



from django.db import models

class TransientAddress(models.Model):
    tradd_id = models.BigAutoField(primary_key=True)
    tradd_province = models.CharField(max_length=50)
    tradd_city = models.CharField(max_length=50)
    tradd_barangay = models.CharField(max_length=50)
    tradd_street = models.CharField(max_length=50)
    tradd_sitio = models.CharField(max_length=50, null=True, blank=True)
 
    class Meta:  
        db_table = 'transient_address'
    
    def save(self, *args, **kwargs):
        # Capitalize all CharFields before saving
        char_fields = [f.name for f in self._meta.get_fields() if isinstance(f, models.CharField)]
        
        for field_name in char_fields:
            value = getattr(self, field_name)
            if value and isinstance(value, str):
                # Use title() for proper capitalization of each word
                setattr(self, field_name, value.upper())
        
        super().save(*args, **kwargs)
     
class Transient(models.Model):
    trans_id = models.CharField(max_length=15, primary_key=True)
    tran_lname = models.CharField(max_length=100)
    tran_fname = models.CharField(max_length=100)
    tran_mname = models.CharField(max_length=100, null=True, blank=True)
    tran_suffix = models.CharField(max_length=50, null=True, blank=True)
    tran_dob = models.DateField()
    tran_sex = models.CharField(max_length=10)
    tran_status = models.CharField(max_length=50)
    tran_ed_attainment = models.CharField(max_length=100)
    tran_religion = models.CharField(max_length=100)
    tran_contact = models.CharField(max_length=20)
    updated_at = models.DateTimeField(auto_now=True)
    tradd_id = models.ForeignKey(TransientAddress, on_delete=models.CASCADE, related_name='transients', db_column='tradd_id', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    philhealth_id = models.CharField(max_length=12, null=True, blank=True)

    # MOTHER fields
    mother_fname = models.CharField(max_length=100, null=True, blank=True)
    mother_lname = models.CharField(max_length=100, null=True, blank=True)
    mother_mname = models.CharField(max_length=100, null=True, blank=True)
    mother_age = models.CharField(max_length=100, null=True, blank=True)
    mother_dob = models.DateField(null=True, blank=True)

    # FATHER fields
    father_fname = models.CharField(max_length=100, null=True, blank=True)
    father_lname = models.CharField(max_length=100, null=True, blank=True)
    father_mname = models.CharField(max_length=100, null=True, blank=True)
    father_age = models.CharField(max_length=100, null=True, blank=True)
    father_dob = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'transient'
    
    def save(self, *args, **kwargs):
        # Capitalize all CharFields before saving
        char_fields = [f.name for f in self._meta.get_fields() if isinstance(f, models.CharField)]
        
        for field_name in char_fields:
            # Skip contact and ID fields that should remain as-is
            if field_name in ['trans_id', 'tran_contact', 'philhealth_id']:
                continue
                
            value = getattr(self, field_name)
            if value and isinstance(value, str):
                # Use title() for proper capitalization of each word
                setattr(self, field_name, value.upper())
        
        super().save(*args, **kwargs)

class Patient(models.Model):
    PATIENT_TYPES = [
        ("Resident", "Resident"),
        ("Transient", "Transient"),
    ]

    pat_id = models.CharField(
        max_length=15,
        primary_key=True,
        editable=False,
        unique=True
    )
    pat_type = models.CharField(
        max_length=100,
        choices=PATIENT_TYPES,
        default="Resident"
    )
    pat_status = models.CharField(max_length=100, default="Active")
    rp_id = models.ForeignKey(
        ResidentProfile,
        on_delete=models.CASCADE,
        related_name='patients',
        null=True,
        blank=True,
        db_column='rp_id'
    )
    trans_id = models.ForeignKey(
        Transient,
        on_delete=models.CASCADE,
        related_name='patients',
        null=True,
        blank=True,
        db_column='trans_id'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.pat_type == 'Resident' and not self.rp_id:
            raise ValidationError("Resident patients must have a rp_id.")
        if self.pat_type == 'Transient' and not self.trans_id:
            raise ValidationError("Transient patients must have a transient_profile.")
        if self.rp_id and self.trans_id:
            raise ValidationError("Patient cannot have both rp_id and trans_id.")

    def save(self, *args, **kwargs):
        # Auto-generate pat_id if not set
        if not self.pat_id:
            # Determine DOB source
            dob = None
            if self.pat_type == 'Resident' and self.rp_id and hasattr(self.rp_id, 'per'):
                dob = getattr(self.rp_id.per, 'per_dob', None)
            elif self.pat_type == 'Transient' and self.trans_id:
                dob = self.trans_id.tran_dob

            year = dob.year if dob else timezone.now().year
            type_code = 'R' if self.pat_type == 'Resident' else 'T'
            prefix = f'P{type_code}{year}'
            
            existing_patients = Patient.objects.filter(
                pat_id__startswith=prefix
            ).values_list('pat_id', flat=True)
            
            existing_numbers = []
            for pat_id in existing_patients:
                try:
                    number_part = pat_id[len(prefix):]
                    existing_numbers.append(int(number_part))
                except (ValueError, IndexError):
                    continue
            
            # Get the next available number
            next_number = max(existing_numbers, default=0) + 1
            self.pat_id = f'{prefix}{str(next_number).zfill(4)}'

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.pat_id} ({self.pat_type})"
    class Meta:
        db_table = 'patient'
        ordering = ['-created_at']

 
class PatientRecord(models.Model):
    patrec_id = models.BigAutoField(primary_key=True)
    patrec_type = models.CharField(max_length=100) #SERVICES  LIKE VACCINATION
    pat_id = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='patient_records',db_column='pat_id')
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'patient_record'
        ordering = ['-patrec_id']
        

class VitalSigns(models.Model):
    vital_id = models.BigAutoField(primary_key=True)
    vital_bp_systolic = models.CharField(max_length=100, default="", null=True, blank=True)
    vital_bp_diastolic = models.CharField(max_length=100, default="", null=True, blank=True)
    vital_temp = models.CharField(max_length=100, default="", null=True, blank=True)
    vital_RR = models.CharField(max_length=100, default="", null=True, blank=True)
    vital_o2 = models.CharField(max_length=100, default="", null=True, blank=True)
    vital_pulse = models.CharField(max_length=100, default="", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    patrec = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='vital_signs', null=True)
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='vital_signs', null=True, blank=True)

    class Meta:
        db_table = 'vital_signs'
    
    # def save(self, *args, **kwargs):
    #     # Only fill empty fields if this is a new record and patrec exists
    #     if not self.pk and self.patrec:
    #         self._fill_empty_with_previous_values()
    #     super().save(*args, **kwargs)
    
    # def _fill_empty_with_previous_values(self):
    #     """Fill empty vital sign fields with the most recent values from patient history"""
    #     # Get the most recent vital signs for this patient
    #     latest_vitals = VitalSigns.objects.filter(
    #         patrec=self.patrec
    #     ).order_by('-created_at').first()
        
    #     if latest_vitals:
    #         # List of vital sign fields to check
    #         vital_fields = [
    #             'vital_bp_systolic', 'vital_bp_diastolic', 'vital_temp',
    #             'vital_RR', 'vital_o2', 'vital_pulse'
    #         ]
            
    #         for field in vital_fields:
    #             current_value = getattr(self, field)
    #             # If current field is empty or None, use previous value
    #             if not current_value or current_value.strip() == "":
    #                 previous_value = getattr(latest_vitals, field)
    #                 if previous_value and previous_value.strip():
    #                     setattr(self, field, previous_value)



class Obstetrical_History(models.Model):
    obs_id = models.BigAutoField(primary_key=True)
    obs_ch_born_alive = models.PositiveIntegerField(null=True, blank=True)
    obs_living_ch = models.PositiveIntegerField(null=True, blank=True)
    obs_abortion = models.PositiveIntegerField(null=True, blank=True)
    obs_still_birth = models.PositiveIntegerField(null=True, blank=True)
    obs_lg_babies = models.PositiveIntegerField(null=True, blank=True)
    obs_lg_babies_str = models.BooleanField(null=True, blank=True)
    obs_gravida = models.PositiveIntegerField(null=True, blank=True)
    obs_para = models.PositiveIntegerField(null=True, blank=True)
    obs_fullterm = models.PositiveIntegerField(null=True, blank=True)
    obs_preterm = models.PositiveIntegerField(null=True, blank=True)
    obs_record_from = models.CharField(max_length=100)
    obs_lmp = models.DateField(null=True, blank=True)
    patrec_id = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='obstetrical_history', db_column='patrec_id')

    class Meta:
        db_table = 'obstetrical_history'
        
  
  

class FollowUpVisit(models.Model):
    followv_id = models.BigAutoField(primary_key=True)
    followv_date = models.DateField(null=True, blank=True)
    followv_status = models.CharField(max_length=100)
    followv_description = models.TextField(default="")
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateField(null=True,blank=True)
    patrec = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='follow_up_visits')
    
    class Meta:
        db_table = 'follow_up_visit'
        

class Spouse(models.Model):
    spouse_id = models.BigAutoField(primary_key=True)
    spouse_type = models.CharField(max_length=10)
    spouse_lname = models.CharField(max_length=50, default="", null=True,blank=True)
    spouse_fname = models.CharField(max_length=50, default="",null=True,blank=True)
    spouse_mname = models.CharField(max_length=50, default="", null=True,blank=True)
    spouse_occupation = models.CharField(max_length=50, null=True,blank=True)
    spouse_dob = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    # updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = 'spouse'
    
    
class BodyMeasurement(models.Model):
    bm_id = models.BigAutoField(primary_key=True)  
    height = models.DecimalField(max_digits=5, decimal_places=2,default=Decimal('0.00'))
    weight = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    wfa = models.CharField(max_length=100, blank=True, null=True)  # Weight-for-Age
    lhfa = models.CharField(max_length=100, blank=True, null=True)  # Length-for-Age
    wfl = models.CharField(max_length=100, blank=True, null=True)  # Weight-for-Length
    muac = models.CharField(max_length=100, blank=True, null=True)  # Mid-Upper Arm Circumference
    created_at = models.DateTimeField(auto_now_add=True)
    edemaSeverity= models.CharField(max_length=100, default="None")  # Edema severity
    muac_status = models.CharField(max_length=100, blank=True, null=True)  # Status of MUAC
    remarks = models.TextField(blank=True, null=True)  # Additional remarks
    is_opt = models.BooleanField(default=False)  # Indicates if the vital sign is optional
    created_at = models.DateTimeField(auto_now_add=True)
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='body_measurements', null=True, blank=True)
    pat = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='body_measurements', db_column='pat_id', null=True, blank=True)
    class Meta:
        db_table = 'body_measurement'
           

    
class Illness(models.Model):
    ill_id = models.BigAutoField(primary_key=True)
    illname = models.CharField(max_length=100,default="",null=True,blank=True)
    ill_description = models.CharField(max_length=200, default="",null=True,blank=True)
    ill_code = models.CharField(max_length=100,default="",null=True,blank=True)
    created_at= models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'illness'

# FINDINGS
class Finding(models.Model):
    find_id = models.BigAutoField(primary_key=True)
    assessment_summary =models.TextField(default="",blank=True,null=True)
    obj_summary = models.TextField(default="")
    subj_summary = models.TextField(default="")
    plantreatment_summary=models.TextField(default="")
    created_at= models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'finding'



class MedicalHistory(models.Model):
    medhist_id = models.BigAutoField(primary_key=True)
    ill = models.ForeignKey(Illness, on_delete=models.CASCADE, related_name='medical_history', null=True, db_column='ill_id')
    ill_date = models.CharField(max_length=255, null=True, blank=True, default=timezone.now().year)
    patrec =models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='medical_history', null=True, db_column='patrec_id')
    created_at = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(default="", blank=True, null=True)
    is_for_surveillance = models.BooleanField(default=False)  # New field for surveillance
    is_from_famhistory=models.BooleanField(default=False)
    class Meta:
        db_table = 'medical_history'   
class Diagnosis(models.Model):
    diag_id = models.BigAutoField(primary_key=True)
    find = models.ForeignKey(Finding, on_delete=models.CASCADE, related_name='diagnosis', null=True,db_column='find_id')
    medhist =models.ForeignKey(MedicalHistory, on_delete=models.CASCADE, related_name='diagnosis', null=True,db_column='medhist_id')
    class Meta:
        db_table = 'diagnosis'   
     
class PESection(models.Model):
    pe_section_id = models.BigAutoField(primary_key=True)  
    title = models.CharField(max_length=255)  # Display name

    class Meta:
        db_table = 'physical_exam_section'


# Option under a section (e.g., "Normal skin color and texture")
class PEOption(models.Model):
    pe_option_id = models.BigAutoField(primary_key=True)
    pe_section = models.ForeignKey(PESection, on_delete=models.CASCADE, related_name='options')
    text = models.TextField()
    class Meta:
        db_table = 'physical_exam_option'


class PEResult(models.Model):
    peres_id= models.BigAutoField(primary_key=True)
    find = models.ForeignKey(Finding, on_delete=models.CASCADE,related_name="pe_result", null=True)
    pe_option =models.ForeignKey(PEOption,on_delete=models.CASCADE, related_name="pe_result")
    
    class Meta:
        db_table ='physical_exam_result'
   
class Appointment(models.Model):
    app_id = models.CharField(max_length=15, primary_key=True)
    app_date = models.DateField()
    app_time = models.TimeField()
    app_status = models.CharField(max_length=100, default="Pending")
    app_reason = models.TextField(default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    res_id = models.ForeignKey(
        ResidentProfile,
        on_delete=models.CASCADE,
        related_name='appointments',
        null=True,
        blank=True,
        db_column='res_id'
    )
    pat_id = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments',
        null=True,
        blank=True,
        db_column='pat_id'
    )
    class  Meta:
        db_table = 'appointment'
        ordering = ['-app_date', '-app_time']
    
    
class ListOfDisabilities(models.Model):
    disability_id = models.BigAutoField(primary_key=True)
    disability_name = models.CharField(max_length=100, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'list_of_disabilities'
        ordering = ['disability_name']
        
class PatientDisablity(models.Model):
    pd_id = models.BigAutoField(primary_key=True)
    patrec = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='patient_disabilities')
    disability = models.ForeignKey(ListOfDisabilities, on_delete=models.CASCADE, related_name='patient_disabilities')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ("active", "Active"),
            ("resolve", "Resolve")
        ],
        default="active"
    )

    class Meta:
        db_table = 'patient_disability_history'