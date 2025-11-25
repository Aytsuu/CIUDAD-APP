from django.apps import AppConfig
from django.conf import settings
from django.utils import timezone
from apscheduler.schedulers.background import BackgroundScheduler
import logging
import os

logger = logging.getLogger(__name__)

class AnnouncementConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.announcement'

    def ready(self):
        # Prevent duplicate schedulers in autoreload
        if settings.SCHEDULER_AUTOSTART:
            self.start_scheduler()

    def start_scheduler(self):
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
            logger.info("✅ Announcement scheduler started successfully")
        except Exception as e:
            logger.error(f"Failed to start scheduler: {str(e)}")
