from django.db import models
from apps.administration.models import Staff  # Adjust the import based on your project structure
from apps.patientrecords.models import Illness

# class HeaderRecipientListReporTemplate(models.Model):
#     rcpheader_id = models.AutoField(primary_key=True)
#     logo = models.URLField(null=True)
#     contact_number = models.CharField(max_length=100)
#     location = models.CharField(max_length=255)
#     department = models.CharField(max_length=255)
#     type = models.CharField(max_length=100,null=True, blank=True)  # e.g., 'Monthly', 'Weekly', etc.)

#     def __str__(self):
#         return f"{self.department} - {self.location}"
    
#     class Meta:
#         db_table = 'header_recipient_list_report_template'


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
    logo = models.URLField(null=True)
    contact_number = models.CharField(max_length=100,default='09705678765')
    location = models.CharField(max_length=255,default='San Roque, Cebu City')
    department = models.CharField(max_length=255,default='Cebu City Health Department')

    unique_together = ('month_year', 'rcp_type')  # Prevent duplicates per month+type

    def __str__(self):
        return f"Recipient Report {self.rcplist_id} - {self.staff}"

    class Meta:
        db_table = 'monthly_recipient_list_report'


class BHWDailyNotes(models.Model):
    bhwdn_id = models.BigAutoField(primary_key=True)
    staff_id = models.ForeignKey(Staff, on_delete=models.CASCADE)
    description = models.TextField(null=True, blank=True)
    disease_surv_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bhw_daily_notes'
        indexes = [
            models.Index(fields=['bhwdn_id', 'staff_id', 'created_at']),
        ]


class BHWReferOrFollowUp(models.Model):
    bhwrof_id = models.BigAutoField(primary_key=True)
    bhwdn_id = models.ForeignKey(BHWDailyNotes, on_delete=models.CASCADE)
    referred_follow_up_count = models.IntegerField(default=0)
    ill_id = models.ForeignKey(Illness, on_delete=models.CASCADE)

    class Meta:
        db_table = 'bhw_refer_or_follow_up'
        indexes = [
            models.Index(fields=['bhwrof_id', 'bhwdn_id', 'ill_id']),
        ]
