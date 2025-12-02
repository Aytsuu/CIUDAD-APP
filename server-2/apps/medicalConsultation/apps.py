from django.apps import AppConfig
from django.conf import settings
import logging
import os
import sys

logger = logging.getLogger(__name__)

class MedicalConsultationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.medicalConsultation' 
    
    def ready(self):
        self.register_signals()
        
        if getattr(settings, 'SCHEDULER_AUTOSTART', False):
            if os.environ.get('RUN_MAIN') == 'true' or os.environ.get('RUN_SCHEDULER') == 'True':
                self.start_scheduler()

    def register_signals(self):
        try:
            from . import signals
            logger.info("✅ MedicalConsultation signals registered")
        except Exception as e:
            logger.error(f"❌ Failed to register MedicalConsultation signals: {e}")

    def start_scheduler(self):
        try:
            from apscheduler.schedulers.background import BackgroundScheduler
            from apscheduler.triggers.cron import CronTrigger
            
            # Import tasks
            from .tasks import update_missed_appointments_background, send_daily_pending_appointments_notification
            # Import the creation AND deletion functions
            from .utils import create_future_date_slots, delete_past_date_slots
            
            scheduler = BackgroundScheduler()

            # 1. Missed appointments check (6 PM)
            scheduler.add_job(
                update_missed_appointments_background,
                trigger=CronTrigger(hour=18, minute=0, timezone='Asia/Manila'),
                id="medical_consultation_missed_check",
                replace_existing=True
            )
            
            # 2. Daily pending notification (Midnight)
            scheduler.add_job(
                send_daily_pending_appointments_notification,
                trigger=CronTrigger(hour=0, minute=0, timezone='Asia/Manila'),
                id="daily_pending_appointments_notification",
                replace_existing=True
            )

            # 3. Create Future Slots (12:01 AM)
            scheduler.add_job(
                create_future_date_slots,
                trigger=CronTrigger(hour=0, minute=1, timezone='Asia/Manila'),
                id="daily_slot_creation",
                replace_existing=True
            )

            # 4. [NEW] Delete Old Slots (12:30 AM)
            # This deletes yesterday's data to keep the database clean
            scheduler.add_job(
                delete_past_date_slots,
                trigger=CronTrigger(hour=0, minute=30, timezone='Asia/Manila'),
                id="daily_slot_cleanup",
                replace_existing=True
            )

            scheduler.start()
            
            logger.info("✅ MedicalConsultation scheduler started")
            
            # Run checks immediately on startup so you don't have to wait
            logger.info("⏳ Running initial slot maintenance...")
            create_future_date_slots() # Create slots for next 30 days
            delete_past_date_slots()   # Delete any old junk data
            logger.info("✅ Slot maintenance complete.")
            
        except Exception as e:
            logger.error(f"❌ Failed to start MedicalConsultation scheduler: {str(e)}")