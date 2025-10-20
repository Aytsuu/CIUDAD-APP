from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
from datetime import datetime
from django.conf import settings
from django.utils import timezone
from apps.notification.create_notification import create_notification

scheduler = BackgroundScheduler()

""" 
    scheduler_reminder_notification(
        title="",
        message="",
        sender=request.user,
        recipients=[user1, user2],
        notif_type="reminder_type",
        remind_at=datetime(2024, 12, 31, 10, 0, 0),
        target_obj=target_object,
    )
"""

def scheduler_reminder_notification( title: str, message: str, sender, recipients: list, notif_type: str, remind_at: datetime, target_obj=None):
    
    if timezone.is_naive(remind_at):
        remind_at = timezone.make_aware(remind_at)
        
    sched_id = f"reminder_{notif_type}_{remind_at.timestamp()}"
    
    trigger = DateTrigger(run_date=remind_at)
    
    scheduler.add_job(
        create_notifcation,
        trigger=trigger,
        id=sched_id,
        replace_existing=True,
        args=[title, message, sender, recipients, notif_type, target_obj],)
    
    print(f"Reminder scheduled for {remind_at} - sched_id={sched_id}")
    
def start_scheduler():
    if not scheduler.running:
        scheduler.start()
        print("Schedules to notify started.")