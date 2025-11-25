from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Business
from apps.notification.utils import create_notification

@receiver(post_save, sender=Business)
def notify_approved_business(sender, instance, created, **kwargs):
  if not created:
    # Get current data before the update
    current_data = Business.objects.filter(bus_id=instance.bus_id).first()

    # Check if previous state is pending
    if current_data.bus_status.lower() == "pending" and \
      instance.bus_status.lower() == "active":
        create_notification(
          title="Approved Business",
          message=(
              f"Your business ({instance.bus_name}) registration request has been approved."
          ),
          recipients=[instance.rp.rp_id if instance.rp else instance.br.br_id],
          notif_type="",
          web_route="",
          web_params={},
          mobile_route="/(business)",
          mobile_params={},
        )

#  response = receiver(signal=self, sender=sender, **named)
# TypeError: notify_approved_business() missing 1 required positional argument: 'created'
# Request: POST /profiling/complete/registration/ Status: 500 Duration: 14.49s
# [21/Nov/2025 20:03:19] "POST /profiling/complete/registration/ HTTP/1.1" 500 26415