from django.db import models

class AcknowledgementReport(models.Model):
  ar_id = models.BigAutoField(primary_key=True)
  ar_incident_activity = models.CharField(max_length=50)
  ar_location = models.TextField()
  ar_sitio = models.CharField(max_length=50)
  ar_date_started = models.DateField()
  ar_time_started = models.TimeField()
  ar_date_completed = models.DateField()
  ar_time_completed = models.TimeField()
  ar_action = models.TextField()

  class Meta:
    db_table = "acknowledgement_report"

class AcknowledgementReportFile(models.Model):
  arf_id = models.BigAutoField(primary_key=True)
  ar_id = models.ForeignKey(AcknowledgementReport, on_delete=models.CASCADE)
  file = models.ForeignKey("file.File", on_delete=models.CASCADE)
