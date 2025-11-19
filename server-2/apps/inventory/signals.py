import logging
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.core.cache import cache
from django.db import models

from .models import (
    MedicineInventory, FirstAidInventory, CommodityInventory,
    VaccineStock, ImmunizationStock
)
from apps.administration.models import Staff
from utils.create_notification import NotificationQueries

logger = logging.getLogger(__name__)

# ---------------------- Notification Helpers ----------------------

def get_health_staff_recipients():
    """Get all staff members in HEALTH STAFFS group or specific positions"""
    try:
        health_staffs = Staff.objects.filter(
            models.Q(pos__pos_group='HEALTH STAFFS') |
            models.Q(pos__pos_title__in=['BARANGAY HEALTH WORKER', 'MIDWIFE', 'ADMIN'])
        ).select_related('rp', 'pos').distinct()
        recipient_ids = [str(staff.staff_id) for staff in health_staffs]
        logger.info(f"Found {len(recipient_ids)} health staff recipients")
        return recipient_ids
    except Exception as e:
        logger.error(f"Error getting health staff recipients: {e}")
        return []

def send_inventory_notification(title, message, inventory_type, item_name, quantity=None):
    """Send inventory notification to all health staff"""
    try:
        notifier = NotificationQueries()
        recipients = get_health_staff_recipients()
        if not recipients:
            logger.warning("No health staff recipients found for inventory notification")
            return False
        
        success = notifier.create_notification(
            title=title,
            message=message,
            recipients=recipients,
            notif_type="REMINDER",
            web_route="", 
            web_params="",
            mobile_route="", 
            mobile_params="",
        )
        if success:
            logger.info(f"✅ {inventory_type} alert sent for {item_name} to {len(recipients)} staff")
        else:
            logger.error(f"❌ Failed to send {inventory_type} alert for {item_name}")
        return success
    except Exception as e:
        logger.error(f"❌ Error sending {inventory_type} alert: {e}")
        return False

def has_been_notified(item_id, alert_type):
    """Check if this alert type has been sent for this item (PERMANENT)"""
    cache_key = f"notified_{alert_type}_{item_id}"
    return cache.get(cache_key) is not None

def mark_as_notified(item_id, alert_type):
    """Mark this alert type as sent for this item (45 days)"""
    cache_key = f"notified_{alert_type}_{item_id}"
    seconds_in_45_days = 60 * 60 * 24 * 45
    cache.set(cache_key, True, seconds_in_45_days)
    logger.info(f"📝 Marked {alert_type} notification as sent for {item_id} (expires in 45 days)")

# ---------------------- Inventory Helpers ----------------------

def _get_available_and_unit(obj):
    """Return (available_qty, unit_str, model_key_name) based on instance type"""
    if isinstance(obj, MedicineInventory):
        available = obj.minv_qty_avail or 0
        unit = obj.minv_qty_unit or "pcs"
        if unit.lower() == "boxes":
            unit = "pcs"
        return available, unit, f"medicine_{obj.minv_id}"
    if isinstance(obj, FirstAidInventory):
        available = int(obj.finv_qty_avail or 0)
        unit = obj.finv_qty_unit or "pcs"
        if unit.lower() == "boxes":
            unit = "pcs"
        return available, unit, f"firstaid_{obj.finv_id}"
    if isinstance(obj, CommodityInventory):
        available = int(obj.cinv_qty_avail or 0)
        unit = obj.cinv_qty_unit or "pcs"
        if unit.lower() == "boxes":
            unit = "pcs"
        return available, unit, f"commodity_{obj.cinv_id}"
    if isinstance(obj, VaccineStock):
        available_doses = obj.vacStck_qty_avail or 0
        solvent_type = (obj.solvent or "").lower()
        if solvent_type == "diluent":
            return available_doses, "containers", f"vaccine_{obj.vacStck_id}"
        if solvent_type == "doses":
            dose_ml = obj.dose_ml or 1
            import math
            vials = math.ceil(available_doses / dose_ml) if available_doses > 0 else 0
            unit = f"doses ({vials} vial{'s' if vials != 1 else ''})"
            return available_doses, unit, f"vaccine_{obj.vacStck_id}"
        return available_doses, "vials", f"vaccine_{obj.vacStck_id}"
    if isinstance(obj, ImmunizationStock):
        available = obj.imzStck_avail or 0
        unit = obj.imzStck_unit or "pcs"
        if unit.lower() == "boxes":
            unit = "pcs"
        return available, unit, f"immunization_{obj.imzStck_id}"
    return 0, "", "unknown"

def _is_low_stock_by_rules(obj, available):
    if isinstance(obj, (MedicineInventory, FirstAidInventory, CommodityInventory, ImmunizationStock)):
        unit = getattr(obj, 'minv_qty_unit', None) or getattr(obj, 'finv_qty_unit', None) or getattr(obj, 'cinv_qty_unit', None) or getattr(obj, 'imzStck_unit', None)
        if unit and str(unit).lower() == 'boxes':
            return available <= 2 and available > 0
        return available <= 20 and available > 0
    if isinstance(obj, VaccineStock):
        return available <= 10 and available > 0
    return False

def _get_item_display_name(instance):
    """Get display name for any inventory item"""
    try:
        if isinstance(instance, MedicineInventory) and instance.med_id:
            return getattr(instance.med_id, 'med_name', 'Medicine Item')
        elif isinstance(instance, FirstAidInventory) and instance.faid_id:
            return getattr(instance.faid_id, 'faid_name', 'First Aid Item')
        elif isinstance(instance, CommodityInventory) and instance.com_id:
            return getattr(instance.com_id, 'com_name', 'Commodity Item')
        elif isinstance(instance, VaccineStock) and instance.vac_id:
            return getattr(instance.vac_id, 'vac_name', 'Vaccine Item')
        elif isinstance(instance, ImmunizationStock) and instance.imz_id:
            return getattr(instance.imz_id, 'imz_name', 'Immunization Item')
        return 'Inventory Item'
    except Exception:
        return 'Inventory Item'

def _is_archived(instance):
    """Check if item is archived"""
    try:
        if hasattr(instance, 'inv_id') and instance.inv_id:
            return getattr(instance.inv_id, 'is_Archived', False)
    except Exception:
        pass
    return False

def _auto_archive_if_expired(instance):
    """Auto-archive items expired >10 days - but don't block notifications"""
    from datetime import timedelta
    try:
        if not hasattr(instance, 'inv_id') or not instance.inv_id:
            return False
        
        # Check if already archived
        if _is_archived(instance):
            return False
            
        if not instance.inv_id.expiry_date:
            return False
            
        today = timezone.now().date()
        archive_threshold = today - timedelta(days=10)
        
        if instance.inv_id.expiry_date <= archive_threshold:
            logger.info(f"🗄️ Auto-archiving item expired on {instance.inv_id.expiry_date}")
            available, unit, item_id = _get_available_and_unit(instance)
            display_name = _get_item_display_name(instance)
            
            try:
                instance.inv_id.is_Archived = True
                instance.inv_id.save()
                
                send_inventory_notification(
                    title=f"Item Auto-Archived - {display_name}",
                    message=f"{display_name} has been automatically archived (expired >10 days ago on {instance.inv_id.expiry_date}). Quantity: {available} {unit}.",
                    inventory_type="EXPIRED",
                    item_name=display_name,
                    quantity=available
                )
                logger.info(f"✅ Auto-archived {display_name} - Qty: {available} {unit}")
                return True
            except Exception as e:
                logger.error(f"❌ Error saving archive status: {e}")
                
    except Exception as e:
        logger.error(f"❌ Error in auto-archive: {e}", exc_info=True)
    return False

# ---------------------- Notification Logic ----------------------

def _notify_for_instance(instance):
    """Check instance quantities and send appropriate notifications - ONE TIME ONLY"""
    from datetime import timedelta

    # First check if we should auto-archive
    _auto_archive_if_expired(instance)

    available, unit, item_id = _get_available_and_unit(instance)
    display_name = _get_item_display_name(instance)
    is_archived = _is_archived(instance)

    # EXPIRED / NEAR_EXPIRY - Check even if archived
    try:
        if hasattr(instance, 'inv_id') and instance.inv_id and instance.inv_id.expiry_date:
            today = timezone.now().date()
            expiry_date = instance.inv_id.expiry_date
            days_until_expiry = (expiry_date - today).days

            # EXPIRED (always notify even if available = 0 or archived)
            if expiry_date <= today:
                if not has_been_notified(item_id, "EXPIRED"):
                    send_inventory_notification(
                        title=f"Item Expired - {display_name}",
                        message=f"{display_name} has EXPIRED on {expiry_date}. Current stock: {available} {unit}. Please remove from inventory.",
                        inventory_type="EXPIRED",
                        item_name=display_name,
                        quantity=available
                    )
                    mark_as_notified(item_id, "EXPIRED")
                    logger.info(f"✅ Sent ONE-TIME EXPIRED notification for {display_name}")
                    return True
                logger.info(f"⏭️ EXPIRED notification already sent for {display_name}")
                return False

            # NEAR EXPIRY (only if stock > 0, even if archived)
            elif 0 < days_until_expiry <= 30 and available > 0:
                if not has_been_notified(item_id, "NEAR_EXPIRY"):
                    send_inventory_notification(
                        title=f"Near Expiry Alert - {display_name}",
                        message=f"{display_name} expires in {days_until_expiry} days on {expiry_date}. Current stock: {available} {unit}. Please use soonest.",
                        inventory_type="NEAR_EXPIRY",
                        item_name=display_name,
                        quantity=available
                    )
                    mark_as_notified(item_id, "NEAR_EXPIRY")
                    logger.info(f"✅ Sent ONE-TIME NEAR_EXPIRY notification for {display_name}")
                    return True
                logger.info(f"⏭️ NEAR_EXPIRY notification already sent for {display_name}")
                return False

    except Exception as e:
        logger.error(f"❌ Error checking expiry: {e}", exc_info=True)

    # Don't check stock status for archived items (except expiry)
    if is_archived:
        logger.info(f"⏭️ Item {display_name} is archived, skipping stock notifications")
        return False

    # OUT OF STOCK (only if not expired and not archived)
    if available <= 0:
        if not has_been_notified(item_id, "OUT_OF_STOCK"):
            send_inventory_notification(
                title=f"Out of Stock Alert - {display_name}",
                message=f"{display_name} is OUT OF STOCK. Please restock.",
                inventory_type="OUT_OF_STOCK",
                item_name=display_name
            )
            mark_as_notified(item_id, "OUT_OF_STOCK")
            logger.info(f"✅ Sent ONE-TIME OUT_OF_STOCK notification for {display_name}")
            return True
        logger.info(f"⏭️ OUT_OF_STOCK notification already sent for {display_name}")
        return False

    # LOW STOCK (only if not expired and not archived)
    if _is_low_stock_by_rules(instance, available):
        if not has_been_notified(item_id, "LOW_STOCK"):
            send_inventory_notification(
                title=f"Low Stock Alert - {display_name}",
                message=f"{display_name} is running low. Current stock: {available} {unit}.",
                inventory_type="LOW_STOCK",
                item_name=display_name,
                quantity=available
            )
            mark_as_notified(item_id, "LOW_STOCK")
            logger.info(f"✅ Sent ONE-TIME LOW_STOCK notification for {display_name}")
            return True
        logger.info(f"⏭️ LOW_STOCK notification already sent for {display_name}")
        return False

    logger.info(f"⏭️ No notifications needed for {display_name}")
    return False

# ---------------------- Signal Handlers ----------------------

@receiver(pre_save, sender=MedicineInventory)
@receiver(pre_save, sender=FirstAidInventory)
@receiver(pre_save, sender=CommodityInventory)
@receiver(pre_save, sender=VaccineStock)
@receiver(pre_save, sender=ImmunizationStock)
def capture_previous_qty(sender, instance, **kwargs):
    """Capture previous quantity before save"""
    if not instance.pk:
        instance._previous_qty = None
        return
    try:
        prev = sender.objects.get(pk=instance.pk)
        if isinstance(instance, MedicineInventory):
            instance._previous_qty = getattr(prev, 'minv_qty_avail', 0)
        elif isinstance(instance, FirstAidInventory):
            instance._previous_qty = int(getattr(prev, 'finv_qty_avail', 0))
        elif isinstance(instance, CommodityInventory):
            instance._previous_qty = int(getattr(prev, 'cinv_qty_avail', 0))
        elif isinstance(instance, VaccineStock):
            instance._previous_qty = getattr(prev, 'vacStck_qty_avail', 0)
        elif isinstance(instance, ImmunizationStock):
            instance._previous_qty = getattr(prev, 'imzStck_avail', 0)
    except sender.DoesNotExist:
        instance._previous_qty = None

@receiver(post_save, sender=MedicineInventory)
@receiver(post_save, sender=FirstAidInventory)
@receiver(post_save, sender=CommodityInventory)
@receiver(post_save, sender=VaccineStock)
@receiver(post_save, sender=ImmunizationStock)
def inventory_post_save(sender, instance, created, **kwargs):
    try:
        prev = getattr(instance, '_previous_qty', None)
        available, _, item_id = _get_available_and_unit(instance)
        if created or prev is None or prev != available:
            _notify_for_instance(instance)
    except Exception as e:
        logger.exception(f"❌ Error in inventory_post_save: {e}")

@receiver(post_delete, sender=MedicineInventory)
@receiver(post_delete, sender=FirstAidInventory)
@receiver(post_delete, sender=CommodityInventory)
@receiver(post_delete, sender=VaccineStock)
@receiver(post_delete, sender=ImmunizationStock)
def inventory_post_delete(sender, instance, **kwargs):
    try:
        _notify_for_instance(instance)
    except Exception:
        logger.exception("Error in inventory_post_delete signal")