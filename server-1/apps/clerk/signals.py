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
            
            max_attempts = 10
            for attempt in range(max_attempts):
                try:
                    
                    existing_codes = SummonCase.objects.filter(
                        sc_code__endswith=f"-{year_suffix:02d}"
                    ).values_list('sc_code', flat=True)
                    
                    if existing_codes:
                        
                        seq_numbers = []
                        for code in existing_codes:
                            try:
                                seq_num = int(code.split('-')[0])
                                seq_numbers.append(seq_num)
                            except (ValueError, IndexError):
                                continue
                        
                        seq = max(seq_numbers) + 1 if seq_numbers else 1
                    else:
                        seq = 1
                    
                    sc_code = f"{seq:04d}-{year_suffix:02d}"
                    
                    
                    SummonCase.objects.create(
                        sc_code=sc_code,
                        sc_mediation_status="Waiting for Schedule",
                        sc_conciliation_status=None,
                        sc_date_marked=None,
                        sc_reason=None,
                        comp_id=instance.comp_id
                    )
                    logger.info(f'Successfully created summon case with code: {sc_code}')
                    break  
                    
                except Exception as e:
                    if attempt == max_attempts - 1:
                        logger.error(f'Failed to create summon case after {max_attempts} attempts: {str(e)}')
                   
                    seq += 1


@receiver(post_save, sender=ServiceChargePaymentRequest)
def auto_decline_overdue_charges(sender, instance, created, **kwargs):
    try:
        # Skip if this is a signal-triggered save to prevent recursion
        if hasattr(instance, '_skip_auto_decline'):
            return
            
        if instance.pay_status == 'Unpaid' and instance.pay_req_status == 'Pending':
            cutoff_date = timezone.now() - timedelta(days=7)
            
            if instance.pay_date_req and instance.pay_date_req < cutoff_date:
                # Only update pay_req_status to Declined, keep pay_status as Unpaid
                instance._skip_auto_decline = True  # Prevent recursion
                instance.pay_req_status = 'Declined'
                instance.save(update_fields=['pay_req_status'])
                logger.info(f'Auto-declined overdue service charge {instance.pay_id}')
        
        # Check other overdue charges (only run once, not on every save)
        if created:  # Only run on creation, not on every update
            overdue_charges = ServiceChargePaymentRequest.objects.filter(
                pay_status='Unpaid',
                pay_req_status='Pending',
                pay_date_req__lt=timezone.now() - timedelta(days=7)
            )
            
            if overdue_charges.exists():
                # Mark records to skip signal recursion
                for charge in overdue_charges:
                    charge._skip_auto_decline = True
                
                updated_count = overdue_charges.update(
                    pay_req_status='Declined'
                )
                if updated_count > 0:
                    logger.info(f'Auto-declined {updated_count} overdue service charges')
                
    except Exception as e:
        logger.error(f'Error in auto_decline_overdue_charges signal: {str(e)}')


@receiver(post_save, sender=ClerkCertificate)
def auto_decline_overdue_personal_clearances(sender, instance, created, **kwargs):
    try:
        if instance.cr_req_payment_status == 'Unpaid':
            cutoff_date = timezone.now() - timedelta(days=7)
            
            if instance.cr_req_request_date and instance.cr_req_request_date < cutoff_date:
                instance.cr_req_payment_status = 'Declined'
                instance.cr_date_rejected = timezone.now()
                instance.save(update_fields=['cr_req_payment_status', 'cr_date_rejected'])
                logger.info(f'Auto-declined overdue personal clearance {instance.cr_id}')
        
        # Check other overdue clearances
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
    try:
        if instance.nrc_req_payment_status == 'Unpaid':
            cutoff_date = timezone.now() - timedelta(days=7)
            
            if instance.nrc_req_date and instance.nrc_req_date < cutoff_date:
                instance.nrc_req_payment_status = 'Declined'
                instance.nrc_date_rejected = timezone.now()
                instance.save(update_fields=['nrc_req_payment_status', 'nrc_date_rejected'])
                logger.info(f'Auto-declined overdue non-resident clearance {instance.nrc_id}')
        
        # Check other overdue clearances
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
    try:
        if instance.req_payment_status == 'Unpaid':
            cutoff_date = timezone.now() - timedelta(days=7)
            
            if instance.req_request_date and instance.req_request_date < cutoff_date:
                instance.req_payment_status = 'Declined'
                instance.req_date_completed = timezone.now().date()
                instance.save(update_fields=['req_payment_status', 'req_date_completed'])
                logger.info(f'Auto-declined overdue permit clearance {instance.bpr_id}')
        
        # Check other overdue permits
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
