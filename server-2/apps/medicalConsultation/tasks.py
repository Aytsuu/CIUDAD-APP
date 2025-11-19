# tasks.py - Remove the infinite loop, make it a simple function
import logging
from datetime import datetime
from django.utils import timezone
from apps.medicalConsultation.models import MedConsultAppointment
from utils.create_notification import NotificationQueries



logger = logging.getLogger(__name__)

def update_missed_appointments_background():
    """
    Background task that runs to check and update missed appointments
    Updates appointments to 'missed' for any confirmed appointments with scheduled_date in the past
    """
    try:
        # Get today's date
        today = timezone.now().date()
        
        # Find all confirmed appointments with scheduled_date before today
        missed_count = MedConsultAppointment.objects.filter(
            scheduled_date__lt=today,  # Any date before today
            status__iexact='confirmed'
        ).update(status='missed')
        
        if missed_count > 0:
            logger.info(f"📅 Updated {missed_count} missed appointments (scheduled before {today})")
        else:
            logger.debug(f"⏰ No missed appointments to update")
            
        return missed_count
        
    except Exception as e:
        logger.error(f"❌ Error in background appointment checker: {e}")
        return 0


# Add this to your existing tasks.py
def send_daily_pending_appointments_notification():
    """
    Daily task that sends notification if there are pending appointments
    Runs every day to remind staff about pending appointments
    """
    try:
       
        # Count pending appointments
        pending_count = MedConsultAppointment.objects.filter(
            status__iexact='pending'
        ).count()
        
        if pending_count > 0:
            # Get health staff recipients
            from apps.inventory.signals import get_health_staff_recipients
            recipients = get_health_staff_recipients()
            
            if recipients:
                notification = NotificationQueries()
                
                # Create notification message based on count
                if pending_count == 1:
                    message = "There is 1 pending medical appointment waiting for review."
                else:
                    message = f"There are {pending_count} pending medical appointments waiting for review."
                
                success = notification.create_notification(
                    title="Pending Medical Appointments Alert",
                    message=message,
                    recipients=recipients,
                    notif_type="PENDING",
                    web_route="/services/medical-consultation/appointments/pending",  # Route to appointments page
                    web_params={"status": "pending"},  # Filter to show pending appointments
                    mobile_route=None,
                    mobile_params=None
                )
                
                if success:
                    logger.info(f"✅ Daily pending appointments notification sent: {pending_count} pending appointments")
                else:
                    logger.error("❌ Failed to send daily pending appointments notification")
            else:
                logger.warning("⚠️ No health staff recipients found for pending appointments notification")
        else:
            logger.info("⏭️ No pending appointments, skipping daily notification")
            
        return pending_count
        
    except Exception as e:
        logger.error(f"❌ Error in daily pending appointments notification: {e}")
        return 0

