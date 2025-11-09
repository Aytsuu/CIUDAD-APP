import logging
import os
import sys
from django.apps import AppConfig
from django.db import connection
from django.db.utils import OperationalError
from django.db.backends.signals import connection_created
from django.dispatch import receiver
from apps.medicineservices.task import update_expired_medicine_requests

logger = logging.getLogger(__name__)


class MedicineConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.medicineservices'

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

                @receiver(connection_created)
                def run_startup_tasks(sender, connection, **kwargs):
                    # This runs after the database connection is established
                    # Remove the receiver after first execution
                    connection_created.disconnect(run_startup_tasks)

                    try:
                        updated = update_expired_medicine_requests()
                        logger.info(f"[MedicineConfig.ready] Updated {updated} expired medicine requests on startup")
                    except Exception:
                        logger.exception("[MedicineConfig.ready] Failed to update expired medicine requests on startup")

            except OperationalError:
                # Database not ready yet (e.g., during initial setup)
                logger.warning("[MedicineConfig.ready] Database not ready, skipping expired medicine requests update")
            except Exception as e:
                logger.exception(f"[MedicineConfig.ready] Error during startup: {e}")