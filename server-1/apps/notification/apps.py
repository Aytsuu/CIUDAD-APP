from django.apps import AppConfig

class NotificationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notification'

    def ready(self):
        from apps.notification.tasks import start_scheduler
        start_scheduler()