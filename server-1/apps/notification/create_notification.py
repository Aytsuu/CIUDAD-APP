from apps.notification.models import FCMToken, Recipient, Notification
from .notifications import send_push_notification
from apps.account.models import Account
from django.contrib.contenttypes.models import ContentType

def create_notification(title, message, sender, recipients, notif_type, target_obj=None):
    """
    Create a notification and send push notifications to recipients."""
    print("Creating notification...")
    
    recipient_accounts = []

    # Get Account objects from ResidentProfile
    for rp in recipients:
        account = Account.objects.filter(rp=rp).first()
        if account:
            print(f"Found account: {account.username}")
            recipient_accounts.append(account)
        else:
            print(f"No account found for ResidentProfile: {rp.rp_id}")
    
    # Prepare notification data
    notification_data = {
        'notif_title': title,
        'notif_message': message,
        'sender': sender,
        'notif_type': notif_type
    }
    
    # Add generic relation if target object is provided
    if target_obj:
        notification_data['content_type'] = ContentType.objects.get_for_model(target_obj)
        notification_data['object_id'] = target_obj.pk
    
    # Create the notification entry
    notification = Notification.objects.create(**notification_data)
    print(f"Notification created with ID: {notification.notif_id}")
    
    # Create recipient entries
    for rp in recipients:
        recipient = Recipient.objects.create(
            notif=notification,
            rp=rp
        )
        print(f"Recipient created for rp_id: {rp.rp_id}")
    
    # Get redirect URL for the notification
    redirect_url = None
    if target_obj and hasattr(target_obj, 'get_absolute_url'):
        redirect_url = target_obj.get_absolute_url()
        print(f"Redirect URL: {redirect_url}")
    
    # Send push notifications via FCM
    for acc in recipient_accounts:
        tokens = FCMToken.objects.filter(acc=acc).values_list('fcm_token', flat=True)
        print(f"Found {len(tokens)} FCM tokens for {acc.username}")
        
        for token in tokens:
            # Prepare FCM data payload
            fcm_data = {
                "notification_id": str(notification.notif_id),
                "type": notif_type,
                "sender_name": sender.username if sender else "System",
            }
            
            # Add redirect URL to FCM data if available
            if redirect_url:
                fcm_data["redirect_url"] = redirect_url
            
            # Add sender avatar if available
            if sender and hasattr(sender, 'avatar') and sender.avatar:
                avatar_url = sender.avatar.url if hasattr(sender.avatar, 'url') else str(sender.avatar)
                fcm_data["sender_avatar"] = avatar_url
            
            try:
                send_push_notification(
                    title=title,
                    message=message,
                    token=token,
                    data=fcm_data
                )
                print(f"Push notification sent to token: {token[:20]}...")
            except Exception as e:
                print(f"Failed to send push notification: {e}")
    
    print(f"Notification process completed. Total recipients: {len(recipients)}")
    return notification