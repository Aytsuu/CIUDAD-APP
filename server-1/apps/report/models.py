from django.db import models

class ReportType(models.Model):
    rt_id = models.BigAutoField(primary_key=True)
    rt_label = models.CharField(max_length=500)
    rt_category = models.CharField(max_length=50)

    class Meta:
      db_table = 'report_type'

class IncidentReport(models.Model):
  ir_id = models.BigAutoField(primary_key=True)
  ir_add_details = models.TextField()
  ir_time = models.TimeField()
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
  ar_created_at = models.DateField(auto_now_add=True)
  ar_status = models.CharField(max_length=20)
  ar_is_archive = models.BooleanField(default=False)
  rt = models.ForeignKey(ReportType, on_delete=models.CASCADE)
  add = models.ForeignKey('profiling.Address', on_delete=models.CASCADE)
  staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE)

  class Meta:
    db_table = 'acknowledgement_report'

class WeeklyAcknowledgementReport(models.Model):
  wr_id = models.BigAutoField(primary_key=True)
  wr_created_at = models.DateField()
  wr_is_archive = models.BooleanField()
  staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE)

  class Meta:
    db_table = 'weekly_acknowledgement_report'

class WeeklyARComposition(models.Model):
  wc = models.BigAutoField(primary_key=True)
  ar = models.ForeignKey(AcknowledgementReport, on_delete=models.CASCADE)
  wr = models.ForeignKey(WeeklyAcknowledgementReport, on_delete=models.CASCADE)

  class Meta:
    db_table = 'weekly_ar_composition'

class IncidentReportFile(models.Model):
  irf_id = models.BigAutoField(primary_key=True)
  ir = models.ForeignKey(IncidentReport, on_delete=models.CASCADE)
  file = models.ForeignKey('file.File', on_delete=models.CASCADE)

  class Meta:
    db_table = 'incident_report_file'