
from django.db import models
from apps.healthProfiling.models import *
from apps.patientrecords.models import *
from apps.administration.models import *

class FP_Record(models.Model):
    fprecord_id = models.BigAutoField(primary_key=True)
    client_id = models.CharField(max_length=50, null=True, blank=True)
    nhts = models.BooleanField(default=False)
    four_ps = models.BooleanField(default=False)
    plan_more_children = models.BooleanField(default=False)
    avg_monthly_income = models.CharField(max_length=15)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    patrec_id = models.ForeignKey(PatientRecord, on_delete=models.CASCADE)
    spouse_id = models.ForeignKey(Spouse,on_delete=models.CASCADE)
    class Meta:
        db_table = "famplan_record"

        
class FP_type(models.Model):
    fpt_id = models.AutoField(primary_key=True)
    fpt_client_type = models.CharField(max_length=20)
    fpt_subtype = models.CharField(max_length=20, null=True, blank=True)
    fpt_reason_fp = models.CharField(max_length=20, null=True, blank=True)
    fpt_reason = models.CharField(max_length=20, null=True, blank=True)
    fpt_method_used = models.CharField(max_length=30)
    
    fprecord_id = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    class Meta:
        db_table = "famplan_type"

class FP_RiskSti(models.Model):
    sti_id = models.AutoField(primary_key=True)
    abnormalDischarge = models.BooleanField(default=False)
    dischargeFrom = models.CharField(max_length=10, null=True, blank=True)
    sores = models.BooleanField(default=False)
    pain = models.BooleanField(default=False)
    history = models.BooleanField(default=False)
    hiv = models.BooleanField(default=False)

    fprecord_id = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    class Meta: 
        db_table = "famplan_risk_sti"

class FP_RiskVaw(models.Model):
    vaw_id = models.AutoField(primary_key=True)
    unpleasant_relationship = models.BooleanField(default=False)
    partner_disapproval = models.BooleanField(default=False)
    domestic_violence = models.BooleanField(default=False)
    referredTo = models.CharField(max_length=30)
    
    fprecord_id = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'famplan_risk_vaw'

class FP_Physical_Exam(models.Model):
    fp_pe_id = models.AutoField(primary_key=True)

    SKIN_EXAM_CHOICES = [("normal", "Normal"),("pale", "Pale"),("yellowish", "Yellowish"),("hematoma", "Hematoma")]
    CONJUNCTIVA_EXAM_CHOICES = [("normal", "Normal"),("pale", "Pale"),("yellowish", "Yellowish")]
    NECK_EXAM_CHOICES = [("normal", "Normal"),("neck_mass", "Neck Mass"),("enlarged_lymph_nodes", "Enlarged Lymph Nodes")]
    BREAST_EXAM_CHOICES = [("normal", "Normal"),("mass", "Mass"),("nipple_discharge", "Nipple Discharge")]
    ABDOMEN_EXAM_CHOICES = [("normal", "Normal"),("abdominal_mass", "Abdominal Mass"),("varicosities", "Varicosities")]
    EXTREMITIES_EXAM_CHOICES = [("normal", "Normal"),("edema", "Edema"),("varicosities", "Varicosities")]
    weight = models.CharField(max_length=3, default="0")
    height = models.CharField(max_length=3, default="0")
    bloodpressure = models.CharField(max_length=3, default="0")
    pulserate = models.CharField(max_length=3, default="0")
    skinExamination = models.CharField(max_length=20, choices=SKIN_EXAM_CHOICES)
    conjunctivaExamination = models.CharField(max_length=20, choices=CONJUNCTIVA_EXAM_CHOICES)
    neckExamination = models.CharField(max_length=30, choices=NECK_EXAM_CHOICES)
    breastExamination = models.CharField(max_length=30, choices=BREAST_EXAM_CHOICES)
    abdomenExamination = models.CharField(max_length=30, choices=ABDOMEN_EXAM_CHOICES)
    extremitiesExamination = models.CharField(max_length=30, choices=EXTREMITIES_EXAM_CHOICES)

    fprecord_id = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'famplan_physical_exam'
        
class FP_Pelvic_Exam(models.Model):
    pelvic_id = models.AutoField(primary_key=True)
    PELVIC_EXAM_CHOICES = [("normal", "Normal"),("mass", "Mass"),("abnormal_discharge", "Abnormal Discharge"),("cervical_abnormalities", "Cervical Abnormalities"),("warts", "Warts"),("polyp_or_cyst", "Polyp or Cyst"),("inflammation_or_erosion", "Inflammation or Erosion"),("bloody_discharge", "Bloody Discharge")]
    
    pelvicExamination = models.CharField(max_length=30, choices=PELVIC_EXAM_CHOICES)
    
    CERVICAL_CONSISTENCY_CHOICES = [("firm", "Firm"),("soft", "Soft")]
    cervicalConsistency = models.CharField(max_length=20, choices=CERVICAL_CONSISTENCY_CHOICES)
    cervicalTenderness = models.BooleanField(default=False)
    cervicalAdnexal = models.BooleanField(default=False)

    UTERINE_POSITION_CHOICES = [("mid", "Mid"),("anteflexed", "Anteflexed"),("retroflexed", "Retroflexed")]
    uterinePosition = models.CharField(max_length=20, choices=UTERINE_POSITION_CHOICES)
    uterineDepth = models.CharField(max_length=10, null=True, blank=True)

    fprecord_id = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    class Meta:
        db_table = "famplan_pelvic_exam"
        
class FP_Acknowledgement(models.Model):
    ack_id = models.AutoField(primary_key=True)
    ack_clientSignature = models.TextField(null=True, blank=True)
    ack_clientSignatureDate = models.DateField()
    client_name = models.CharField(max_length=50)
    guardian_signature = models.TextField(null=True, blank=True)
    guardian_signature_date = models.DateField(null=True, blank=True)
   
    fprecord_id = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    class Meta:
        db_table = "famplan_acknowledgement"

class FP_Obstetrical_History(models.Model):
    fpob_id = models.AutoField(primary_key=True)
    fpob_last_delivery = models.DateField(null=True, blank=True)
    fpob_type_last_delivery = models.CharField(max_length=30, null=True, blank=True)
    fpob_last_period = models.DateField(null=True, blank=True)
    fpob_previous_period = models.DateField(null=True, blank=True)
    fpob_mens_flow = models.CharField(max_length=20)
    fpob_dysme = models.BooleanField(default=False)
    fpob_hydatidiform = models.BooleanField(default=False)
    fpob_ectopic_pregnancy = models.BooleanField(default=False)
    
    fprecord_id = models.ForeignKey(FP_Record, on_delete=models.CASCADE)

    class Meta:
        db_table = "famplan_obs_history"
    
class FP_pregnancy_check(models.Model):
    fp_pc_id = models.AutoField(primary_key=True)
    breastfeeding = models.BooleanField(default=False)
    abstained = models.BooleanField(default=False)
    recent_baby = models.BooleanField(default=False)
    recent_period = models.BooleanField(default=False)
    recent_abortion = models.BooleanField(default=False)
    using_contraceptive = models.BooleanField(default=False)
    
    fprecord_id = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'famplan_pregnancy_check'

# Medical History Model
class FP_Medical_History(models.Model):
    fp_medhistory_id = models.AutoField(primary_key=True)
    severeHeadaches = models.BooleanField(default=False)
    strokeHeartAttackHypertension = models.BooleanField(default=False)
    hematomaBruisingBleeding = models.BooleanField(default=False)
    breastCancerHistory = models.BooleanField(default=False)
    severeChestPain = models.BooleanField(default=False)
    coughMoreThan14Days = models.BooleanField(default=False)
    jaundice = models.BooleanField(default=False)
    unexplainedVaginalBleeding = models.BooleanField(default=False)
    abnormalVaginalDischarge = models.BooleanField(default=False)
    phenobarbitalOrRifampicin = models.BooleanField(default=False)
    smoker = models.BooleanField(default=False)
    disability = models.BooleanField(default=False)
    disabilityDetails = models.TextField(null=True, blank=True)
    
    fprecord_id = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    class Meta:
        db_table = "famplan_medical_history"

class FP_Assessment_Record(models.Model):
    assessment_id = models.AutoField(primary_key=True)
    quantity = models.IntegerField(default=0)
    as_provider_signature = models.CharField()
    as_provider_name= models.CharField(max_length=35)
    as_findings = models.CharField(max_length=100,default="None")
    
    # for method used
    fpt_id = models.ForeignKey(FP_type,on_delete=models.CASCADE) 
    fp_pe_id = models.ForeignKey(FP_Physical_Exam,on_delete=models.CASCADE)
    staff_id = models.ForeignKey(Staff,on_delete=models.CASCADE)
    
    class Meta:
        db_table = "famplan_assessment"