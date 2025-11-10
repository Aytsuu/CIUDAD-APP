import firebase_admin
from firebase_admin import messaging, credentials, exceptions
import os

"""
Handles sending push notifications using Firebase Cloud Messaging (FCM).
This is called by create_notification() in utils.py.
"""

# Initialize Firebase Admin SDK once
if not firebase_admin._apps:
    cred_path = os.path.join(os.path.dirname(__file__), "firebase-key.json")
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

def send_push_notification(token: str, title: str, message: str, data: dict = None):
    """
    Sends a push notification to a single device using Firebase Cloud Messaging (FCM).
    """
    formatted_data = {}

    # Ensure all data values are strings (FCM requires string values)
    if data:
        formatted_data = {str(k): str(v) for k, v in data.items()}
        print(f"📦 Data payload: {formatted_data}")

    # Construct the FCM message
    fcm_message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=message
        ),
        data=formatted_data,
        token=token,
        android=messaging.AndroidConfig(
            priority='high',
            notification=messaging.AndroidNotification(
                sound='default',
                channel_id='default', 
            ),
        ),
        apns=messaging.APNSConfig(
            payload=messaging.APNSPayload(
                aps=messaging.Aps(
                    sound='default',
                    badge=1,
                    content_available=True,
                )
            )
        ),
    )

    # Try sending the message
    try:
        response = messaging.send(fcm_message)
        print("Successfully sent message:", response)
        return response

    except exceptions.InvalidArgumentError as e:
        print(f"❌ Invalid argument error: {e}")
        return None

    except firebase_admin.exceptions.FirebaseError as e:
        print(f"❌ Token unregistered or invalid: {e}")
        return None

    except Exception as e:
        print(f"❌ General error sending message: {e}")
        print(f"❌ Error type: {type(e).__name__}")
        return None
