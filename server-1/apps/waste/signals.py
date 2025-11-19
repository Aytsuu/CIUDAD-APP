from datetime import datetime
from email.mime import message
from zoneinfo import ZoneInfo
from django.utils import timezone
from .models import WasteHotspot, WasteEvent
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import *
from apps.notification.utils import create_notification
from apps.administration.models import Staff


def archive_completed_hotspots():
    print('Running trigger...')
    local_tz = ZoneInfo("Asia/Manila")
    now = timezone.now().astimezone(local_tz)
    print(f'Local time now: {now}')

    hotspots = WasteHotspot.objects.filter(wh_is_archive=False)
    to_archive = []

    for hs in hotspots:
        # wh_date + wh_end_time are assumed to be in local time
        naive_end_dt = datetime.combine(hs.wh_date, hs.wh_end_time)
        local_end_dt = timezone.make_aware(naive_end_dt, local_tz)

        print(f"Checking {hs.wh_num}: ends at {local_end_dt}, now is {now}")

        if local_end_dt < now:
            print(f"Archiving {hs.wh_num}")
            to_archive.append(hs.wh_num)

    updated = WasteHotspot.objects.filter(wh_num__in=to_archive).update(wh_is_archive=True)
    print(f"Archived {updated} hotspot(s)")
    return updated

def archive_passed_waste_events():
    """Automatically archive waste events when their date and time have passed"""
    local_tz = ZoneInfo("Asia/Manila")
    now = timezone.now().astimezone(local_tz)
    
    events = WasteEvent.objects.filter(we_is_archive=False, we_date__isnull=False, we_time__isnull=False)
    to_archive = []
    
    for event in events:
        # Combine we_date and we_time, assume local time
        naive_event_dt = datetime.combine(event.we_date, event.we_time)
        local_event_dt = timezone.make_aware(naive_event_dt, local_tz)
        
        if local_event_dt < now:
            to_archive.append(event.we_num)
    
    if to_archive:
        updated = WasteEvent.objects.filter(we_num__in=to_archive).update(we_is_archive=True)
        print(f"Archived {updated} waste event(s)")
        return updated
    
    return 0

# ============================= WASTE REPORT CREATE ==============================
@receiver(post_save, sender=WasteReport)
def create_waste_report_notification_on_create(sender, instance, created, **kwargs):
    if created:
        # Get all staff with ADMIN position
        admin_staff = Staff.objects.filter(
            pos__pos_title__iexact='ADMIN'
        ).select_related('rp__account')
        
        # Get the account IDs of admin staff
        admin_accounts = []
        for staff in admin_staff:
            if staff.rp and hasattr(staff.rp, 'account') and staff.rp.account:
                admin_accounts.append(staff.rp.account)
        
        if admin_accounts:
            create_notification(
                title='New Waste Report Filed', 
                message=f'Report {instance.rep_id} is waiting for your review.',
                recipients=admin_accounts,
                notif_type='REPORT',
                mobile_route="/(waste)/illegal-dumping/staff/illegal-dump-view-staff",
                mobile_params={'rep_id': instance.rep_id},
                web_route="/waste-illegaldumping-report",
            )

# ============================= GARBAGE PICKUP REQUEST CREATE ==============================
@receiver(post_save, sender=Garbage_Pickup_Request)
def create_garbage_pickup_notification_on_create(sender, instance, created, **kwargs):
    if created:
        # Get all staff with ADMIN position
        admin_staff = Staff.objects.filter(
            pos__pos_title__iexact='ADMIN'
        ).select_related('rp__account')
        
        # Get the account IDs of admin staff
        admin_accounts = []
        for staff in admin_staff:
            if staff.rp and hasattr(staff.rp, 'account') and staff.rp.account:
                admin_accounts.append(staff.rp.account)
        
        if admin_accounts:
            create_notification(
                title='New Garbage Pickup Request', 
                message=f'Garbage Pickup Request {instance.garb_id} is waiting for your review.',
                recipients=admin_accounts,
                notif_type='REQUEST',
                mobile_route="/(waste)/garbage-pickup/staff/main-request",
                # mobile_params={'rep_id': instance.rep_id},
                web_route="/garbage-pickup-request",
            )

#===================================== GARBAGE PICKUP REQUEST STATUS UDPATE ================================
@receiver(pre_save, sender=Garbage_Pickup_Request)
def store_previous_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            previous = Garbage_Pickup_Request.objects.get(pk=instance.pk)
            instance._previous_status = previous.garb_req_status
        except Garbage_Pickup_Request.DoesNotExist:
            instance._previous_status = None
    else:
        instance._previous_status = None

@receiver(post_save, sender=Garbage_Pickup_Request)
def create_garbage_request_notification_on_update(sender, instance, created, **kwargs):
    if not created and hasattr(instance, '_previous_status'):
        previous_status = instance._previous_status
        current_status = instance.garb_req_status
        
        notify_statuses = ['accepted', 'rejected']  # Remove 'completed' from here
        
        if (previous_status != current_status and 
            current_status.lower() in notify_statuses and 
            instance.rp and 
            hasattr(instance.rp, 'account') and 
            instance.rp.account):
            
            account = instance.rp.account
                        
            status_config = {
                'accepted': {
                    'title': 'Request Accepted',
                    'message': f'Your garbage pickup request {instance.garb_id} has been accepted and is scheduled for collection.',
                    'notif_type': 'REQUEST'
                },
                'rejected': {
                    'title': 'Request Rejected',
                    'message': f'Your garbage pickup request {instance.garb_id} has been rejected.',
                    'notif_type': 'REQUEST'
                }
            }
            
            config = status_config.get(current_status.lower())
            
            create_notification(
                title=config['title'],
                message=config['message'],
                recipients=[account],
                notif_type=config['notif_type'],
                mobile_route="/(my-request)/garbage-pickup/garbage-pickup-tracker",
            )

@receiver(post_save, sender=Pickup_Confirmation)
def create_completion_notifications(sender, instance, created, **kwargs):
    garbage_request = instance.garb_id
    
    # Partial completion - only staff confirmed
    if instance.conf_staff_conf and not instance.conf_resident_conf:
        # Notify resident that staff has completed pickup
        if garbage_request.rp and hasattr(garbage_request.rp, 'account') and garbage_request.rp.account:
            create_notification(
                title='Pickup Done',
                message=f'Garbage pickup for request {garbage_request.garb_id} is done. Please confirm completion.',
                recipients=[garbage_request.rp.account],
                notif_type='REQUEST',
                mobile_route="/(my-request)/garbage-pickup/garbage-pickup-tracker",
            )
    
    # Full completion - both staff and resident confirmed
    elif instance.conf_staff_conf and instance.conf_resident_conf:
        # Notify resident that request is fully completed
        if garbage_request.rp and hasattr(garbage_request.rp, 'account') and garbage_request.rp.account:
            create_notification(
                title='Request Completed',
                message=f'Your garbage pickup request {garbage_request.garb_id} has been completed. Thank you!',
                recipients=[garbage_request.rp.account],
                notif_type='REQUEST',
                mobile_route="/(my-request)/garbage-pickup/garbage-pickup-tracker",
            )
        
        # Notify admin staff that request is fully completed
        admin_staff = Staff.objects.filter(
            pos__pos_title__iexact='ADMIN'
        ).select_related('rp__account')
        
        admin_accounts = []
        for staff in admin_staff:
            if staff.rp and hasattr(staff.rp, 'account') and staff.rp.account:
                admin_accounts.append(staff.rp.account)
        
        if admin_accounts:
            create_notification(
                title='Request Completed',
                message=f'Garbage pickup request {garbage_request.garb_id} has been completed and confirmed by resident.',
                recipients=admin_accounts,
                notif_type='REQUEST',
                mobile_route="/(my-request)/garbage-pickup/garbage-pickup-tracker",
            )


# ========================= WASTE REPORT STATUS UPDATE ====================
@receiver(pre_save, sender=WasteReport)
def store_previous_waste_report_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            previous = WasteReport.objects.get(pk=instance.pk)
            instance._previous_rep_status = previous.rep_status
        except WasteReport.DoesNotExist:
            instance._previous_rep_status = None
    else:
        instance._previous_rep_status = None

@receiver(post_save, sender=WasteReport)
def create_waste_report_notification_on_update(sender, instance, created, **kwargs):
    if not created and hasattr(instance, '_previous_rep_status'):
        previous_status = instance._previous_rep_status
        current_status = instance.rep_status
        
        # Only notify when status changes to 'resolved'
        if (previous_status != current_status and 
            current_status.lower() == 'resolved' and 
            instance.rp_id and 
            hasattr(instance.rp_id, 'account') and 
            instance.rp_id.account):
            
            account = instance.rp_id.account
            
            create_notification(
                title='Report Resolved',
                message=f'Your waste report {instance.rep_id} has been resolved. Thank you for helping keep our community clean!',                
                recipients=[account],
                notif_type='REPORT',
                mobile_route="/(waste)/illegal-dumping/resident/illegal-dump-res-main",
            )
