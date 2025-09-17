from django.utils import timezone
from datetime import timedelta
from .models import RequestRegistration

def update_expired_requests():
    print(f"[{timezone.now()}] Checking expired requests...") 
    now = timezone.now()
    RequestRegistration.objects.filter(
        req_date__range=(
            now - timedelta(days=7, minutes=15),  # 7 days 15 mins ago
            now - timedelta(days=7)               # 7 days ago
        ),
        req_is_archive=False
    ).update(req_is_archive=True)
