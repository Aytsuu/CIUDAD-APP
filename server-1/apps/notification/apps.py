from django.apps import AppConfig
from django.conf import settings
import os
import sys

class NotificationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notification'

    def ready(self):
        from apps.notification.utils import start_scheduler
        import sys

        # Check if we're running a management command that shouldn't trigger scheduler
        if settings.SCHEDULER_AUTOSTART: 
            if os.environ.get('RUN_SCHEDULER') == 'True' or 'runserver' in sys.argv:
                start_scheduler()