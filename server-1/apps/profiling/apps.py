from django.apps import AppConfig
from django.conf import settings
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import logging
import os
import sys

logger = logging.getLogger(__name__)

class ProfilingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.profiling'

    def ready(self):
        # Start scheduler only when Django is fully loaded
        import apps.profiling.signals
        import sys

        # Check if we're running a management command that shouldn't trigger scheduler
        if settings.SCHEDULER_AUTOSTART: 
            if os.environ.get('RUN_SCHEDULER') == 'True' or 'runserver' in sys.argv:
                self.start_scheduler()
                self.start_tesseract()

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
            logger.info("✅ Expired request checker started successfully")
        except Exception as e:
            logger.error(f"Failed to start scheduler: {str(e)}")
    
    def start_tesseract(self):
        """Initialize and start tesseract model"""
        try:
            from .tasks import get_face_recognition_models

            # Call methood
            get_face_recognition_models()
            logger.info("✅ Tesseract initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize tesseract: {str(e)}")