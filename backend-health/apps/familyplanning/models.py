from django.db import models
from models import *

<<<<<<< HEAD
class ObstetricalHistory(models.Model):
    obs_id = models.AutoField(primary_key=True)
    obs_living_children = models.PositiveIntegerField(default=0)
    obs_abortion = models.PositiveIntegerField(default=0)
    obs_fetal_death = models.PositiveIntegerField(default=0)
    obs_large_babies = models.PositiveIntegerField(default=0)
    obs_gravida = models.PositiveIntegerField(default=0)
    obs_para = models.PositiveIntegerField(default=0)
    obs_fullterm = models.PositiveIntegerField(default=0)
    obs_category = models.CharField(max_length=20)
    
class FP_ObstetricalHistory(models.Model):
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
    obs = models.ForeignKey(ObstetricalHistory,on_delete=models.CASCADE)
    
    
    
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

class RiskVaw(models.Model):
    unpleasantRelationship = models.BooleanField(default=False)
    partnerDisapproval = models.BooleanField(default=False)
    domesticViolence = models.BooleanField(default=False)
    referredTo = models.CharField(max_length=10)
    otherReferral = models.CharField(max_length=30)
    
    class Meta:
        db_table = 'risk_vaw'

class PhysicalExamination(models.Model):
    # Physical Examination Fields
    weight = models.FloatField()
    height = models.FloatField()
    bloodPressure = models.CharField(max_length=20)
    pulseRate = models.IntegerField()

    # Examination Fields
    SKIN_EXAM_CHOICES = [
        ("normal", "Normal"),
        ("pale", "Pale"),
        ("yellowish", "Yellowish"),
        ("hematoma", "Hematoma"),
        
    ]
    skinExamination = models.CharField(max_length=20, choices=SKIN_EXAM_CHOICES)

    CONJUNCTIVA_EXAM_CHOICES = [
        ("normal", "Normal"),
        ("pale", "Pale"),
        ("yellowish", "Yellowish"),
   
    ]
    conjunctivaExamination = models.CharField(max_length=20, choices=CONJUNCTIVA_EXAM_CHOICES)

    NECK_EXAM_CHOICES = [
        ("normal", "Normal"),
        ("neck_mass", "Neck Mass"),
        ("enlarged_lymph_nodes", "Enlarged Lymph Nodes"),
      
    ]
    neckExamination = models.CharField(max_length=30, choices=NECK_EXAM_CHOICES)

    BREAST_EXAM_CHOICES = [
        ("normal", "Normal"),
        ("mass", "Mass"),
        ("nipple_discharge", "Nipple Discharge"),
       
    ]
    breastExamination = models.CharField(max_length=30, choices=BREAST_EXAM_CHOICES)

    ABDOMEN_EXAM_CHOICES = [
        ("normal", "Normal"),
        ("abdominal_mass", "Abdominal Mass"),
        ("varicosities", "Varicosities"),
   
    ]
    abdomenExamination = models.CharField(max_length=30, choices=ABDOMEN_EXAM_CHOICES)

    EXTREMITIES_EXAM_CHOICES = [
        ("normal", "Normal"),
        ("edema", "Edema"),
        ("varicosities", "Varicosities"),
      
    ]
    extremitiesExamination = models.CharField(max_length=30, choices=EXTREMITIES_EXAM_CHOICES)

    # Pelvic Examination (for IUD Acceptors)
    PELVIC_EXAM_CHOICES = [
        ("normal", "Normal"),
        ("mass", "Mass"),
        ("abnormal_discharge", "Abnormal Discharge"),
        ("cervical_abnormalities", "Cervical Abnormalities"),
        ("warts", "Warts"),
        ("polyp_or_cyst", "Polyp or Cyst"),
        ("inflammation_or_erosion", "Inflammation or Erosion"),
        ("bloody_discharge", "Bloody Discharge"),

    ]
    pelvicExamination = models.CharField(max_length=30, choices=PELVIC_EXAM_CHOICES)

    # Cervical Examination
    CERVICAL_CONSISTENCY_CHOICES = [
        ("firm", "Firm"),
        ("soft", "Soft"),
   
    ]
    cervicalConsistency = models.CharField(max_length=20, choices=CERVICAL_CONSISTENCY_CHOICES)
    cervicalTenderness = models.BooleanField(default=False)
    cervicalAdnexalMassTenderness = models.BooleanField(default=False)

    # Uterine Examination
    UTERINE_POSITION_CHOICES = [
        ("mid", "Mid"),
        ("anteflexed", "Anteflexed"),
        ("retroflexed", "Retroflexed"),

    ]
    uterinePosition = models.CharField(max_length=20, choices=UTERINE_POSITION_CHOICES)
    uterineDepth = models.CharField(max_length=10, null=True, blank=True)

    class Meta:
        db_table = "physical_examination"
        
        
class Acknowledgement(models.Model):
    ack_id = models.BigAutoField(primary_key=True)
    ack_clientSignature = models.TextField()
    ack_selectedMethod = models.CharField(max_length=50)
    ack_clientSignatureDate = models.DateField()

    clientName = models.CharField(max_length=50)
    guardianSignature = models.TextField()
    guardianSignatureDate = models.DateField()
    
    class Meta:
        db_table = "acknowledgement"
=======
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
>>>>>>> eac5b29bec182701333af109425eb1c2c4d6e7d9
