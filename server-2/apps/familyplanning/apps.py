# familyplanning/apps.py

from django.apps import AppConfig
from django.conf import settings
from apscheduler.schedulers.background import BackgroundScheduler
import logging
import os
import sys

logger = logging.getLogger(__name__)

class FamilyplanningConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    # NOTE: Ensure this name matches your app's actual path
    name = 'apps.familyplanning' 

    def ready(self):
        # Only start the scheduler if SCHEDULER_AUTOSTART is True in settings
        if settings.SCHEDULER_AUTOSTART: 
            # Crucial check: only allow the scheduler to run in the main process (or the one designated as the master)
            if os.environ.get('RUN_SCHEDULER') == 'True' or 'runserver' in sys.argv:
                self.start_scheduler()

    def start_scheduler(self):
        """Initialize and start the background scheduler for family planning tasks."""
        try:
            # Import the task function 
            from .tasks import run_followup_check
            
            scheduler = BackgroundScheduler()
            
            # --- Schedule the Daily Follow-up Check Job ---
            scheduler.add_job(
                run_followup_check,
                'cron',              # Use 'cron' for time-of-day scheduling
                hour=2,              # Run every day at 2 AM (02:00)
                minute=0,
                misfire_grace_time=3600, # Allow up to 1 hour to run if missed
                id='family_planning_followup_check', # Unique ID
                replace_existing=True
            )

            scheduler.start()
            logger.info("Family Planning Scheduler started successfully. Follow-up check scheduled for 2:00 AM daily.")
        except Exception as e:
            logger.error(f"Failed to start Family Planning scheduler: {str(e)}")