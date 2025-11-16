# apps/inventory/tasks.py
import logging
from django.utils import timezone
from django.core.cache import cache
from .models import MedicineInventory, VaccineStock, FirstAidInventory, CommodityInventory, ImmunizationStock

logger = logging.getLogger(__name__)

def run_inventory_checks():
    """Periodic task to scan all inventory - notifications are ONE-TIME ONLY"""
    logger.info("🔎 Running inventory checks (one-time notifications only)...")
    
    try:
        # Get all inventory types
        all_items = (
            list(MedicineInventory.objects.all()) +
            list(FirstAidInventory.objects.all()) +
            list(CommodityInventory.objects.all()) +
            list(VaccineStock.objects.all()) +
            list(ImmunizationStock.objects.all())
        )
        
        logger.info(f"Found {len(all_items)} inventory items to evaluate")
        
        notified_count = 0
        skipped_count = 0
        
        for item in all_items:
            try:
                # Use the main notification logic with permanent tracking
                from .signals import _notify_for_instance
                if _notify_for_instance(item):
                    notified_count += 1
                else:
                    skipped_count += 1
                    
            except Exception as e:
                logger.error(f"❌ Error checking inventory item {item}: {e}")
        
        logger.info(f"📊 Inventory check completed: {notified_count} new notifications, {skipped_count} already notified")
        return notified_count
        
    except Exception as e:
        logger.error(f"❌ Failed to run inventory checks: {e}")
        return 0