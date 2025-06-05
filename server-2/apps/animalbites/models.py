from django.db import models
from apps.patientrecords.models import PatientRecord
from apps.administration.models import Staff 

class BitingAnimal(models.Model):
    animal_id = models.AutoField(primary_key=True)
    animal_name = models.CharField(max_length=100)

    class Meta:
        db_table = "animalbite_biting_animal"

    def __str__(self):
        return self.animal_name


class ExposureSite(models.Model):
    exposure_site_id = models.AutoField(primary_key=True)
    exposure_site = models.CharField(max_length=100)

    class Meta:
        db_table = "animalbite_exposure_site"

    def __str__(self):
        return self.exposure_site

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
    actions_taken = models.CharField(max_length=255)

    referredby = models.ForeignKey(Staff, on_delete=models.SET_NULL,null=True)
    referral = models.ForeignKey(AnimalBite_Referral, on_delete=models.CASCADE, related_name="bite_details")
    biting_animal = models.ForeignKey(BitingAnimal, on_delete=models.SET_NULL, null=True, blank=True)
    exposure_site = models.ForeignKey(ExposureSite, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = "animalbite_detail"
