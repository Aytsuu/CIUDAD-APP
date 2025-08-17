# from django.utils import timezone
# from .models import Announcement

# def update_ann_status():
#     now = timezone.now()  # UTC internally

#     print(f"[{timezone.localtime(now)}] Checking announcements...")

#     Announcement.objects.filter(
#         ann_end_at__lte=now,
#         ann_status="Active"
#     ).update(ann_status="Inactive")

#     Announcement.objects.filter(
#         ann_start_at__lte=now,
#         ann_end_at__gt=now,
#         ann_status="Inactive"
#     ).update(ann_status="Active")

#     Announcement.objects.filter(
#         ann_start_at__gt=now,
#         ann_status="Active"
#     ).update(ann_status="Inactive")
