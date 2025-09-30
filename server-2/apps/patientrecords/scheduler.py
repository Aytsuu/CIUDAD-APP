
import sys
from apscheduler.schedulers.background import BackgroundScheduler
from django.core.management import call_command
from django.utils import timezone

def run_followup_check():
    """
    Function to call the Django management command.
    """
    # Use timezone.localtime() for logging or display if needed
    print(f"[{timezone.now().strftime('%Y-%m-%d %H:%M:%S')}] Running daily follow-up check...")
    
    try:
        # Calls the management command you created earlier (check_followups)
        call_command('check_followups')
        print("Follow-up check completed successfully.")
    except Exception as e:
        print(f"Error running follow-up check: {e}")


def start_scheduler():
    """
    Initializes and starts the BackgroundScheduler.
    """
    scheduler = BackgroundScheduler()

    # Schedule the job to run every day at a specific time (e.g., 2:00 AM)
    # This is a good time for maintenance tasks.
    scheduler.add_job(
        run_followup_check, 
        'cron', 
        hour=2, 
        minute=0, 
        id='followup_check_job',
        replace_existing=True
    )

    try:
        # Start the scheduler
        scheduler.start()
        print("APScheduler started successfully. Follow-up check scheduled for 2:00 AM daily.")
    except Exception as e:
        print(f"Failed to start APScheduler: {e}")