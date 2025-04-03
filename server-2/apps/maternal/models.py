from django.db import models, transaction
from django.db.models import Max
from datetime import datetime
from django.utils import timezone
from django.core.validators import MinValueValidator

# Create your models here.
class PrenatalForm(models.Model):
    pf_id = models.BigAutoField(primary_key=True)
    pf_h_lname = models.CharField(max_length=100)
    pf_h_fname = models.CharField(max_length=100)
    pf_h_mname = models.CharField(max_length=100)
    pf_lmp = models.DateField()
    pf_edc = models.DateField()
    # health profiling fk

    class Meta:
        db_table = 'prenatal_form'
    

class Obstretical_History(models.Model):
    obs_id = models.BigAutoField(primary_key=True)
    obs_ch_born_alive = models.PositiveBigIntegerField()
    obs_living_ch = models.PositiveBigIntegerField()
    obs_abortion = models.PositiveBigIntegerField()
    obs_still_birth = models.PositiveBigIntegerField()
    obs_lg_babies = models.PositiveBigIntegerField()
    obs_gravida = models.PositiveBigIntegerField()
    obs_para = models.PositiveBigIntegerField()
    obs_fullterm = models.PositiveBigIntegerField()
    obs_preterm = models.PositiveBigIntegerField()
    obs_record_from = models.CharField(max_length=100)
    