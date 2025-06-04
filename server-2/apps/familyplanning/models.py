from django.db import models
from .models import *
from apps.healthProfiling.models import HealthRelatedDetails
from apps.patientrecords.models import PatientRecord

class FP_Record(models.Model):
    fprecord_id = models.BigAutoField(primary_key=True)
    client_id = models.CharField(null=True,blank=True)
    nhts = models.BooleanField(default=False)
    four_ps = models.BooleanField(default=False)
    plan_more_children = models.BooleanField(default=False)
    avg_monthly_income = models.CharField(max_length=15)
    transient = models.BooleanField(default=False)
    
    #For personal info
    patrec_id = models.ForeignKey(PatientRecord, on_delete=models.CASCADE)
    # For philhealth id
    hrd_id = models.ForeignKey(HealthRelatedDetails, on_delete=models.CASCADE, null=True, blank=True)
   
    # philhealth_id = models.CharField(max_length=14)
    # serv_id = models.ForeignKey(ServicesRecords,on_delete=models.CASCADE)
    # fprecord_id = models.AutoField(primary_key=True)
    # personal = models.ForeignKey(Personal, on_delete=models.CASCADE, null=True)

    
    class Meta:
        db_table = "fp_record"


class FP_type(models.Model):
    fpt_id = models.AutoField(primary_key=True)
    fpt_client_type = models.CharField(max_length=20)
    fpt_subtype = models.CharField(max_length=20,null=True, blank=True)
    fpt_reason_fp = models.CharField(max_length=20, null=True, blank=True)
    fpt_reason = models.CharField(max_length=20,null=True, blank=True)
    fpt_method_used = models.CharField(max_length=30)
    
    fprecord_id = models.ForeignKey(FP_Record,on_delete=models.CASCADE)
    
    class Meta:
        db_table = "fp_type"
        
class Illness(models.Model):
    ill_id = models.AutoField(primary_key=True),
    ill_name = models.CharField(max_length=50,unique=True)

    class Meta:
        db_table = "illness"
        
class FP_Medical_history(models.Model):
    medic_id = models.AutoField(primary_key=True)
    ilness = models.ForeignKey(Illness, on_delete=models.CASCADE)
    patient = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    class Meta:
        db_table = "fp_medical_history"
    
    
# class Spouse(models.Model):
#     sp_id = models.AutoField(primary_key=True)

# class PelvicExam(models.Model):
#     pel_id = models.AutoField(primary_key=True)
#     pel_exam = models.CharField(max_length=25)
#     cervical_consistency = models.CharField(max_length=5)
#     cervical_tenderness = models.CharField(max_length=20)
#     cervical_adnexal = models.CharField(max_length=20)
#     cervical_position = models.CharField(max_length=20)
#     uterine_depth = models.CharField(max_length=20)
#     # fpt_id = models.ForeignKey(FP_type,on_delete=True)

#     class Meta:
#         db_table = "pelvic_exam"
        
          
# class ObstetricalHistory(models.Model):
#     obs_id = models.AutoField(primary_key=True)
#     obs_living_children = models.PositiveIntegerField(default=0)
#     obs_abortion = models.PositiveIntegerField(default=0)
#     obs_fetal_death = models.PositiveIntegerField(default=0)
#     obs_large_babies = models.PositiveIntegerField(default=0)
#     obs_gravida = models.PositiveIntegerField(default=0)
#     obs_para = models.PositiveIntegerField(default=0)
#     obs_fullterm = models.PositiveIntegerField(default=0)
#     obs_category = models.CharField(max_length=20)
     
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
        db_table = "fp_risk_sti"

class FP_RiskVaw(models.Model):
    vaw_id = models.AutoField(primary_key=True)
    unpleasant_relationship = models.BooleanField(default=False)
    partner_disapproval = models.BooleanField(default=False)
    domestic_violence = models.BooleanField(default=False)
    referredTo = models.CharField(max_length=30)
    
    fprecord_id = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'fp_risk_vaw'

class FP_Physical_Exam(models.Model):
    fp_pe_id = models.AutoField(primary_key=True)

    # Examination Fields
    SKIN_EXAM_CHOICES = [("normal", "Normal"),("pale", "Pale"),("yellowish", "Yellowish"),("hematoma", "Hematoma"),]
    CONJUNCTIVA_EXAM_CHOICES = [("normal", "Normal"),("pale", "Pale"),("yellowish", "Yellowish")]
    NECK_EXAM_CHOICES = [("normal", "Normal"),("neck_mass", "Neck Mass"),("enlarged_lymph_nodes", "Enlarged Lymph Nodes"),]
    BREAST_EXAM_CHOICES = [("normal", "Normal"),("mass", "Mass"),("nipple_discharge", "Nipple Discharge")]
    ABDOMEN_EXAM_CHOICES = [("normal", "Normal"),("abdominal_mass", "Abdominal Mass"),("varicosities", "Varicosities"),]
    EXTREMITIES_EXAM_CHOICES = [("normal", "Normal"),("edema", "Edema"),("varicosities", "Varicosities"),]

    skinExamination = models.CharField(max_length=20, choices=SKIN_EXAM_CHOICES)
    conjunctivaExamination = models.CharField(max_length=20, choices=CONJUNCTIVA_EXAM_CHOICES)
    neckExamination = models.CharField(max_length=30, choices=NECK_EXAM_CHOICES)
    breastExamination = models.CharField(max_length=30, choices=BREAST_EXAM_CHOICES)
    abdomenExamination = models.CharField(max_length=30, choices=ABDOMEN_EXAM_CHOICES)
    extremitiesExamination = models.CharField(max_length=30, choices=EXTREMITIES_EXAM_CHOICES)

    fprecord_id = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    # vital_id = models.ForeignKey(,on_delete=models.CASCADE)
    # bm_id = models.ForeignKey(,on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'fp_physical_exam'
        
 
class FP_Pelvic_Exam(models.Model):
    pelvic_id = models.AutoField(primary_key=True)
    PELVIC_EXAM_CHOICES = [("normal", "Normal"),("mass", "Mass"),("abnormal_discharge", "Abnormal Discharge"),("cervical_abnormalities", "Cervical Abnormalities"),("warts", "Warts"),("polyp_or_cyst", "Polyp or Cyst"),("inflammation_or_erosion", "Inflammation or Erosion"),("bloody_discharge", "Bloody Discharge"),]
    
    pelvicExamination = models.CharField(max_length=30, choices=PELVIC_EXAM_CHOICES)
    
    # Cervical Examination
    CERVICAL_CONSISTENCY_CHOICES = [("firm", "Firm"),("soft", "Soft"),]
    cervicalConsistency = models.CharField(max_length=20, choices=CERVICAL_CONSISTENCY_CHOICES)
    cervicalTenderness = models.BooleanField(default=False)
    cervicalAdnexal = models.BooleanField(default=False)

    # Uterine Examination
    UTERINE_POSITION_CHOICES = [("mid", "Mid"),("anteflexed", "Anteflexed"),("retroflexed", "Retroflexed"),]
    uterinePosition = models.CharField(max_length=20, choices=UTERINE_POSITION_CHOICES)
    uterineDepth = models.CharField(max_length=10, null=True, blank=True)

    fpt_id = models.ForeignKey(FP_type, on_delete=models.CASCADE)
    
    class Meta:
        db_table = "fp_pelvic_exam"
        
           
class FP_Acknowledgement(models.Model):
    ack_id = models.AutoField(primary_key=True)
    ack_clientSignature = models.TextField()
    ack_clientSignatureDate = models.DateField()
    client_name = models.CharField(max_length=50)
    guardian_signature = models.TextField()
    guardian_signature_date = models.DateField()
    patient_ack_id = models.ForeignKey(PatientRecord,on_delete=models.CASCADE)
    
    fpt_id = models.ForeignKey(FP_type,on_delete=models.CASCADE)
    
    class Meta:
        db_table = "fp_acknowledgement"


class FP_Obstetrical_History(models.Model):
    fpob_id = models.AutoField(primary_key=True)
    fpob_last_delivery = models.CharField(max_length=30)
    fpob_type_last_delivery = models.CharField(null=True,max_length=30)
    fpob_last_period = models.CharField(null=True,max_length=30)
    fpob_previous_period = models.CharField(null=True,max_length=30)
    fpob_mens_flow = models.CharField(max_length=20)
    fpob_dysme = models.BooleanField(default=False)
    fpob_hydatidiform = models.BooleanField(default=False)
    fpob_ectopic_pregnancy = models.BooleanField(default=False)
    
    fprecord_id = models.ForeignKey(FP_Record,on_delete=models.CASCADE)
    # obs_history = models.ForeignKey(Obstetrical_History,on_delete=True)
    # wala pa ma merge kang mayi
    class Meta:
        db_table = "fp_obs_history"
    
class FP_Assessment_Record(models.Model):
    assessment_id = models.AutoField(primary_key=True)
    quantity = models.IntegerField(default=0)
    as_provider_signature = models.CharField()
    as_provider_name= models.CharField(max_length=35)
    as_followup_date = models.CharField(max_length=15)
    medical_findings = models.CharField(max_length=100,default="None")
    ack_id = models.ForeignKey(FP_Acknowledgement,on_delete=models.CASCADE)
    # for method used
    fpt_id = models.ForeignKey(FP_type,on_delete=models.CASCADE) 
    # vital signs fk pud
    # staff_id = models.ForeignKey(Staff,on_delete=True)
    
    class Meta:
        db_table = "fp_assessment"


class FP_pregnancy_check(models.Model):
    fp_pc_id = models.AutoField(primary_key=True)
    breastfeeding = models.BooleanField(default=False)
    abstained = models.BooleanField(default=False)
    recent_baby = models.BooleanField(default=False)
    recent_period = models.BooleanField(default=False)
    recent_abortion = models.BooleanField(default=False)
    using_contraceptive = models.BooleanField(default=False)
    pregnancy_patient = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    # as_id = models.ForeignKey(Assessment_Record,on_delete=True) 
    # physical_exam = models.ForeignKey(Physical_Exam,on_delete=True)
    # vitals = models.ForeignKey(VitalSigns,on_delete=models.CASCADE)
    fpt_id = models.ForeignKey(FP_type,on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'fp_pregnancy_check'
