from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class Account(AbstractUser): 
    profile_image = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        default='https://isxckceeyjcwvjipndfd.supabase.co/storage/v1/object/public/userimage//sanRoqueLogo.svg'
    )
    
    class Meta:
        db_table = 'account'
        
    # def update_profile_image(self, image_url):
    #     self.profile_image = image_url
    #     self.save()
    #     return self.profile_image
