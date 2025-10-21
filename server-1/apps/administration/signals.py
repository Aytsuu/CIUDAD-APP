from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.waste.models import WastePersonnel
from .models import Staff

@receiver(post_save, sender=Staff)
def handle_waste_personnel(sender, instance, created, **kwargs):
    if hasattr(instance, 'pos') and instance.pos.pos_group and instance.pos.pos_group.lower() == "waste personnel":
        if created:
            WastePersonnel.objects.create(staff=instance)