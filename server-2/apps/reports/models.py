from django.db import models
from apps.administration.models import Staff  # Adjust the import based on your project structure

class HeaderRecipientListReporTemplate(models.Model):
    rcpheader_id = models.AutoField(primary_key=True)
    logo = models.URLField(null=True)
    contact_number = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    department = models.CharField(max_length=255)
    type = models.CharField(max_length=100,null=True, blank=True)  # e.g., 'Monthly', 'Weekly', etc.)

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

    def __str__(self):
        return f"Recipient Report {self.rcplist_id} - {self.staff}"

    class Meta:
        db_table = 'monthly_recipient_list_report'

# class HeaderRecipientListReporFile(models.Model):
#   rcpf_id = models.BigAutoField(primary_key=True)
#   rcpf_name = models.CharField(max_length=500)
#   rcpf_type = models.CharField(max_length=50)
#   rcpf_path = models.CharField(max_length=500)
#   rcpf_url = models.URLField()

#   class Meta:
#     db_table = 'ar_file'
    
