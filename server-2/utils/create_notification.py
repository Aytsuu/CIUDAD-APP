import requests
from decouple import config
from datetime import datetime

class NotificationQueries:
    def __init__(self):
        self.client = config("CLIENT", default="http://localhost:8001")

    def create_notification(
        self,
        title: str,
        message: str,
        recipients: list,
        notif_type: str,
        web_route: str = None,
        web_params: dict = None,
        mobile_route: str = None,
        mobile_params: dict = None,
    ):
        payload = {
            "title": title,
            "message": message,
            "recipients": recipients or [],
            "notif_type": notif_type,
            "web_route": web_route,
            "web_params": web_params or {},
            "mobile_route": mobile_route,
            "mobile_params": mobile_params or {},
        }

        try:
            response = requests.post(
                f"{self.client}/notification/create/",
                json=payload,
                headers=headers,
                timeout=5
            )
            response.raise_for_status()
            print(f"Notification successfully sent to Server-1: {response.json()}")
            return True
        except requests.RequestException as e:
            print(f"Error creating notification: {e}")
            return None

    def reminder_notification(
        self,
        title: str,
        message: str,
        recipients: list,
        notif_type: str,
        remind_at: datetime,
        web_route=None,
        web_params=None,
        mobile_route=None,
        mobile_params=None,
    ):
        # Convert datetime to ISO 8601 string
        remind_at_iso = remind_at.isoformat()

        payload = {
            "title": title,
            "message": message,
            "recipients": recipients or [],
            "notif_type": notif_type,
            "remind_at": remind_at_iso,
            "web_route": web_route,
            "web_params": web_params or {},
            "mobile_route": mobile_route,
            "mobile_params": mobile_params or {},
        }

        try:
            response = requests.post(
                f"{self.client}/notification/create-reminder/",
                json=payload,
                headers=headers,
                timeout=5
            )
            response.raise_for_status()
            print(f"Reminder notification successfully sent to Server-1: {response.json()}")
            return True
        except requests.RequestException as e:
            print(f"Error creating reminder notification: {e}")
            return None
