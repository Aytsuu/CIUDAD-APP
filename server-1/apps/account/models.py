from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator
from django.contrib.auth.models import AbstractUser
from datetime import datetime, timedelta
from django.utils import timezone
from django.contrib.auth.base_user import BaseUserManager

class AccountManager(BaseUserManager):
    use_in_migrations = True

    def normalize_email(self, email):
        # Override to allow None, do not convert None to ''
        if email is None:
            return None
        return super().normalize_email(email)

    def create_user(self, email=None, password=None, **extra_fields):
        email = self.normalize_email(email)
        if email is None:
            pass
        else:
            if not email:
                raise ValueError('The Email must be set')

        user = self.model(email=email, **extra_fields)
        user.set_password(password) 
        user.save(using=self._db)
        return user


class Account(AbstractUser):
    acc_id = models.AutoField(primary_key=True, verbose_name='Account ID')
    email = models.CharField(unique=True,null=True, verbose_name='Email Address')    
    username = models.CharField(max_length=100,unique=True,blank=True,null=True,validators=[MinLengthValidator(3)])
    profile_image = models.URLField( max_length=500,blank=True, null=True,default='https://isxckceeyjcwvjipndfd.supabase.co/storage/v1/object/public/profile_picture-bucket/1757783075918_c1nodq418e.png')
    phone = models.CharField(max_length=11, unique=True, blank=True, null=False, verbose_name='Phone Number' )
    
    rp = models.OneToOneField("profiling.ResidentProfile", on_delete=models.CASCADE,null=True,related_name="account")
    br = models.OneToOneField("profiling.BusinessRespondent",on_delete=models.CASCADE,null=True,related_name="business_account")

    objects = AccountManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    
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
    pv_type = models.CharField(default=False, max_length=10)

    class Meta:
        db_table = "phone_verification"
    