from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.administration.models import Staff  # Adjust the import based on your project structure
from apps.patientrecords.models import BodyMeasurement, Illness

class HeaderRecipientListReporTemplate(models.Model):
    rcpheader_id = models.AutoField(primary_key=True)
    province = models.CharField(max_length=255, default='Cebu')
    doh_logo = models.URLField(
        null=True,
        default="https://miornhcxxzxecwnkgupq.supabase.co/storage/v1/object/public/manage-images/reports/cebucity_logo.png"
    )
    health_facility = models.CharField(max_length=255, default='Cebu City Health Department')
    city =  models.CharField(max_length=255, default='Cebu City')

    def __str__(self):
        return f"{self.department} - {self.location}"
    
    class Meta:
        db_table = 'header_recipient_list_report_template'


class MonthlyRecipientListReport(models.Model):
    monthlyrcplist_id = models.AutoField(primary_key=True)
    month_year = models.CharField(max_length=7)  # Format: YYYY-MM
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE,null=True)  # Replace if you have a custom Staff model
    signature = models.TextField(null=True, blank=True)  # Base64 string
    office = models.CharField(max_length=255, null=True, blank=True)
    control_no = models.CharField(max_length=100, null=True, blank=True)
    total_records = models.IntegerField(default=0)
    rcp_type = models.CharField(
        max_length=20,
        choices=[
            
            ('FirstAid', 'FirstAid'),
            ('Medicine', 'Medicine'),
        ]
    )
    logo = models.URLField(null=True,  default="https://miornhcxxzxecwnkgupq.supabase.co/storage/v1/object/public/manage-images/reports/cebucity_logo.png")
    contact_number = models.CharField(max_length=100,default='(032) 232-6820; 232-6863')
    location = models.CharField(max_length=255,default='General Maxilom Extension, Carreta, Cebu City')
    department = models.CharField(max_length=255,default='Cebu City Health Department')

    unique_together = ('month_year', 'rcp_type')  # Prevent duplicates per month+type

    def __str__(self):
        return f"Recipient Report {self.rcplist_id} - {self.staff}"

    class Meta:
        db_table = 'monthly_recipient_list_report'


class BHWDailyNotes(models.Model):
    bhwdn_id = models.BigAutoField(primary_key=True)
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, db_column='staff_id', related_name='daily_notes')
    bm = models.ForeignKey(BodyMeasurement, on_delete=models.CASCADE, db_column='bm_id')
    description = models.TextField(null=True, blank=True)
    disease_surv_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bhw_daily_notes'
        indexes = [
            models.Index(fields=['bhwdn_id', 'staff', 'created_at']),
        ]


class BHWReferOrFollowUp(models.Model):
    bhwrof_id = models.BigAutoField(primary_key=True)
    bhwdn = models.ForeignKey(BHWDailyNotes, on_delete=models.CASCADE)
    referred_follow_up_count = models.IntegerField(default=0)
    ill = models.ForeignKey(Illness, on_delete=models.CASCADE)

    class Meta:
        db_table = 'bhw_refer_or_follow_up'
        indexes = [
            models.Index(fields=['bhwrof_id', 'bhwdn_id', 'ill_id']),
        ]


class BHWAttendanceRecord(models.Model):
    bhwa_id = models.BigAutoField(primary_key=True)
    num_working_days = models.IntegerField(default=0)
    days_present = models.IntegerField(default=0)
    days_absent = models.IntegerField(default=0)
    noted_by = models.ForeignKey(Staff, on_delete=models.CASCADE, db_column='noted_by', related_name='attendance_noted')
    approved_by = models.ForeignKey(Staff, on_delete=models.CASCADE, db_column='approved_by', related_name='attendance_approved')
    bhwdn = models.ForeignKey(BHWDailyNotes, on_delete=models.CASCADE, db_column='bhwdn_id')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bhw_attendance_record'