from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Business
from apps.notification.utils import create_notification

@receiver(pre_save, sender=Business)
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
