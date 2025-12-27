from django.apps import AppConfig
from django.conf import settings
from django.utils import timezone
from django.db.models.signals import post_migrate
from apscheduler.schedulers.background import BackgroundScheduler
import logging
import fcntl
import os

logger = logging.getLogger(__name__)

class AnnouncementConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.announcement'

    def ready(self):
        if os.environ.get("SCHEDULER_AUTOSTART") != 'True':
            return

        lock_file_path = '/tmp/announcement_scheduler.lock'

        try:
            self.fp = open(lock_file_path, 'wb')
            fcntl.flock(self.fp, fcntl.LOCK_EX | fcntl.LOCK_NB)
            
            logger.info("Announcement Scheduler starting...")
            self.start_scheduler()
        except OSError:
            # Another worker already has the lock
            logger.error("Scheduler already running in another worker. Skipping.")

    def start_scheduler(self, **kwargs):
        """Initialize and start the background scheduler"""
        try:
            from .tasks import update_ann_status

            scheduler = BackgroundScheduler()
            scheduler.add_job(
                update_ann_status,
                'interval',
                seconds=5,
                next_run_time=timezone.now(),  # timezone-aware
                misfire_grace_time=900,
                id='announcement_status_update',
            )
            scheduler.start()
            # logger.info("✅ Announcement scheduler started successfully")
        except Exception as e:
            logger.error(f"Failed to start scheduler: {str(e)}")
