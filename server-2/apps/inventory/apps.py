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

def auto_archive_expired_items_on_migrate(sender, **kwargs):
    from .task import (
        auto_archive_expired_commodities,
        auto_archive_expired_first_aid,
        auto_archive_expired_medicines,
        auto_archive_expired_items,
    )
    try:
        archived_com_count = auto_archive_expired_commodities()
        archived_fa_count = auto_archive_expired_first_aid()
        archived_med_count = auto_archive_expired_medicines()
        archived_items_count = auto_archive_expired_items()
        logger.info(f"Auto-archived {archived_com_count} expired commodities after migration.")
        logger.info(f"Auto-archived {archived_fa_count} expired first aid items after migration.")
        logger.info(f"Auto-archived {archived_med_count} expired medicines after migration.")
        logger.info(f"Auto-archived {archived_items_count} expired items after migration.")
    except Exception as e:
        logger.error(f"Failed to auto-archive expired items: {e}")

def run_inventory_alerts_on_migrate(sender, **kwargs):
    """
    Run inventory alerts (low stock, near expiry, out of stock) after migration
    This will run ONCE after migrations and notify health staff about inventory issues
    """
    from .task import run_all_inventory_alerts
    try:
        logger.info("Running inventory alerts after migration...")
        run_all_inventory_alerts()
        logger.info("Completed inventory alerts after migration")
    except Exception as e:
        logger.error(f"Failed to run inventory alerts: {e}")

class InventoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.inventory'
    
    def ready(self):
        post_migrate.connect(create_initial_categories, sender=self)
        post_migrate.connect(auto_archive_expired_items_on_migrate, sender=self)
        post_migrate.connect(run_inventory_alerts_on_migrate, sender=self)