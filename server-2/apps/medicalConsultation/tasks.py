import logging
from django.utils import timezone
from django.db.models import Q
from .models import MedConsultAppointment

logger = logging.getLogger(__name__)


def update_missed_med_appointments() -> int:
    """
    Mark appointments as 'missed' only when they are CONFIRMED and:
      1) scheduled_date is in the past, or
      2) scheduled_date is today and it's past 6:00 PM local time.
    """
    now = timezone.localtime()
    today = now.date()
    total_updated = 0

    # Case 1: Overdue (date already passed) and confirmed
    overdue_qs = (
        MedConsultAppointment.objects
        .filter(scheduled_date__lt=today)
        .filter(status__iexact='confirmed')
    )
    if overdue_qs.exists():
        updated = overdue_qs.update(status='missed')
        logger.info(f"[{now}] Marked {updated} overdue CONFIRMED MedConsult appointments as 'missed'")
        total_updated += updated

    # Case 2: Today's confirmed appointments, after 6 PM mark as missed
    six_pm_today = now.replace(hour=18, minute=0, second=0, microsecond=0)
    if now >= six_pm_today:
        today_confirmed_qs = (
            MedConsultAppointment.objects
            .filter(scheduled_date=today)
            .filter(status__iexact='confirmed')
        )
        if today_confirmed_qs.exists():
            updated_today = today_confirmed_qs.update(status='missed')
            logger.info(f"[{now}] Marked {updated_today} today's CONFIRMED MedConsult appointments as 'missed' (after 6 PM)")
            total_updated += updated_today

    if total_updated == 0:
        logger.debug(f"[{now}] No CONFIRMED MedConsult appointments to mark as missed")

    return total_updated

