from django.apps import AppConfig

class TreasurerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.treasurer'

    def ready(self):
        import apps.treasurer.signals