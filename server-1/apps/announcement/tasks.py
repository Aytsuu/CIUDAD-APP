from django.utils import timezone
from .models import Announcement
from apps.notification.utils import create_notification
from apps.profiling.models import ResidentProfile

def update_ann_status():
    now = timezone.now() 
    print(f"[{timezone.localtime(now)}] Checking announcements...")

    event = Announcement.objects.filter(
        ann_end_at__lte=now,
        ann_status__iexact="ACTIVE"
    ).update(ann_status="INACTIVE")

    if event > 0:
        create_notification(
            title=f"New Event Announcement",
            message=(
                f"{event} new announcement{"s" if event > 1 else ""} has been added"
            ),

            recipients=[res.rp_id for res in ResidentProfile.objects.all()],
            notif_type="",
            web_route="",
            web_params={},
            # mobile_route="",
            # mobile_params={},
        )

    Announcement.objects.filter(
        ann_start_at__lte=now,
        ann_end_at__gt=now,
        ann_status__iexact="INACTIVE"
    ).update(ann_status="ACTIVE")
    
    general = Announcement.objects.filter(
        ann_start_at__gt=now,
        ann_status__iexact="ACTIVE"
    ).update(ann_status="INACTIVE")

    if general > 0:
        create_notification(
            title=f"New Announcement",
            message=(
                f"{general} new announcement{"s" if general > 1 else ""} has been added"
            ),

            recipients=[res.rp_id for res in ResidentProfile.objects.all()],
            notif_type="",
            web_route="",
            web_params={},
            # mobile_route="",
            # mobile_params={},
        )