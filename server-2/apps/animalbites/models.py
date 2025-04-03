from django.db import models

class Patient(models.Model):
    patient_id = models.AutoField(primary_key=True)
    transient = models.BooleanField()
    lastname = models.CharField(max_length=50)
    firstname = models.CharField(max_length=50)
    middlename = models.CharField(max_length=50, null=True, blank=True)
    address = models.CharField(max_length=50)
    age = models.IntegerField()
    gender = models.CharField(max_length=20) 
    class Meta:
        db_table = "patient"
    
class Referral(models.Model):
    referral_id = models.AutoField(primary_key=True)
    receiver = models.CharField(max_length=50)
    sender = models.CharField(max_length=50)
    date = models.DateField()
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    
    class Meta:
        db_table = "referral"    
        
class BiteDetails(models.Model):
    bite_id = models.AutoField(primary_key=True)
    exposure_type = models.CharField(max_length=50)
    exposure_site = models.CharField(max_length=50, default="Not specified")  
    biting_animal = models.CharField(max_length=50)
    actions_taken = models.CharField(max_length=50)
    referral = models.ForeignKey(Referral, on_delete=models.CASCADE)
    
    class Meta:
        db_table = "bite_detail"

