from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import *
import logging
from apps.notification.utils import create_notification
from apps.administration.models import Staff

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
                    
                    
                    summoncase = SummonCase.objects.create(
                        sc_code=sc_code,
                        sc_mediation_status="Waiting for Schedule",
                        sc_conciliation_status=None,
                        sc_date_marked=None,
                        sc_reason=None,
                        comp_id=instance.comp_id
                    )
                    logger.info(f'Successfully created summon case with code: {sc_code}')

                       # Create notification for admin staff
                    admin_staff = Staff.objects.filter(
                        pos__pos_title__iexact='ADMIN'
                    ).select_related('rp__account')
                    
                    # Get the account IDs of admin staff
                    admin_accounts = []
                    for staff in admin_staff:
                        if staff.rp and hasattr(staff.rp, 'account') and staff.rp.account:
                            admin_accounts.append(staff.rp.account)
                    
                    if admin_accounts and summoncase:
                        create_notification(
                            title='New Case Opened', 
                            message=f'Case No. {summoncase.sc_code} has been opened and waiting for schedule.',
                            recipients=admin_accounts,
                            notif_type='MEDIATION_CASE',
                            mobile_route="/(summon)/council-mediation-main",
                            web_route="/summon-case",
                        )
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


@receiver(pre_save, sender=SummonCase)
def store_previous_mediation_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            previous = SummonCase.objects.get(pk=instance.pk)
            instance._previous_mediation_status = previous.sc_mediation_status
        except SummonCase.DoesNotExist:
            instance._previous_mediation_status = None
    else:
        instance._previous_mediation_status = None

@receiver(post_save, sender=SummonCase)
def create_notification_on_case_forwarded(sender, instance, created, **kwargs):
    if not created and hasattr(instance, '_previous_mediation_status'):
        previous_status = instance._previous_mediation_status
        current_status = instance.sc_mediation_status
        
        if (previous_status != current_status and 
            current_status.lower() == 'forwarded to lupon'):
            
            admin_staff = Staff.objects.filter(
                pos__pos_title__iexact='ADMIN'
            ).select_related('rp__account')
            
            admin_accounts = []
            for staff in admin_staff:
                if staff.rp and hasattr(staff.rp, 'account') and staff.rp.account:
                    admin_accounts.append(staff.rp.account)
            
            if admin_accounts:
                create_notification(
                    title='New Case Forwarded', 
                    message=f'Case No. {instance.sc_code} has been forwarded and is waiting for schedule.',
                    recipients=admin_accounts,
                    notif_type='CONCILIATION_CASE',
                    mobile_route="/(summon)/lupon-conciliation-main", 
                    web_route="/conciliation-proceedings",
                )

# ================== HEARING SCHEDULE NOTIFICATION ====================
@receiver(post_save, sender=HearingSchedule)
def create_notification_on_hearing_schedule(sender, instance, created, **kwargs):
    if created and instance.sc_id:
        # Get the summon case and its complaint
        summon_case = instance.sc_id
        complaint = summon_case.comp_id
        
        if complaint:
            has_complainant_with_rp = complaint.complainant.filter(rp_id__isnull=False).exists()
            
            if has_complainant_with_rp:
                admin_staff = Staff.objects.filter(
                    pos__pos_title__iexact='ADMIN'
                ).select_related('rp__account')
                
                # Get the account IDs of admin staff
                admin_accounts = []
                for staff in admin_staff:
                    if staff.rp and hasattr(staff.rp, 'account') and staff.rp.account:
                        admin_accounts.append(staff.rp.account)
                
                if admin_accounts:
                    # Get date and time from the schedule
                    date_time_info = ""
                    if instance.sd_id and instance.st_id:
                        # Format military time to 12-hour format
                        military_time = instance.st_id.st_start_time
                        formatted_time = military_time.strftime('%I:%M %p').lstrip('0')
                        date_time_info = f" on {instance.sd_id.sd_date} at {formatted_time}"
                    elif instance.sd_id:
                        date_time_info = f" on {instance.sd_id.sd_date}"
                    
                    if 'conciliation' in instance.hs_level.lower():
                        mobile_route = "/(summon)/lupon-conciliation-main"
                        web_route = "/conciliation-proceedings"
                    else:  
                        mobile_route = "/(summon)/council-mediation-main"
                        web_route = "/summon-case"
                    
                    create_notification(
                        title=f'{instance.hs_level} Hearing Schedule', 
                        message=f'{instance.hs_level} for Case No. {summon_case.sc_code} has been scheduled{date_time_info}.',
                        recipients=admin_accounts,
                        notif_type='HEARING_SCHEDULE',
                        mobile_route=mobile_route, 
                        web_route=web_route,
                    )

# ====================== NOTIF FOR REMARK ===========================
@receiver(post_save, sender=Remark)
def create_notification_on_remark_added(sender, instance, created, **kwargs):
    if created and instance.hs_id and instance.hs_id.sc_id:
        # Get the hearing schedule, summon case and complaint
        hearing_schedule = instance.hs_id
        summon_case = hearing_schedule.sc_id
        complaint = summon_case.comp_id
        
        if complaint:

            # for admin
            admin_staff = Staff.objects.filter(
                pos__pos_title__iexact='ADMIN'
            ).select_related('rp__account')
            
            admin_accounts = []
            for staff in admin_staff:
                if staff.rp and hasattr(staff.rp, 'account') and staff.rp.account:
                    admin_accounts.append(staff.rp.account)
            
            if admin_accounts:
                if 'conciliation' in hearing_schedule.hs_level.lower():
                    mobile_route = "/(summon)/lupon-conciliation-main"
                    web_route = "/conciliation-proceedings"
                else: 
                    mobile_route = "/(summon)/council-mediation-main"
                    web_route = "/summon-case"
                
                create_notification(
                    title='New Remarks Added', 
                    message=f'New remarks have been posted for {hearing_schedule.hs_level} - Case No. {summon_case.sc_code}.',
                    recipients=admin_accounts,
                    notif_type='REMARK',
                    mobile_route=mobile_route, 
                    web_route=web_route,
                )
            

            # for complainants
            complainants_with_rp = complaint.complainant.filter(rp_id__isnull=False)

            status = (
                summon_case.sc_conciliation_status or
                summon_case.sc_mediation_status or
                "None"
            )
            
            mobile_params = {
                'sc_id': summon_case.sc_id, 
                'status': status
            }
            
            for complainant in complainants_with_rp:
                if complainant.rp_id and hasattr(complainant.rp_id, 'account') and complainant.rp_id.account:
                    create_notification(
                        title='Remarks Available', 
                        message=f'Case No. {summon_case.sc_code} has remarks available for your {hearing_schedule.hs_level} hearing.',
                        recipients=[complainant.rp_id.account],
                        notif_type='REMARK',
                        mobile_route="/(my-request)/complaint-tracking/hearing-history", 
                        mobile_params=mobile_params,
                    )