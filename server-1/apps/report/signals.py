from django.dispatch import receiver
from django.db.models.signals import post_save
from .models import AcknowledgementReport

@receiver(post_save, sender=AcknowledgementReport)
def handle_archive_ir(sender, instance, created, **kwargs):
  if hasattr(instance, 'ir') and instance.ir and instance.ar_status.lower() == "signed":
    if not created:
      instance.ir.ir_is_archive=True
      instance.ir.save()
  