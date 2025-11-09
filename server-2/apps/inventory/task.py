import logging
from datetime import timedelta
from django.utils import timezone
from django.db import transaction, models
from django.core.cache import cache
from apps.inventory.models import (
    CommodityInventory, CommodityTransaction,
    FirstAidInventory, FirstAidTransactions,
    MedicineInventory, MedicineTransactions,
    VaccineStock, ImmunizationStock, AntigenTransaction
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
            notif_type=f"INVENTORY_{inventory_type}",
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

def check_low_stock_alerts():
    """
    Check for low stock items - EACH ITEM ONLY NOTIFIED ONCE
    """
    today = timezone.now().date()
    
    # Check medicine low stock
    medicine_stocks = MedicineInventory.objects.select_related(
        'med_id', 'inv_id'
    ).filter(inv_id__is_Archived=False)
    
    for stock in medicine_stocks:
        available_stock = stock.minv_qty_avail
        
        # Check out of stock FIRST (exclude from low stock)
        is_out_of_stock = available_stock <= 0
        
        # Check low stock based on unit type (only if NOT out of stock)
        is_low_stock = False
        if not is_out_of_stock:
            if stock.minv_qty_unit and stock.minv_qty_unit.lower() == "boxes":
                # For boxes, low stock threshold is 2 boxes
                is_low_stock = available_stock <= 2
            else:
                # For pieces, low stock threshold is 20 pcs
                is_low_stock = available_stock <= 20
        
        if is_low_stock:
            # Check if this specific medicine has already been notified for low stock
            item_id = f"medicine_{stock.minv_id}"
            if not has_been_notified(item_id, "LOW_STOCK"):
                send_inventory_notification(
                    title="Low Stock Alert - Medicine",
                    message=f"Medicine '{stock.med_id.med_name}' is running low. Current stock: {available_stock} {stock.minv_qty_unit or 'pcs'}. Please consider restocking.",
                    inventory_type="LOW_STOCK",
                    item_name=stock.med_id.med_name,
                    quantity=available_stock
                )
                # Mark this specific medicine as notified for low stock
                mark_as_notified(item_id, "LOW_STOCK")
                logger.info(f"📦 Low stock notification sent for medicine: {stock.med_id.med_name}")
    
    # Check first aid low stock
    first_aid_stocks = FirstAidInventory.objects.select_related(
        'faid_id', 'inv_id'
    ).filter(inv_id__is_Archived=False)
    
    for stock in first_aid_stocks:
        available_stock = int(stock.finv_qty_avail) if stock.finv_qty_avail else 0
        
        # Check out of stock FIRST (exclude from low stock)
        is_out_of_stock = available_stock <= 0
        
        # Check low stock based on unit type (only if NOT out of stock)
        is_low_stock = False
        if not is_out_of_stock:
            if stock.finv_qty_unit and stock.finv_qty_unit.lower() == "boxes":
                # For boxes, low stock threshold is 2 boxes
                is_low_stock = available_stock <= 2
            else:
                # For pieces, low stock threshold is 20 pcs
                is_low_stock = available_stock <= 20
        
        if is_low_stock:
            # Check if this specific first aid item has already been notified
            item_id = f"firstaid_{stock.finv_id}"
            if not has_been_notified(item_id, "LOW_STOCK"):
                send_inventory_notification(
                    title="Low Stock Alert - First Aid",
                    message=f"First aid item '{stock.faid_id.faid_name}' is running low. Current stock: {available_stock} {stock.finv_qty_unit or 'pcs'}. Please consider restocking.",
                    inventory_type="LOW_STOCK",
                    item_name=stock.faid_id.faid_name,
                    quantity=available_stock
                )
                mark_as_notified(item_id, "LOW_STOCK")
                logger.info(f"🩹 Low stock notification sent for first aid: {stock.faid_id.faid_name}")
    
    # Check commodity low stock
    commodity_stocks = CommodityInventory.objects.select_related(
        'com_id', 'inv_id'
    ).filter(inv_id__is_Archived=False)
    
    for stock in commodity_stocks:
        available_stock = int(stock.cinv_qty_avail) if stock.cinv_qty_avail else 0
        
        # Check out of stock FIRST (exclude from low stock)
        is_out_of_stock = available_stock <= 0
        
        # Check low stock based on unit type (only if NOT out of stock)
        is_low_stock = False
        if not is_out_of_stock:
            if stock.cinv_qty_unit and stock.cinv_qty_unit.lower() == "boxes":
                # For boxes, low stock threshold is 2 boxes
                is_low_stock = available_stock <= 2
            else:
                # For pieces, low stock threshold is 20 pcs
                is_low_stock = available_stock <= 20
        
        if is_low_stock:
            # Check if this specific commodity has already been notified
            item_id = f"commodity_{stock.cinv_id}"
            if not has_been_notified(item_id, "LOW_STOCK"):
                send_inventory_notification(
                    title="Low Stock Alert - Commodity",
                    message=f"Commodity '{stock.com_id.com_name}' is running low. Current stock: {available_stock} {stock.cinv_qty_unit or 'pcs'}. Please consider restocking.",
                    inventory_type="LOW_STOCK",
                    item_name=stock.com_id.com_name,
                    quantity=available_stock
                )
                mark_as_notified(item_id, "LOW_STOCK")
                logger.info(f"📦 Low stock notification sent for commodity: {stock.com_id.com_name}")
    
    # Check vaccine low stock
    vaccine_stocks = VaccineStock.objects.select_related(
        'vac_id', 'inv_id'
    ).filter(inv_id__is_Archived=False)
    
    for stock in vaccine_stocks:
        available_stock = stock.vacStck_qty_avail
        
        # Check out of stock FIRST (exclude from low stock)
        is_out_of_stock = available_stock <= 0
        
        # Check low stock based on unit type (only if NOT out of stock)
        is_low_stock = False
        if not is_out_of_stock:
            if stock.solvent and stock.solvent.lower() == "diluent":
                # For diluent, low stock threshold is 10 containers
                is_low_stock = available_stock <= 10
            else:
                # For regular vaccines, low stock threshold is 10 vials
                is_low_stock = available_stock <= 10
        
        if is_low_stock:
            # Check if this specific vaccine has already been notified
            item_id = f"vaccine_{stock.vacStck_id}"
            if not has_been_notified(item_id, "LOW_STOCK"):
                item_type = "Diluent" if stock.solvent and stock.solvent.lower() == "diluent" else "Vaccine"
                send_inventory_notification(
                    title=f"Low Stock Alert - {item_type}",
                    message=f"{item_type} '{stock.vac_id.vac_name}' is running low. Current stock: {available_stock}. Please consider restocking.",
                    inventory_type="LOW_STOCK",
                    item_name=stock.vac_id.vac_name,
                    quantity=available_stock
                )
                mark_as_notified(item_id, "LOW_STOCK")
                logger.info(f"💉 Low stock notification sent for {item_type.lower()}: {stock.vac_id.vac_name}")
    
    # Check immunization supplies low stock
    immunization_stocks = ImmunizationStock.objects.select_related(
        'imz_id', 'inv_id'
    ).filter(inv_id__is_Archived=False)
    
    for stock in immunization_stocks:
        available_stock = stock.imzStck_avail
        
        # Check out of stock FIRST (exclude from low stock)
        is_out_of_stock = available_stock <= 0
        
        # Check low stock based on unit type (only if NOT out of stock)
        is_low_stock = False
        if not is_out_of_stock:
            if stock.imzStck_unit and stock.imzStck_unit.lower() == "boxes":
                # For boxes, low stock threshold is 2 boxes
                is_low_stock = available_stock <= 2
            else:
                # For pieces, low stock threshold is 20 pcs
                is_low_stock = available_stock <= 20
        
        if is_low_stock:
            # Check if this specific immunization supply has already been notified
            item_id = f"immunization_{stock.imzStck_id}"
            if not has_been_notified(item_id, "LOW_STOCK"):
                send_inventory_notification(
                    title="Low Stock Alert - Immunization Supply",
                    message=f"Immunization supply '{stock.imz_id.imz_name}' is running low. Current stock: {available_stock} {stock.imzStck_unit or 'pcs'}. Please consider restocking.",
                    inventory_type="LOW_STOCK",
                    item_name=stock.imz_id.imz_name,
                    quantity=available_stock
                )
                mark_as_notified(item_id, "LOW_STOCK")
                logger.info(f"🩺 Low stock notification sent for immunization supply: {stock.imz_id.imz_name}")

def check_near_expiry_alerts():
    """
    Check for items nearing expiry (30 days) - EACH ITEM ONLY NOTIFIED ONCE
    """
    today = timezone.now().date()
    near_expiry_threshold = today + timedelta(days=30)
    
    # Check near expiry medicines
    near_expiry_medicines = MedicineInventory.objects.filter(
        inv_id__expiry_date__lte=near_expiry_threshold,
        inv_id__expiry_date__gt=today,
        inv_id__is_Archived=False
    ).select_related('med_id', 'inv_id')
    
    for medicine in near_expiry_medicines:
        days_until_expiry = (medicine.inv_id.expiry_date - today).days
        # Check if this specific medicine has already been notified for near expiry
        item_id = f"medicine_{medicine.minv_id}"
        if not has_been_notified(item_id, "NEAR_EXPIRY"):
            send_inventory_notification(
                title="Near Expiry Alert - Medicine",
                message=f"Medicine '{medicine.med_id.med_name}' expires in {days_until_expiry} days on {medicine.inv_id.expiry_date}. Current stock: {medicine.minv_qty_avail}. Please use soonest.",
                inventory_type="NEAR_EXPIRY",
                item_name=medicine.med_id.med_name,
                quantity=medicine.minv_qty_avail
            )
            mark_as_notified(item_id, "NEAR_EXPIRY")
            logger.info(f"⏰ Near expiry notification sent for medicine: {medicine.med_id.med_name}")
    
    # Check near expiry first aid
    near_expiry_first_aid = FirstAidInventory.objects.filter(
        inv_id__expiry_date__lte=near_expiry_threshold,
        inv_id__expiry_date__gt=today,
        inv_id__is_Archived=False
    ).select_related('faid_id', 'inv_id')
    
    for item in near_expiry_first_aid:
        days_until_expiry = (item.inv_id.expiry_date - today).days
        # Check if this specific first aid item has already been notified
        item_id = f"firstaid_{item.finv_id}"
        if not has_been_notified(item_id, "NEAR_EXPIRY"):
            send_inventory_notification(
                title="Near Expiry Alert - First Aid",
                message=f"First aid item '{item.faid_id.faid_name}' expires in {days_until_expiry} days on {item.inv_id.expiry_date}. Current stock: {item.finv_qty_avail}. Please use soonest.",
                inventory_type="NEAR_EXPIRY",
                item_name=item.faid_id.faid_name,
                quantity=item.finv_qty_avail
            )
            mark_as_notified(item_id, "NEAR_EXPIRY")
            logger.info(f"⏰ Near expiry notification sent for first aid: {item.faid_id.faid_name}")
    
    # Check near expiry commodities
    near_expiry_commodities = CommodityInventory.objects.filter(
        inv_id__expiry_date__lte=near_expiry_threshold,
        inv_id__expiry_date__gt=today,
        inv_id__is_Archived=False
    ).select_related('com_id', 'inv_id')
    
    for commodity in near_expiry_commodities:
        days_until_expiry = (commodity.inv_id.expiry_date - today).days
        # Check if this specific commodity has already been notified
        item_id = f"commodity_{commodity.cinv_id}"
        if not has_been_notified(item_id, "NEAR_EXPIRY"):
            send_inventory_notification(
                title="Near Expiry Alert - Commodity",
                message=f"Commodity '{commodity.com_id.com_name}' expires in {days_until_expiry} days on {commodity.inv_id.expiry_date}. Current stock: {commodity.cinv_qty_avail}. Please use soonest.",
                inventory_type="NEAR_EXPIRY",
                item_name=commodity.com_id.com_name,
                quantity=commodity.cinv_qty_avail
            )
            mark_as_notified(item_id, "NEAR_EXPIRY")
            logger.info(f"⏰ Near expiry notification sent for commodity: {commodity.com_id.com_name}")
    
    # Check near expiry vaccines
    near_expiry_vaccines = VaccineStock.objects.filter(
        inv_id__expiry_date__lte=near_expiry_threshold,
        inv_id__expiry_date__gt=today,
        inv_id__is_Archived=False
    ).select_related('vac_id', 'inv_id')
    
    for vaccine in near_expiry_vaccines:
        days_until_expiry = (vaccine.inv_id.expiry_date - today).days
        # Check if this specific vaccine has already been notified
        item_id = f"vaccine_{vaccine.vacStck_id}"
        if not has_been_notified(item_id, "NEAR_EXPIRY"):
            item_type = "Diluent" if vaccine.solvent and vaccine.solvent.lower() == "diluent" else "Vaccine"
            send_inventory_notification(
                title=f"Near Expiry Alert - {item_type}",
                message=f"{item_type} '{vaccine.vac_id.vac_name}' expires in {days_until_expiry} days on {vaccine.inv_id.expiry_date}. Current stock: {vaccine.vacStck_qty_avail}. Please use soonest.",
                inventory_type="NEAR_EXPIRY",
                item_name=vaccine.vac_id.vac_name,
                quantity=vaccine.vacStck_qty_avail
            )
            mark_as_notified(item_id, "NEAR_EXPIRY")
            logger.info(f"⏰ Near expiry notification sent for {item_type.lower()}: {vaccine.vac_id.vac_name}")
    
    # Check near expiry immunization supplies
    near_expiry_immunization = ImmunizationStock.objects.filter(
        inv_id__expiry_date__lte=near_expiry_threshold,
        inv_id__expiry_date__gt=today,
        inv_id__is_Archived=False
    ).select_related('imz_id', 'inv_id')
    
    for item in near_expiry_immunization:
        days_until_expiry = (item.inv_id.expiry_date - today).days
        # Check if this specific immunization supply has already been notified
        item_id = f"immunization_{item.imzStck_id}"
        if not has_been_notified(item_id, "NEAR_EXPIRY"):
            send_inventory_notification(
                title="Near Expiry Alert - Immunization Supply",
                message=f"Immunization supply '{item.imz_id.imz_name}' expires in {days_until_expiry} days on {item.inv_id.expiry_date}. Current stock: {item.imzStck_avail}. Please use soonest.",
                inventory_type="NEAR_EXPIRY",
                item_name=item.imz_id.imz_name,
                quantity=item.imzStck_avail
            )
            mark_as_notified(item_id, "NEAR_EXPIRY")
            logger.info(f"⏰ Near expiry notification sent for immunization supply: {item.imz_id.imz_name}")

def check_out_of_stock_alerts():
    """
    Check for out of stock items - EACH ITEM ONLY NOTIFIED ONCE
    """
    # Check out of stock medicines
    out_of_stock_medicines = MedicineInventory.objects.filter(
        minv_qty_avail=0,
        inv_id__is_Archived=False
    ).select_related('med_id')
    
    for medicine in out_of_stock_medicines:
        # Check if this specific medicine has already been notified for out of stock
        item_id = f"medicine_{medicine.minv_id}"
        if not has_been_notified(item_id, "OUT_OF_STOCK"):
            send_inventory_notification(
                title="Out of Stock Alert - Medicine",
                message=f"Medicine '{medicine.med_id.med_name}' is OUT OF STOCK. Urgent restocking required.",
                inventory_type="OUT_OF_STOCK",
                item_name=medicine.med_id.med_name
            )
            mark_as_notified(item_id, "OUT_OF_STOCK")
            logger.info(f"🚨 Out of stock notification sent for medicine: {medicine.med_id.med_name}")
    
    # Check out of stock first aid
    out_of_stock_first_aid = FirstAidInventory.objects.filter(
        finv_qty_avail=0,
        inv_id__is_Archived=False
    ).select_related('faid_id')
    
    for item in out_of_stock_first_aid:
        # Check if this specific first aid item has already been notified
        item_id = f"firstaid_{item.finv_id}"
        if not has_been_notified(item_id, "OUT_OF_STOCK"):
            send_inventory_notification(
                title="Out of Stock Alert - First Aid",
                message=f"First aid item '{item.faid_id.faid_name}' is OUT OF STOCK. Urgent restocking required.",
                inventory_type="OUT_OF_STOCK",
                item_name=item.faid_id.faid_name
            )
            mark_as_notified(item_id, "OUT_OF_STOCK")
            logger.info(f"🚨 Out of stock notification sent for first aid: {item.faid_id.faid_name}")
    
    # Check out of stock commodities
    out_of_stock_commodities = CommodityInventory.objects.filter(
        cinv_qty_avail=0,
        inv_id__is_Archived=False
    ).select_related('com_id')
    
    for commodity in out_of_stock_commodities:
        # Check if this specific commodity has already been notified
        item_id = f"commodity_{commodity.cinv_id}"
        if not has_been_notified(item_id, "OUT_OF_STOCK"):
            send_inventory_notification(
                title="Out of Stock Alert - Commodity",
                message=f"Commodity '{commodity.com_id.com_name}' is OUT OF STOCK. Urgent restocking required.",
                inventory_type="OUT_OF_STOCK",
                item_name=commodity.com_id.com_name
            )
            mark_as_notified(item_id, "OUT_OF_STOCK")
            logger.info(f"🚨 Out of stock notification sent for commodity: {commodity.com_id.com_name}")
    
    # Check out of stock vaccines
    out_of_stock_vaccines = VaccineStock.objects.filter(
        vacStck_qty_avail=0,
        inv_id__is_Archived=False
    ).select_related('vac_id')
    
    for vaccine in out_of_stock_vaccines:
        # Check if this specific vaccine has already been notified
        item_id = f"vaccine_{vaccine.vacStck_id}"
        if not has_been_notified(item_id, "OUT_OF_STOCK"):
            item_type = "Diluent" if vaccine.solvent and vaccine.solvent.lower() == "diluent" else "Vaccine"
            send_inventory_notification(
                title=f"Out of Stock Alert - {item_type}",
                message=f"{item_type} '{vaccine.vac_id.vac_name}' is OUT OF STOCK. Urgent restocking required.",
                inventory_type="OUT_OF_STOCK",
                item_name=vaccine.vac_id.vac_name
            )
            mark_as_notified(item_id, "OUT_OF_STOCK")
            logger.info(f"🚨 Out of stock notification sent for {item_type.lower()}: {vaccine.vac_id.vac_name}")
    
    # Check out of stock immunization supplies
    out_of_stock_immunization = ImmunizationStock.objects.filter(
        imzStck_avail=0,
        inv_id__is_Archived=False
    ).select_related('imz_id')
    
    for item in out_of_stock_immunization:
        # Check if this specific immunization supply has already been notified
        item_id = f"immunization_{item.imzStck_id}"
        if not has_been_notified(item_id, "OUT_OF_STOCK"):
            send_inventory_notification(
                title="Out of Stock Alert - Immunization Supply",
                message=f"Immunization supply '{item.imz_id.imz_name}' is OUT OF STOCK. Urgent restocking required.",
                inventory_type="OUT_OF_STOCK",
                item_name=item.imz_id.imz_name
            )
            mark_as_notified(item_id, "OUT_OF_STOCK")
            logger.info(f"🚨 Out of stock notification sent for immunization supply: {item.imz_id.imz_name}")

def run_all_inventory_alerts():
    """
    Run all inventory alert checks - WITH PER-ITEM TRACKING
    """
    logger.info("Running all inventory alert checks with per-item tracking...")
    
    # Check various alert types
    check_low_stock_alerts()
    check_near_expiry_alerts()
    check_out_of_stock_alerts()
    
    logger.info("Completed all inventory alert checks")

# KEEP ALL THE AUTO-ARCHIVE FUNCTIONS THE SAME AS BEFORE
# (They already have proper notification handling)
def auto_archive_expired_commodities():
    """
    Auto-archive commodities that expired more than 10 days ago and log transactions.
    Send notification to health staff.
    """
    today = timezone.now().date()
    archive_date = today - timedelta(days=10)

    logger.info(f"Auto-archiving commodity items expired before: {archive_date}")

    # Archive expired commodity stocks
    commodity_stocks = CommodityInventory.objects.select_related('inv_id', 'com_id').filter(
        inv_id__expiry_date__lte=archive_date,
        inv_id__is_Archived=False
    )

    archived_commodity_count = 0
    with transaction.atomic():
        for stock in commodity_stocks:
            # Get the current available quantity before archiving
            current_qty = stock.cinv_qty_avail or 0

            # Determine the unit and format quantity with unit
            if stock.cinv_qty_unit and stock.cinv_qty_unit.lower() == "boxes":
                qty_with_unit = f"{current_qty} pcs"
            else:
                # For other units, use the actual unit
                unit = stock.cinv_qty_unit if stock.cinv_qty_unit else "pcs"
                qty_with_unit = f"{current_qty} {unit}"

            # Archive the inventory
            stock.inv_id.is_Archived = True
            stock.inv_id.save()

            # Create transaction record for the archive action
            CommodityTransaction.objects.create(
                comt_qty=qty_with_unit,
                comt_action='Expired',
                cinv_id=stock,
                staff=None
            )

            # Send expired notification
            send_inventory_notification(
                title="Item Expired - Commodity",
                message=f"Commodity '{stock.com_id.com_name}' has expired and been automatically archived. Quantity: {qty_with_unit}.",
                inventory_type="EXPIRED",
                item_name=stock.com_id.com_name,
                quantity=current_qty
            )

            archived_commodity_count += 1
            logger.info(f"Archived commodity stock: {stock.cinv_id}, Expiry: {stock.inv_id.expiry_date}, Qty: {current_qty}")

    logger.info(f"Total archived commodities: {archived_commodity_count}")
    return archived_commodity_count

def auto_archive_expired_first_aid():
    """
    Auto-archive first aid items that expired more than 10 days ago and log transactions.
    Send notification to health staff.
    """
    today = timezone.now().date()
    archive_date = today - timedelta(days=10)

    logger.info(f"Auto-archiving first aid items expired before: {archive_date}")

    # Archive expired first aid stocks
    first_aid_stocks = FirstAidInventory.objects.select_related('inv_id', 'faid_id').filter(
        inv_id__expiry_date__lte=archive_date,
        inv_id__is_Archived=False
    )

    archived_first_aid_count = 0
    with transaction.atomic():
        for stock in first_aid_stocks:
            # Get the current available quantity before archiving
            current_qty = stock.finv_qty_avail or 0

            # Determine the unit and format quantity with unit
            if stock.finv_qty_unit and stock.finv_qty_unit.lower() == "boxes":
                qty_with_unit = f"{current_qty} pcs"
            else:
                unit = stock.finv_qty_unit if stock.finv_qty_unit else "pcs"
                qty_with_unit = f"{current_qty} {unit}"

            # Archive the inventory
            stock.inv_id.is_Archived = True
            stock.inv_id.save()

            # Create transaction record for the archive action
            FirstAidTransactions.objects.create(
                fat_qty=qty_with_unit,
                fat_action='Expired',
                finv_id=stock,
                staff=None
            )

            # Send expired notification
            send_inventory_notification(
                title="Item Expired - First Aid",
                message=f"First aid item '{stock.faid_id.faid_name}' has expired and been automatically archived. Quantity: {qty_with_unit}.",
                inventory_type="EXPIRED",
                item_name=stock.faid_id.faid_name,
                quantity=current_qty
            )

            archived_first_aid_count += 1
            logger.info(f"Archived first aid stock: {stock.finv_id}, Expiry: {stock.inv_id.expiry_date}, Qty: {qty_with_unit}")

    logger.info(f"Total archived first aid items: {archived_first_aid_count}")
    return archived_first_aid_count

def auto_archive_expired_medicines():
    """
    Auto-archive medicines that expired more than 10 days ago and log transactions.
    Send notification to health staff.
    """
    today = timezone.now().date()
    archive_date = today - timedelta(days=10)

    logger.info(f"Auto-archiving medicine items expired before: {archive_date}")

    # Archive expired medicine stocks
    medicine_stocks = MedicineInventory.objects.select_related('inv_id', 'med_id').filter(
        inv_id__expiry_date__lte=archive_date,
        inv_id__is_Archived=False
    )

    archived_medicine_count = 0
    with transaction.atomic():
        for stock in medicine_stocks:
            # Get the current available quantity before archiving
            current_qty = stock.minv_qty_avail or 0

            # Determine the unit and format quantity with unit
            if stock.minv_qty_unit and stock.minv_qty_unit.lower() == "boxes":
                qty_with_unit = f"{current_qty} pcs"
            else:
                unit = stock.minv_qty_unit if stock.minv_qty_unit else "pcs"
                qty_with_unit = f"{current_qty} {unit}"

            # Archive the inventory
            stock.inv_id.is_Archived = True
            stock.inv_id.save()

            # Create transaction record for the archive action
            MedicineTransactions.objects.create(
                mdt_qty=qty_with_unit,
                mdt_action='Expired',
                minv_id=stock,
                staff=None
            )

            # Send expired notification
            send_inventory_notification(
                title="Item Expired - Medicine",
                message=f"Medicine '{stock.med_id.med_name}' has expired and been automatically archived. Quantity: {qty_with_unit}.",
                inventory_type="EXPIRED",
                item_name=stock.med_id.med_name,
                quantity=current_qty
            )

            archived_medicine_count += 1
            logger.info(f"Archived medicine stock: {stock.minv_id}, Expiry: {stock.inv_id.expiry_date}, Qty: {qty_with_unit}")

    logger.info(f"Total archived medicine items: {archived_medicine_count}")
    return archived_medicine_count

def auto_archive_expired_items():
    """
    Auto-archive items that expired more than 10 days ago and log transactions.
    Send notification to health staff.
    """
    today = timezone.now().date()
    archive_date = today - timedelta(days=10)

    logger.info(f"Auto-archiving items expired before: {archive_date}")

    # Archive expired vaccine stocks
    vaccine_stocks = VaccineStock.objects.select_related('inv_id', 'vac_id').filter(
        inv_id__expiry_date__lte=archive_date,
        inv_id__is_Archived=False
    )

    archived_vaccine_count = 0
    with transaction.atomic():
        for stock in vaccine_stocks:
            # Get the current available quantity before archiving
            current_qty = stock.vacStck_qty_avail or 0

            # Determine the unit based on solvent type
            if stock.solvent and stock.solvent.lower() == "doses":
                qty_with_unit = f"{current_qty} doses"
            elif stock.solvent and stock.solvent.lower() == "container":
                qty_with_unit = f"{current_qty} pcs"
            else:
                # For other solvent types, use the immunization unit or default to doses
                qty_with_unit = f"{current_qty} doses"

            # Archive the inventory
            stock.inv_id.is_Archived = True
            stock.inv_id.save()

            # Create transaction record for the archive action
            AntigenTransaction.objects.create(
                antt_qty=qty_with_unit,
                antt_action='Expired',
                vacStck_id=stock,
                imzStck_id=None,
                staff=None
            )

            # Send expired notification
            item_type = "Diluent" if stock.solvent and stock.solvent.lower() == "diluent" else "Vaccine"
            send_inventory_notification(
                title=f"Item Expired - {item_type}",
                message=f"{item_type} '{stock.vac_id.vac_name}' has expired and been automatically archived. Quantity: {qty_with_unit}.",
                inventory_type="EXPIRED",
                item_name=stock.vac_id.vac_name,
                quantity=current_qty
            )

            archived_vaccine_count += 1
            logger.info(f"Archived vaccine stock: {stock.vacStck_id}, Expiry: {stock.inv_id.expiry_date}, Qty: {qty_with_unit}")

    # Archive expired immunization stocks
    immunization_stocks = ImmunizationStock.objects.select_related('inv_id', 'imz_id').filter(
        inv_id__expiry_date__lte=archive_date,
        inv_id__is_Archived=False
    )

    archived_immunization_count = 0
    with transaction.atomic():
        for stock in immunization_stocks:
            # Get the current available quantity before archiving
            current_qty = stock.imzStck_avail or 0

            # Determine the unit based on immunization unit
            if stock.imzStck_unit and stock.imzStck_unit.lower() == "boxes":
                qty_with_unit = f"{current_qty} pcs"
            else:
                # Use the actual immunization unit or default to pcs
                unit = stock.imzStck_unit if stock.imzStck_unit else "pcs"
                qty_with_unit = f"{current_qty} {unit}"

            # Archive the inventory
            stock.inv_id.is_Archived = True
            stock.inv_id.save()

            # Create transaction record for the archive action
            AntigenTransaction.objects.create(
                antt_qty=qty_with_unit,
                antt_action='Expired',
                vacStck_id=None,
                imzStck_id=stock,
                staff=None
            )

            # Send expired notification
            send_inventory_notification(
                title="Item Expired - Immunization Supply",
                message=f"Immunization supply '{stock.imz_id.imz_name}' has expired and been automatically archived. Quantity: {qty_with_unit}.",
                inventory_type="EXPIRED",
                item_name=stock.imz_id.imz_name,
                quantity=current_qty
            )

            archived_immunization_count += 1
            logger.info(f"Archived immunization stock: {stock.imzStck_id}, Expiry: {stock.inv_id.expiry_date}, Qty: {qty_with_unit}")

    logger.info(f"Auto-archived {archived_vaccine_count} vaccine items and {archived_immunization_count} immunization items with transaction records")
    return archived_vaccine_count + archived_immunization_count