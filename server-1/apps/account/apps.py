from django.apps import AppConfig
from django.conf import settings
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class AccountConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.account'

    def ready(self):
        if settings.SCHEDULER_AUTOSTART: 
            self.start_scheduler()

    def start_scheduler(self):
        """Initialize and start the background scheduler"""
        try:
            from .tasks import clean_otp

            scheduler = BackgroundScheduler()
            scheduler.add_job(
                clean_otp,
                'interval',
                minutes=30,
                next_run_time=datetime.now(),
                misfire_grace_time=900,
                id='clean_expired_otp'
            )
            scheduler.start()
            logger.info('OTP cleaner started successfully')
        except Exception as e:
            logger.error(f"Failed to start scheduler: {str(e)}")