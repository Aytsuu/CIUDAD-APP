from datetime import datetime
from zoneinfo import ZoneInfo
from django.utils import timezone
from .models import WasteHotspot

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
