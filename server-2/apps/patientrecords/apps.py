# patientrecords/apps.py

from django.apps import AppConfig

class PatientrecordsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.patientrecords'

    def ready(self):
        # Import the function to start the scheduler
        from . import scheduler
        
        # Only start the scheduler if Django is running in the main process (not during migrations, etc.)
        if 'runserver' in scheduler.sys.argv or 'gunicorn' in scheduler.sys.argv:
            scheduler.start_scheduler()