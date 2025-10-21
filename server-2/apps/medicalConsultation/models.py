from django.db import models
from apps.patientrecords.models import PatientRecord, VitalSigns, BodyMeasurement, Finding, Patient
from apps.medicineservices.models import MedicineRequest
from apps.administration.models import Staff
from django.core.validators import MinValueValidator
from django.utils import timezone
from apps.servicescheduler.models import *
from apps.healthProfiling.models import *
from apps.maternal.models import *
from django.db import models


class MedConsultAppointment(models.Model):
    id = models.BigAutoField(primary_key=True)
    chief_complaint = models.CharField(max_length=255)
    scheduled_date = models.DateField()
    meridiem = models.CharField(max_length=2, choices=[('AM', 'AM'), ('PM', 'PM')])
    status = models.CharField(max_length=50, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    
    archive_reason = models.TextField(null=True, blank=True)
    
    # CHANGED: Use CharField to match the VARCHAR type in database
    rp = models.ForeignKey(
        'healthProfiling.ResidentProfile',
        on_delete=models.CASCADE,
        db_column='rp_id',
        to_field='rp_id'  # Specify which field to use as the foreign key
    )
    
    class Meta:
        db_table = "medconsult_appointment"
        
class PhilHealthLaboratory(models.Model):
    lab_id = models.BigAutoField(primary_key=True)
    
    # Laboratory test flags
    is_cbc = models.BooleanField(default=False, verbose_name="Complete Blood Count")
    is_urinalysis = models.BooleanField(default=False, verbose_name="Urinalysis")
    is_fecalysis = models.BooleanField(default=False, verbose_name="Fecalysis")
    is_sputum_microscopy = models.BooleanField(default=False, verbose_name="Sputum Microscopy")
    is_creatine = models.BooleanField(default=False, verbose_name="Creatinine")
    is_hba1c = models.BooleanField(default=False, verbose_name="HbA1c")
    is_chestxray = models.BooleanField(default=False, verbose_name="Chest X-ray")
    is_papsmear = models.BooleanField(default=False, verbose_name="Pap Smear")
    is_fbs = models.BooleanField(default=False, verbose_name="Fasting Blood Sugar")
    is_oralglucose = models.BooleanField(default=False, verbose_name="Oral Glucose Tolerance Test")
    is_lipidprofile = models.BooleanField(default=False, verbose_name="Lipid Profile")
    is_fecal_occult_blood = models.BooleanField(default=False, verbose_name="Fecal Occult Blood")
    is_ecg = models.BooleanField(default=False)
    # Other fields
    others = models.TextField(null=True, blank=True, verbose_name="Other Laboratory Tests")
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.others:
            self.others = self.others.title()
        super().save(*args, **kwargs)
    class Meta:
        db_table = 'philhealth_laboratory'
        verbose_name = "Philhealth Laboratory"
        verbose_name_plural = "Philhealth Laboratories"
        ordering = ['-created_at']

class PhilhealthDetails(models.Model):
    phil_id = models.BigAutoField(primary_key=True)
    
    # ✅ ADDED: ForeignKey to MedicalConsultation_Record
    medrec = models.OneToOneField(
        'MedicalConsultation_Record',
        on_delete=models.CASCADE,
        related_name='philhealth_details'  # ✅ UNIQUE related_name
    )
    
    # PhilHealth fields
    iswith_atc = models.BooleanField(default=False)
    dependent_or_member = models.CharField(max_length=50, null=True, blank=True)
    ogtt_result = models.CharField(max_length=100, null=True, blank=True)
    contraceptive_used = models.CharField(max_length=100, null=True, blank=True)
    smk_sticks_per_day = models.IntegerField(null=True, blank=True)
    smk_years = models.IntegerField(null=True, blank=True)
    is_passive_smoker = models.BooleanField(default=False)
    alcohol_bottles_per_day = models.IntegerField(null=True, blank=True)
    civil_status = models.CharField(max_length=100, null=True, blank=True)
   
    tts = models.ForeignKey(TT_Status, on_delete=models.SET_NULL, related_name='philhealth_details', null=True, blank=True)
    obs = models.ForeignKey(Obstetrical_History, on_delete=models.SET_NULL, related_name='philhealth_details', null=True, blank=True)
    lab = models.ForeignKey(PhilHealthLaboratory, on_delete=models.SET_NULL, related_name='philhealth_details', null=True, blank=True)

    class Meta:
        db_table = 'philhealth_details'
        
    def save(self, *args, **kwargs):
        # Only capitalize non-empty string fields that aren't numeric
        char_fields = [f.name for f in self._meta.get_fields() if isinstance(f, models.CharField)]
        
        for field_name in char_fields:
            value = getattr(self, field_name)
            if value and isinstance(value, str) and value.strip():
                # Don't capitalize if it's a numeric string
                if not value.replace('.', '').isdigit():
                    setattr(self, field_name, value.upper())
        
        print(f"DEBUG: Saving PhilhealthDetails with medrec_id: {self.medrec_id}")
        print(f"DEBUG: Fields - civil_status: {self.civil_status}, dependent_or_member: {self.dependent_or_member}")
        
        try:
            super().save(*args, **kwargs)
            print(f"DEBUG: PhilhealthDetails saved successfully with ID: {self.phil_id}")
        except Exception as e:
            print(f"DEBUG: Error saving PhilhealthDetails: {str(e)}")
            raise e

class MedicalConsultation_Record(models.Model):
    medrec_id = models.BigAutoField(primary_key=True)
    medrec_status = models.CharField(max_length=100, default="pending")
    medrec_chief_complaint = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Core foreign keys
    patrec = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='medical_consultation_record')
    vital = models.ForeignKey(VitalSigns, on_delete=models.CASCADE, related_name='medical_consultation_record')
    bm = models.ForeignKey(BodyMeasurement, on_delete=models.CASCADE, related_name='medical_consultation_record')
    find = models.ForeignKey(Finding, on_delete=models.CASCADE, related_name='medical_consultation_record', null=True)
    medreq = models.ForeignKey(MedicineRequest, on_delete=models.CASCADE, related_name='medical_consultation_record', null=True, blank=True)
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='medical_consultation_record', null=True, blank=True)
    assigned_to = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='medical_consultation_record_assigned', null=True, blank=True)
   
    # PhilHealth flag only
    is_phrecord = models.BooleanField(default=False)
    app_id =models.ForeignKey(MedConsultAppointment, on_delete=models.SET_NULL, null=True, blank=True, db_column='app_id')


    class Meta:
        db_table = 'medical_consultation_record'
        
    def __str__(self):
        return f"Medical Consultation {self.medrec_id}"

class DateSlots(models.Model):
    id = models.BigAutoField(primary_key=True)
    date = models.DateField(unique=True)
    am_max_slots = models.IntegerField(default=20)
    pm_max_slots = models.IntegerField(default=20)
    am_current_bookings = models.IntegerField(default=0)
    pm_current_bookings = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    ss_id = models.ForeignKey(
        'servicescheduler.ServiceScheduler',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='ss_id'
    )
    
    class Meta:
        db_table = "date_slots"

    @property
    def am_available_slots(self):
        return max(0, self.am_max_slots - self.am_current_bookings)
    
    @property
    def pm_available_slots(self):
        return max(0, self.pm_max_slots - self.pm_current_bookings)
