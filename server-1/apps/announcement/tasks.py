from django.utils import timezone
from .models import Announcement
from apps.notification.utils import create_notification
from apps.profiling.models import ResidentProfile
import logging

logger = logging.getLogger(__name__)

def update_ann_status():
    now = timezone.now() 
    logger.info("Checking announcements...")

    announcements = Announcement.objects.filter(
        ann_start_at__lte=now,
        ann_end_at__gt=now,
        ann_status__iexact="INACTIVE"
    ).update(ann_status="ACTIVE")

    if announcements > 0:
        create_notification(
            title=f"New Announcement",
            message=(
                f"{announcements} new announcement{'s' if announcements > 1 else ''} has been added"
            ),

            recipients=[res.rp_id for res in ResidentProfile.objects.all()],
            notif_type="",
            web_route="",
            web_params={},
            mobile_route="",
            mobile_params={},
        )
    
    Announcement.objects.filter(
        ann_end_at__lte=now,
        ann_status__iexact="ACTIVE"
    ).delete()
