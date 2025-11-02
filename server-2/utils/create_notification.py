import requests
from decouple import config
from datetime import datetime 

"""
    notification = NotificationQueries()
    
    notification.create_notification(
        title="Sample Title",
        message="Sample Message",
        sender_id=1,
        recipient_ids=[1, 2, 3],
        notif_type="info",
        target_obj=None,
        web_route="/sample/path",
        web_params={"key": "value"},
        mobile_route="/mobile/sample/path",
        mobile_params={"key": "value"},
    )
    
    reminder notification
    
    notification.reminder_notification(
        title="Reminder Title",
        message="Reminder Message",
        sender_id=1,
        recipient_ids=[1, 2, 3],
        notif_type="reminder",
        remind_at=datetime(2024, 12, 31, 10, 0, 0),
        target_obj=None,
        web_route="/reminder/path",
        web_params={"key": "value"},
        mobile_route="/mobile/reminder/path",
        mobile_params={"key": "value"},
    )
"""
class NotificationQueries:
    def __init__(self):
        self.client = config("CLIENT", default="http://localhost:8001")
        
    def create_notification(
        self,
        title: str,
        message: str,
        sender,
        recipients: list,
        notif_type: str,
        target_obj=None,
        web_route: str = None,
        web_params: dict = None,
        mobile_route: str = None,
        mobile_params: dict = None,
    ):
        payload = {
            "title": title,
            "message": message,
            "sender_id": sender,
            "recipients": recipients or [],
            "notif_type": notif_type,
            "target_obj": target_obj,
            "web_route": web_route,
            "web_params": web_params or {},
            "mobile_route": mobile_route,
            "mobile_params": mobile_params or {},
        }
        try:
            response = requests.post(
                f"{self.client}/notification/create/", 
                json=payload,
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
        sender,
        recipients: list,
        notif_type: str,
        remind_at: datetime,
        target_obj=None,
        web_route=None,
        web_params=None,
        mobile_route=None,
        mobile_params=None,
    ):
        payload = {
            "title": title,
            "message": message,
            "sender_id": sender,
            "recipients": recipients or [],
            "notif_type": notif_type,
            "remind_at": remind_at,  # must be ISO 8601 string
            "target_obj": target_obj,
            "web_route": web_route,
            "web_params": web_params or {},
            "mobile_route": mobile_route,
            "mobile_params": mobile_params or {},
        }
        try:
            response = requests.post(
                f"{self.client}/notification/create-reminder/", 
                json=payload,
                timeout=5
            )
            response.raise_for_status()
            print(f"Reminder notification successfully sent to Server-1: {response.json()}")
            return True
        except requests.RequestException as e:
            print(f"Error creating reminder notification: {e}")
            return None