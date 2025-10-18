from apps.notification.models import FCMToken, Recipient, Notification
from .notifications import send_push_notification
from apps.account.models import Account
from django.contrib.contenttypes.models import ContentType
import json

def create_notification(title, message, sender, recipients, notif_type, target_obj=None):
    print(f"Recipients count: {len(recipients)}")
    
    recipient_accounts = []

    # Get Account objects from ResidentProfile
    for rp in recipients:
        account = Account.objects.filter(rp=rp).first()
        if account:
            recipient_accounts.append(account)
    
    if not recipient_accounts:
        return None
    
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
    
    notification = Notification.objects.create(**notification_data)
    
    # Create recipient entries
    for rp in recipients:
        recipient = Recipient.objects.create(
            notif=notification,
            rp=rp
        )
    
    redirect_url = None
    mobile_route = None
    if target_obj and hasattr(target_obj, 'get_absolute_url'):
        redirect_url = target_obj.get_absolute_url()

    if target_obj and hasattr(target_obj, 'get_mobile_route'):
        mobile_route = target_obj.get_mobile_route()
        
    total_sent = 0
    total_failed = 0
    
    print(f"Target obj type: {type(target_obj)}")
    print(f"Has mobile route: {hasattr(target_obj, 'get_mobile_route')}")
    
    # Group tokens by device_id across all accounts
    device_tokens = {}  # {device_id: token_obj}
    
    for acc in recipient_accounts:
        tokens = FCMToken.objects.filter(acc=acc)
        
        for token_obj in tokens:
            device_id = token_obj.fcm_device_id if hasattr(token_obj, 'fcm_device_id') else None
            
            if not device_id:
                continue
            
            # Only store the first token we encounter for each device_id
            if device_id not in device_tokens:
                device_tokens[device_id] = {
                    'token': token_obj.fcm_token,
                    'account': acc
                }
    
    print(f"Unique devices to send: {len(device_tokens)}")
    
    for device_id, token_data in device_tokens.items():
        token = token_data['token']
        acc = token_data['account']
        
        # Prepare FCM data payload
        fcm_data = {
            "notification_id": str(notification.notif_id),
            "notif_type": notif_type,
            "sender_name": sender.username if sender else "System",
            "sender_profile": sender.profile_image if sender and hasattr(sender, 'profile_image') else "", 
            "object_id": str(target_obj.pk) if target_obj else "",
        }
            
        if redirect_url:
            fcm_data["redirect_url"] = redirect_url
        
        if mobile_route:
            fcm_data["screen"] = mobile_route.get('screen', '')
            fcm_data["params"] = json.dumps(mobile_route.get('params', {}))
            
        try:
            result = send_push_notification(
                token=token,
                title=title,
                message=message,
                data=fcm_data
            )
            
            if result:
                total_sent += 1
            else:
                total_failed += 1
                
        except Exception as e:
            total_failed += 1
    
    return notification