from django.db import models
from datetime import date

class ReportType(models.Model):
    rt_id = models.BigAutoField(primary_key=True)
    rt_label = models.CharField(max_length=500)
    rt_category = models.CharField(max_length=50)

    class Meta:
      db_table = 'report_type'

class IncidentReport(models.Model):
  ir_id = models.BigAutoField(primary_key=True)
  ir_add_details = models.TextField()
  ir_time = models.TimeField(auto_now_add=True)
  ir_date = models.DateField(auto_now_add=True)
  ir_is_archive = models.BooleanField(default=False)
  rt = models.ForeignKey(ReportType, on_delete=models.CASCADE)
  rp = models.ForeignKey('profiling.ResidentProfile', on_delete=models.CASCADE)
  add = models.ForeignKey('profiling.Address', on_delete=models.CASCADE)

  class Meta:
    db_table = 'incident_report'

class AcknowledgementReport(models.Model):
  ar_id = models.BigAutoField(primary_key=True)
  ar_title = models.CharField(max_length=500)
  ar_date_started = models.DateField()
  ar_time_started = models.TimeField()
  ar_date_completed = models.DateField()
  ar_time_completed = models.TimeField()
  ar_action_taken = models.TextField()
  ar_result = models.TextField()
  ar_created_at = models.DateField(default=date.today)
  ar_status = models.CharField(max_length=20, default='Unsigned')
  ar_is_archive = models.BooleanField(default=False)
  ir = models.ForeignKey(IncidentReport, on_delete=models.CASCADE, null=True)
  rt = models.ForeignKey(ReportType, on_delete=models.CASCADE, null=True)
  add = models.ForeignKey('profiling.Address', on_delete=models.CASCADE)
  staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE)

  class Meta:
    db_table = 'acknowledgement_report'

class ARFile(models.Model):
  arf_id = models.BigAutoField(primary_key=True)
  arf_name = models.CharField(max_length=500)
  arf_type = models.CharField(max_length=50)
  arf_path = models.CharField(max_length=500)
  arf_url = models.URLField()
  ar = models.ForeignKey(AcknowledgementReport, on_delete=models.CASCADE)

  class Meta:
    db_table = 'ar_file'

class WeeklyAccomplishmentReport(models.Model):
  war_id = models.BigAutoField(primary_key=True)
  war_created_at = models.DateField(default=date.today)
  war_created_for = models.DateField(default=date.today)
  war_status = models.CharField(max_length=50, default='Unsigned')
  war_is_archive = models.BooleanField(default=False)
  staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE)

  class Meta:
    db_table = 'weekly_accomplishment_report'

class WARFile(models.Model):
  warf_id = models.BigAutoField(primary_key=True)
  warf_name = models.CharField(max_length=500)
  warf_type = models.CharField(max_length=50)
  warf_path = models.CharField(max_length=500)
  warf_url = models.URLField()
  war = models.ForeignKey(WeeklyAccomplishmentReport, on_delete=models.CASCADE)

  class Meta:
    db_table = 'war_file'

class WeeklyARComposition(models.Model):
  warc_id = models.BigAutoField(primary_key=True)
  ar = models.ForeignKey(AcknowledgementReport, on_delete=models.CASCADE)
  war = models.ForeignKey(WeeklyAccomplishmentReport, on_delete=models.CASCADE)

  class Meta:
    db_table = 'weekly_ar_composition'

class IncidentReportFile(models.Model):
  irf_id = models.BigAutoField(primary_key=True)
  irf_name = models.CharField(max_length=500)
  irf_type = models.CharField(max_length=50)
  irf_path = models.CharField(max_length=100)
  irf_url = models.URLField()
  ir = models.ForeignKey(IncidentReport, on_delete=models.CASCADE)

  class Meta:
    db_table = 'incident_report_file'

class ReportTemplate(models.Model):
  rte_id = models.BigAutoField(primary_key=True)
  rte_logoLeft = models.URLField(null=True)
  rte_logoRight = models.URLField(null=True)
  rte_headerText = models.TextField(null=True)
  rte_type = models.CharField(max_length=50, null=True)
  rte_prepared_by = models.CharField(max_length=100, null=True)
  rte_recommended_by = models.CharField(max_length=100, null=True)
  rte_approved_by = models.CharField(max_length=100, null=True)
  
  class Meta:
    db_table = "report_template"
