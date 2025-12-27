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

class ProfilingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.profiling'

    def ready(self):
        # Start scheduler only when Django is fully loaded
        import apps.profiling.signals
        # Check if we're running a management command that shouldn't trigger scheduler
        if os.environ.get('SCHEDULER_AUTOSTART') != 'True':
            return

        # 2. Use a file lock to ensure only ONE Gunicorn worker starts this
        # Render's ephemeral storage is shared across workers in the same instance
        lock_file_path = '/tmp/profiling_scheduler.lock'
        
        try:
            self.fp = open(lock_file_path, 'wb')
            # Attempt to get an exclusive lock (non-blocking)
            fcntl.flock(self.fp, fcntl.LOCK_EX | fcntl.LOCK_NB)
            
            # If we reach here, this worker "won" the lock
            logger.info("Worker starting Scheduler & Tesseract...")
            self.start_scheduler()
            self.start_tesseract()
            
        except OSError:
            # Another worker already has the lock
            logger.error("Scheduler already running in another worker. Skipping.")


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