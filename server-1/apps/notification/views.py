# from rest_framework import generics, status
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from .models import Notification, Recipient
# from .serializers import NotificationSerializer
# from rest_framework.decorators import api_view
# from django.utils import timezone
# from utils.supabase_client import supabase
# from django.conf import settings

# class UserNotificationListView(generics.ListAPIView):
#     serializer_class = NotificationSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         # Get notifications where user is a recipient
#         return Notification.objects.filter(
#             recipients__acc=self.request.user
#         ).order_by('-notif_created_at')

# class NotificationCreateView(generics.CreateAPIView):
#     serializer_class = NotificationSerializer
#     permission_classes = [IsAuthenticated]

#     def perform_create(self, serializer):
#         notification = serializer.save(sender=self.request.user)
        
#         # Add recipients (example - adjust as needed)
#         recipients = self.request.data.get('recipients', [])
#         for acc_id in recipients:
#             Recipient.objects.create(notif=notification, acc_id=acc_id)
        
#         # Sync to Supabase
#         notification.push_to_supabase()

# class NotificationMarkAsReadView(generics.UpdateAPIView):
#     queryset = Notification.objects.all()
#     serializer_class = NotificationSerializer
#     permission_classes = [IsAuthenticated]

#     def update(self, request, *args, **kwargs):
#         notification = self.get_object()
#         recipient = notification.recipients.filter(acc=request.user).first()
        
#         if not recipient:
#             return Response(
#                 {"error": "Not authorized to mark this notification as read"},
#                 status=status.HTTP_403_FORBIDDEN
#             )
        
#         recipient.is_read = True
#         recipient.read_at = timezone.now()
#         recipient.save()
        
#         # Update main notification if all recipients read it
#         if not notification.recipients.filter(is_read=False).exists():
#             notification.is_read = True
#             notification.read_at = timezone.now()
#             notification.save()
        
#         # Sync to Supabase
#         notification.push_to_supabase()
        
#         return Response(self.get_serializer(notification).data)

# @api_view(['GET'])
# def unread_count(request):
#     count = Recipient.objects.filter(
#         acc=request.user,
#         is_read=False
#     ).count()
#     return Response({'unread_count': count})

from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Notification, Recipient, FCMToken
from .serializers import NotificationSerializer, FCMTokenSerializer, RecipientSerializer
from .notifications import send_push_notification
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

class RegisterFCMTokenView(generics.CreateAPIView):
    serializer_class = FCMTokenSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        fcm_token = serializer.validated_data['fcm_token']
        fcm_device_id = serializer.validated_data['fcm_device_id']
        
        obj, created = FCMToken.objects.update_or_create(
            acc=request.user,
            fcm_device_id=fcm_device_id,
            defaults={'fcm_token': fcm_token}
        )
        return Response(FCMTokenSerializer(obj).data, status=status.HTTP_201_CREATED)
        
class NotificationListView(generics.ListAPIView):
    serializer_class = RecipientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_rp = getattr(self.request.user, "rp", None)

        if not user_rp:
            return Recipient.objects.none()

        return (
            Recipient.objects.filter(rp=user_rp)
            .select_related(
                "notif",           # Notification details
                "notif__sender",   # Sender account details
                "rp",              # Resident profile details
                "rp__per"          # Personal info (name)
            )
            .order_by("-notif__notif_created_at")
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request, notif_id):
    """
    Mark a single notification as read for the authenticated user.
    """
    try:
        user_rp = request.user.rp
        if not user_rp:
            return Response(
                {"error": "User does not have a resident profile"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get the recipient entry for this user and notification
        recipient = get_object_or_404(
            Recipient,
            notif__notif_id=notif_id,
            rp=user_rp
        )
        
        recipient.is_read = True
        recipient.save()
        
        return Response(
            {"message": "Notification marked as read"},
            status=status.HTTP_200_OK
        )
    
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_as_read(request):
    """
    Mark all unread notifications as read for the authenticated user.
    """
    try:
        user_rp = request.user.rp
        if not user_rp:
            return Response(
                {"error": "User does not have a resident profile"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        notification_ids = request.data.get('notification_ids', [])
        
        if not notification_ids:
            return Response(
                {"error": "No notification IDs provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update all matching recipients
        updated_count = Recipient.objects.filter(
            notif__notif_id__in=notification_ids,
            rp=user_rp,
            is_read=False
        ).update(is_read=True)
        
        return Response(
            {
                "message": f"{updated_count} notifications marked as read",
                "count": updated_count
            },
            status=status.HTTP_200_OK
        )
    
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notif_id):
    """
    Delete a notification recipient entry for the authenticated user.
    Note: This doesn't delete the notification itself, just the user's recipient entry.
    """
    try:
        user_rp = request.user.rp
        if not user_rp:
            return Response(
                {"error": "User does not have a resident profile"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        recipient = get_object_or_404(
            Recipient,
            notif__notif_id=notif_id,
            rp=user_rp
        )
        
        recipient.delete()
        
        return Response(
            {"message": "Notification deleted"},
            status=status.HTTP_200_OK
        )
    
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )