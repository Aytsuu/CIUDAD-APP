from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from decouple import config
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Notification, Recipient, FCMToken
from .serializers import NotificationSerializer, FCMTokenSerializer, RecipientSerializer
from .utils import create_notification, start_scheduler, reminder_notification

from apps.profiling.models import ResidentProfile
from apps.account.models import Account

import uuid
import logging
import pytz
from datetime import datetime

logger = logging.getLogger(__name__)


""" 
  API endpoint for other servers to CREATE a notification
"""
class CreateNotificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            sender = "00001250924"
            print("SENDER", sender)
            if sender:
                sender = str(sender) 
            
            recipients = list(ResidentProfile.objects.filter(rp_id__in=request.data.get('recipients', [])))
            print("RECIPIENTS", recipients)
            
            notification = create_notification(
                title=request.data.get('title'),
                message=request.data.get('message'),
                notif_type=request.data.get('notif_type'),
                sender=sender, 
                recipients=recipients,
                web_route=request.data.get('web_route'),
                web_params=request.data.get('web_params'),
                mobile_route=request.data.get('mobile_route'),
                mobile_params=request.data.get('mobile_params'),
                target_obj=request.data.get('target_obj')
            )

            return Response(
                {'message': '✅ Notification created successfully from Server-2'},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            logger.error(f"❌ Error creating notification from Server-2: {str(e)}")
            return Response({'error': 'Failed to create notification'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreateReminderNotificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # secret_key = request.headers.get('Secret-Key')
        # expected_key = config('NOTIFICATION_SECRET_KEY')

        # if secret_key != expected_key:
        #     return Response(
        #         {'error': 'Unauthorized'}, 
        #         status=status.HTTP_401_UNAUTHORIZED
        #     )

        try:
            sender = request.data.get('sender')
            if sender:
                sender = str(sender)
            
            # Get recipient rp_ids from request
            recipient_ids = request.data.get('recipients', [])
            
            # Fetch ResidentProfile objects
            recipients = list(
                ResidentProfile.objects.filter(rp_id__in=recipient_ids)
            )
            
            if not recipients:
                return Response(
                    {'error': 'No valid recipients found'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Parse the ISO 8601 datetime string
            remind_at_str = request.data.get('remind_at')
            if not remind_at_str:
                return Response(
                    {'error': 'remind_at is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Parse ISO format datetime string
            remind_at = datetime.fromisoformat(remind_at_str.replace('Z', '+00:00'))
            
            # Make timezone-aware if naive
            if timezone.is_naive(remind_at):
                remind_at = timezone.make_aware(remind_at)

            # Call the reminder_notification function
            reminder_notification(
                title=request.data.get('title'),
                message=request.data.get('message'),
                notif_type=request.data.get('notif_type'),
                remind_at=remind_at,
                sender=sender, 
                recipients=recipients,
                web_route=request.data.get('web_route'),
                web_params=request.data.get('web_params'),
                mobile_route=request.data.get('mobile_route'),
                mobile_params=request.data.get('mobile_params'),
                target_obj=None  # Don't pass target_obj through API
            )

            return Response(
                {
                    'message': '✅ Reminder notification scheduled successfully from Server-2',
                    'remind_at': remind_at.isoformat(),
                    'recipient_count': len(recipients)
                },
                status=status.HTTP_201_CREATED
            )

        except ValueError as e:
            logger.error(f"❌ Invalid datetime format: {str(e)}")
            return Response(
                {'error': f'Invalid datetime format: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"❌ Error creating reminder notification from Server-2: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to create reminder notification: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

""" 
    Register FCM token (for mobile push)
"""
class RegisterFCMTokenView(generics.CreateAPIView):
    serializer_class = FCMTokenSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        fcm_token = serializer.validated_data['fcm_token']
        fcm_device_id = serializer.validated_data['fcm_device_id']

        # if unauthenticated, skip binding
        user = request.user if request.user.is_authenticated else None

        obj, created = FCMToken.objects.update_or_create(
            acc=user,
            fcm_device_id=fcm_device_id,
            defaults={'fcm_token': fcm_token}
        )
        return Response(FCMTokenSerializer(obj).data, status=status.HTTP_201_CREATED)


""" 
    Fetch notifications for a user
"""
class NotificationListView(generics.ListAPIView):
    serializer_class = RecipientSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_rp = getattr(self.request.user, "rp", None)

        if not user_rp:
            return Recipient.objects.none()

        return (
            Recipient.objects.filter(rp=user_rp)
            .select_related("notif", "notif__sender", "rp", "rp__per")
            .order_by("-notif__notif_created_at")
        )


""" 
    Mark multiple notifications as read
"""
class BulkMarkAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        notif_ids = request.data.get('notification_ids', [])
        user_rp = getattr(request.user, "rp", None)

        try:
            updated_count = Recipient.objects.filter(
                notif_id__in=notif_ids, rp=user_rp, is_read=False
            ).update(is_read=True)

            return Response(
                {'message': f'{updated_count} notifications marked as read successfully'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"❌ Error in BulkMarkAsReadView: {str(e)}")
            return Response({'error': 'Failed to update notifications.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


""" 
    Mark single notification as read
"""
class SingleMarkAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        notif_id = request.data.get('notification_id')
        user_rp = getattr(request.user, "rp", None)

        try:
            updated_count = Recipient.objects.filter(
                notif_id=notif_id, rp=user_rp, is_read=False
            ).update(is_read=True)

            return Response(
                {'message': 'Notification marked as read successfully'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"❌ Error in SingleMarkAsReadView: {str(e)}")
            return Response({'error': 'Failed to update notification.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)