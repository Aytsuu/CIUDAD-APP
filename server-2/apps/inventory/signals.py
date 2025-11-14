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


def get_health_staff_recipients():
    """
    Get all staff members who are in HEALTH STAFFS group or have specific positions
    """
    try:
        # Get staff in HEALTH STAFFS group or specific positions
        health_staffs = Staff.objects.filter(
            models.Q(pos__pos_group='HEALTH STAFFS') |
            models.Q(pos__pos_title__in=['BARANGAY HEALTH WORKER', 'MIDWIFE', 'ADMIN'])
        ).select_related('rp', 'pos').distinct()
        
        recipient_ids = [str(staff.staff_id) for staff in health_staffs]
        logger.info(f"Found {len(recipient_ids)} health staff recipients for inventory notifications")
        return recipient_ids
        
    except Exception as e:
        logger.error(f"Error getting health staff recipients: {str(e)}")
        return []


def send_inventory_notification(title, message, inventory_type, item_name, quantity=None):
    """
    Send inventory notification to all health staff WITHOUT routing (pure reminders)
    """
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
            notif_type=f"REMINDER",
            # NO ROUTING - these are just reminders/alerts
            web_route="",  
            web_params="",
            mobile_route="",  
            mobile_params="",
        )
        
        if success:
            logger.info(f"✅ {inventory_type} alert sent for {item_name} to {len(recipients)} health staff")
        else:
            logger.error(f"❌ Failed to send {inventory_type} alert for {item_name}")
            
        return success
        
    except Exception as e:
        logger.error(f"❌ Error sending {inventory_type} alert: {str(e)}")
        return False


def has_been_notified(item_id, alert_type):
    """
    Check if a specific item has already been notified for a specific alert type
    """
    cache_key = f"notified_{alert_type}_{item_id}"
    return cache.get(cache_key) is not None


def mark_as_notified(item_id, alert_type):
    """
    Mark a specific item as notified for a specific alert type
    """
    cache_key = f"notified_{alert_type}_{item_id}"
    # Store for 45 days - long enough to cover any inventory cycle
    cache.set(cache_key, True, 60*60*24*45)


def _get_available_and_unit(obj):
    """Return (available_qty, unit_str, model_key_name) based on instance type"""
    
    # MEDICINE INVENTORY
    if isinstance(obj, MedicineInventory):
        available = obj.minv_qty_avail or 0
        unit = obj.minv_qty_unit or "pcs"
        # Convert boxes to pcs for display
        if unit.lower() == "boxes":
            unit = "pcs"
        return available, unit, f"medicine_{obj.minv_id}"
    
    # FIRST AID INVENTORY
    if isinstance(obj, FirstAidInventory):
        available = int(obj.finv_qty_avail or 0)
        unit = obj.finv_qty_unit or "pcs"
        # Convert boxes to pcs for display
        if unit.lower() == "boxes":
            unit = "pcs"
        return available, unit, f"firstaid_{obj.finv_id}"
    
    # COMMODITY INVENTORY
    if isinstance(obj, CommodityInventory):
        available = int(obj.cinv_qty_avail or 0)
        unit = obj.cinv_qty_unit or "pcs"
        # Convert boxes to pcs for display
        if unit.lower() == "boxes":
            unit = "pcs"
        return available, unit, f"commodity_{obj.cinv_id}"
    
    # VACCINE STOCK (special handling for doses and vials)
    if isinstance(obj, VaccineStock):
        available_doses = obj.vacStck_qty_avail or 0
        solvent_type = (obj.solvent or "").lower()
        
        # For diluent/containers, just show containers
        if solvent_type == "diluent":
            return available_doses, "containers", f"vaccine_{obj.vacStck_id}"
        
        # For doses/vials: calculate vials from doses
        if solvent_type == "doses":
            dose_ml = obj.dose_ml or 1  # doses per vial
            if dose_ml > 0:
                # Calculate vials: ceil(available_doses / dose_ml)
                import math
                vials = math.ceil(available_doses / dose_ml) if available_doses > 0 else 0
                # Format: "10 doses (2 vial/s)" or "5 doses (1 vial/s)"
                unit = f"doses ({vials} vial{'s' if vials != 1 else ''})"
            else:
                unit = "doses"
            return available_doses, unit, f"vaccine_{obj.vacStck_id}"
        
        # Default to vials if solvent type is not specified or is "vials"
        return available_doses, "vials", f"vaccine_{obj.vacStck_id}"
    
    # IMMUNIZATION STOCK
    if isinstance(obj, ImmunizationStock):
        available = obj.imzStck_avail or 0
        unit = obj.imzStck_unit or "pcs"
        # Convert boxes to pcs for display
        if unit.lower() == "boxes":
            unit = "pcs"
        return available, unit, f"immunization_{obj.imzStck_id}"
    
    return 0, "", "unknown"


def _is_low_stock_by_rules(obj, available):
    """Encapsulate the same low-stock rules used in task.py"""
    # Medicine & First Aid & Commodity & Immunization: boxes -> <=2 else <=20
    if isinstance(obj, (MedicineInventory, FirstAidInventory, CommodityInventory, ImmunizationStock)):
        unit = getattr(obj, 'minv_qty_unit', None) or getattr(obj, 'finv_qty_unit', None) or getattr(obj, 'cinv_qty_unit', None) or getattr(obj, 'imzStck_unit', None)
        if unit and str(unit).lower() == 'boxes':
            return available <= 2 and available > 0
        return available <= 20 and available > 0

    # VaccineStock: diluent or vaccine -> threshold 10
    if isinstance(obj, VaccineStock):
        return available <= 10 and available > 0

    return False


def _auto_archive_if_expired(instance):
    """Auto-archive items that expired more than 10 days ago."""
    from datetime import timedelta
    
    try:
        if not hasattr(instance, 'inv_id') or not instance.inv_id:
            return False
            
        # Skip if already archived
        if instance.inv_id.is_Archived:
            return False
            
        # Check if expired more than 10 days ago
        if not instance.inv_id.expiry_date:
            return False
            
        today = timezone.now().date()
        archive_threshold = today - timedelta(days=10)
        
        if instance.inv_id.expiry_date <= archive_threshold:
            logger.info(f"🗄️ Auto-archiving item expired on {instance.inv_id.expiry_date} (>10 days ago)")
            
            available, unit, item_id = _get_available_and_unit(instance)
            
            # Get display name
            try:
                name = getattr(instance, 'med_id', None) or getattr(instance, 'faid_id', None) or getattr(instance, 'com_id', None) or getattr(instance, 'vac_id', None) or getattr(instance, 'imz_id', None)
                display_name = getattr(name, 'med_name', None) or getattr(name, 'faid_name', None) or getattr(name, 'com_name', None) or getattr(name, 'vac_name', None) or getattr(name, 'imz_name', None) or 'Item'
            except Exception:
                display_name = 'Item'
            
            # Archive the inventory
            instance.inv_id.is_Archived = True
            instance.inv_id.save()
            
            # Send notification about auto-archive
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
        logger.error(f"❌ Error in auto-archive: {e}", exc_info=True)
    
    return False


def _notify_for_instance(instance):
    """Check instance quantities and send appropriate notifications (low / out of stock / expired / near expiry)."""
    from datetime import timedelta

    # First, check if item should be auto-archived (expired >10 days)
    was_archived = _auto_archive_if_expired(instance)
    if was_archived:
        logger.info(f"🗄️ Item was auto-archived, skipping further notifications")
        return

    # Check if item is archived - don't send notifications for archived items
    try:
        if hasattr(instance, 'inv_id') and instance.inv_id and instance.inv_id.is_Archived:
            logger.info(f"⏭️ Skipping notification - item is archived")
            return
    except Exception as e:
        logger.debug(f"Could not check archived status: {e}")

    available, unit, item_id = _get_available_and_unit(instance)
    
    logger.info(f"🔍 SIGNAL DEBUG: Checking {item_id} - Available: {available}, Unit: {unit}")
    
    # CHECK EXPIRY STATUS FIRST (most urgent)
    try:
        if hasattr(instance, 'inv_id') and instance.inv_id and instance.inv_id.expiry_date:
            today = timezone.now().date()
            expiry_date = instance.inv_id.expiry_date
            days_until_expiry = (expiry_date - today).days
            
            logger.info(f"📅 Expiry check - Today: {today}, Expires: {expiry_date}, Days until: {days_until_expiry}")
            
            # EXPIRED (past expiry date)
            if expiry_date <= today:
                logger.info(f"⚠️ EXPIRED detected for {item_id} (expired on {expiry_date})")
                
                if not has_been_notified(item_id, "EXPIRED"):
                    # Get display name
                    try:
                        name = getattr(instance, 'med_id', None) or getattr(instance, 'faid_id', None) or getattr(instance, 'com_id', None) or getattr(instance, 'vac_id', None) or getattr(instance, 'imz_id', None)
                        display_name = getattr(name, 'med_name', None) or getattr(name, 'faid_name', None) or getattr(name, 'com_name', None) or getattr(name, 'vac_name', None) or getattr(name, 'imz_name', None) or 'Item'
                    except Exception:
                        display_name = 'Item'
                    
                    logger.info(f"📤 Sending EXPIRED notification for {display_name}")
                    success = send_inventory_notification(
                        title=f"Item Expired - {display_name}",
                        message=f"{display_name} has EXPIRED on {expiry_date}. Current stock: {available} {unit}. Please remove from inventory.",
                        inventory_type="EXPIRED",
                        item_name=display_name,
                        quantity=available
                    )
                    logger.info(f"📬 EXPIRED notification result: {success}")
                    mark_as_notified(item_id, "EXPIRED")
                    logger.info(f"✅ Realtime: EXPIRED notification sent for {item_id}")
                else:
                    logger.info(f"⏭️ Already notified about expiry for {item_id}")
                # Continue to check stock levels even if expired
            
            # NEAR EXPIRY (within 30 days)
            elif 0 < days_until_expiry <= 30:
                logger.info(f"⏰ NEAR EXPIRY detected for {item_id} ({days_until_expiry} days remaining)")
                
                if not has_been_notified(item_id, "NEAR_EXPIRY"):
                    # Get display name
                    try:
                        name = getattr(instance, 'med_id', None) or getattr(instance, 'faid_id', None) or getattr(instance, 'com_id', None) or getattr(instance, 'vac_id', None) or getattr(instance, 'imz_id', None)
                        display_name = getattr(name, 'med_name', None) or getattr(name, 'faid_name', None) or getattr(name, 'com_name', None) or getattr(name, 'vac_name', None) or getattr(name, 'imz_name', None) or 'Item'
                    except Exception:
                        display_name = 'Item'
                    
                    logger.info(f"📤 Sending NEAR_EXPIRY notification for {display_name}")
                    success = send_inventory_notification(
                        title=f"Near Expiry Alert - {display_name}",
                        message=f"{display_name} expires in {days_until_expiry} days on {expiry_date}. Current stock: {available} {unit}. Please use soonest.",
                        inventory_type="NEAR_EXPIRY",
                        item_name=display_name,
                        quantity=available
                    )
                    logger.info(f"📬 NEAR_EXPIRY notification result: {success}")
                    mark_as_notified(item_id, "NEAR_EXPIRY")
                    logger.info(f"✅ Realtime: NEAR_EXPIRY notification sent for {item_id}")
                else:
                    logger.info(f"⏭️ Already notified about near expiry for {item_id}")
    except Exception as e:
        logger.error(f"❌ Error checking expiry: {e}", exc_info=True)

    # OUT OF STOCK
    if available <= 0:
        logger.info(f"🚨 OUT OF STOCK detected for {item_id} (available={available})")
        
        already_notified = has_been_notified(item_id, "OUT_OF_STOCK")
        logger.info(f"📋 Already notified? {already_notified}")
        
        if not already_notified:
            # build a friendly name
            try:
                name = getattr(instance, 'med_id', None) or getattr(instance, 'fa_id', None) or getattr(instance, 'com_id', None) or getattr(instance, 'vac_id', None) or getattr(instance, 'imz_id', None)
                display_name = getattr(name, 'med_name', None) or getattr(name, 'fa_name', None) or getattr(name, 'com_name', None) or getattr(name, 'vac_name', None) or getattr(name, 'imz_name', None) or 'Item'
                logger.info(f"📝 Item display name: {display_name}")
            except Exception as e:
                display_name = 'Item'
                logger.error(f"❌ Error getting display name: {e}")

            logger.info(f"📤 Sending OUT_OF_STOCK notification for {display_name}")
            success = send_inventory_notification(
                title=f"Out of Stock Alert - {display_name}",
                message=f"{display_name} is OUT OF STOCK. please restock.",
                inventory_type="OUT_OF_STOCK",
                item_name=display_name
            )
            logger.info(f"📬 Notification send result: {success}")
            
            mark_as_notified(item_id, "OUT_OF_STOCK")
            logger.info(f"✅ Realtime: Out of stock notification sent for {item_id}")
        else:
            logger.info(f"⏭️ Skipping notification - already sent for {item_id}")
        return
    else:
        logger.info(f"✔️ Not out of stock - available={available}")

    # LOW STOCK
    if _is_low_stock_by_rules(instance, available):
        if not has_been_notified(item_id, "LOW_STOCK"):
            try:
                name = getattr(instance, 'med_id', None) or getattr(instance, 'faid_id', None) or getattr(instance, 'com_id', None) or getattr(instance, 'vac_id', None) or getattr(instance, 'imz_id', None)
                display_name = getattr(name, 'med_name', None) or getattr(name, 'faid_name', None) or getattr(name, 'com_name', None) or getattr(name, 'vac_name', None) or getattr(name, 'imz_name', None) or 'Item'
            except Exception:
                display_name = 'Item'

            send_inventory_notification(
                title=f"Low Stock Alert - {display_name}",
                message=f"{display_name} is running low. Current stock: {available} {unit}.",
                inventory_type="LOW_STOCK",
                item_name=display_name,
                quantity=available
            )
            mark_as_notified(item_id, "LOW_STOCK")
            logger.info(f"Realtime: Low stock notification sent for {item_id}")


@receiver(pre_save, sender=MedicineInventory)
@receiver(pre_save, sender=FirstAidInventory)
@receiver(pre_save, sender=CommodityInventory)
@receiver(pre_save, sender=VaccineStock)
@receiver(pre_save, sender=ImmunizationStock)
def capture_previous_qty(sender, instance, **kwargs):
    """Capture previous quantity before save so we can detect changes if needed."""
    if not instance.pk:
        instance._previous_qty = None
        return
    try:
        prev = sender.objects.get(pk=instance.pk)
        # store previous available amount on the instance
        if isinstance(instance, MedicineInventory):
            instance._previous_qty = getattr(prev, 'minv_qty_avail', None) or 0
        elif isinstance(instance, FirstAidInventory):
            instance._previous_qty = int(getattr(prev, 'finv_qty_avail', None) or 0)
        elif isinstance(instance, CommodityInventory):
            instance._previous_qty = int(getattr(prev, 'cinv_qty_avail', None) or 0)
        elif isinstance(instance, VaccineStock):
            instance._previous_qty = getattr(prev, 'vacStck_qty_avail', None) or 0
        elif isinstance(instance, ImmunizationStock):
            instance._previous_qty = getattr(prev, 'imzStck_avail', None) or 0
    except sender.DoesNotExist:
        instance._previous_qty = None


@receiver(post_save, sender=MedicineInventory)
@receiver(post_save, sender=FirstAidInventory)
@receiver(post_save, sender=CommodityInventory)
@receiver(post_save, sender=VaccineStock)
@receiver(post_save, sender=ImmunizationStock)
def inventory_post_save(sender, instance, created, **kwargs):
    """When inventory changes, run realtime checks and notify if thresholds crossed."""
    try:
        logger.info(f"🎯 POST_SAVE SIGNAL triggered for {sender.__name__} - Created: {created}")
        
        # Only trigger when quantity changed or created
        prev = getattr(instance, '_previous_qty', None)
        available, _, item_id = _get_available_and_unit(instance)
        
        logger.info(f"📊 Quantities - Previous: {prev}, Current: {available}, Item ID: {item_id}")

        # If created, always evaluate
        if created:
            logger.info(f"🆕 New inventory item created - evaluating notifications")
            _notify_for_instance(instance)
            return

        # If previous is None, still evaluate
        if prev is None or prev != available:
            logger.info(f"🔄 Quantity changed from {prev} to {available} - evaluating notifications")
            _notify_for_instance(instance)
        else:
            logger.info(f"⏭️ No quantity change detected - skipping notification check")

    except Exception as e:
        logger.exception(f"❌ Error in inventory_post_save signal: {e}")


@receiver(post_delete, sender=MedicineInventory)
@receiver(post_delete, sender=FirstAidInventory)
@receiver(post_delete, sender=CommodityInventory)
@receiver(post_delete, sender=VaccineStock)
@receiver(post_delete, sender=ImmunizationStock)
def inventory_post_delete(sender, instance, **kwargs):
    """If an inventory row is deleted, consider it out-of-stock and notify once."""
    try:
        available, _, item_id = _get_available_and_unit(instance)
        if not has_been_notified(item_id, "OUT_OF_STOCK"):
            # Use the same notify flow
            _notify_for_instance(instance)
    except Exception:
        logger.exception("Error in inventory_post_delete signal")
