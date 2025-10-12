from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import ServiceChargePaymentRequest, SummonCase, ClerkCertificate, NonResidentCertificateRequest, BusinessPermitRequest
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=ServiceChargePaymentRequest)
def create_summon_case_on_payment(sender, instance, created, **kwargs):
    if instance.pay_status == 'Paid' and instance.comp_id:
        existing_summon_case = SummonCase.objects.filter(comp_id=instance.comp_id).first()
        
        if not existing_summon_case:
            year_suffix = timezone.now().year % 100
            
            try:
                existing_count = SummonCase.objects.filter(
                    sc_code__endswith=f"-{year_suffix:02d}"
                ).count()
            except Exception:
                existing_count = SummonCase.objects.count()
            
            seq = existing_count + 1
            sc_code = f"{seq:04d}-{year_suffix:02d}"
            
            try:
                SummonCase.objects.create(
                    sc_code=sc_code,
                    sc_mediation_status="Waiting for Schedule",
                    sc_conciliation_status=None,
                    sc_date_marked=None,
                    sc_reason=None,
                    comp_id=instance.comp_id
                )
                
            except Exception as e:
                pass


@receiver(post_save, sender=ServiceChargePaymentRequest)
def auto_decline_overdue_charges(sender, instance, created, **kwargs):
    """
    Automatically decline unpaid service charges that are 7 days overdue
    This signal runs whenever a ServiceChargePaymentRequest is saved
    """
    try:
        # Only process if this is a new unpaid charge or if we're updating an unpaid charge
        if instance.pay_status == 'Unpaid':
            # Calculate the cutoff date (7 days ago)
            cutoff_date = timezone.now() - timedelta(days=7)
            
            # Check if this specific charge is overdue
            if instance.pay_date_req and instance.pay_date_req < cutoff_date:
                # This charge is overdue, decline it
                instance.pay_status = 'Declined'
                instance.pay_date_paid = timezone.now()  # Use this field to track decline date
                instance.save(update_fields=['pay_status', 'pay_date_paid'])
                
                logger.info(f'Auto-declined overdue service charge {instance.pay_id} (requested: {instance.pay_date_req})')
        
        # Also check and decline any other overdue charges in the system
        # This ensures we catch any charges that might have been missed
        overdue_charges = ServiceChargePaymentRequest.objects.filter(
            pay_status='Unpaid',
            pay_date_req__lt=timezone.now() - timedelta(days=7)
        )
        
        if overdue_charges.exists():
            updated_count = overdue_charges.update(
                pay_status='Declined',
                pay_date_paid=timezone.now()
            )
            
            if updated_count > 0:
                logger.info(f'Auto-declined {updated_count} overdue service charges')
                
    except Exception as e:
        logger.error(f'Error in auto_decline_overdue_charges signal: {str(e)}')


@receiver(post_save, sender=ClerkCertificate)
def auto_decline_overdue_personal_clearances(sender, instance, created, **kwargs):
    """
    Automatically decline unpaid personal clearances that are 7 days overdue
    This signal runs whenever a ClerkCertificate is saved
    """
    try:
        # Only process if this is an unpaid clearance
        if instance.cr_req_payment_status == 'Unpaid':
            # Calculate the cutoff date (7 days ago)
            cutoff_date = timezone.now() - timedelta(days=7)
            
            # Check if this specific clearance is overdue
            if instance.cr_req_request_date and instance.cr_req_request_date < cutoff_date:
                # This clearance is overdue, decline it
                instance.cr_req_payment_status = 'Declined'
                instance.cr_date_rejected = timezone.now()
                instance.save(update_fields=['cr_req_payment_status', 'cr_date_rejected'])
                
                logger.info(f'Auto-declined overdue personal clearance {instance.cr_id} (requested: {instance.cr_req_request_date})')
        
        # Also check and decline any other overdue personal clearances
        overdue_clearances = ClerkCertificate.objects.filter(
            cr_req_payment_status='Unpaid',
            cr_req_request_date__lt=timezone.now() - timedelta(days=7)
        )
        
        if overdue_clearances.exists():
            updated_count = overdue_clearances.update(
                cr_req_payment_status='Declined',
                cr_date_rejected=timezone.now()
            )
            
            if updated_count > 0:
                logger.info(f'Auto-declined {updated_count} overdue personal clearances')
                
    except Exception as e:
        logger.error(f'Error in auto_decline_overdue_personal_clearances signal: {str(e)}')


@receiver(post_save, sender=NonResidentCertificateRequest)
def auto_decline_overdue_nonresident_clearances(sender, instance, created, **kwargs):
    """
    Automatically decline unpaid non-resident clearances that are 7 days overdue
    This signal runs whenever a NonResidentCertificateRequest is saved
    """
    try:
        # Only process if this is an unpaid clearance
        if instance.nrc_req_payment_status == 'Unpaid':
            # Calculate the cutoff date (7 days ago)
            cutoff_date = timezone.now() - timedelta(days=7)
            
            # Check if this specific clearance is overdue
            if instance.nrc_req_date and instance.nrc_req_date < cutoff_date:
                # This clearance is overdue, decline it
                instance.nrc_req_payment_status = 'Declined'
                instance.nrc_date_rejected = timezone.now()
                instance.save(update_fields=['nrc_req_payment_status', 'nrc_date_rejected'])
                
                logger.info(f'Auto-declined overdue non-resident clearance {instance.nrc_id} (requested: {instance.nrc_req_date})')
        
        # Also check and decline any other overdue non-resident clearances
        overdue_clearances = NonResidentCertificateRequest.objects.filter(
            nrc_req_payment_status='Unpaid',
            nrc_req_date__lt=timezone.now() - timedelta(days=7)
        )
        
        if overdue_clearances.exists():
            updated_count = overdue_clearances.update(
                nrc_req_payment_status='Declined',
                nrc_date_rejected=timezone.now()
            )
            
            if updated_count > 0:
                logger.info(f'Auto-declined {updated_count} overdue non-resident clearances')
                
    except Exception as e:
        logger.error(f'Error in auto_decline_overdue_nonresident_clearances signal: {str(e)}')


@receiver(post_save, sender=BusinessPermitRequest)
def auto_decline_overdue_permit_clearances(sender, instance, created, **kwargs):
    """
    Automatically decline unpaid permit clearances that are 7 days overdue
    This signal runs whenever a BusinessPermitRequest is saved
    """
    try:
        # Only process if this is an unpaid permit clearance
        if instance.req_payment_status == 'Unpaid':
            # Calculate the cutoff date (7 days ago)
            cutoff_date = timezone.now() - timedelta(days=7)
            
            # Check if this specific permit clearance is overdue
            if instance.req_request_date and instance.req_request_date < cutoff_date:
                # This permit clearance is overdue, decline it
                instance.req_payment_status = 'Declined'
                instance.req_date_completed = timezone.now().date()
                instance.save(update_fields=['req_payment_status', 'req_date_completed'])
                
                logger.info(f'Auto-declined overdue permit clearance {instance.bpr_id} (requested: {instance.req_request_date})')
        
        # Also check and decline any other overdue permit clearances
        overdue_permits = BusinessPermitRequest.objects.filter(
            req_payment_status='Unpaid',
            req_request_date__lt=timezone.now() - timedelta(days=7)
        )
        
        if overdue_permits.exists():
            updated_count = overdue_permits.update(
                req_payment_status='Declined',
                req_date_completed=timezone.now().date()
            )
            
            if updated_count > 0:
                logger.info(f'Auto-declined {updated_count} overdue permit clearances')
                
    except Exception as e:
        logger.error(f'Error in auto_decline_overdue_permit_clearances signal: {str(e)}')
