# apps/medicineservices/apps.py

from django.apps import AppConfig
from django.conf import settings
import logging
import os
import sys

logger = logging.getLogger(__name__)

class MedicineservicesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.medicineservices'

    def ready(self):
        """
        Start the scheduler only if SCHEDULER_AUTOSTART is True and
        we are running the server (not during migrations).
        """
        if getattr(settings, 'SCHEDULER_AUTOSTART', False):
            # Only run scheduler for the main process
            if os.environ.get('RUN_SCHEDULER') == 'True' or 'runserver' in sys.argv:
                self.start_scheduler()

    def start_scheduler(self):
        """Initialize and start the background scheduler for medicine services tasks."""
        try:
            from apscheduler.schedulers.background import BackgroundScheduler
            from apscheduler.triggers.interval import IntervalTrigger
            from apscheduler.triggers.cron import CronTrigger
            from .task import update_expired_medicine_requests,send_daily_pending_medicine_requests_notification  # your task function

            scheduler = BackgroundScheduler()

            # Schedule the job to run every 1 minute
             # Schedule the job to run every 1 minute
            scheduler.add_job(
                update_expired_medicine_requests,
                trigger=CronTrigger(hour=18, minute=0, timezone='Asia/Manila'),
                id="update_expired_medicine_requests",
                max_instances=1,
                replace_existing=True,
            )
              # Schedule daily pending medicine requests notification at 8 AM
            scheduler.add_job(
                send_daily_pending_medicine_requests_notification,
                trigger=CronTrigger(hour=0, minute=0, timezone='Asia/Manila'),
                id="daily_pending_medicine_requests_notification",
                replace_existing=True,
            )

            scheduler.start()

            logger.info("✅ Medicineservices Scheduler started: update_expired_medicine_requests every 1 minute")
        except Exception as e:
            logger.error(f"Failed to start Medicineservices scheduler: {str(e)}")

