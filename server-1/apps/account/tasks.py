from django.utils import timezone
from datetime import timedelta
from .models import PhoneVerification

def clean_otp():
  print('checking expired OTPs...')
  now = timezone.now()
  PhoneVerification.objects.filter(
    pv_created_at__lte=(
      now - timedelta(minutes=20)
    )
  ).delete()
  
