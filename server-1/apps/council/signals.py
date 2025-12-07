from django.db.models.signals import post_delete
from django.dispatch import receiver
from apps.council.models import *
import logging

logger = logging.getLogger(__name__)  # This will be 'your_app.signals'

@receiver(post_delete, sender=MinutesOfMeeting)
def delete_related_momfile(sender, instance, **kwargs):
    if instance.momf_id:
        try:
            instance.momf_id.delete()
            logger.info(f"Deleted related MOMFile: {instance.momf_id.momf_id}")
        except Exception as e:
            logger.error(f"Failed to delete related MOMFile: {str(e)}")