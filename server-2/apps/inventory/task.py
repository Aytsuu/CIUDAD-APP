from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from apps.inventory.models import CommodityInventory, CommodityTransaction
import logging
from apps.inventory.models import FirstAidInventory, FirstAidTransactions
from apps.inventory.models import MedicineInventory, MedicineTransactions
from apps.inventory.models import VaccineStock, ImmunizationStock, AntigenTransaction

logger = logging.getLogger(__name__)

def auto_archive_expired_commodities():
    """
    Auto-archive commodities that expired more than 10 days ago and log transactions.
    """
    today = timezone.now().date()
    archive_date = today - timedelta(days=10)

    logger.info(f"Auto-archiving commodity items expired before: {archive_date}")

    # Archive expired commodity stocks
    commodity_stocks = CommodityInventory.objects.select_related('inv_id').filter(
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
                comt_qty=qty_with_unit,  # Record the quantity with unit that was archived
                comt_action='Expired',  # Clear action indicating expiration-based archiving
                cinv_id=stock,  # Reference to the commodity inventory
                staff=None  # System action, so no staff member
            )

            archived_commodity_count += 1
            logger.info(f"Archived commodity stock: {stock.cinv_id}, Expiry: {stock.inv_id.expiry_date}, Qty: {current_qty}")

    logger.info(f"Total archived commodities: {archived_commodity_count}")
    return archived_commodity_count


def auto_archive_expired_first_aid():
    """
    Auto-archive first aid items that expired more than 10 days ago and log transactions.
    """
    today = timezone.now().date()
    archive_date = today - timedelta(days=10)

    logger.info(f"Auto-archiving first aid items expired before: {archive_date}")

    # Archive expired first aid stocks
    first_aid_stocks = FirstAidInventory.objects.select_related('inv_id').filter(
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
                fat_qty=qty_with_unit,  # Record the quantity with unit that was archived
                fat_action='Expired',  # Clear action indicating expiration-based archiving
                finv_id=stock,  # Reference to the first aid inventory
                staff=None  # System action, so no staff member
            )

            archived_first_aid_count += 1
            logger.info(f"Archived first aid stock: {stock.finv_id}, Expiry: {stock.inv_id.expiry_date}, Qty: {qty_with_unit}")

    logger.info(f"Total archived first aid items: {archived_first_aid_count}")
    return archived_first_aid_count


def auto_archive_expired_medicines():
    """
    Auto-archive medicines that expired more than 10 days ago and log transactions.
    """
    today = timezone.now().date()
    archive_date = today - timedelta(days=10)

    logger.info(f"Auto-archiving medicine items expired before: {archive_date}")

    # Archive expired medicine stocks
    medicine_stocks = MedicineInventory.objects.select_related('inv_id').filter(
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
                mdt_qty=qty_with_unit,  # Record the quantity with unit that was archived
                mdt_action='Expired',  # Clear action indicating expiration-based archiving
                minv_id=stock,  # Reference to the medicine inventory
                staff=None  # System action, so no staff member
            )

            archived_medicine_count += 1
            logger.info(f"Archived medicine stock: {stock.minv_id}, Expiry: {stock.inv_id.expiry_date}, Qty: {qty_with_unit}")

    logger.info(f"Total archived medicine items: {archived_medicine_count}")
    return archived_medicine_count


def auto_archive_expired_items():
    """
    Auto-archive items that expired more than 10 days ago and log transactions.
    """
    today = timezone.now().date()
    archive_date = today - timedelta(days=10)  # Changed from 1 to 10 days

    logger.info(f"Auto-archiving items expired before: {archive_date}")

    # Archive expired vaccine stocks
    vaccine_stocks = VaccineStock.objects.select_related('inv_id').filter(
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
                qty_with_unit = f"{current_qty} doses"  # Default for vaccines

            # Archive the inventory
            stock.inv_id.is_Archived = True
            stock.inv_id.save()

            # Create transaction record for the archive action
            AntigenTransaction.objects.create(
                antt_qty=qty_with_unit,  # Record the quantity with unit that was archived
                antt_action='Expired',  # Clear action indicating expiration-based archiving
                vacStck_id=stock,  # Reference to the vaccine stock
                imzStck_id=None,  # Not an immunization stock
                staff=None  # System action, so no staff member
            )

            archived_vaccine_count += 1
            logger.info(f"Archived vaccine stock: {stock.vacStck_id}, Expiry: {stock.inv_id.expiry_date}, Qty: {qty_with_unit}")

    # Archive expired immunization stocks
    immunization_stocks = ImmunizationStock.objects.select_related('inv_id').filter(
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
                antt_qty=qty_with_unit,  # Record the quantity with unit that was archived
                antt_action='Expired',  # Clear action indicating expiration-based archiving
                vacStck_id=None,  # Not a vaccine stock
                imzStck_id=stock,  # Reference to the immunization stock
                staff=None  # System action, so no staff member
            )

            archived_immunization_count += 1
            logger.info(f"Archived immunization stock: {stock.imzStck_id}, Expiry: {stock.inv_id.expiry_date}, Qty: {qty_with_unit}")

    logger.info(f"Auto-archived {archived_vaccine_count} vaccine items and {archived_immunization_count} immunization items with transaction records")
    return archived_vaccine_count + archived_immunization_count