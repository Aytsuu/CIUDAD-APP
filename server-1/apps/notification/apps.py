from django.apps import AppConfig
from django.conf import settings
from django.db.models.signals import post_migrate
import os
import sys
import logging
import fcntl

logger = logging.getLogger(__name__)

class NotificationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notification'

    def ready(self):
        # Ensure schedulers start after models are migrated
        post_migrate.connect(self.run_setup)

    def run_setup(self, **kwargs):
        from apps.notification.utils import start_scheduler
        # Check if we're running a management command that shouldn't trigger scheduler
        if os.environ.get('SCHEDULER_AUTOSTART') != 'True':
            return

        lock_file_path = '/tmp/notification_scheduler.lock'

        try:
            self.fp = open(lock_file_path, 'wb')
            fcntl.flock(self.fp, fcntl.LOCK_EX | fcntl.LOCK_NB)

            logger.info('Notification Scheduler starting...')
            start_scheduler()
        except OSError:
            logger.error("Scheduler already running in another worker. Skipping.")
        
