from django.apps import AppConfig
from django.conf import settings
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ProfilingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.profiling'

    def ready(self):
        # Start scheduler only when Django is fully loaded
        if settings.SCHEDULER_AUTOSTART: 
            self.start_scheduler()

    def start_scheduler(self):
        """Initialize and start the background scheduler"""
        try:
            from .tasks import update_expired_requests 
            
            scheduler = BackgroundScheduler()
            scheduler.add_job(
                update_expired_requests,
                'interval',
                minutes=15,
                next_run_time=datetime.now(),
                misfire_grace_time=900,
                id='expired_requests_check'  # Unique ID for the job
            )
            scheduler.start()
            logger.info("Scheduler started successfully")
        except Exception as e:
            logger.error(f"Failed to start scheduler: {str(e)}")