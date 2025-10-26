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
    target_obj=None,
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

    if target_obj:
        notification_data['content_type'] = ContentType.objects.get_for_model(target_obj)
        notification_data['object_id'] = target_obj.pk

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
    remind_at: datetime,
    target_obj=None,
    web_route=None,
    web_params=None,
    mobile_route=None,
    mobile_params=None,
):
    if timezone.is_naive(remind_at):
        remind_at = timezone.make_aware(remind_at)

    sched_id = f"reminder_{notif_type}_{remind_at.timestamp()}"

    trigger = DateTrigger(run_date=remind_at)
    scheduler.add_job(
        create_notification,
        trigger=trigger,
        id=sched_id,
        replace_existing=True,
        args=[
            title, message, sender, recipients, notif_type, target_obj,
            web_route, web_params, mobile_route, mobile_params
        ],
    )

    print(f"Reminder scheduled for {remind_at} - sched_id={sched_id}")

def start_scheduler():
    if not scheduler.running:
        scheduler.start()
        print("Notification scheduler started.")