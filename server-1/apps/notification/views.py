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
            recipient_ids = request.data.get("recipients", [])
            print("RC ID:",recipient_ids)
            logger.info(f"📥 Received ResidentProfile IDs: {recipient_ids}")

            if not recipient_ids:
                return Response(
                    {"error": "No ResidentProfile IDs provided."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            resident_profiles = ResidentProfile.objects.filter(rp_id__in=recipient_ids).select_related("account")

            recipients = []
            skipped_ids = []

            for rp in resident_profiles:
                if hasattr(rp, "account") and rp.account:
                    recipients.append(rp.account)
                else:
                    skipped_ids.append(rp.rp_id)
                    logger.warning(f"⚠️ ResidentProfile ID {rp.rp_id} has no linked Account")

            if not recipients:
                return Response(
                    {"error": "No valid recipients found for given ResidentProfile IDs."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            logger.info(f"✅ Found {len(recipients)} valid account(s)")
            if skipped_ids:
                logger.info(f"⚠️ Skipped IDs without linked accounts: {skipped_ids}")

            notification = create_notification(
                title=request.data.get("title"),
                message=request.data.get("message"),
                notif_type=request.data.get("notif_type"),
                recipients=recipients,
                web_route=request.data.get("web_route"),
                web_params=request.data.get("web_params"),
                mobile_route=request.data.get("mobile_route"),
                mobile_params=request.data.get("mobile_params"),
            )

            if not notification:
                return Response(
                    {"error": "Failed to create notification — invalid recipients or data."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            response_data = {
                "message": "✅ Notification created successfully from Server-2",
                "notification_id": notification.notif_id,
                "recipients_count": len(recipients),
            }

            if skipped_ids:
                response_data["skipped_ids"] = skipped_ids

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"❌ Error creating notification from Server-2: {str(e)}")
            return Response(
                {"error": f"Failed to create notification: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CreateReminderNotificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # secret_key = request.headers.get('Secret-Key')
        # expected_key = config('NOTIFICATION_SECRET_KEY')

        # if secret_key != expected_key:
            # return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            recipient_ids = request.data.get('recipients', [])
            recipients = []

            accounts = list(Account.objects.filter(acc_id__in=recipient_ids))

            if accounts:
                recipients = accounts
            else:
                resident_profiles = ResidentProfile.objects.filter(rp_id__in=recipient_ids)
                recipients = [
                    rp.account for rp in resident_profiles 
                    if hasattr(rp, 'account') and rp.account
                ]

            if not recipients:
                return Response(
                    {'error': 'No valid recipients found for given IDs.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            send_at = datetime.fromisoformat(request.data.get('send_at'))
            if send_at.tzinfo is None:
                send_at = pytz.utc.localize(send_at)

            reminder_notification(
                title=request.data.get('title'),
                message=request.data.get('message'),
                notif_type=request.data.get('notif_type'),
                send_at=send_at,
                recipients=recipients,
                web_route=request.data.get('web_route'),
                web_params=request.data.get('web_params'),
                mobile_route=request.data.get('mobile_route'),
                mobile_params=request.data.get('mobile_params'),
            )

            return Response(
                {'message': '✅ Reminder notification scheduled successfully from Server-2'},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            logger.error(f"❌ Error creating reminder notification from Server-2: {str(e)}")
            return Response({'error': 'Failed to create reminder notification'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CreateReminderNotificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # secret_key = request.headers.get('Secret-Key')
        # expected_key = config('NOTIFICATION_SECRET_KEY')

        # if secret_key != expected_key:
            # return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            # sender = request.data.get('sender')
            
            # if sender:
                # sender = str(sender)
            
            recipients = list(ResidentProfile.objects.filter(rp_id__in=request.data.get('recipients', [])))

            send_at = datetime.fromisoformat(request.data.get('send_at'))
            if send_at.tzinfo is None:
                send_at = pytz.utc.localize(send_at)

            reminder_notification(
                title=request.data.get('title'),
                message=request.data.get('message'),
                notif_type=request.data.get('notif_type'),
                send_at=send_at,
                # sender=sender, 
                recipients=recipients,
                web_route=request.data.get('web_route'),
                web_params=request.data.get('web_params'),
                mobile_route=request.data.get('mobile_route'),
                mobile_params=request.data.get('mobile_params'),
            )

            return Response(
                {'message': '✅ Reminder notification scheduled successfully from Server-2'},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            logger.error(f"❌ Error creating reminder notification from Server-2: {str(e)}")
            return Response({'error': 'Failed to create reminder notification'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        user = self.request.user
        
        if not user.is_authenticated:
            return Recipient.objects.none()

        return (
            Recipient.objects.filter(acc=user)
            .select_related("notif", "acc")
            .order_by("-notif__notif_created_at")
        )


""" 
    Mark multiple notifications as read
"""
class BulkMarkAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        notif_ids = request.data.get('notification_ids', [])

        try:
            updated_count = Recipient.objects.filter(
                notif_id__in=notif_ids, acc=request.user, is_read=False
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

        try:
            updated_count = Recipient.objects.filter(
                notif_id=notif_id, acc=request.user, is_read=False
            ).update(is_read=True)

            return Response(
                {'message': 'Notification marked as read successfully'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"❌ Error in SingleMarkAsReadView: {str(e)}")
            return Response({'error': 'Failed to update notification.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)