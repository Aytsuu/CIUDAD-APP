from django.utils import timezone
from .models import Announcement

def update_ann_status():
    now = timezone.now() 
    print(f"[{timezone.localtime(now)}] Checking announcements...")

    Announcement.objects.filter(
        ann_end_at__lte=now,
        ann_status__iexact="ACTIVE"
    ).update(ann_status="INACTIVE")

    Announcement.objects.filter(
        ann_start_at__lte=now,
        ann_end_at__gt=now,
        ann_status__iexact="INACTIVE"
    ).update(ann_status="ACTIVE")
    

    Announcement.objects.filter(
        ann_start_at__gt=now,
        ann_status__iexact="ACTIVE"
    ).update(ann_status="INACTIVE")
