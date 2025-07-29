from django.apps import AppConfig

class WasteConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.waste'

    def ready(self):
        import apps.waste.signals