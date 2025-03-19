from django.db import models

class Patient(models.Model):
    transient = models.BooleanField(default=False)
    lastname = models.CharField(max_length=50)
    firstname = models.CharField(max_length=50)
    middlename = models.CharField(max_length=50)
    address = models.CharField(max_length=50)
    age = models.IntegerField(max_length=2)
    gender = models.CharField(max_length=20)
    
    
    
class Referral(models.Model):
    referral_id = models.AutoField(primary_key=True)
    receiver = models.CharField(max_length=50)
    sender = models.CharField(max_length=50)
    date = models.DateField()
    patient = models.ForeignKey(Patient,on_delete=models.CASCADE)
    
    class Meta:
        db_table  = "Referral"    
        
class BiteDetails(models.Model):
    bite_id = models.AutoField(primary_key=True)
    exposure_type = models.CharField(max_length=50)
    biting_animal = models.CharField(max_length=50)
    lab_exam = models.CharField(max_length=50)
    actions_taken = models.CharField(max_length=50)
    referral = models.ForeignKey(Referral,on_delete=models.CASCADE)