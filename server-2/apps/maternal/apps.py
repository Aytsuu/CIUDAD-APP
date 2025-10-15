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
        # import apps.maternal.signals
        
        # Start scheduler for follow-up checks
        if settings.SCHEDULER_AUTOSTART and os.environ.get("RUN_MAIN") == "true":
            self.start_scheduler()

    def start_scheduler(self):
        """Initialize and start the background scheduler for follow-up and appointment checks"""
        try:
            # Import here to avoid circular import issues
            from .tasks import update_missed_followups, update_missed_prenatal_appointments

            scheduler = BackgroundScheduler()
            
            # Run every day at midnight to check for missed follow-ups
            scheduler.add_job(
                update_missed_followups,
                'cron',
                hour=0,
                minute=0,
                next_run_time=timezone.now(),  # Run immediately on startup
                misfire_grace_time=3600,  # 1 hour grace period
                id='followup_status_update',
                replace_existing=True
            )
            
            # Run every day at midnight to check for missed prenatal appointments
            scheduler.add_job(
                update_missed_prenatal_appointments,
                'cron',
                hour=0,
                minute=0,
                next_run_time=timezone.now(),  # Run immediately on startup
                misfire_grace_time=3600,  # 1 hour grace period
                id='prenatal_appointment_status_update',
                replace_existing=True
            )
            
            scheduler.start()
            logger.info("Maternal services scheduler started successfully")
            print("✓ Maternal scheduler started - checking for missed follow-ups and appointments daily at midnight")
        except Exception as e:
            logger.error(f"Failed to start maternal scheduler: {str(e)}")
            print(f"✗ Failed to start scheduler: {str(e)}")