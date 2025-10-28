
from django.db import models
from apps.healthProfiling.models import *
from apps.patientrecords.models import *
from apps.administration.models import *
from apps.inventory.models import *


class FP_Record(models.Model):
    fprecord_id = models.BigAutoField(primary_key=True)
    client_id = models.CharField(max_length=50, null=True, blank=True)
    # nhts = models.BooleanField(default=False)
    fourps = models.BooleanField(default=False)
    num_of_children = models.PositiveIntegerField(default=0, null=True, blank=True)
    plan_more_children = models.BooleanField(default=False)
    avg_monthly_income = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    occupation = models.CharField(max_length=50, null=True, blank=True)
    
    patrec = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name='fp_records')
    spouse = models.ForeignKey(Spouse, on_delete=models.CASCADE, related_name='fp_records',null=True, blank=True)
    pat = models.ForeignKey(Patient, to_field='pat_id',on_delete=models.CASCADE, related_name='fp_records', null=True)
    
    class Meta:
        db_table = "famplan_record"
        ordering = ['-created_at']
        verbose_name = 'Family Planning Record'
        verbose_name_plural = 'Family Planning Records'

    def __str__(self):
        return f"FP Record {self.fprecord_id} for Patient {self.pat.pat_id}"

    def get_absolute_url(self):
        return {
            'path': '/services/familyplanning/records',
            'params': {'fprecordId': self.fprecord_id}
        }
    
    # def get_mobile_route(self):
    #     return {
    #         'screen' : '/(my-request)/complaint-tracking/compMainView',
    #         'params' : {'comp_id': str(self.comp_id)}
    #     }
    
    
class FP_type(models.Model):
    fpt_id = models.AutoField(primary_key=True)
    fpt_client_type = models.CharField(max_length=50)
    fpt_subtype = models.CharField(max_length=50, null=True, blank=True) 
    fpt_reason_fp = models.CharField(max_length=50, null=True, blank=True)
    fpt_reason = models.CharField(max_length=50, null=True, blank=True)  #
    fpt_method_used = models.CharField(max_length=50)
    fpt_other_method = models.CharField(max_length=50,null=True,blank=True)
    
    fprecord = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    class Meta:
        db_table = "famplan_type"
        ordering = ['fpt_client_type']
        verbose_name = 'Family Planning Type'
        verbose_name_plural = 'Family Planning Types'

    def __str__(self):
        return f"{self.fpt_client_type} - {self.fpt_method_used}"

class FP_RiskSti(models.Model):
    sti_id = models.AutoField(primary_key=True)
    sti_abnormal_discharge = models.BooleanField(default=False)
    sti_discharge_from = models.CharField(max_length=50, null=True, blank=True)
    sti_sores = models.BooleanField(default=False)
    sti_pain = models.BooleanField(default=False)
    sti_history = models.BooleanField(default=False)
    sti_hiv = models.BooleanField(default=False)
    
    fprecord = models.ForeignKey(FP_Record, on_delete=models.CASCADE, related_name='fp_risk_stis')
    
    class Meta: 
        db_table = "famplan_risk_sti"
        verbose_name_plural = 'FP Risk STIs'

    def __str__(self):
        return f"STI Risk for FP Record {self.fprecord_id}"

class FP_RiskVaw(models.Model):
    vaw_id = models.AutoField(primary_key=True)
    vaw_unpleasant_rs = models.BooleanField(default=False)
    vaw_partner_disapproval = models.BooleanField(default=False)
    vaw_domestic_violence = models.BooleanField(default=False)
    vaw_referred_to = models.CharField(max_length=40,blank=True)
    
    fprecord = models.ForeignKey(FP_Record, on_delete=models.CASCADE, related_name='fp_risk_vaws')
    
    class Meta:
        db_table = 'famplan_risk_vaw'
        verbose_name_plural = 'FP Risk VAWs'

    def __str__(self):
        return f"VAW Risk for FP Record {self.fprecord_id}"
    
    
class FP_Physical_Exam(models.Model):
    fp_pe_id = models.AutoField(primary_key=True)

    # SKIN_EXAM_CHOICES = [("normal", "Normal"),("pale", "Pale"),("yellowish", "Yellowish"),("hematoma", "Hematoma")]
    # CONJUNCTIVA_EXAM_CHOICES = [("normal", "Normal"),("pale", "Pale"),("yellowish", "Yellowish")]
    # NECK_EXAM_CHOICES = [("normal", "Normal"),("neck_mass", "Neck Mass"),("enlarged_lymph_nodes", "Enlarged Lymph Nodes")]
    # BREAST_EXAM_CHOICES = [("normal", "Normal"),("mass", "Mass"),("nipple_discharge", "Nipple Discharge")]
    # ABDOMEN_EXAM_CHOICES = [("normal", "Normal"),("abdominal_mass", "Abdominal Mass"),("varicosities", "Varicosities")]
    # EXTREMITIES_EXAM_CHOICES = [("normal", "Normal"),("edema", "Edema"),("varicosities", "Varicosities")]

    skin_exam = models.CharField(max_length=50, default="Normal", null=True, blank=True)
    conjunctiva_exam = models.CharField(max_length=50, default="Normal", null=True, blank=True)
    neck_exam = models.CharField(max_length=30, default="Normal", null=True, blank=True)
    breast_exam = models.CharField(max_length=30, default="Normal", null=True, blank=True)
    abdomen_exam = models.CharField(max_length=30, default="Normal", null=True, blank=True)
    extremities_exam = models.CharField(max_length=30, default="Normal", null=True, blank=True)

    fprecord = models.ForeignKey(FP_Record, on_delete=models.CASCADE, related_name="fp_physical_exam")
    bm = models.ForeignKey(BodyMeasurement,on_delete=models.CASCADE,null=True)
    vital = models.ForeignKey(VitalSigns,on_delete=models.CASCADE,null=True)
    class Meta:
        db_table = 'famplan_physical_exam'
        verbose_name_plural = 'FP Physical Exams'

    def __str__(self):
        return f"Physical Exam for FP Record {self.fprecord_id}"
        
class FP_Pelvic_Exam(models.Model):
    pelvic_id = models.AutoField(primary_key=True)
    PELVIC_EXAM_CHOICES = [("normal", "Normal"),("mass", "Mass"),("abnormal_discharge", "Abnormal Discharge"),("cervical_abnormalities", "Cervical Abnormalities"),("warts", "Warts"),("polyp_or_cyst", "Polyp or Cyst"),("inflammation_or_erosion", "Inflammation or Erosion"),("bloody_discharge", "Bloody Discharge")]
    CERVICAL_CONSISTENCY_CHOICES = [("firm", "Firm"),("soft", "Soft")]
    # UTERINE_POSITION_CHOICES = [
    #     ('middle', 'Middle'),
    #     ('anteflexed', 'Anteflexed'), # Add this
    #     ('retroflexed', 'Retroflexed'), # Add this
    # ]
    pelvic_exam = models.CharField(max_length=30, null=True, blank=True)
    
    cervical_consistency = models.CharField(max_length=50, null=True, blank=True)
    cervical_tenderness = models.BooleanField(default=False, null=True, blank=True)
    cervical_adnexal = models.BooleanField(default=False, null=True, blank=True)

    # UTERINE_POSITION_CHOICES = [("Middle", "Mid"),("Anteflexed", "Anteflexed"),("Retroflexed", "Retroflexed")]
    uterine_position = models.CharField(max_length=50, null=True, blank=True)
    uterine_depth = models.CharField(max_length=10, null=True, blank=True)

   
    fprecord = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    class Meta:
        db_table = "famplan_pelvic_exam"
        verbose_name_plural = 'FP Pelvic Exams'

    def __str__(self):
        return f"Pelvic Exam for FP Record {self.fprecord_id}"
    
    
class FP_MedicalHistory(models.Model):
    fp_md_id = models.BigAutoField(primary_key=True)
    fprecord = models.ForeignKey(
        FP_Record,
        on_delete=models.CASCADE,
        related_name='medical_history_snapshots'
    )
    medhist = models.ForeignKey(
        'patientrecords.MedicalHistory',
        on_delete=models.CASCADE,
        related_name='fp_snapshots'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "famplan_medhistory"
            
class FP_Acknowledgement(models.Model):
    ack_id = models.AutoField(primary_key=True)
    ack_client_name = models.CharField(max_length=50)
    ack_client_signature = models.TextField(null=True, blank=True)
    ack_guardian_signature = models.TextField(null=True, blank=True)
    
    ack_client_signature_date = models.DateField(auto_now_add=True)
    ack_guardian_signature_date = models.DateField(null=True, blank=True)
   
    fprecord = models.ForeignKey(FP_Record, on_delete=models.CASCADE,related_name="fp_acknowledgement")
    fpt = models.ForeignKey(FP_type, on_delete=models.CASCADE)
    
    class Meta:
        db_table = "famplan_acknowledgement"
        verbose_name_plural = 'FP Acknowledgements'

    def __str__(self):
        return f"Acknowledgement for FP Record {self.fprecord_id}"


class FP_Obstetrical_History(models.Model):
    fpob_id = models.AutoField(primary_key=True)
    fpob_last_delivery = models.DateField(null=True, blank=True)
    fpob_type_last_delivery = models.CharField(max_length=30, null=True, blank=True)
    # fpob_last_period = models.DateField(null=True, blank=True)
    fpob_previous_period = models.DateField(null=True, blank=True)
    fpob_mens_flow = models.CharField(max_length=50)
    fpob_dysme = models.BooleanField(default=False)
    fpob_hydatidiform = models.BooleanField(default=False)
    fpob_ectopic_pregnancy = models.BooleanField(default=False)
    
    fprecord = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    obs = models.ForeignKey(Obstetrical_History, on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        db_table = "famplan_obs_history"
        verbose_name_plural = 'FP Obstetrical Histories'

    def __str__(self):
        return f"Obstetrical History for FP Record {self.fprecord_id}"
    
class FP_pregnancy_check(models.Model):
    fp_pc_id = models.AutoField(primary_key=True)
    fp_pc_breastfeeding = models.BooleanField(default=False)
    fp_pc_abstained = models.BooleanField(default=False)
    fp_pc_recent_baby = models.BooleanField(default=False)
    fp_pc_recent_period = models.BooleanField(default=False)
    fp_pc_recent_abortion = models.BooleanField(default=False)
    fp_pc_using_contraceptive = models.BooleanField(default=False)
    
    fprecord = models.ForeignKey(FP_Record, on_delete=models.CASCADE)
    
    class Meta:
        db_table = "famplan_pregnancy_check"
        verbose_name_plural = 'FP Obstetrical Histories'

    def __str__(self):
        return f"Obstetrical History for FP Record {self.fprecord_id}"
    


class FP_Assessment_Record(models.Model):
    assessment_id = models.AutoField(primary_key=True)
    quantity = models.IntegerField(default=0)
    as_provider_signature = models.CharField(null=True,blank=True)
    as_provider_name = models.CharField(max_length=35, null=True,blank=True)
    as_findings = models.TextField(default="None",blank=True,null=True)
    
    fprecord = models.ForeignKey(FP_Record,on_delete=models.CASCADE, related_name="fp_assessment_record")

    followv = models.ForeignKey(FollowUpVisit,on_delete=models.CASCADE)

 
    class Meta:
        db_table = "famplan_assessment"
        verbose_name_plural = 'FP Assessment Records'

    def __str__(self):
        return f"Assessment {self.assessment_id} for FP Type {self.fpt.fpt_id}"
