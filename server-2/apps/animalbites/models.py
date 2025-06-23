from django.db import models
from apps.patientrecords.models import PatientRecord # Ensure this import is correct

class AnimalBite_Referral(models.Model):
    referral_id = models.AutoField(primary_key=True)
    receiver = models.CharField(max_length=50)
    sender = models.CharField(max_length=50)
    # Changed from auto_now=True to auto_now_add=True to capture creation date only
    date = models.DateField(auto_now_add=True) 
    # If you need a field that updates on every save, add a separate updated_at field:
    # updated_at = models.DateTimeField(auto_now=True)
    patrec = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name="referrals")
    
    class Meta:
        db_table = "animalbite_referral"
        # Ordering by date (creation date) in descending order to get latest first in queries
        ordering = ['-date', '-referral_id'] # Add -referral_id for stable ordering if dates are the same

class AnimalBite_Details(models.Model):
    bite_id = models.AutoField(primary_key=True)
    exposure_type = models.CharField(max_length=50)
    actions_taken = models.CharField(max_length=255,null=True, blank=True)
    referredby = models.CharField(max_length=100, null=False)
    biting_animal = models.CharField(max_length=255,default="")
    exposure_site = models.CharField(max_length=255,default="")
    referral = models.ForeignKey(AnimalBite_Referral, on_delete=models.CASCADE, related_name="bite_details")
    # Add a created_at field to AnimalBite_Details if you want a precise timestamp for this record
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True) # Added for more precise tracking

    class Meta:
        db_table = "animalbite_detail"
        # Ordering by created_at in descending order
        ordering = ['-created_at', '-bite_id']
