from datetime import datetime
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
from apps.notification.models import Notification, Recipient, FCMToken
from apps.account.models import Account
from .notifications import send_push_notification
import json

scheduler = BackgroundScheduler()


def create_notification(
    title: str,
    message: str,
    sender,
    recipients: list,
    notif_type: str,
    web_route: str = None,
    web_params: dict = None,
    mobile_route: str = None,
    mobile_params: dict = None,
):
    print(f"Recipients count: {len(recipients)}")

    sender_account = None
    if sender:
        try:
            sender_account = Account.objects.select_related("rp").get(rp__rp_id=str(sender))
            print(f"Found sender account via rp_id {sender}: {sender_account.email}")
        except Account.DoesNotExist:
            print(f"No account found for rp_id: {sender}")
        except Exception as e:
            print(f"Error fetching sender account: {str(e)}")

    recipient_accounts = []
    for rp in recipients:
        account = Account.objects.filter(rp=rp).first()
        if account:
            recipient_accounts.append(account)

    if not recipient_accounts:
        print("No recipient accounts found")
        return None

    notification_data = {
        'notif_title': title,
        'notif_message': message,
        'sender': sender_account,
        'notif_type': notif_type,
        'web_route': web_route,
        'web_params': web_params,
        'mobile_route': mobile_route,
        'mobile_params': mobile_params,
    }

    notification = Notification.objects.create(**notification_data)

    for rp in recipients:
        Recipient.objects.create(notif=notification, rp=rp)

    total_sent = 0
    total_failed = 0
    device_tokens = {}

    for acc in recipient_accounts:
        tokens = FCMToken.objects.filter(acc=acc)
        for token_obj in tokens:
            if not token_obj.fcm_device_id:
                continue
            if token_obj.fcm_device_id not in device_tokens:
                device_tokens[token_obj.fcm_device_id] = token_obj.fcm_token

    fcm_payload = {
        "notification_id": str(notification.notif_id),
        "notif_type": notif_type,
        "sender_name": sender_account.username if sender_account else "System",
        "web_route": web_route or "",
        "web_params": json.dumps(web_params or {}),
        "mobile_route": mobile_route or "",
        "mobile_params": json.dumps(mobile_params or {}),
    }

    for token in device_tokens.values():
        try:
            result = send_push_notification(
                token=token,
                title=title,
                message=message,
                data=fcm_payload,
            )
            if result:
                total_sent += 1
            else:
                total_failed += 1
        except Exception:
            total_failed += 1

    print(f"Notification sent. Total sent: {total_sent}, failed: {total_failed}")
    return notification


def reminder_notification(
    title: str,
    message: str,
    sender,
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
        print(f"⚠️ Cannot schedule notification in the past: {send_at}")
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
            args=[
                title, message, sender, recipients, notif_type,
                web_route, web_params, mobile_route, mobile_params
            ],
        )
        
        print(f"⏰ Scheduled notification for {len(recipients)} recipients at {send_at}")
        print(f"   Job ID: {job_id}")
        return job_id
        
    except Exception as e:
        print(f"❌ Error scheduling notification: {str(e)}")
        return None


def get_scheduled_jobs():
    """
    Get all pending scheduled notifications.
    
    Returns:
        list: List of job info dictionaries
    
    Example:
        jobs = get_scheduled_jobs()
        for job in jobs:
            print(f"{job['job_id']}: {job['next_run_time']}")
    """
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
        print(f"✅ Cancelled job: {job_id}")
        return True
    except Exception as e:
        print(f"❌ Error cancelling job: {str(e)}")
        return False


def start_scheduler():
    if not scheduler.running:
        scheduler.start()
        print("✅ Notification scheduler started")
    else:
        print("⚠️ Scheduler is already running")