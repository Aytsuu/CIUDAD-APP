from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import *
import logging
from apps.notification.utils import create_notification, reminder_notification
from apps.administration.models import Staff
from .notif_recipients import conciliation_recipient, mediation_recipient, payment_req_recipient
from datetime import timedelta

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


                    # Get the recipients for mediation
                    recipient_list = mediation_recipient()
                    
                    if recipient_list and summoncase:
                        create_notification(
                            title='New Case Opened', 
                            message=f'Case No. {summoncase.sc_code} has been opened and waiting for schedule.',
                            recipients=recipient_list,
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

# =================== CASE STATUS UPDATE NOTIF (RESOLVED OR ESCALATED and CASE FORWARD) ==============
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
            
            recipient_list = conciliation_recipient()
            if recipient_list:
                create_notification(
                    title='New Case Forwarded', 
                    message=f'Case No. {instance.sc_code} has been forwarded and is waiting for schedule.',
                    recipients=recipient_list,
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
                # Get the account IDs of admin staff
                conciliation_rec_list = conciliation_recipient()
                mediation_rec_list = mediation_recipient()
              
                if conciliation_rec_list and mediation_rec_list:
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
                        recipient = conciliation_rec_list
                    else:  
                        mobile_route = "/(summon)/council-mediation-main"
                        web_route = "/summon-case"
                        recipient = mediation_rec_list
                    
                    create_notification(
                        title=f'{instance.hs_level} Hearing Schedule', 
                        message=f'{instance.hs_level} for Case No. {summon_case.sc_code} has been scheduled{date_time_info}.',
                        recipients=recipient,
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

            conciliation_rec_list = conciliation_recipient()
            mediation_rec_list = mediation_recipient()
            
            if conciliation_rec_list and mediation_rec_list:
                if 'conciliation' in hearing_schedule.hs_level.lower():
                    mobile_route = "/(summon)/lupon-conciliation-main"
                    web_route = "/conciliation-proceedings"
                    recipient = conciliation_rec_list
                else: 
                    mobile_route = "/(summon)/council-mediation-main"
                    web_route = "/summon-case"
                    recipient = mediation_rec_list
                
                create_notification(
                    title='New Remarks Added', 
                    message=f'New remarks have been posted for {hearing_schedule.hs_level} - Case No. {summon_case.sc_code}.',
                    recipients=recipient,
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


# =================== SERVICE CHARGE CREATE NOTIF =============================
@receiver(post_save, sender=ServiceChargePaymentRequest)
def create_service_charge_notification_on_create(sender, instance, created, **kwargs):
    if created:
        if instance.pay_status == 'Unpaid':
            schedule_service_charge_payment_reminder(instance)
        
        recipient_list = payment_req_recipient()
        
        if recipient_list:
            create_notification(
                title='New Certificate Request', 
                message=f'Request {instance.pay_id} for {instance.pay_sr_type} is waiting for review.',
                recipients=recipient_list,
                notif_type='REQUEST',
                mobile_route="/(treasurer)/clearance-request/service-charge-list", 
                web_route="/treasurer-service-charge",  
            )

# ======================= PERSONAL CERT NOTIFICATION ==========================
@receiver(post_save, sender=ClerkCertificate)
def create_clerk_certificate_notification_on_create(sender, instance, created, **kwargs):
    if created:
        if instance.cr_req_payment_status == 'Unpaid':
            schedule_certificate_payment_reminder(instance)
        recipient_list = payment_req_recipient()
    
        if recipient_list:
            create_notification(
                title='New Certificate Request', 
                message=f'Request {instance.cr_id} is waiting for your review.',
                recipients=recipient_list,
                notif_type='REQUEST',
                mobile_route="/(treasurer)/clearance-request/certificate-list",  
                web_route="/treasurer-personal-and-others",  
            )

# ======================= BUSINESS CERT NOTIFICATION ==========================
@receiver(post_save, sender=BusinessPermitRequest)
def create_clerk_business_notification_on_create(sender, instance, created, **kwargs):
    if created:
        if instance.req_payment_status == 'Unpaid':
            schedule_business_permit_payment_reminder(instance)
        recipient_list = payment_req_recipient()
        
        if recipient_list:
            create_notification(
                title='New Clearance Request', 
                message=f'Request {instance.bpr_id} is waiting for your review.',
                recipients=recipient_list,
                notif_type='REQUEST',
                mobile_route="/(treasurer)/clearance-request/business-list",  
                web_route="/treasurer-permit",  
            )

# =================== SERVICE CHARGE PAYMENT STATUS RESIDENT SIDE NOTIF =====================
@receiver(pre_save, sender=ServiceChargePaymentRequest)
def notify_payment_status_change(sender, instance, **kwargs):

    # If new object, no previous status exists
    if not instance.pk:
        return

    # Get the existing row BEFORE it is overwritten
    old_instance = ServiceChargePaymentRequest.objects.filter(pk=instance.pk).first()

    if not old_instance:
        return

    # No change → ignore
    if old_instance.pay_status == instance.pay_status:
        return

    # If no complaint, no residents to notify
    if not instance.comp_id:
        return

    complainants = instance.comp_id.complainant.filter(rp_id__isnull=False)

    for c in complainants:
        if not (c.rp_id and hasattr(c.rp_id, 'account') and c.rp_id.account):
            continue

        # ============= PAID =============
        if instance.pay_status == 'Paid':
            create_notification(
                title='Payment Received',
                message=f"Your request {instance.pay_id} for Service Charge is now marked Paid.",
                recipients=[c.rp_id.account],
                notif_type='REQUEST',
                mobile_route="/(my-request)/certification-tracking/certificate-request-tracker",
            )

        # ============= DECLINED =============
        elif instance.pay_status == 'Declined':
            reason = instance.pay_reason or "No reason specified."
            
            create_notification(
                title='Payment Declined',
                message=(
                    f"Your payment for request {instance.pay_id} for Service Charge has been declined. "
                    f"Reason: {reason}"
                ),
                recipients=[c.rp_id.account],
                notif_type='PAYMENT_UPDATE',
                mobile_route="/(my-request)/certification-tracking/certificate-request-tracker",
            )


# ==================== PERSONAL CERTIFICATE RESIDENT SIDE NOTIF =========================
@receiver(pre_save, sender=ClerkCertificate)
def notify_certificate_payment_status_change(sender, instance, **kwargs):

    # If new object → nothing to compare yet
    if not instance.pk:
        return

    # Get the current saved version before updating
    old_instance = ClerkCertificate.objects.filter(pk=instance.pk).first()
    if not old_instance:
        return

    # Check if payment status changed
    if old_instance.cr_req_payment_status == instance.cr_req_payment_status:
        return

    # Must have resident profile
    if not instance.rp_id or not hasattr(instance.rp_id, 'account'):
        return

    resident_account = instance.rp_id.account
    if not resident_account:
        return

    # =================== PAYMENT STATUS: PAID ===================
    if instance.cr_req_payment_status == "Paid":
        create_notification(
            title="Payment Received",
            message=f"Your request {instance.cr_id} for Personal has been marked as Paid.",
            recipients=[resident_account],
            notif_type="REQUEST",
            mobile_route="/(my-request)/certification-tracking/certificate-request-tracker",
        )

    # =================== PAYMENT STATUS: DECLINED ===================
    elif instance.cr_req_payment_status == "Declined":
        reason = instance.cr_reason or "No reason specified."

        create_notification(
            title="Payment Declined",
            message=(
                f"Your request {instance.cr_id} for Personal has been declined. "
                f"Reason: {reason}"
            ),
            recipients=[resident_account],
            notif_type="REQUEST",
            mobile_route="/(my-request)/certification-tracking/certificate-request-tracker",
        )


# ==================== BUSINESS/BARANGAY CLEARANCE RESIDENT SIDE NOTIF =========================
@receiver(pre_save, sender=BusinessPermitRequest)
def notify_business_permit_payment_change(sender, instance, **kwargs):

    # If creating a new record → nothing to compare yet
    if not instance.pk:
        return

    # Get old version BEFORE update
    old_instance = BusinessPermitRequest.objects.filter(pk=instance.pk).first()
    if not old_instance:
        return

    # If no change in payment status → no notification needed
    if old_instance.req_payment_status == instance.req_payment_status:
        return

    # Ensure there is an RP account to notify
    if not instance.rp_id or not hasattr(instance.rp_id, 'account'):
        return

    resident_account = instance.rp_id.account
    if not resident_account:
        return

    # ===================== PAID =====================
    if instance.req_payment_status == "Paid":
        create_notification(
            title="Payment Received",
            message=f"Your request {instance.bpr_id} for Business/Barangay Permit has been marked as Paid.",
            recipients=[resident_account],
            notif_type="REQUEST",
            mobile_route="/(my-request)/business-permit/tracking",
        )

    # ===================== DECLINED =====================
    elif instance.req_payment_status == "Declined":
        reason = instance.bus_reason or "No reason specified."

        create_notification(
            title="Payment Declined",
            message=(
                f"Your request {instance.bpr_id} for Business/Barangay Permit has been declined. "
                f"Reason: {reason}"
            ),
            recipients=[resident_account],
            notif_type="REQUEST",
            mobile_route="/(my-request)/business-permit/tracking",
        )

# ============================ SERVICE CHARGE PAYMENT REQUEST REMINDER =================================
def schedule_service_charge_payment_reminder(service_charge_payment):
    try:
        # Check if payment status is unpaid
        if service_charge_payment.pay_status != 'Unpaid':
            return False
            
        # Get complainants from the complaint
        complainants = service_charge_payment.comp_id.complainant.filter(rp_id__isnull=False)
        
        # Collect all recipient accounts
        recipient_accounts = []
        for complainant in complainants:
            if complainant.rp_id and hasattr(complainant.rp_id, 'account') and complainant.rp_id.account:
                recipient_accounts.append(complainant.rp_id.account)
        
        if not recipient_accounts:
            print(f"✗ No valid recipients found for service charge payment {service_charge_payment.pay_id}")
            return False
        
        due_date = service_charge_payment.pay_due_date
        
        # Schedule 3 days before reminder
        reminder_3_days = due_date - timedelta(days=3)
        reminder_notification(
            title='Payment Due Reminder',
            message=f'Your payment for {service_charge_payment.pay_id} is due in 3 days on {due_date.strftime("%B %d, %Y")}. Please visit the barangay hall to settle your payment.',
            recipients=recipient_accounts,
            notif_type='REMINDER',
            send_at=reminder_3_days,
            mobile_route="/(my-request)/certification-tracking/certificate-request-tracker",
            mobile_params={'pay_id': service_charge_payment.pay_id},
        )
        
        # Schedule 1 day before reminder
        reminder_1_day = due_date - timedelta(days=1)
        reminder_notification(
            title='Payment Due Tomorrow',
            message=f'Your payment for {service_charge_payment.pay_id} is due tomorrow on {due_date.strftime("%B %d, %Y")}. Please visit the barangay hall to settle your payment.',
            recipients=recipient_accounts,
            notif_type='REMINDER',
            send_at=reminder_1_day,
            mobile_route="/(my-request)/certification-tracking/certificate-request-tracker",
            mobile_params={'pay_id': service_charge_payment.pay_id},
        )
        
        return True
        
    except Exception as e:
        return False
    
# ============================ PERSONAL PURPOSE PAYMENT REQUEST REMINDER =================================
def schedule_certificate_payment_reminder(certificate):
    try:
        if not certificate.rp_id or not hasattr(certificate.rp_id, 'account') or not certificate.rp_id.account:
            return False
    
        if certificate.cr_req_payment_status != 'Unpaid':
            return False
        
        resident_account = certificate.rp_id.account
        
        # Calculate due date (7 days after request date)
        due_date = certificate.cr_req_request_date.date() + timedelta(days=7)
        
        # Schedule 3 days before reminder
        reminder_3_days = due_date - timedelta(days=3)
        reminder_notification(
            title='Payment Due Reminder',
            message=f'Your payment for {certificate.cr_id} is due in 3 days on {due_date.strftime("%B %d, %Y")}. Please visit the barangay hall to settle your payment.',
            recipients=[resident_account],
            notif_type='REMINDER',
            send_at=reminder_3_days,
            mobile_route="/(my-request)/certification-tracking/certificate-request-tracker",
            mobile_params={'cr_id': certificate.cr_id},
        )
        
        # Schedule 1 day before reminder
        reminder_1_day = due_date - timedelta(days=1)
        reminder_notification(
            title='Certificate Payment Due Tomorrow',
            message=f'Your payment for {certificate.cr_id} is due tomorrow on {due_date.strftime("%B %d, %Y")}. Please visit the barangay hall to settle your payment.',
            recipients=[resident_account],
            notif_type='REMINDER',
            send_at=reminder_1_day,
            mobile_route="/(my-request)/certification-tracking/certificate-request-tracker",
            mobile_params={'cr_id': certificate.cr_id},
        )
        
        return True
        
    except Exception as e:
        return False
    
# ============================ BARANGAY/BUSINESS CLEARANCE PAYMENT REQUEST REMINDER =================================
def schedule_business_permit_payment_reminder(business_permit):
    try:
        if not business_permit.rp_id or not hasattr(business_permit.rp_id, 'account') or not business_permit.rp_id.account:
            return False
        
        if business_permit.req_payment_status != 'Unpaid':
            return False
        
        resident_account = business_permit.rp_id.account
        
        # Calculate due date (7 days after request date)
        due_date = business_permit.req_request_date + timedelta(days=7)
        
        # Schedule 3 days before reminder
        reminder_3_days = due_date - timedelta(days=3)
        reminder_notification(
            title='Payment Due Reminder',
            message=f'Your payment for {business_permit.bpr_id} is due in 3 days on {due_date.strftime("%B %d, %Y")}. Please visit the barangay hall to settle your payment.',
            recipients=[resident_account],
            notif_type='REMINDER',
            send_at=reminder_3_days,
            mobile_route="/(my-request)/business-permit/tracking",
            mobile_params={'bpr_id': business_permit.bpr_id},
        )
        
        # Schedule 1 day before reminder
        reminder_1_day = due_date - timedelta(days=1)
        reminder_notification(
            title='Payment Due Tomorrow',
            message=f'Your payment for {business_permit.bpr_id} is due tomorrow on {due_date.strftime("%B %d, %Y")}. Please visit the barangay hall to settle your payment.',
            recipients=[resident_account],
            notif_type='REMINDER',
            send_at=reminder_1_day,
            mobile_route="/(my-request)/business-permit/tracking",
            mobile_params={'bpr_id': business_permit.bpr_id},
        )
        
        return True
        
    except Exception as e:
        return False


# ============================ QUARTERLY REMINDER FOR ADDING DATE AND TIMESLOTS =================================
def schedule_quarterly_hearing_reminders():
    """
    Schedule quarterly reminders for adding summon dates and time slots
    """
    try:
        recipient_list = mediation_recipient()
        
        # Schedule for current quarter and recurring quarterly
        now = timezone.now()
        
        # Calculate next quarter (January, April, July, October)
        current_month = now.month
        if current_month <= 3:
            next_quarter_month = 4  # April
            quarter_name = "Q2 (April-June)"
        elif current_month <= 6:
            next_quarter_month = 7  # July
            quarter_name = "Q3 (July-September)"
        elif current_month <= 9:
            next_quarter_month = 10  # October
            quarter_name = "Q4 (October-December)"
        else:
            next_quarter_month = 1  # January (next year)
            quarter_name = "Q1 (January-March)"
        
        # Set reminder for 1st day of the quarter at 9:00 AM
        if next_quarter_month == 1:  # January (next year)
            reminder_date = datetime(now.year + 1, next_quarter_month, 1, 9, 0)
        else:
            reminder_date = datetime(now.year, next_quarter_month, 1, 9, 0)
        
        reminder_time = timezone.make_aware(reminder_date)
        
        # Schedule the quarterly reminder
        reminder_notification(
            title=f'Quarterly Hearing Schedule - {quarter_name}',
            message=f'Time to add summon dates and time availability slots for {quarter_name}. Please add available dates and time slots in the Date & Time Availability feature.',
            recipients=recipient_list,
            notif_type='REMINDER',
            send_at=reminder_time,
            web_route="/summon-calendar"
        )
        
        print(f"✓ Quarterly hearing reminder scheduled for {quarter_name} on {reminder_time.strftime('%B %d, %Y')}")
        return True
        
    except Exception as e:
        print(f"✗ Error scheduling quarterly hearing reminders: {e}")
        return False

# Initialize quarterly scheduling
def initialize_quarterly_hearing_reminders():
    schedule_quarterly_hearing_reminders()
