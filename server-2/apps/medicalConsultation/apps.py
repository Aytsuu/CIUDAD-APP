from django.apps import AppConfig
from django.conf import settings
from apscheduler.schedulers.background import BackgroundScheduler
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
        
        # Start background scheduler only if autostart is enabled
        if settings.SCHEDULER_AUTOSTART:
            # Only start in main process or designated scheduler process
            if os.environ.get('RUN_SCHEDULER') == 'True' or 'runserver' in sys.argv:
                self.start_scheduler()

    def start_scheduler(self):
        """Initialize and start the background scheduler for medical consultation tasks."""
        try:
            # Import the background checker function
            from .tasks import update_missed_appointments_background
            
            scheduler = BackgroundScheduler()
            
            # Schedule the appointment checker to run every minute
            scheduler.add_job(
                update_missed_appointments_background,
                'interval',
                minutes=1,
                misfire_grace_time=300,  # Allow up to 5 minutes to run if missed
                id='medical_consultation_appointment_checker',
                replace_existing=True
            )

            scheduler.start()
            logger.info("✅ MedicalConsultation scheduler started successfully (checks every minute)")
        except Exception as e:
            logger.error(f"❌ Failed to start MedicalConsultation scheduler: {str(e)}")