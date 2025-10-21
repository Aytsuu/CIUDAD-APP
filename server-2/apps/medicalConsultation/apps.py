from django.apps import AppConfig
import os
import sys
import logging

logger = logging.getLogger(__name__)

class MedicalconsultationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.medicalConsultation'
    
    def ready(self):
        # Avoid double-execution with Django's autoreloader
        is_runserver = 'runserver' in sys.argv
        is_reloader_child = is_runserver and os.environ.get('RUN_MAIN') != 'true'
        if is_reloader_child:
            return

        try:
            from .tasks import update_missed_med_appointments
            updated = update_missed_med_appointments()
            logger.info(f"[medicalConsultation.apps.ready] Updated {updated} missed MedConsult appointments on startup")
        except Exception:
            logger.exception("[medicalConsultation.apps.ready] Failed to update missed MedConsult appointments on startup")
