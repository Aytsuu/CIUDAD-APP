from django.db import models

class FP_Record(models.Model):
    fprecord_id = models.AutoField(primary_key=True)
    nhts = models.BooleanField(default=False)
    four_ps = models.BooleanField(default=False)
    plan_more_children = models.BooleanField(default=False)
    avg_monthly_income = models.CharField(max_length=15)
    patient_id = models.ForeignKey(,on_delete=models.CASCADE)

class FP_type(models.Model):
    fpt_id = models.AutoField(primary_key=True)
    fpt_client_type = models.CharField(max_length=20)
    fpt_subtype = models.CharField(max_length=20)
    fpt_reason_fp = models.CharField(max_length=20)
    fpt_reason = models.CharField(max_length=20)
    fpt_method_used = models.CharField(max_length=30)
    record = models.ForeignKey(FP_Record,on_delete=models.CASCADE)
    
class Spouse(models.Model):
    sp_id = models.AutoField(primary_key=True)

class PelvicExam(models.Model):
    pel_id = models.AutoField(primary_key=True)
    cervical_consistency = models.CharField(max_length=5)
    cervical_tenderness = models.CharField(max_length=20)
    cervical_adnexal = models.CharField(max_length=20)
    cervical_position = models.CharField(max_length=20)
    uterine_depth = models.CharField(max_length=20)
    fpt_id = models.ForeignKey(FP_type,on_delete=True)

      
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
    ack_id = models.AutoField(primary_key=True)
    ack_clientSignature = models.TextField()
    ack_selectedMethod = models.CharField(max_length=50)
    ack_clientSignatureDate = models.DateField()

    clientName = models.CharField(max_length=50)
    guardianSignature = models.TextField()
    guardianSignatureDate = models.DateField()
    method = models.ForeignKey(FP_type, on_delete=True)
    class Meta:
        db_table = "acknowledgement"


class FP_Obstetrical_History(models.Model):
    fpob_id = models.AutoField(primary_key=True)
    fpob_last_delivery = models.CharField(max_length=30)
    fpob_type_last_delivery = models.CharField(max_length=30)
    fpob_last_period = models.CharField(max_length=30)
    fpob_previous_period = models.CharField(max_length=30)
    fpob_mens_flow = models.CharField(max_length=20)
    fpob_last_delivery = models.CharField(max_length=30)
    fpob_dysme = models.CharField(max_length=10)
    fpob_hydatidiform = models.CharField(max_length=10)
    fpob_ectopic_pregnancy = models.CharField(max_length=10)
    
    fpt_id = models.ForeignKey(FP_type,on_delete=True)
    obs_id = models.ForeignKey(ObstetricalHistory,on_delete=True)
    
    
class Assessment_Record(models.Model):
    as_id = models.AutoField(primary_key=True)
    quantity = models.IntegerField(default=0)
    as_followup_date = models.CharField(default=15)
    as_provider_signature = models.CharField()
    as_provider_name= models.CharField(default=35)
    ack = models.ForeignKey(Acknowledgement,on_delete=True)
    fpt = models.ForeignKey(FP_type,on_delete=True)
    staff_id = models.ForeignKey(Staff,on_delete=True)
    
class FP_finding(models.Model):
    fpf_id = models.AutoField(primary_key=True)
    fpf_details = models.CharField(max_length=50)
    as_id = models.ForeignKey(Assessment_Record,on_delete=True) 