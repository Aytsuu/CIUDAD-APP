# # notif_scheduler.py - UPDATED VERSION
# import time
# import logging
# from django.core.management.base import BaseCommand
# from apscheduler.schedulers.background import BackgroundScheduler
# from apscheduler.triggers.cron import CronTrigger
# from django.core.management import call_command
# from django.conf import settings
# from django.utils import timezone

# logger = logging.getLogger(__name__)

# class Command(BaseCommand):
#     help = 'Starts APScheduler for all notification services'

#     def handle(self, *args, **options):
#         self.stdout.write(self.style.SUCCESS('Starting comprehensive notification scheduler...'))

#         scheduler = BackgroundScheduler(timezone=timezone.get_current_timezone())

#         # MEDICAL APPOINTMENTS - Use the medical-specific scheduler
#         scheduler.add_job(
#             self.run_medical_scheduler,
#             trigger=CronTrigger(hour=6, minute=0),  # Start at 6 AM
#             id='medical_appointment_scheduler',
#             name='Medical Appointment Scheduler Starter',
#             replace_existing=True
#         )

#         # FOLLOW-UP VISITS - 8:00 AM
#         scheduler.add_job(
#             self.run_followup_notifications,
#             trigger=CronTrigger(hour=8, minute=0),
#             id='daily_followup_notifications',
#             name='Daily Follow-up Visit Notifications',
#             replace_existing=True
#         )

#         # Debug mode
#         if settings.DEBUG:
#             scheduler.add_job(
#                 self.run_medical_scheduler,
#                 trigger='interval',
#                 minutes=10,
#                 id='debug_medical_scheduler',
#                 name='[DEBUG] Medical Scheduler'
#             )
#             self.stdout.write(self.style.WARNING('DEBUG mode: Medical scheduler every 10 minutes'))

#         scheduler.start()
#         self.stdout.write(self.style.SUCCESS('Comprehensive scheduler started!'))
#         self.stdout.write('   • Medical appointments: 6:00 AM starter')
#         self.stdout.write('   • Follow-up visits: 8:00 AM')

#         try:
#             while True:
#                 time.sleep(60)
#         except KeyboardInterrupt:
#             self.stdout.write('\nStopping scheduler...')
#             scheduler.shutdown()
#             self.stdout.write(self.style.SUCCESS('Stopped.'))

#     def run_medical_scheduler(self):
#         """Start the medical appointment scheduler"""
#         try:
#             self.stdout.write(f"{timezone.now()}: Starting medical appointment scheduler...")
#             call_command('medical_appointment_scheduler')
#         except Exception as e:
#             logger.error(f"Medical scheduler failed: {e}")

#     def run_followup_notifications(self):
#         """Run follow-up notifications"""
#         try:
#             self.stdout.write(f"{timezone.now()}: Running follow-up notifications...")
#             call_command('create_todays_followup_notifications')
#             logger.info("Follow-up notifications executed")
#         except Exception as e:
#             logger.error(f"Follow-up job failed: {e}")