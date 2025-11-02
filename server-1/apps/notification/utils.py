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


# ===============================================================
#  CREATE NEW NOTIFICATION IMMEDIATELY
# ===============================================================
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
            recipient_accounts.append(recipient)
        elif isinstance(recipient, ResidentProfile):
            account = Account.objects.filter(rp=recipient).first()
            if account:
                recipient_accounts.append(account)
            else:
                logger.warning(f"⚠️ No Account found for ResidentProfile: {recipient.rp_id}")
        else:
            logger.error(f"❌ Invalid recipient type: {type(recipient)}")

    if not recipient_accounts:
        logger.error("❌ No valid recipient accounts found")
        return None

    logger.info(f"✅ Found {len(recipient_accounts)} valid account(s)")

    # Create notification record
    notification_data = {
        "notif_title": title,
        "notif_message": message,
        "notif_type": notif_type,
        "web_route": web_route,
        "web_params": web_params,
        "mobile_route": mobile_route,
        "mobile_params": mobile_params,
    }

    notification = Notification.objects.create(**notification_data)
    logger.info(f"✅ Notification created: ID {notification.notif_id}")

    # Create recipient records
    for acc in recipient_accounts:
        Recipient.objects.create(notif=notification, acc=acc)

    logger.info(f"✅ Created {len(recipient_accounts)} recipient records")

    # Send push notification
    _send_push(notification, recipient_accounts)

    return notification


# ===============================================================
#  SEND REMINDER FOR EXISTING NOTIFICATION AT SCHEDULED TIME
# ===============================================================
def reminder_notification(notification_id: str, send_at: datetime):
    try:
        notification = Notification.objects.get(notif_id=notification_id)
    except Notification.DoesNotExist:
        logger.error(f"❌ Notification with ID {notification_id} not found.")
        return None

    recipients = [
        r.acc for r in Recipient.objects.filter(notif=notification)
    ]

    if not recipients:
        logger.warning(f"⚠️ No recipients found for Notification ID {notification_id}")
        return None

    # Ensure send_at is timezone-aware
    if timezone.is_naive(send_at):
        send_at = timezone.make_aware(send_at)

    if send_at <= timezone.now():
        logger.warning(f"⚠️ Cannot schedule reminder in the past: {send_at}")
        return None

    job_id = f"reminder_{notification_id}_{int(send_at.timestamp())}"
    trigger = DateTrigger(run_date=send_at)

    try:
        scheduler.add_job(
            _send_push,
            trigger=trigger,
            id=job_id,
            replace_existing=True,
            kwargs={"notification": notification, "recipient_accounts": recipients},
        )
        logger.info(f"⏰ Reminder scheduled for notification {notification_id} at {send_at}")
        return job_id
    except Exception as e:
        logger.error(f"❌ Error scheduling reminder: {str(e)}")
        return None


# ===============================================================
#  INTERNAL PUSH SENDER (USED BY BOTH CREATE & REMINDER)
# ===============================================================
def _send_push(notification, recipient_accounts):
    total_sent = 0
    total_failed = 0
    device_tokens = {}

    # Collect device tokens
    for acc in recipient_accounts:
        tokens = FCMToken.objects.filter(acc=acc)
        for token_obj in tokens:
            if token_obj.fcm_device_id and token_obj.fcm_device_id not in device_tokens:
                device_tokens[token_obj.fcm_device_id] = token_obj.fcm_token

    logger.info(f"📱 Found {len(device_tokens)} unique device tokens")

    # FCM payload
    fcm_payload = {
        "notification_id": str(notification.notif_id),
        "notif_type": notification.notif_type,
        "web_route": notification.web_route or "",
        "web_params": json.dumps(notification.web_params or {}),
        "mobile_route": notification.mobile_route or "",
        "mobile_params": json.dumps(notification.mobile_params or {}),
    }

    # Send push
    for device_id, token in device_tokens.items():
        try:
            result = send_push_notification(
                token=token,
                title=notification.notif_title,
                message=notification.notif_message,
                data=fcm_payload,
            )
            if result:
                total_sent += 1
            else:
                total_failed += 1
        except Exception as e:
            logger.error(f"❌ Error sending to device {device_id}: {str(e)}")
            total_failed += 1

    logger.info(f"📊 Reminder push: {total_sent} sent, {total_failed} failed")


# ===============================================================
#  SCHEDULER HELPERS
# ===============================================================
def get_scheduled_jobs():
    jobs = scheduler.get_jobs()
    return [
        {
            "job_id": job.id,
            "next_run_time": job.next_run_time,
            "function": job.func.__name__,
        }
        for job in sorted(jobs, key=lambda j: j.next_run_time or datetime.max)
    ]


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
        logger.warning("⚠️ Scheduler already running")
