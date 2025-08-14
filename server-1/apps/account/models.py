from django.db import models
from django.core.validators import MinLengthValidator

class Account(models.Model):
    acc_id = models.AutoField(
        primary_key=True,
        verbose_name='Account ID'
    )
    
    supabase_id = models.CharField(
        max_length=255,
        unique=True,
        editable=False,
        verbose_name='Supabase User ID',
        help_text='Unique identifier from Supabase Auth'
    )
    
    email = models.EmailField(
        unique=True,
        blank=False,
        null=False,
        verbose_name='Email Address'
    )
    
    username = models.CharField(
        max_length=100,
        unique=True,
        blank=False,
        null=False,
        validators=[MinLengthValidator(3)],
        error_messages={
            'unique': 'This username is already taken.',
            'blank': 'Username is required.',
            'null': 'Username is required.',
            'min_length': 'Username must be at least 3 characters long.'
        }
    )
    
    profile_image = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        default='https://isxckceeyjcwvjipndfd.supabase.co/storage/v1/object/public/userimage//sanRoqueLogo.svg'
    )
    
    rp = models.OneToOneField(
        "profiling.ResidentProfile",
        on_delete=models.CASCADE,
        null=True,
        related_name="account"
    )

    br = models.OneToOneField(
        "profiling.BusinessRespondent",
        on_delete=models.CASCADE,
        null=True,
        related_name="business_account"
    )

    class Meta:
        db_table = 'account'
    
    @property
    def is_authenticated(self):
        """Always return True for authenticated users."""
        return True
        
    def __str__(self):
        return f"{self.username} (ID: {self.acc_id})"
    
    
class OTPLog(models.Model):
    phone = models.CharField(max_length=15)
    otp = models.CharField(max_length=6)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)    
    
    def is_valid(self, otp_input):
        return self.otp == otp_input and now() < self.expires_at
    
    