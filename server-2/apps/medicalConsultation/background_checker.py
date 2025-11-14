import threading
import time
import logging
from datetime import datetime, timedelta
from django.utils import timezone
from apps.medicalConsultation.models import MedConsultAppointment
import pytz

logger = logging.getLogger(__name__)


def update_missed_appointments_background():
    """
    Background task that runs every minute to check and update missed appointments
    Updates appointments to 'missed' at exactly 6 PM Philippine time on their scheduled date
    This runs in a separate thread so it doesn't block the main server
    """
    philippine_tz = pytz.timezone('Asia/Manila')
    
    while True:
        try:
            # Wait 60 seconds between checks
            time.sleep(60)
            
            # Get current time in Philippine timezone
            now = timezone.now().astimezone(philippine_tz)
            current_date = now.date()
            current_time = now.time()
            
            # Define 6 PM threshold
            six_pm = datetime.strptime('18:00', '%H:%M').time()
            
            # Case 1: Past dates (any appointment before today should be marked missed)
            overdue_count = MedConsultAppointment.objects.filter(
                scheduled_date__lt=current_date,
                status__iexact='confirmed'
            ).update(status='missed')
            
            # Case 2: Today at or after 6 PM Philippine time
            today_missed_count = 0
            if current_time >= six_pm:
                today_missed_count = MedConsultAppointment.objects.filter(
                    scheduled_date=current_date,
                    status__iexact='confirmed'
                ).update(status='missed')
            
            total = overdue_count + today_missed_count
            if total > 0:
                logger.info(f"� {now.strftime('%Y-%m-%d %I:%M %p')} PH Time: Updated {total} missed appointments")
            
        except Exception as e:
            logger.error(f"❌ Error in background appointment checker: {e}")


def start_appointment_checker():
    """Start the background thread when Django starts"""
    thread = threading.Thread(target=update_missed_appointments_background, daemon=True)
    thread.start()
    logger.info("✅ Background appointment checker started (checks every minute, updates at 6 PM PH time)")
