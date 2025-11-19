import logging
from django.apps import AppConfig
import os
import sys
from django.db import connection
from django.db.utils import OperationalError
from utils.create_notification import NotificationQueries
logger = logging.getLogger(__name__)


def update_expired_medicine_requests() -> int:
    """
    Mark medicine request items as 'cancelled' and archive them when:
    - Status is 'confirmed'
    - confirmed_at is more than 2 days ago
    - Archive reason: "Exceeded pick-up date"
    Send notification to the recipient
    """
    from django.utils import timezone
    from .models import MedicineRequestItem
    
    now = timezone.localtime()
    expiry_threshold = now - timezone.timedelta(days=2)
    
    # Find confirmed items where confirmed_at is more than 2 days ago
    expired_items = MedicineRequestItem.objects.filter(
        status__iexact='confirmed',
        confirmed_at__lt=expiry_threshold
    ).select_related(
        'medreq_id',
        'medreq_id__rp_id',
        'medreq_id__rp_id__per',
        'med'
    )
    
    total_updated = 0
    
    if expired_items.exists():
        # Process each expired item individually to send notifications
        for item in expired_items:
            # Update the item
            item.status = 'cancelled'
            item.is_archived = True
            item.archive_reason = 'Exceeded pick-up date'
            item.cancelled_rejected_reffered_at = timezone.now()
            item.save()
            
            # Send notification to the recipient
            send_medicine_expired_notification(item)
            
            total_updated += 1
        
        logger.info(f"[{now}] Marked {total_updated} expired CONFIRMED medicine request items as 'cancelled' and archived (based on confirmed_at)")
    
    if total_updated == 0:
        logger.debug(f"[{now}] No expired CONFIRMED medicine request items to cancel")
    
    return total_updated


def send_medicine_expired_notification(medicine_request_item):
    """
    Send notification to resident when their confirmed medicine request has expired
    """
    try:
        notifier = NotificationQueries()
        
        # Get the medicine request and resident profile
        medicine_request = medicine_request_item.medreq_id
        resident_profile = medicine_request.rp_id
        
        if not resident_profile:
            print(f"⚠️ No resident profile found for expired medicine request item {medicine_request_item.medreqitem_id}")
            return False
        
        # Get resident name
        resident_name = "Resident"
        if resident_profile.per:
            resident_name = f"{resident_profile.per.per_fname} {resident_profile.per.per_lname}"
        
        # Get medicine name
        if medicine_request_item.med:
            med = medicine_request_item.med
            med_dsg = med.med_dsg if hasattr(med, 'med_dsg') and med.med_dsg else ""
            med_dsg_unit = med.med_dsg_unit if hasattr(med, 'med_dsg_unit') and med.med_dsg_unit else ""
            med_form = med.med_form if hasattr(med, 'med_form') and med.med_form else ""
            medicine_name = f"{med.med_name} {med_dsg}{med_dsg_unit} {med_form}".strip()
        else:
            medicine_name = "medicine"
        
        # Create notification
        success = notifier.create_notification(
            title="Medicine Request Automatic Cancellation",
            message=(
                f"Your confirmed medicine request for {medicine_name} has expired "
                f"because you did not pick it up within 2 days. The request has been cancelled. "
                f"You can submit a new request if you still need the medicine."
            ),
            recipients=[str(resident_profile.rp_id)],
            notif_type="Request Cancellation",
            web_route="/services/medicine/requests/cancelled",
            web_params={"request_id": str(medicine_request.medreq_id), "status": "cancelled"},
            mobile_route="/(health)/medicine-request/my-requests",
            mobile_params={"request_id": str(medicine_request.medreq_id)},
        )
        
        if success:
            print(f"✅ Medicine expired notification sent to {resident_name} for request item {medicine_request_item.medreqitem_id}")
        else:
            print(f"❌ Failed to send medicine expired notification to {resident_name} for request item {medicine_request_item.medreqitem_id}")
            
        return success
        
    except Exception as e:
        print(f"❌ Error sending medicine expired notification for request item {medicine_request_item.medreqitem_id}: {str(e)}")
        return False


def send_daily_pending_medicine_requests_notification():
    """
    Daily task that sends notification if there are pending medicine requests
    Counts unique medreq_id to avoid duplicate counting of the same request
    """
    try:
        from .models import MedicineRequestItem
        from apps.inventory.signals import get_health_staff_recipients
        
        # Count unique pending medicine requests (distinct medreq_id)
        pending_requests_count = MedicineRequestItem.objects.filter(
            status__iexact='pending'
        ).values('medreq_id').distinct().count()
        
        if pending_requests_count > 0:
            # Get health staff recipients
            recipients = get_health_staff_recipients()
            
            if recipients:
                notification = NotificationQueries()
                
                # Create notification message based on count
                if pending_requests_count == 1:
                    message = "There is 1 pending medicine request waiting for review."
                else:
                    message = f"There are {pending_requests_count} pending medicine requests waiting for review."
                
                success = notification.create_notification(
                    title="Pending Medicine Requests Alert",
                    message=message,
                    recipients=recipients,
                    notif_type="REMINDER",
                    web_route="/services/medicine/requests/pending",  # Route to medicine requests page
                    web_params={"status": "pending"},  # Filter to show pending requests
                    mobile_route=None,
                    mobile_params=None
                )
                
                if success:
                    logger.info(f"✅ Daily pending medicine requests notification sent: {pending_requests_count} unique pending requests")
                else:
                    logger.error("❌ Failed to send daily pending medicine requests notification")
            else:
                logger.warning("⚠️ No health staff recipients found for pending medicine requests notification")
        else:
            logger.info("⏭️ No pending medicine requests, skipping daily notification")
            
        return pending_requests_count
        
    except Exception as e:
        logger.error(f"❌ Error in daily pending medicine requests notification: {e}")
        return 0