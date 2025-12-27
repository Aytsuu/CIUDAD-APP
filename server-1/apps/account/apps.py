from django.apps import AppConfig
from django.conf import settings
from django.db.models.signals import post_migrate
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import logging
import fcntl
import sys
import os

logger = logging.getLogger(__name__)

class AccountConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.account'

    def ready(self):
        
        if os.environ.get('SCHEDULER_AUTOSTART') != 'True':
            return
        
        lock_file_path = '/tmp/account_scheduler.lock'

        try:
            self.fp = open(lock_file_path, 'wb')
            fcntl.flock(self.fp, fcntl.LOCK_EX | fcntl.LOCK_NB)

            logger.info("Account Scheduler starting...")
            self.start_scheduler()
        except OSError:
            # Another worker already has the lock
           logger.error("Scheduler already running in another worker. Skipping.")

    def start_scheduler(self):
        """Initialize and start the background scheduler"""
        try:
            from .tasks import clean_otp

            scheduler = BackgroundScheduler()
            scheduler.add_job(
                clean_otp,
                'interval',
                minutes=1,
                next_run_time=datetime.now(),
                misfire_grace_time=900,
                id='clean_expired_otp'
            )
            scheduler.start()
            logger.info('✅ OTP cleaner started successfully')
        except Exception as e:
            logger.error(f"Failed to start scheduler: {str(e)}")