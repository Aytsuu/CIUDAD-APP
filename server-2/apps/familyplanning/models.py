from django.db import models
from .models import *
from apps.vaccination.models import PatientRecord

class FP_Record(models.Model):
    client_id = models.BigAutoField(primary_key=True)
    nhts = models.BooleanField(default=False)
    four_ps = models.BooleanField(default=False)
    plan_more_children = models.BooleanField(default=False)
    avg_monthly_income = models.CharField(max_length=15)
    transient = models.BooleanField(default=False)
    record = models.ForeignKey(PatientRecord, to_field='pat_id', on_delete=models.CASCADE)

    
    # philhealth_id = models.CharField(max_length=14)
    # serv_id = models.ForeignKey(ServicesRecords,on_delete=models.CASCADE)
    # fprecord_id = models.AutoField(primary_key=True)
    # personal = models.ForeignKey(Personal, on_delete=models.CASCADE, null=True)
    
    # def patient(self):
    #     return self.serv_id.pat_id
    
    class Meta:
        db_table = "fp_record"


class FP_type(models.Model):
    fpt_id = models.AutoField(primary_key=True)
    fpt_client_type = models.CharField(max_length=20)
    fpt_subtype = models.CharField(max_length=20,null=True, blank=True)
    fpt_reason_fp = models.CharField(max_length=20, null=True, blank=True)
    fpt_reason = models.CharField(max_length=20,null=True, blank=True)
    fpt_method_used = models.CharField(max_length=30)
    
    type_record = models.ForeignKey(FP_Record,on_delete=models.CASCADE)
    
    class Meta:
        db_table = "fp_type"
        
class Illness(models.Model):
    ill_id = models.AutoField(primary_key=True),
    ill_name = models.CharField(max_length=50,unique=True)

    class Meta:
        db_table = "illness"
        
class Medical_history(models.Model):
    medic_id = models.AutoField(primary_key=True)
    ilness = models.ForeignKey(Illness, on_delete=models.CASCADE)
    patient = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    class Meta:
        db_table = "medical_history"
    
    
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
     
class RiskSti(models.Model):
    sti_id = models.AutoField(primary_key=True)
    abnormalDischarge = models.BooleanField(default=False)
    dischargeFrom = models.CharField(max_length=10, null=True, blank=True)
    sores = models.BooleanField(default=False)
    pain = models.BooleanField(default=False)
    history = models.BooleanField(default=False)
    hiv = models.BooleanField(default=False)

    sti_patient = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    class Meta: 
        db_table = "risk_sti"

class RiskVaw(models.Model):
    vaw_id = models.AutoField(primary_key=True)
    unpleasant_relationship = models.BooleanField(default=False)
    partner_disapproval = models.BooleanField(default=False)
    domestic_violence = models.BooleanField(default=False)
    referredTo = models.CharField(max_length=30)
    
    vaw_patient = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'risk_vaw'

class Physical_Exam(models.Model):
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

    pe_id = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    # vital_id = models.ForeignKey(,on_delete=models.CASCADE)
    # bm_id = models.ForeignKey(,on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'physical_exam'
        
 
class Pelvic_Exam(models.Model):
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

    pelvic_record = models.ForeignKey(FP_type, on_delete=models.CASCADE)
    class Meta:
        db_table = "pelvic_exam"
        
           
class Acknowledgement(models.Model):
    ack_id = models.AutoField(primary_key=True)
    ack_clientSignature = models.TextField()
    ack_clientSignatureDate = models.DateField()
    client_name = models.CharField(max_length=50)
    guardian_signature = models.TextField()
    guardian_signature_date = models.DateField()
    patient_ack_id = models.ForeignKey(PatientRecord,on_delete=models.CASCADE)
    fpt_record = models.ForeignKey(FP_type,on_delete=models.CASCADE)
    
    class Meta:
        db_table = "acknowledgement"


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
    
    fptype_obs = models.ForeignKey(FP_Record,on_delete=models.CASCADE)
    # obs_history = models.ForeignKey(Obstetrical_History,on_delete=True)
    # wala pa ma merge kang mayi
    class Meta:
        db_table = "Fp_Obs_History"
    
class Assessment_Record(models.Model):
    assessment_id = models.AutoField(primary_key=True)
    quantity = models.IntegerField(default=0)
    as_provider_signature = models.CharField()
    as_provider_name= models.CharField(max_length=35)
    as_followup_date = models.CharField(max_length=15)
    
    acknowledge = models.ForeignKey(Acknowledgement,on_delete=models.CASCADE)
    fpt = models.ForeignKey(FP_type,on_delete=models.CASCADE)
    # staff_id = models.ForeignKey(Staff,on_delete=True)
    
    class Meta:
        db_table = "Assessment"


class FP_finding(models.Model):
    fpf_id = models.AutoField(primary_key=True)
    fpf_details = models.CharField(max_length=50)
    
    breastfeeding = models.BooleanField(default=False)
    abstained = models.BooleanField(default=False)
    recent_baby = models.BooleanField(default=False)
    recent_period = models.BooleanField(default=False)
    recent_abortion = models.BooleanField(default=False)
    using_contraceptive = models.BooleanField(default=False)
    pregnancy_patient = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    # as_id = models.ForeignKey(Assessment_Record,on_delete=True) 
    # physical_exam = models.ForeignKey(Physical_Exam,on_delete=True)
    finding_record = models.ForeignKey(FP_type,on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'fp_findings'
