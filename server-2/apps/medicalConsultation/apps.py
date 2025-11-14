from django.apps import AppConfig
import logging
import os
import sys

logger = logging.getLogger(__name__)

class MedicalconsultationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.medicalConsultation'
    
    def ready(self):
        # Import signals to register them
        try:
            from . import signals
            logger.info("✅ MedicalConsultation signals registered")
        except Exception as e:
            logger.exception(f"❌ Failed to import signals: {e}")
        
        # Start background checker (only in main process, not in reloader)
        # This runs every minute automatically to update missed appointments
        if os.environ.get('RUN_MAIN') == 'true' or 'runserver' not in sys.argv:
            try:
                from .background_checker import start_appointment_checker
                start_appointment_checker()
                logger.info("✅ MedicalConsultation background checker started (checks every minute)")
            except Exception as e:
                logger.exception(f"❌ Failed to start background appointment checker: {e}")