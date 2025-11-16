# tasks.py - Remove the infinite loop, make it a simple function
import logging
from datetime import datetime
from django.utils import timezone
from apps.medicalConsultation.models import MedConsultAppointment
import pytz

logger = logging.getLogger(__name__)

def update_missed_appointments_background():
    """
    Background task that runs every minute to check and update missed appointments
    Updates appointments to 'missed' at exactly 6 PM Philippine time on their scheduled date
    """
    philippine_tz = pytz.timezone('Asia/Manila')
    
    try:
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
            logger.info(f"📅 {now.strftime('%Y-%m-%d %I:%M %p')} PH Time: Updated {total} missed appointments")
        else:
            logger.debug(f"⏰ {now.strftime('%Y-%m-%d %I:%M %p')} PH Time: No missed appointments to update")
            
    except Exception as e:
        logger.error(f"❌ Error in background appointment checker: {e}")

# Remove the start_appointment_checker function entirely