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
            notif_type="CANCELLED",
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
    Daily task that sends notification for NEW pending medicine requests only
    Tracks which requests have already been notified to avoid duplicate notifications
    Only sends notification for requests that haven't been notified before
    """
    try:
        from django.core.cache import cache
        from django.utils import timezone
        from .models import MedicineRequest, MedicineRequestItem
        from apps.inventory.signals import get_health_staff_recipients
        
        # Get all pending medicine requests
        pending_requests = MedicineRequest.objects.filter(
            items__status__iexact='pending'
        ).distinct()
        
        if not pending_requests.exists():
            logger.info("⏭️ No pending medicine requests found")
            return 0
        
        # Get cache key for tracking notified requests
        cache_key = "notified_pending_medicine_requests"
        notified_request_ids = cache.get(cache_key, set())
        
        # Find NEW pending requests that haven't been notified yet
        new_pending_requests = []
        for request in pending_requests:
            if request.medreq_id not in notified_request_ids:
                new_pending_requests.append(request)
        
        new_pending_count = len(new_pending_requests)
        
        if new_pending_count > 0:
            # Get health staff recipients
            recipients = get_health_staff_recipients()
            
            if recipients:
                notification = NotificationQueries()
                
                # Create notification message based on count
                if new_pending_count == 1:
                    message = f"There is 1 new medicine request (ID: {new_pending_requests[0].medreq_id}) with pending items waiting for review and action."
                else:
                    request_ids = [req.medreq_id for req in new_pending_requests[:3]]  # Show first 3 IDs
                    ids_text = ", ".join(request_ids)
                    if new_pending_count > 3:
                        ids_text += f" and {new_pending_count - 3} more"
                    message = f"There are {new_pending_count} new medicine requests ({ids_text}) with pending items waiting for review and action."
                
                success = notification.create_notification(
                    title="New Pending Medicine Requests Alert",
                    message=message,
                    recipients=recipients,
                    notif_type="PENDING",
                    web_route="/services/medicine/requests/pending",
                    web_params={"status": "pending"},
                    mobile_route=None,
                    mobile_params=None
                )
                
                if success:
                    # Add the new request IDs to the notified set
                    for request in new_pending_requests:
                        notified_request_ids.add(request.medreq_id)
                    
                    # Update cache with no expiration (persistent until status changes)
                    cache.set(cache_key, notified_request_ids, None)
                    
                    logger.info(f"✅ New pending medicine requests notification sent: {new_pending_count} new requests")
                else:
                    logger.error("❌ Failed to send new pending medicine requests notification")
            else:
                logger.warning("⚠️ No health staff recipients found for pending medicine requests notification")
        else:
            logger.info("⏭️ No new pending medicine requests to notify about")
        
        # Clean up cache: remove request IDs that are no longer pending
        current_pending_ids = set(req.medreq_id for req in pending_requests)
        notified_request_ids = notified_request_ids.intersection(current_pending_ids)
        cache.set(cache_key, notified_request_ids, None)
            
        return new_pending_count
        
    except Exception as e:
        logger.error(f"❌ Error in pending medicine requests notification: {e}")
        return 0