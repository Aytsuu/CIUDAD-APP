from django.db import models
from models import *

class Acknowledgement(models.Model):
    ack_id = models.AutoField(primary_key=True)
    selectedMethod = models.CharField(max_length=100)
    clientSignature = models.TextField()  # Base64 encoded image
    clientSignatureDate = models.DateField()

    guardianName = models.CharField(max_length=100)
    guardianSignature = models.TextField()
    guardianSignatureDate = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "acknowledgement"

class Risk_sti(models.Model):
    risk_sti_id = models.AutoField(primary_key=True)
    abnormal_discharge = models.BooleanField()
    discharge_source = models.CharField(max_length=10)
    sores = models.BooleanField()
    pain = models.BooleanField()
    history = models.BooleanField()
    hiv = models.BooleanField()
    
    class Meta: 
        db_table = "risk_Sti"


        
class Risk_vaw(models.Model):
    risk_vaw_id = models.AutoField(primary_key=True)
    unpleasantRelationship = models.BooleanField(default=False)
    partnerDisapproval = models.BooleanField(default=False)
    domesticViolence = models.BooleanField(default=False)
    referredTo = models.TextField()
    otherReferral = models.TextField()
    
    class Meta:
        db_table = "risk_vaw"
        
class FP_Type(models.Model):
    fpt_id = models.AutoField(primary_key=True)
    fpt_client_type = models.CharField(max_length=20)
    fpt_subtype = models.CharField(max_length=20, nullable = True, blank=True)
    fpt_reason_fp = models.CharField(max_length=20)
    fpt_reason = models.CharField(max_length=20)
    fpt_method_used = models.CharField(max_length=20)
    
    class Meta: 
        db_table = "fp_type"
        
class PhysicalExam(models.Model):
    pe_id = models.AutoField(primary_key=True)
    pe_weight = models.CharField(max_length=3)
    pe_height = models.CharField(max_length=3)
    pe_bp = models.CharField(max_length=3)
    pe_pulserate = models.CharField(max_length=3)
    pe_skinExamination = models.BooleanField()
    pe_conjunctivaExamination = models.BooleanField()
    pe_neckExamination = models.BooleanField()
    pe_breastExamination = models.BooleanField() 
    pe_abdomenExamination = models.BooleanField()
    pe_extrimities = models.BooleanField()
    
    class Meta:
        db_table = "PhysicalExam"
        
class Pelvic_exam(models.Model):
    pelvic_id = models.AutoField(primary_key=True) 
    cervical_consistency = models.CharField(max_length=4)
    cervical_tenderness = models.BooleanField()
    cervical_adnexal = models.BooleanField()
    uterine_position = models.CharField(max_length=10)
    uterine_depth = models.CharField(max_length=5)
    
    
class Obstetrical_History(models.Model):
    obs_id = models.AutoField
    obs_livingchild 
    obs_abortion
    obs_gravida
    obs_para
    obs_fullterm