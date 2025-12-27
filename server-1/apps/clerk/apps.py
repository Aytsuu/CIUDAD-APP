from django.apps import AppConfig
from django.conf import settings
from django.db.models.signals import post_migrate
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import logging
import os
import sys
import fcntl

logger = logging.getLogger(__name__)

class ClerkConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.clerk'
    
    def ready(self):
        import apps.clerk.signals
        from apps.clerk.signals import initialize_quarterly_hearing_reminders
        
        if os.environ.get('SCHEDULER_AUTOSTART') != 'True':
            return

        lock_file_path = '/tmp/clerk_scheduler.lock'

        try:
            self.fp = open(lock_file_path, 'wb')
            fcntl.flock(self.fp, fcntl.LOCK_EX | fcntl.LOCK_NB)
            
            logger.info("Clerk Scheduler starting...")
            initialize_quarterly_hearing_reminders()
            self.start_scheduler()
        except OSError:
            logger.error("Scheduler already running in another worker. Skipping.")
    
    
    def start_scheduler(self):
        """Initialize and start the background scheduler for auto-declining overdue requests"""
        try:
            from .tasks import auto_decline_overdue_requests
            
            scheduler = BackgroundScheduler()
            
            # Schedule the job to run daily at 12:00 AM
            scheduler.add_job(
                auto_decline_overdue_requests,
                'cron',
                hour=0, # 12:00 AM
                minute=0,
                misfire_grace_time=3600,  # Allow up to 1 hour to run if missed
                id='auto_decline_overdue_requests',
                replace_existing=True
            )
            
            scheduler.start()
            logger.info("Clerk scheduler started successfully. Auto-decline job scheduled for 2:00 AM daily.")
        except Exception as e:
            logger.error(f"Failed to start Clerk scheduler: {str(e)}")