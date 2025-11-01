from datetime import datetime
from zoneinfo import ZoneInfo
from django.utils import timezone
from .models import WasteHotspot, WasteEvent

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
