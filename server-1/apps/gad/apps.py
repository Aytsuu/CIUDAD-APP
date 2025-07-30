from django.apps import AppConfig


class GadConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.gad'

    def ready(self):
        import apps.gad.signals