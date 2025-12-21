from django.apps import AppConfig
from django.conf import settings

class NotificationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notification'

    def ready(self):
        from apps.notification.utils import start_scheduler
        import sys

        # Check if we're running a management command that shouldn't trigger scheduler
        if 'manage.py' in sys.argv[0]:
            if len(sys.argv) > 1 and sys.argv[1] in ['migrate', 'makemigrations', 'showmigrations']:
                return

            if settings.SCHEDULER_AUTOSTART:
                start_scheduler()