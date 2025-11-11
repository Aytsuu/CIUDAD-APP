from django.apps import AppConfig
from django.conf import settings
from django.utils import timezone
from apscheduler.schedulers.background import BackgroundScheduler
import logging
import os

logger = logging.getLogger(__name__)


class MaternalConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.maternal'

    def ready(self):
        # Start scheduler for follow-up checks
        if settings.SCHEDULER_AUTOSTART and os.environ.get("RUN_MAIN") == "true":
            self.start_scheduler()

    def start_scheduler(self):
        """Initialize and start the background scheduler for follow-up and appointment checks"""
        try:
            from .tasks import update_missed_followups, update_missed_prenatal_appointments
            from apscheduler.triggers.cron import CronTrigger

            scheduler = BackgroundScheduler()
            
            # Run every day at 6 PM (18:00) to check for missed follow-ups
            scheduler.add_job(
                update_missed_followups,
                CronTrigger(hour=18, minute=0),
                misfire_grace_time=1800,  # 1 hour grace period
                id='followup_status_update',
                replace_existing=True
            )
            
            # Run every day at 6 PM (18:00) to check for missed prenatal appointments
            scheduler.add_job(
                update_missed_prenatal_appointments,
                CronTrigger(hour=18, minute=0),
                misfire_grace_time=3600,  # 1 hour grace period
                id='prenatal_appointment_status_update',
                replace_existing=True
            )
            
            scheduler.start()
            logger.info("Maternal services scheduler started successfully")
            print("MSC - Checking for missed follow-ups and appointments daily at 6:00 PM")
        except Exception as e:
            logger.error(f"Failed to start maternal scheduler: {str(e)}")
            print(f"✗ Failed to start scheduler: {str(e)}")