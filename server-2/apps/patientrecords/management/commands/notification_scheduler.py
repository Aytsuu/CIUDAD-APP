# management/commands/notification_scheduler.py
import time
import logging
from django.core.management.base import BaseCommand
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.core.management import call_command
from django.conf import settings

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Starts the APScheduler to automatically create daily follow-up notifications'
    
    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 Starting automatic notification scheduler...')
        )
        
        # Create and configure the scheduler
        scheduler = BackgroundScheduler()
        
        # Schedule the follow-up notifications to run daily at 8:00 AM
        scheduler.add_job(
            self.run_daily_followup_notifications,
            trigger=CronTrigger(hour=7, minute=0),  # Daily at 8:00 AM
            id='daily_followup_notifications',
            name='Create daily follow-up visit notifications',
            replace_existing=True
        )
        
        # Optional: Add a test job that runs every 2 minutes for debugging
        # if settings.DEBUG:
        #     scheduler.add_job(
        #         self.run_daily_followup_notifications,
        #         trigger='interval',
        #         minutes=2,
        #         id='test_followup_notifications',
        #         name='Test follow-up notifications (debug mode only)'
        #     )
        
        # Start the scheduler
        scheduler.start()
        self.stdout.write(
            self.style.SUCCESS('✅ Scheduler started! Automatic notifications are enabled.')
        )
        self.stdout.write('📅 Follow-up notifications will run daily at 8:00 AM')
        
        if settings.DEBUG:
            self.stdout.write('🔧 Debug mode: Test job runs every 2 minutes')
        
        # Keep the process running
        try:
            while True:
                time.sleep(60)
        except KeyboardInterrupt:
            self.stdout.write('\n🛑 Stopping scheduler...')
            scheduler.shutdown()
            self.stdout.write(self.style.SUCCESS('✅ Scheduler stopped gracefully.'))
    
    def run_daily_followup_notifications(self):
        """Execute the follow-up notifications command"""
        try:
            self.stdout.write('🔔 Running automatic follow-up notifications...')
            call_command('create_todays_followup_notifications')
            logger.info("Successfully executed automatic follow-up notifications")
        except Exception as e:
            logger.error(f"Failed to run follow-up notifications: {e}")
            self.stdout.write(
                self.style.ERROR(f'❌ Error running notifications: {e}')
            )