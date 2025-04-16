from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.administration.models import Staff


class Account(AbstractUser): 
    email = models.EmailField(null=True, blank=True)
    profile_image = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        default='https://isxckceeyjcwvjipndfd.supabase.co/storage/v1/object/public/userimage//sanRoqueLogo.svg'
    )
    
    rp = models.OneToOneField("profiling.ResidentProfile", on_delete=models.CASCADE, null=True, related_name="account")
    
    class Meta:
        db_table = 'account'

class Account(models.Model):
    acc_id = models.CharField(max_length=20, primary_key=True, editable=False)
    acc_username = models.CharField(max_length=200)
    acc_email = models.CharField(max_length=200)
    acc_password = models.CharField(max_length=200)

    def save(self, *args, **kwargs):
        if not self.acc_id:
            last_account = Account.objects.order_by('-id').first()
            if last_account:
                last_id = int(last_account.acc_id.split('-')[1]) + 1
            else:
                last_id = 1
            self.acc_id = f"ACC-{last_id:05d}" 
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = 'account'
