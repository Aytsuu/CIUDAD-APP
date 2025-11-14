from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.administration.models import Staff  # Adjust the import based on your project structure

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

