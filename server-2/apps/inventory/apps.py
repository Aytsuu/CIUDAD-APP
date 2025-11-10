from django.apps import AppConfig
from django.db.models.signals import post_migrate
import logging

logger = logging.getLogger(__name__)

def create_initial_categories(sender, **kwargs):
    from .models import VaccineCategory  # Import inside function to avoid circular import
    VaccineCategory.objects.get_or_create(
        vaccat_id=1, defaults={'vaccat_type': 'Vaccine'}
    )
    VaccineCategory.objects.get_or_create(
        vaccat_id=2, defaults={'vaccat_type': 'Immunization Supplies'}
    )

class InventoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.inventory'
    
    def ready(self):
        post_migrate.connect(create_initial_categories, sender=self)
        # Import signals to enable realtime inventory notifications when models change
        try:
            from . import signals  # noqa: F401
            logger.info("✅✅✅ Inventory signals module imported (realtime notifications enabled) ✅✅✅")
            logger.info(f"📡 Registered signal handlers: inventory_post_save, capture_previous_qty, inventory_post_delete")
        except Exception as e:
            logger.exception(f"❌❌❌ Failed to import inventory signals: {e}")