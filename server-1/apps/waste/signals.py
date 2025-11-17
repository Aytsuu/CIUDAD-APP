from datetime import datetime
from zoneinfo import ZoneInfo
from django.utils import timezone
from .models import WasteHotspot, WasteEvent
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import *
from apps.notification.utils import create_notification


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
def create_garbage_request_notification(sender, instance, created, **kwargs):
    if not created and hasattr(instance, '_previous_status'):
        previous_status = instance._previous_status
        current_status = instance.garb_req_status
        
        notify_statuses = ['accepted', 'completed', 'rejected']
        
        if (previous_status != current_status and 
            current_status.lower() in notify_statuses and 
            instance.rp and 
            hasattr(instance.rp, 'account') and 
            instance.rp.account):
            
            account = instance.rp.account
                        
            status_config = {
                'accepted': {
                    'title': 'Request Accepted',
                    'message': 'Your garbage pickup request has been accepted and is scheduled for collection.',
                    'notif_type': 'REQUEST'
                },
                'completed': {
                    'title': 'Request Completed', 
                    'message': 'Your garbage pickup has been completed. Thank you!',
                    'notif_type': 'REQUEST'
                },
                'rejected': {
                    'title': 'Request Rejected',
                    'message': 'Your garbage pickup request has been rejected.',
                    'notif_type': 'REQUEST'
                }
            }
            
            config = status_config.get(current_status.lower())
            
            # FIX: Wrap the account in a list
            create_notification(
                title=config['title'],
                message=config['message'],
                recipients=[account],  # Pass as a list with one account
                notif_type=config['notif_type'],
                mobile_route="/(my-request)/garbage-pickup/garbage-pickup-tracker",
            )
