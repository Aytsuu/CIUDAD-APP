import time
import logging
from django.core.management.base import BaseCommand
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django.core.management import call_command
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Starts APScheduler for medical appointment notifications'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting medical appointment scheduler...'))
        
        # Use the correct timezone
        scheduler = BackgroundScheduler(timezone=timezone.get_current_timezone())
        
        # TODAY'S APPOINTMENTS - Run at 7:30 AM daily
        scheduler.add_job(
            self.run_todays_appointments,
            trigger=CronTrigger(hour=7, minute=30),
            id='daily_todays_appointments',
            name='Daily Today\'s Appointment Notifications',
            replace_existing=True
        )
        
        # TOMORROW'S APPOINTMENTS - Run at 4:00 PM daily (for next day reminders)
        scheduler.add_job(
            self.run_tomorrows_appointments,
            trigger=CronTrigger(hour=16, minute=0),  # 4:00 PM
            id='daily_tomorrows_appointments',
            name='Daily Tomorrow\'s Appointment Notifications',
            replace_existing=True
        )
        
        # NEW APPOINTMENTS CHECK - Run every 30 minutes during business hours
        scheduler.add_job(
            self.run_new_appointments_check,
            trigger=CronTrigger(hour='8-17', minute='0,30'),  # 8AM-5PM, every 30 mins
            id='new_appointments_check',
            name='New Appointments Check',
            replace_existing=True
        )
        
        # Debug mode: Run every 5 minutes for testing
        if settings.DEBUG:
            scheduler.add_job(
                self.run_test_notifications,
                trigger='interval',
                minutes=5,
                id='test_appointment_notifications',
                name='[DEBUG] Test Appointment Notifications'
            )
            self.stdout.write(self.style.WARNING('DEBUG mode: Running every 5 minutes'))
        
        scheduler.start()
        self.stdout.write(self.style.SUCCESS('Medical appointment scheduler started!'))
        self.stdout.write('   • Today\'s appointments: 7:30 AM')
        self.stdout.write('   • Tomorrow\'s appointments: 4:00 PM')
        self.stdout.write('   • New appointments check: Every 30 mins (8AM-5PM)')
        
        # Keep the scheduler running
        try:
            while True:
                time.sleep(60)
        except KeyboardInterrupt:
            self.stdout.write('\nStopping scheduler...')
            scheduler.shutdown()
            self.stdout.write(self.style.SUCCESS('Scheduler stopped.'))
    
    def run_todays_appointments(self):
        """Run notifications for today's appointments"""
        try:
            self.stdout.write(f"{timezone.now()}: Running today's appointment notifications...")
            call_command('create_notif_consult')  # Your existing command for today
            logger.info("Today's appointment notifications executed successfully")
        except Exception as e:
            logger.error(f"Today's appointment job failed: {e}")
            self.stdout.write(self.style.ERROR(f"Today's appointment job failed: {e}"))
    
    def run_tomorrows_appointments(self):
        """Run notifications for tomorrow's appointments"""
        try:
            self.stdout.write(f"{timezone.now()}: Running tomorrow's appointment notifications...")
            call_command('create_notif_consult', '--tomorrow')  # Use tomorrow flag
            logger.info("Tomorrow's appointment notifications executed successfully")
        except Exception as e:
            logger.error(f"Tomorrow's appointment job failed: {e}")
            self.stdout.write(self.style.ERROR(f"Tomorrow's appointment job failed: {e}"))
    
    def run_new_appointments_check(self):
        """Check for new appointments created recently"""
        try:
            self.stdout.write(f"{timezone.now()}: Checking for new appointments...")
            # You can create a separate command for this or extend your existing one
            call_command('create_notif_consult', '--test')  # Test mode for new appointments
            logger.info("New appointments check completed")
        except Exception as e:
            logger.error(f"New appointments check failed: {e}")
    
    def run_test_notifications(self):
        """Test notifications in debug mode"""
        try:
            self.stdout.write(f"{timezone.now()}: [DEBUG] Running test notifications...")
            call_command('create_notif_consult', '--test')
            logger.info("Debug test notifications executed")
        except Exception as e:
            logger.error(f"Debug test failed: {e}")