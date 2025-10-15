from django.utils import timezone
from .models import FollowUpVisit, PrenatalAppointmentRequest
import logging

logger = logging.getLogger(__name__)

def update_missed_followups():
    """
    Check for pending follow-ups that are beyond their scheduled date
    and automatically mark them as 'Missed'
    Only processes follow-ups for Prenatal and Postpartum Care records
    """
    try:
        now = timezone.now()
        
        # Find all pending follow-ups where the date has passed
        # Only for Prenatal and Postpartum Care patient records
        pending_followups = FollowUpVisit.objects.filter(
            followv_status='Pending',
            followv_date__lt=now.date(),  # Date is in the past
            patrec_id__patrec_type__in=['Prenatal', 'Postpartum Care']  # Only maternal services
        )
        
        count = pending_followups.count()
        
        if count > 0:
            # Update all matching records to 'Missed'
            updated = pending_followups.update(followv_status='Missed')
            logger.info(f"[{now}] Updated {updated} pending maternal follow-ups to 'Missed' status")
            print(f"[{now}] ✓ Marked {updated} overdue maternal follow-ups as Missed")
        else:
            logger.debug(f"[{now}] No overdue maternal follow-ups found")
            print(f"[{now}] ℹ No overdue maternal follow-ups to update")
            
    except Exception as e:
        logger.error(f"Error updating missed follow-ups: {str(e)}", exc_info=True)
        print(f"[{now}] ✗ Error: {str(e)}")


def update_missed_prenatal_appointments():
    """
    Check for approved prenatal appointments that are beyond their scheduled date
    and automatically mark them as 'missed'
    """
    try:
        now = timezone.now()
        
        # Find all approved appointments where the requested date has passed
        overdue_appointments = PrenatalAppointmentRequest.objects.filter(
            status='approved',
            requested_date__lt=now.date()  # Date is in the past
        )
        
        count = overdue_appointments.count()
        
        if count > 0:
            # Update all matching records to 'missed'
            updated = overdue_appointments.update(
                status='missed',
                missed_at=now
            )
            logger.info(f"[{now}] Updated {updated} approved prenatal appointments to 'missed' status")
            print(f"[{now}] ✓ Marked {updated} overdue prenatal appointments as Missed")
        else:
            logger.debug(f"[{now}] No overdue prenatal appointments found")
            print(f"[{now}] ℹ No overdue prenatal appointments to update")
            
    except Exception as e:
        logger.error(f"Error updating missed prenatal appointments: {str(e)}", exc_info=True)
        print(f"[{now}] ✗ Error: {str(e)}")
