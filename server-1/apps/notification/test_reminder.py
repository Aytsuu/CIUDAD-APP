import requests
from datetime import datetime, timedelta

# Schedule a reminder for 5 minutes from now
remind_time = datetime.now() + timedelta(minutes=1)

data = {
    "title": "Test Reminder",
    "message": "This is a test notification reminder",
    "sender": "system",
    "recipients": ["00001250924"],  # ResidentProfile IDs - CHANGE THESE TO REAL IDs
    "notif_type": "test_reminder",
    "send_at": remind_time.isoformat(),
    "web_route": "/dashboard",
    "web_params": {
        "section": "notifications",
        "highlight": True
    },
    "mobile_route": "Dashboard",
    "mobile_params": {
        "tab": "notifications"
    },
}

response = requests.post(
    'http://localhost:8000/notification/create-reminder/',  # Change port if needed
    json=data
)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")
