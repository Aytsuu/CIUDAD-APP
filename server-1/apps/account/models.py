from django.contrib.auth.models import AbstractUser
from django.db import models

class Account(AbstractUser): 
    profile_image = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        default='https://isxckceeyjcwvjipndfd.supabase.co/storage/v1/object/public/userimage//sanRoqueLogo.svg'
    )
    
    rp = models.OneToOneField("profiling.ResidentProfile", on_delete=models.CASCADE, null=True, related_name="account")
    
    class Meta:
        db_table = 'account'
