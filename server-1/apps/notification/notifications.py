import firebase_admin
from firebase_admin import messaging, credentials
import os 

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate(os.path.join(os.path.dirname(__file__), "firebase-key.json"))
    firebase_admin.initialize_app(cred)
    
def send_push_notification(token, title, message, data=None):
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=message
        ),
        token=token,
        data=data or {},
    )

    try:
        response = messaging.send(message)
        print("Successfully sent message:", response)
        return response
    except Exception as e:
        print("Error sending message:", e)
        return None

