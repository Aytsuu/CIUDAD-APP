from django.core.management import call_command
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

def run_notification_checks(command_name, missed_days=None):
    logger.info(f"[{timezone.now().strftime('%Y-%m-%d %H:%M:%S')}] Running {command_name}...")
    
    try:
        if command_name == 'create_todays_followup_notifications' and missed_days:
            call_command(command_name, f'--missed-days={missed_days}')
        else:
            call_command(command_name)
            
        logger.info(f"✅ {command_name} completed successfully.")
    except Exception as e:
        logger.error(f"❌ ERROR: Failed to run {command_name}: {e}")