from django.apps import AppConfig
import logging
from django.conf import settings
import os
import sys

logger = logging.getLogger(__name__)

def create_initial_categories(sender, **kwargs):
    from .models import VaccineCategory  # Import inside function to avoid circular import
    VaccineCategory.objects.get_or_create(
        vaccat_id=1, defaults={'vaccat_type': 'Vaccine'}
    )
    VaccineCategory.objects.get_or_create(
        vaccat_id=2, defaults={'vaccat_type': 'Immunization Supplies'}
    )

class InventoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.inventory'
    
    def ready(self):
        # Import and register signals
        self.register_signals()
        
        # Only start the scheduler if SCHEDULER_AUTOSTART is True in settings
        if settings.SCHEDULER_AUTOSTART: 
            # Crucial check: only allow the scheduler to run in the main process
            if os.environ.get('RUN_SCHEDULER') == 'True' or 'runserver' in sys.argv:
                self.start_scheduler()

    def register_signals(self):
        """Import and register signal handlers"""
        try:
            from . import signals
            logger.info("✅ Inventory signals registered")
        except Exception as e:
            logger.error(f"❌ Failed to register inventory signals: {e}")

    def start_scheduler(self):
        try:
            from apscheduler.schedulers.background import BackgroundScheduler
            from .tasks import run_inventory_checks

            scheduler = BackgroundScheduler()

            # Schedule with reasonable interval since notifications are one-time
            scheduler.add_job(
                run_inventory_checks,
                'interval',
                hours=12,  # Check twice a day, but notifications are one-time only
                misfire_grace_time=3600,
                id="inventory_notification_job",
                replace_existing=True,
            )

            scheduler.start()
            logger.info("✅ Inventory Scheduler started: checks every 12 hours (one-time notifications only)")

        except Exception as e:
            logger.error(f"❌ Failed to start inventory scheduler: {str(e)}")