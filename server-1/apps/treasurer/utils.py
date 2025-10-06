from django.utils import timezone
from django.db import transaction
from .models import Income_Tracking, Income_Particular
from apps.administration.models import Staff
import logging

logger = logging.getLogger(__name__)

def create_automatic_income_entry(request_type, request_id, purpose, amount, staff_id=None, discount_notes=None, invoice_discount_reason=None):
    try:
        with transaction.atomic():
            if request_type == 'CERT':
                particular_name = f"CERT-{purpose}"
            elif request_type == 'PERMIT':
                particular_name = f"PERMIT-{purpose}"
            else:
                particular_name = f"{request_type}-{purpose}"
            
            # Get or create the income particular
            income_particular, created = Income_Particular.objects.get_or_create(
                incp_item=particular_name,
                defaults={'incp_item': particular_name}
            )
            
            # Get staff if provided
            staff = None
            if staff_id:
                try:
                    # Handle case where staff_id might be a Staff object or string
                    if hasattr(staff_id, 'staff_id'):
                        # staff_id is already a Staff object
                        staff = staff_id
                    else:
                        # staff_id is a string, get the Staff object
                        staff = Staff.objects.get(staff_id=staff_id)
                except Staff.DoesNotExist:
                    logger.warning(f"Staff with ID {staff_id} not found for income entry")
                except Exception as e:
                    logger.warning(f"Error getting staff for income entry: {str(e)}")
            
            # Determine additional notes - use invoice discount reason or "None"
            additional_notes = "None"
            if invoice_discount_reason:
                additional_notes = invoice_discount_reason
            elif discount_notes:
                additional_notes = discount_notes
            
            # Create the income tracking entry
            income_entry = Income_Tracking.objects.create(
                inc_serial_num=f"{request_id}",  # Auto-generated serial number
                inc_transac_num=request_id,  # Use request ID as transaction number
                inc_datetime=timezone.now(),
                inc_entryType=particular_name,  # Use the formatted purpose (CERT-Purpose or PERMIT-Purpose)
                inc_amount=amount,
                inc_additional_notes=additional_notes,
                inc_is_archive=False,
                incp_id=income_particular,
                staff_id=staff
            )
            
            logger.info(f"Created automatic income entry: {income_entry.inc_num} for {request_type} {request_id}")
            return income_entry
            
    except Exception as e:
        logger.error(f"Error creating automatic income entry for {request_type} {request_id}: {str(e)}")
        raise e
