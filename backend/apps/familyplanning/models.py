from django.db import models


class ObstetricalHistory(models.Model):
    g_pregnancies = models.PositiveIntegerField(default=0)
    p_pregnancies = models.PositiveIntegerField(default=0)
    full_term = models.PositiveIntegerField()
    premature = models.PositiveIntegerField()
    abortion = models.PositiveIntegerField()
    living_children = models.PositiveIntegerField()
    last_delivery_date = models.DateField(blank=True, null=True)
    type_of_last_delivery = models.CharField(max_length=10, choices=[("Vaginal", "Vaginal"), ("Cesarean", "Cesarean")], blank=True, null=True)
    last_menstrual_period = models.DateField()
    previous_menstrual_period = models.DateField()
    menstrual_flow = models.CharField(max_length=10, choices=[("Scanty", "Scanty"), ("Moderate", "Moderate"), ("Heavy", "Heavy")])
    dysmenorrhea = models.BooleanField(default=False)
    hydatidiform_mole = models.BooleanField(default=False)
    ectopic_pregnancy_history = models.BooleanField(default=False)
    
    class Meta:
        db_table = "obstetrical_history"
        
class RiskSti(models.Model):
    abnormalDischarge = models.BooleanField(default=False)
    dischargeFrom = models.CharField(max_length=10)
    sores = models.BooleanField(default=False)
    pain = models.BooleanField(default=False)
    history = models.BooleanField(default=False)
    hiv = models.BooleanField(default=False)
    
    class Meta: 
        db_table = "risk_sti"