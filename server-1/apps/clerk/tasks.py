from django.utils import timezone
from datetime import timedelta
from .models import (
    ServiceChargePaymentRequest,
    ClerkCertificate,
    NonResidentCertificateRequest,
    BusinessPermitRequest
)
import logging

logger = logging.getLogger(__name__)

def auto_decline_overdue_requests():
    # auto decline if malapas of due date
    try:
        cutoff_date = timezone.now() - timedelta(days=7)
        declined_count = 0
        
        # 1. Decline overdue Service Charge Payment Requests
        overdue_service_charges = ServiceChargePaymentRequest.objects.filter(
            pay_status='Unpaid',
            pay_req_status='Pending',
            pay_date_req__lt=cutoff_date
        )
        
        if overdue_service_charges.exists():
            # Mark to skip signal recursion
            for charge in overdue_service_charges:
                charge._skip_auto_decline = True
            
            updated_count = overdue_service_charges.update(
                pay_req_status='Declined',
                pay_status='Declined',
                pay_reason='Auto-declined due to overdue'
            )
            declined_count += updated_count
            logger.info(f'Auto-declined {updated_count} overdue service charge requests')
        
        # 2. Decline overdue Personal Clearance Requests (ClerkCertificate)
        overdue_personal_clearances = ClerkCertificate.objects.filter(
            cr_req_payment_status='Unpaid',
            cr_req_status__in=['Pending', 'None'],
            cr_req_request_date__lt=cutoff_date
        )
        
        if overdue_personal_clearances.exists():
            updated_count = overdue_personal_clearances.update(
                cr_req_payment_status='Declined',
                cr_req_status='Declined',
                cr_date_rejected=timezone.now(),
                cr_reason='Auto-declined due to overdue'
            )
            declined_count += updated_count
            logger.info(f'Auto-declined {updated_count} overdue personal clearance requests')
        
        # 3. Decline overdue Non-Resident Certificate Requests
        overdue_nonresident = NonResidentCertificateRequest.objects.filter(
            nrc_req_payment_status='Unpaid',
            nrc_req_status__in=['Pending', 'None'],
            nrc_req_date__lt=cutoff_date
        )
        
        if overdue_nonresident.exists():
            updated_count = overdue_nonresident.update(
                nrc_req_payment_status='Declined',
                nrc_req_status='Declined',
                nrc_date_rejected=timezone.now(),
                nrc_reason='Auto-declined due to overdue'
            )
            declined_count += updated_count
            logger.info(f'Auto-declined {updated_count} overdue non-resident certificate requests')
        
        # 4. Decline overdue Business Permit Requests
        overdue_permits = BusinessPermitRequest.objects.filter(
            req_payment_status='Unpaid',
            req_status__in=['Pending', 'None'],
            req_request_date__lt=cutoff_date
        )
        
        if overdue_permits.exists():
            updated_count = overdue_permits.update(
                req_payment_status='Declined',
                req_status='Declined',
                req_date_completed=timezone.now().date(),
                bus_reason='Auto-declined due to overdue'
            )
            declined_count += updated_count
            logger.info(f'Auto-declined {updated_count} overdue business permit requests')
        
        if declined_count > 0:
            logger.info(f'Total auto-declined requests: {declined_count}')
        else:
            logger.debug('No overdue requests found to decline')
            
    except Exception as e:
        logger.error(f'Error in auto_decline_overdue_requests task: {str(e)}')

