from django.apps import AppConfig
from django.conf import settings
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import logging
import os
import sys

logger = logging.getLogger(__name__)

class ClerkConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.clerk'
    
    def ready(self):
        import apps.clerk.signals
        
        # Start scheduler only when Django is fully loaded
        if settings.SCHEDULER_AUTOSTART:
            # Prevent duplicate schedulers in autoreload
            if os.environ.get('RUN_MAIN') == 'true' or 'runserver' in sys.argv:
                self.start_scheduler()
    
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