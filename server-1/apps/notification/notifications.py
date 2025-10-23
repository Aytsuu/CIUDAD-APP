import firebase_admin
from firebase_admin import messaging, credentials, exceptions
import os 

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate(os.path.join(os.path.dirname(__file__), "firebase-key.json"))
    firebase_admin.initialize_app(cred)
    
def send_push_notification(token, title, message, data):
    formatted_data = {}
    if data:
        for key, value in data.items():
            formatted_data[key] = str(value)
        print(f"📦 Data payload: {formatted_data}")
    
    fcm_message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=message
        ),
        data=formatted_data,  # This will be accessible in React Native
        token=token,
        android=messaging.AndroidConfig(
            priority='high',
            notification=messaging.AndroidNotification(
                sound='default',
                priority='high',
                channel_id='default',  # Must match channel created in React Native
                default_sound=True,
            )
        ),
        apns=messaging.APNSConfig(
            payload=messaging.APNSPayload(
                aps=messaging.Aps(
                    sound='default',
                    badge=1,
                    content_available=True,
                )
            )
        )
    )

    try:
        response = messaging.send(fcm_message)
        print(f"✅ Successfully sent message: {response}")
        return response
    except exceptions.InvalidArgumentError as e:
        print(f"❌ Invalid argument error: {e}")
        return None
    except exceptions.UnregisteredError as e:
        print(f"❌ Token is unregistered/invalid: {e}")
        return None
    except Exception as e:
        print(f"❌ Error sending message: {e}")
        print(f"❌ Error type: {type(e).__name__}")
        return None