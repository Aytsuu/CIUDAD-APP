from django.apps import AppConfig
from django.conf import settings
from apscheduler.schedulers.background import BackgroundScheduler
import logging
import os
import sys

logger = logging.getLogger(__name__)


class PatientrecordsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.patientrecords'
    
    def ready(self):
        if getattr(settings, 'SCHEDULER_AUTOSTART', True):
            if os.environ.get('RUN_MAIN') or 'runserver' in sys.argv:
                self.start_scheduler()

    def start_scheduler(self):
        """Initialize and start the background scheduler for patient records notifications."""
        try:
            from .tasks import run_notification_checks
            
            scheduler = BackgroundScheduler()
            
            # Today's follow-ups & missed follow-ups (7:00 AM)
            scheduler.add_job(
                run_notification_checks,
                'cron',
                hour=7,
                minute=0,
                kwargs={'command_name': 'create_todays_followup_notifications'},
                id='patient_records_today_followups',
                name='Create today\'s and missed follow-up visit notifications',
                replace_existing=True
            )
            
            # Tomorrow's reminders (5:00 PM)
            scheduler.add_job(
                run_notification_checks,
                'cron',
                hour=17,
                minute=0,
                kwargs={'command_name': 'create_day_before_followup_notifications'},
                id='patient_records_tomorrow_reminders',
                name='Create tomorrow\'s follow-up visit reminders',
                replace_existing=True
            )
            
            # Missed follow-ups check (12:00 PM)
            scheduler.add_job(
                run_notification_checks,
                'cron',
                hour=12,
                minute=0,
                kwargs={'command_name': 'create_todays_followup_notifications', 'missed_days': 1},
                id='patient_records_missed_followups',
                name='Check for missed follow-up visits',
                replace_existing=True
            )

            scheduler.start()
            # logger.info("Patient Records Notification Scheduler started successfully!")
            # logger.info("📅 Today's & missed notifications: Daily at 7:00 AM")
            # logger.info("📅 Tomorrow's reminders: Daily at 5:00 PM") 
            # logger.info("📅 Missed follow-ups check: Daily at 12:00 PM")
            
        except Exception as e:
            logger.error(f"Failed to start Patient Records scheduler: {str(e)}")