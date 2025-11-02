from datetime import datetime
from django.utils import timezone
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
from apps.notification.models import Notification, Recipient, FCMToken
from apps.account.models import Account
from apps.profiling.models import ResidentProfile
from .notifications import send_push_notification
import json
import logging

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()


def create_notification(
    title: str,
    message: str,
    recipients: list,
    notif_type: str,
    web_route: str = None,
    web_params: dict = None,
    mobile_route: str = None,
    mobile_params: dict = None,
):
    logger.info(f"📨 Creating notification for {len(recipients)} recipients")

    if not recipients:
        logger.warning("⚠️ No recipients provided")
        return None

    # Convert recipients to Account objects
    recipient_accounts = []
    for recipient in recipients:
        if isinstance(recipient, Account):
            # Already an Account object
            recipient_accounts.append(recipient)
            logger.debug(f"✓ Account: {recipient.username}")
        elif isinstance(recipient, ResidentProfile):
            # It's a ResidentProfile, get the associated Account
            account = Account.objects.filter(rp=recipient).first()
            if account:
                recipient_accounts.append(account)
                logger.debug(f"✓ ResidentProfile -> Account: {account.username}")
            else:
                logger.warning(f"⚠️ No Account found for ResidentProfile: {recipient.rp_id}")
        else:
            logger.error(f"❌ Invalid recipient type: {type(recipient)}")

    if not recipient_accounts:
        logger.error("❌ No valid recipient accounts found")
        return None

    logger.info(f"✅ Found {len(recipient_accounts)} valid account(s)")

    # Create the notification
    notification_data = {
        'notif_title': title,
        'notif_message': message,
        'notif_type': notif_type,
        'web_route': web_route,
        'web_params': web_params,
        'mobile_route': mobile_route,
        'mobile_params': mobile_params,
    }

    notification = Notification.objects.create(**notification_data)
    logger.info(f"✅ Notification created: ID {notification.notif_id}")

    # Create recipient records using 'acc' field
    recipient_objects = []
    for acc in recipient_accounts:
        recipient_obj = Recipient.objects.create(notif=notification, acc=acc)
        recipient_objects.append(recipient_obj)
    
    logger.info(f"✅ Created {len(recipient_objects)} recipient records")

    # Send push notifications
    total_sent = 0
    total_failed = 0
    device_tokens = {}

    # Collect unique device tokens for all recipients
    for acc in recipient_accounts:
        tokens = FCMToken.objects.filter(acc=acc)
        for token_obj in tokens:
            if not token_obj.fcm_device_id:
                continue
            # Avoid duplicate tokens
            if token_obj.fcm_device_id not in device_tokens:
                device_tokens[token_obj.fcm_device_id] = token_obj.fcm_token

    logger.info(f"📱 Found {len(device_tokens)} unique device tokens")

    # Prepare FCM payload
    fcm_payload = {
        "notification_id": str(notification.notif_id),
        "notif_type": notif_type,
        "web_route": web_route or "",
        "web_params": json.dumps(web_params or {}),
        "mobile_route": mobile_route or "",
        "mobile_params": json.dumps(mobile_params or {}),
    }

    # Send push notifications to all devices
    for device_id, token in device_tokens.items():
        try:
            result = send_push_notification(
                token=token,
                title=title,
                message=message,
                data=fcm_payload,
            )
            if result:
                total_sent += 1
                logger.debug(f"✅ Push sent to device: {device_id}")
            else:
                total_failed += 1
                logger.warning(f"⚠️ Push failed to device: {device_id}")
        except Exception as e:
            logger.error(f"❌ Error sending push to device {device_id}: {str(e)}")
            total_failed += 1

    logger.info(f"📊 Push notifications: {total_sent} sent, {total_failed} failed")
    return notification


def reminder_notification(
    title: str,
    message: str,
    recipients: list,
    notif_type: str,
    send_at: datetime,
    web_route: str = None,
    web_params: dict = None,
    mobile_route: str = None,
    mobile_params: dict = None,
):
    if timezone.is_naive(send_at):
        send_at = timezone.make_aware(send_at)

    # Don't schedule past times
    if send_at <= timezone.now():
        logger.warning(f"⚠️ Cannot schedule notification in the past: {send_at}")
        return None

    # Create unique job ID
    job_id = f"notif_{notif_type}_{int(send_at.timestamp())}"

    # Schedule the job
    trigger = DateTrigger(run_date=send_at)
    
    try:
        scheduler.add_job(
            create_notification,
            trigger=trigger,
            id=job_id,
            replace_existing=True,
            kwargs={
                'title': title,
                'message': message,
                'recipients': recipients,
                'notif_type': notif_type,
                'web_route': web_route,
                'web_params': web_params,
                'mobile_route': mobile_route,
                'mobile_params': mobile_params,
            },
        )
        
        logger.info(f"⏰ Scheduled notification for {len(recipients)} recipients at {send_at}")
        logger.info(f"   Job ID: {job_id}")
        return job_id
        
    except Exception as e:
        logger.error(f"❌ Error scheduling notification: {str(e)}")
        return None


def get_scheduled_jobs():
    jobs = scheduler.get_jobs()
    
    job_list = []
    for job in jobs:
        job_list.append({
            'job_id': job.id,
            'next_run_time': job.next_run_time,
            'function': job.func.__name__,
        })
    
    # Sort by next_run_time
    job_list.sort(key=lambda x: x['next_run_time'])
    
    return job_list


def cancel_scheduled_notification(job_id: str):
    try:
        scheduler.remove_job(job_id)
        logger.info(f"✅ Cancelled job: {job_id}")
        return True
    except Exception as e:
        logger.error(f"❌ Error cancelling job {job_id}: {str(e)}")
        return False


def start_scheduler():
    if not scheduler.running:
        scheduler.start()
        logger.info("✅ Notification scheduler started")
    else:
        logger.warning("⚠️ Scheduler is already running")
