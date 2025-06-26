from django.db import models
from apps.patientrecords.models import PatientRecord

# class AnimalBite_Record(models.Model):
#     animalbite_record_id = models.AutoField(primary_key=True)
#     patrec = models.ForeignKey(PatientRecord, on_delete=models.CASCADE)
    
#     class Meta:
#         db_table = "animalbite_record"
    
class AnimalBite_Referral(models.Model):
    referral_id = models.AutoField(primary_key=True)
    receiver = models.CharField(max_length=50)
    sender = models.CharField(max_length=50)
    date = models.DateField(auto_now=True)
    transient = models.BooleanField(default=False)
    patrec = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name="referrals")

    class Meta:
        db_table = "animalbite_referral"


class AnimalBite_Details(models.Model):
    bite_id = models.AutoField(primary_key=True)
    exposure_type = models.CharField(max_length=50)
    exposure_site = models.CharField(max_length=50, default="Not specified")  
    biting_animal = models.CharField(max_length=50)
    actions_taken = models.CharField(max_length=50)
    referredby = models.CharField(max_length=50)
    referral = models.ForeignKey(AnimalBite_Referral, on_delete=models.CASCADE, related_name="bite_details")

    class Meta:
        db_table = "animalbite_detail"


