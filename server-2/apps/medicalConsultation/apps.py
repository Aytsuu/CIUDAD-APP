from django.apps import AppConfig
import os
import sys
import logging
from django.db import connection
from django.db.utils import OperationalError

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

        # Only run the task update if the database is ready and we're not in a migration
        if 'migrate' not in sys.argv and 'makemigrations' not in sys.argv:
            try:
                # Check if database connection is ready
                connection.ensure_connection()
                
                # Import here to avoid circular imports
                from django.core.management import call_command
                
                # Use a management command or delayed task instead
                # Option 1: Call via management command (create one if needed)
                # call_command('update_missed_appointments')
                
                # Option 2: Use Django signals (recommended)
                from django.db.backends.signals import connection_created
                from django.dispatch import receiver
                
                @receiver(connection_created)
                def run_startup_tasks(sender, connection, **kwargs):
                    # This runs after the database connection is established
                    # Remove the receiver after first execution
                    connection_created.disconnect(run_startup_tasks)
                    
                    try:
                        from .tasks import update_missed_med_appointments
                        updated = update_missed_med_appointments()
                        logger.info(f"[medicalConsultation.apps.ready] Updated {updated} missed MedConsult appointments on startup")
                    except Exception:
                        logger.exception("[medicalConsultation.apps.ready] Failed to update missed MedConsult appointments on startup")
                        
            except OperationalError:
                # Database not ready yet (e.g., during initial setup)
                logger.warning("[medicalConsultation.apps.ready] Database not ready, skipping missed appointments update")
            except Exception as e:
                logger.exception(f"[medicalConsultation.apps.ready] Error during startup: {e}")