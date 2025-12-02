from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apps.medconsultation.utils import create_future_date_slots # Adjust import path

def start():
    scheduler = BackgroundScheduler()
    
    # Run the function once every day at 12:00 AM (midnight)
    # This ensures you always have a rolling 30-day window of slots
    scheduler.add_job(create_future_date_slots, 'cron', hour=0, minute=0)
    
    scheduler.start()