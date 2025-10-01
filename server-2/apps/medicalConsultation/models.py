from django.db import models
from apps.patientrecords.models import PatientRecord,VitalSigns,BodyMeasurement,Finding
from apps.medicineservices.models import MedicineRequest
from apps.patientrecords.models import FollowUpVisit
from apps.administration.models import Staff
from django.core.validators import MinValueValidator
from django.utils import timezone
from apps.servicescheduler.models import *
from apps.healthProfiling.models import *

class MedicalConsultation_Record(models.Model):
    medrec_id = models.BigAutoField(primary_key=True)
    medrec_status = models.CharField(max_length=100, default="pending")
    medrec_chief_complaint = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    patrec = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='medical_consultation_record')
    vital = models.ForeignKey(VitalSigns, on_delete=models.CASCADE, related_name='medical_consultation_record')
    bm = models.ForeignKey(BodyMeasurement, on_delete=models.CASCADE, related_name='medical_consultation_record')
    find = models.ForeignKey(Finding, on_delete=models.CASCADE, related_name='medical_consultation_record', null=True)
    medreq = models.ForeignKey(MedicineRequest, on_delete=models.CASCADE, related_name='medical_consultation_record', null=True)
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='medical_consultation_record', null=True)
    assigned_to = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='medical_consultation_record_assigned', null=True, blank=True)
    
    # Optional fields
    is_phrecord = models.BooleanField(default=False)
    iswith_atc = models.BooleanField(default=False)
    marital_status = models.CharField(max_length=50, null=True, blank=True)
    dependent_or_member = models.CharField(max_length=50, null=True, blank=True)
    lmp = models.DateField(null=True, blank=True)
    obgscore_g = models.CharField(max_length=100, null=True, blank=True)
    obgscore_p = models.CharField(max_length=100, null=True, blank=True)
    tpal = models.CharField(max_length=100, null=True, blank=True)
    tt_status = models.CharField(max_length=100, null=True, blank=True)
    ogtt_result = models.CharField(max_length=100, null=True, blank=True)
    contraceptive_used = models.CharField(max_length=100, null=True, blank=True)
    smk_sticks_per_day = models.CharField(max_length=100, null=True, blank=True)
    smk_years = models.CharField(max_length=100, null=True, blank=True)
    is_passive_smoker = models.BooleanField(default=False)
    alcohol_bottles_per_day = models.CharField(max_length=100, null=True, blank=True)
    phil_pin = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'medical_consultation_record'


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
        to_field='rp_id' 
    )
    
    class Meta:
        db_table = "medconsult_appointment"