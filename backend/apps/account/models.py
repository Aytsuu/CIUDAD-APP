from django.db import models

# Create your models here.
class Account(models.Model):
    acc_id = models.CharField(max_length=20, primary_key=True, editable=False)
    acc_username = models.CharField(max_length=200)
    acc_email = models.CharField(max_length=200)
    acc_password = models.CharField(max_length=200)
    
    from django.db import models

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

    
    class Meta:
        db_table = 'account'