# apps/medicalConsultation/apps.py
from django.apps import AppConfig
from django.conf import settings
import logging
import os
import sys

logger = logging.getLogger(__name__)

class MedicalConsultationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.medicalConsultation'
    
    def ready(self):
        # Import and register signals
        self.register_signals()
        
        # Start background scheduler only if autostart is enabled
        if settings.SCHEDULER_AUTOSTART:
            # Only start in main process or designated scheduler process
            if os.environ.get('RUN_SCHEDULER') == 'True' or 'runserver' in sys.argv:
                self.start_scheduler()

    def register_signals(self):
        """Import and register signal handlers"""
        try:
            from . import signals
            logger.info("✅ MedicalConsultation signals registered")
        except Exception as e:
            logger.error(f"❌ Failed to register MedicalConsultation signals: {e}")

    def start_scheduler(self):
        """Initialize and start the background scheduler for medical consultation tasks."""
        try:
            from apscheduler.schedulers.background import BackgroundScheduler
            from apscheduler.triggers.cron import CronTrigger
            
            # Import both tasks
            from .tasks import update_missed_appointments_background, send_daily_pending_appointments_notification

            scheduler = BackgroundScheduler()

            # Schedule missed appointments check to run every minute
            scheduler.add_job(
                update_missed_appointments_background,
                trigger=CronTrigger(hour=18, minute=0, timezone='Asia/Manila'),  # 6 PM daily
                misfire_grace_time=300,
                id="medical_consultation_missed_check",
                replace_existing=True
            )
            
            # Schedule daily pending appointments notification at midnight
            scheduler.add_job(
                send_daily_pending_appointments_notification,
                trigger=CronTrigger(hour=0, minute=0, timezone='Asia/Manila'),  # Midnight daily
                id="daily_pending_appointments_notification",
                replace_existing=True
            )

            scheduler.start()
            logger.info("✅ MedicalConsultation scheduler started successfully")
            logger.info("   - Missed appointments check: every minute")
            logger.info("   - Pending appointments notification: 8:00 AM daily")
            
        except Exception as e:
            logger.error(f"❌ Failed to start MedicalConsultation scheduler: {str(e)}")