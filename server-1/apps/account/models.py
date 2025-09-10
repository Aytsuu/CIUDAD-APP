from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator
from django.contrib.auth.models import AbstractUser
from datetime import datetime, timedelta
from django.utils import timezone


class Account(AbstractUser):
    acc_id = models.AutoField(primary_key=True, verbose_name='Account ID')
    email = models.EmailField(unique=True,blank=False,null=True, verbose_name='Email Address' )    
    username = models.CharField(max_length=100,unique=True,blank=True,null=True,validators=[MinLengthValidator(3)])
    profile_image = models.URLField( max_length=500,blank=True, null=True,default='https://isxckceeyjcwvjipndfd.supabase.co/storage/v1/object/public/userimage//sanRoqueLogo.svg')
    phone = models.CharField(max_length=15, unique=True, blank=True, null=False, verbose_name='Phone Number' )
    
    rp = models.OneToOneField("profiling.ResidentProfile", on_delete=models.CASCADE,null=True,related_name="account")
    br = models.OneToOneField("profiling.BusinessRespondent",on_delete=models.CASCADE,null=True,related_name="business_account")

    USERNAME_FIELD = 'email' # Use email to log in
    REQUIRED_FIELDS = [] # Username is still required
    
    class Meta:
        db_table = 'account'
        
    def __str__(self):
        return f"{self.email} (ID: {self.acc_id})"

class PhoneVerification(models.Model):
    pv_id = models.BigAutoField(primary_key=True)
    pv_created_at = models.DateTimeField(auto_now_add=True)
    pv_phone_num = models.CharField(max_length=11)
    pv_otp = models.CharField(max_length=6, null=True)
    pv_sent = models.BooleanField(default=False)

    class Meta:
        db_table = "phone_verification"
    
    


