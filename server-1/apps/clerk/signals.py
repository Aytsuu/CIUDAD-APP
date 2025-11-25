from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
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
                            notif_type='CASE_UPDATE',
                            mobile_route="/(summon)/council-mediation-main",
                            web_route="/summon-case",
                        )
                    
                    complainants_with_rp = instance.comp_id.complainant.filter(rp_id__isnull=False)
                
                    for complainant in complainants_with_rp:
                        if complainant.rp_id and hasattr(complainant.rp_id, 'account') and complainant.rp_id.account:
                            create_notification(
                                title='Set Schedule', 
                                message=f'Your Case No. {summoncase.sc_code} is now open and waiting for you to set a hearing schedule.',  
                                recipients=[complainant.rp_id.account],
                                notif_type='CASE_UPDATE',
                                mobile_route='/(my-request)/complaint-tracking/compMainView',
                                mobile_params={'comp_id': str(instance.comp_id.comp_id)},  
                            )
                    break  
                    
                except Exception as e:
                    if attempt == max_attempts - 1:
                        logger.error(f'Failed to create summon case after {max_attempts} attempts: {str(e)}')
                   
                    seq += 1


@receiver(pre_save, sender=SummonCase)
def store_previous_statuses(sender, instance, **kwargs):
    if instance.pk:
        try:
            previous = SummonCase.objects.get(pk=instance.pk)
            instance._previous_mediation_status = previous.sc_mediation_status
            instance._previous_conciliation_status = previous.sc_conciliation_status
        except SummonCase.DoesNotExist:
            instance._previous_mediation_status = None
            instance._previous_conciliation_status = None
    else:
        instance._previous_mediation_status = None
        instance._previous_conciliation_status = None

@receiver(post_save, sender=SummonCase)
def create_case_status_notification(sender, instance, created, **kwargs):
    if not created and (hasattr(instance, '_previous_mediation_status') or hasattr(instance, '_previous_conciliation_status')):
        previous_mediation = getattr(instance, '_previous_mediation_status', None)
        previous_conciliation = getattr(instance, '_previous_conciliation_status', None)
        current_mediation = instance.sc_mediation_status
        current_conciliation = instance.sc_conciliation_status
        
        # Check if any status changed to a notify-worthy state
        status_config = {
            'resolved': {
                'title': 'Case Resolved',
                'message': f'Your Case No. {instance.sc_code} has been successfully resolved.',
                'notif_type': 'CASE_UPDATE',
                'mobile_route': '/(my-request)/complaint-tracking/compMainView',
                'mobile_params': {'comp_id': str(instance.comp_id.comp_id)}
            },
            'escalated': {
                'title': 'Case Escalated', 
                'message': f'Your Case No. {instance.sc_code} has been escalated for further action.',
                'notif_type': 'CASE_UPDATE',
                'mobile_route': '/(my-request)/complaint-tracking/compMainView',
                'mobile_params': {'comp_id': str(instance.comp_id.comp_id)}
            }
        }
        
        # Get complainants with resident profiles
        complainants_with_rp = []
        if instance.comp_id:
            complainants_with_rp = instance.comp_id.complainant.filter(rp_id__isnull=False)
        
        # Check for resolved status in either mediation or conciliation
        if ((previous_mediation != current_mediation and current_mediation.lower() == 'resolved') or
            (previous_conciliation != current_conciliation and current_conciliation and current_conciliation.lower() == 'resolved')):
            
            config = status_config['resolved']
            for complainant in complainants_with_rp:
                if complainant.rp_id and hasattr(complainant.rp_id, 'account') and complainant.rp_id.account:
                    create_notification(
                        title=config['title'],
                        message=config['message'],
                        recipients=[complainant.rp_id.account],
                        notif_type=config['notif_type'],
                        mobile_route=config['mobile_route'],
                        mobile_params=config['mobile_params']
                    )
        
        # Check for escalated status in conciliation
        elif (previous_conciliation != current_conciliation and 
              current_conciliation and 
              current_conciliation.lower() == 'escalated'):
            
            config = status_config['escalated']
            for complainant in complainants_with_rp:
                if complainant.rp_id and hasattr(complainant.rp_id, 'account') and complainant.rp_id.account:
                    create_notification(
                        title=config['title'],
                        message=config['message'],
                        recipients=[complainant.rp_id.account],
                        notif_type=config['notif_type'],
                        mobile_route=config['mobile_route'],
                        mobile_params=config['mobile_params']
                    )
        
        # Keep your existing forwarded to lupon logic
        elif (previous_mediation != current_mediation and 
              current_mediation.lower() == 'forwarded to lupon'):
            
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
                    notif_type='CASE_UPDATE',
                    mobile_route="/(summon)/lupon-conciliation-main", 
                    web_route="/conciliation-proceedings",
                )

# =================== CASE STATUS UPDATE NOTIF (WAITING FOR SCHEDULE) ==============
@receiver(post_save, sender=SummonCase)
def create_notification_on_waiting_for_schedule(sender, instance, created, **kwargs):
    if not created and (hasattr(instance, '_previous_mediation_status') or hasattr(instance, '_previous_conciliation_status')):
        previous_mediation = getattr(instance, '_previous_mediation_status', None)
        previous_conciliation = getattr(instance, '_previous_conciliation_status', None)
        current_mediation = instance.sc_mediation_status
        current_conciliation = instance.sc_conciliation_status
        
        # Check if status changed TO 'waiting for schedule'
        mediation_changed_to_waiting = (
            previous_mediation != current_mediation and 
            current_mediation.lower() == 'waiting for schedule'
        )
        
        conciliation_changed_to_waiting = (
            previous_conciliation != current_conciliation and 
            current_conciliation and 
            current_conciliation.lower() == 'waiting for schedule'
        )
        
        if (mediation_changed_to_waiting or conciliation_changed_to_waiting) and instance.comp_id:
            # Get current hearing schedule count
            hearing_schedule_count = instance.hearing_schedules.count()
            
            # Determine max allowed schedules
            if mediation_changed_to_waiting:
                max_schedules = 3
            else:
                max_schedules = 6
            
            # Only create notification if we haven't reached the max schedules
            if hearing_schedule_count < max_schedules:
                # Get complainants with resident profiles
                complainants_with_rp = instance.comp_id.complainant.filter(rp_id__isnull=False)
                
                for complainant in complainants_with_rp:
                    if complainant.rp_id and hasattr(complainant.rp_id, 'account') and complainant.rp_id.account:
                        create_notification(
                            title='Set Schedule', 
                            message=f'Your Case No. {instance.sc_code} is waiting for you to set a hearing schedule.',
                            recipients=[complainant.rp_id.account],
                            notif_type='CASE_UPDATE',
                            mobile_route= '/(my-request)/complaint-tracking/compMainView',
                            mobile_params={'comp_id': str(instance.comp_id.comp_id)},
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
                        notif_type='CASE_UPDATE',
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
                    notif_type='CASE_UPDATE',
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
                        notif_type='CASE_UPDATE',
                        mobile_route="/(my-request)/complaint-tracking/hearing-history", 
                        mobile_params=mobile_params,
                    )