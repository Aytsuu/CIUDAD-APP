# notification_scheduler.py
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

    def add_arguments(self, parser):
        parser.add_argument(
            '--test',
            action='store_true',
            help='Run in test mode: execute jobs immediately and exit',
        )

    def handle(self, *args, **options):
        test_mode = options['test']

        if test_mode:
            self.stdout.write(self.style.WARNING('TEST MODE: Running all jobs immediately...'))
            self.run_all_jobs_once()
            self.stdout.write(self.style.SUCCESS('TEST MODE: All jobs executed.'))
            return

        # === NORMAL MODE ===
        self.stdout.write(self.style.SUCCESS('Starting automatic notification scheduler...'))

        scheduler = BackgroundScheduler()

        # JOB 1: Today + Missed (8:30 AM)
        scheduler.add_job(
            lambda: self.run_cmd('create_todays_followup_notifications'),
            trigger=CronTrigger(hour=8, minute=30),
            id='daily_followup_notifications_morning',
            replace_existing=True
        )

        # JOB 2: Tomorrow Reminder (5:00 PM)
        scheduler.add_job(
            lambda: self.run_cmd('create_day_before_followup_notifications'),
            trigger=CronTrigger(hour=17, minute=0),
            id='daily_followup_notifications_evening',
            replace_existing=True
        )

        scheduler.start()
        self.stdout.write(self.style.SUCCESS('Scheduler started!'))

        try:
            while True:
                time.sleep(60)
        except KeyboardInterrupt:
            scheduler.shutdown()
            self.stdout.write(self.style.SUCCESS('Scheduler stopped.'))

    def run_cmd(self, cmd, *args):
        try:
            self.stdout.write(f'Running: {cmd} {" ".join(args)}')
            call_command(cmd, *args)
        except Exception as e:
            logger.error(f"Job failed: {cmd} - {e}")
            self.stdout.write(self.style.ERROR(f'Job failed: {e}'))

    def run_all_jobs_once(self):
        """Run all scheduled jobs immediately for testing"""
        self.stdout.write("1. Running TODAY + MISSED follow-ups...")
        self.run_cmd('create_todays_followup_notifications', '--test')

        self.stdout.write("\n2. Running TOMORROW reminders...")
        self.run_cmd('create_day_before_followup_notifications', '--test')