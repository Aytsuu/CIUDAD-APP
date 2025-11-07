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
        
        scheduler = BackgroundScheduler()
        
        # JOB 1: Today's follow-ups and missed follow-ups (Morning check)
        scheduler.add_job(
            lambda: self.run_notification_command('create_todays_followup_notifications'),
            trigger=CronTrigger(hour=8, minute=30),
            id='daily_followup_notifications_morning',
            name='Create today\'s and missed follow-up visit notifications',
            replace_existing=True
        )
        
        # JOB 2: Tomorrow's follow-ups reminder (Evening check)
        scheduler.add_job(
            lambda: self.run_notification_command('create_day_before_followup_notifications'),
            trigger=CronTrigger(hour=17, minute=0),  # Daily at 5:00 PM
            id='daily_followup_notifications_evening',
            name='Create tomorrow\'s follow-up visit reminders',
            replace_existing=True
        )
        
        # JOB 3: Missed follow-ups only (Mid-day check)
        scheduler.add_job(
            lambda: self.run_notification_command('create_todays_followup_notifications', '--missed-days', '1'),
            trigger=CronTrigger(hour=12, minute=0),  # Daily at 12:00 PM
            id='missed_followup_notifications',
            name='Check for missed follow-up visits',
            replace_existing=True
        )
        
        # Start the scheduler
        scheduler.start()
        self.stdout.write(
            self.style.SUCCESS('✅ Scheduler started! Automatic notifications are enabled.')
        )
        # self.stdout.write('📅 Today\'s & missed notifications: Daily at 7:00 AM')
        # self.stdout.write('📅 Tomorrow\'s reminders: Daily at 5:00 PM')
        # self.stdout.write('📅 Missed follow-ups check: Daily at 12:00 PM')
        
        # if settings.DEBUG:
        #     # Optional: Test job for debugging
        #     scheduler.add_job(
        #         lambda: self.run_notification_command('create_todays_followup_notifications', '--test'),
        #         trigger=CronTrigger(minute='*/5'),  # Every 5 minutes in debug
        #         id='test_notifications',
        #         name='Test notifications (debug mode only)',
        #         replace_existing=True
        #     )
        #     self.stdout.write('🔧 Debug mode: Test job runs every 5 minutes')
        
        # Keep the process running
        try:
            while True:
                time.sleep(60)
        except KeyboardInterrupt:
            self.stdout.write('\n🛑 Stopping scheduler...')
            scheduler.shutdown()
            self.stdout.write(self.style.SUCCESS('✅ Scheduler stopped gracefully.'))
    
    def run_notification_command(self, command_name, *args):
        """Execute a specific follow-up notifications command"""
        try:
            self.stdout.write(f'🔔 Running automatic command: {command_name} {" ".join(args)}...')
            call_command(command_name, *args)
            logger.info(f"Successfully executed automatic command: {command_name}")
        except Exception as e:
            logger.error(f"Failed to run {command_name}: {e}")
            self.stdout.write(
                self.style.ERROR(f'❌ Error running {command_name}: {e}')
            )