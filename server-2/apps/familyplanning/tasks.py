from django.core.management import call_command
from django.utils import timezone

def run_followup_check():
    """
    Function executed by APScheduler to run the Django management command.
    """
    # Log to the console/server logs that the task is starting
    print(f"[{timezone.now().strftime('%Y-%m-%d %H:%M:%S')}] Running Family Planning follow-up status check...")
    
    try:
        # EXECUTES THE LOGIC: The 'check_followups' management command
        call_command('check_followups')
        print("Family Planning follow-up check completed successfully.")
    except Exception as e:
        # Log any errors that occur during the command execution
        print(f"ERROR: Failed to run follow-up check: {e}")