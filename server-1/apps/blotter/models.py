from django.db import models

# Create your models here.
class Blotter(models.Model):
    bc_id = models.AutoField(primary_key=True)
    bc_complainant = models.CharField(max_length=100, null=False, blank=False)
    bc_cmplnt_address = models.CharField(max_length=100, null=True, blank=True)
    bc_accused = models.CharField(max_length=100, null=False, blank=False)
    bc_accused_address = models.CharField(max_length=100, null=True, blank=True)
    bc_incident_type = models.CharField(max_length=100, null=False, blank=False)
    bc_allegation = models.TextField(null=False, blank=False)
    bc_datetime = models.DateTimeField(null=False, blank=False)
    bc_evidence = models.FileField(max_length=255, blank=True, null=True)
    
    class Meta:
        db_table = "blotter"
