from django.db import models
from apps.patientrecords.models import PatientRecord # Ensure this import is correct

class AnimalBite_Referral(models.Model):
    referral_id = models.AutoField(primary_key=True)
    receiver = models.CharField(max_length=50)
    sender = models.CharField(max_length=50)
    date = models.DateField(auto_now_add=True) 
    patrec = models.ForeignKey(PatientRecord, on_delete=models.CASCADE, related_name="referrals")
    
    class Meta:
        db_table = "animalbite_referral"
        ordering = ['-date', '-referral_id']
        
class AnimalBiteInfographic(models.Model):
    id = models.AutoField(primary_key=True)
    content = models.JSONField(
        default=dict,
        help_text="JSON object containing infographic content (introText, didYouKnow, firstAidSteps, etc.)"
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "animalbite_infographic"
        verbose_name = "Animal Bite Infographic"
        verbose_name_plural = "Animal Bite Infographics"

    def __str__(self):
        return f"Animal Bite Infographic (Updated: {self.updated_at})"
    
class AnimalBite_Details(models.Model):
    bite_id = models.AutoField(primary_key=True)
    exposure_type = models.CharField(max_length=50)
    actions_taken = models.CharField(max_length=255,null=True, blank=True)
    referredby = models.CharField(max_length=100, null=False)
    biting_animal = models.CharField(max_length=255,default="")
    exposure_site = models.CharField(max_length=255,default="")
    referral = models.ForeignKey(AnimalBite_Referral, on_delete=models.CASCADE, related_name="bite_details")
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True) 

    class Meta:
        db_table = "animalbite_detail"
        ordering = ['-created_at', '-bite_id']
