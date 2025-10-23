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
from rest_framework.views import APIView
import logging

logger = logging.getLogger(__name__)

class RegisterFCMTokenView(generics.CreateAPIView):
    serializer_class = FCMTokenSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
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
                "notif",         
                "notif__sender",   
                "rp",             
                "rp__per"          
            )
            .order_by("-notif__notif_created_at")
        )

class BulkMarkAsReadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        notif_ids = request.data.get('notification_ids', [])
        
        user_rp = getattr(request.user, "rp", None)
        
        try:
            updated_count = Recipient.objects.filter(
                notif_id__in=notif_ids,
                rp=user_rp,
                is_read=False
            ).update(is_read=True)
            
            return Response({'message': "Notifications marked as read successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in BulkMarkAsReadView: {str(e)}")
            return Response({'error': 'An error occurred while updating notifications.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SingleMarkAsReadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        notif_id = request.data.get('notification_id')
        
        user_rp = getattr(request.user, "rp", None)
        
        try:
            updated_count = Recipient.objects.filter(
                notif_id__in=notif_id,
                rp=user_rp,
                is_read=False
            ).update(is_read=True)
            
            return Response({'message': "Notifications marked as read successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in BulkMarkAsReadView: {str(e)}")
            return Response({'error': 'An error occurred while updating notifications.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class CreateNotificationView(APIView):
    """
    API endpoint for creating notifications from other servers (e.g., server-2).
    Accepts POST requests with notification data and creates notifications in the database.
    """
    permission_classes = [AllowAny]  # Can be restricted with API key if needed
    
    def post(self, request):
        try:
            title = request.data.get('title')
            message = request.data.get('message')
            notif_type = request.data.get('notif_type', 'GENERAL')
            recipient_rp_ids = request.data.get('recipient_rp_ids', [])  # List of ResidentProfile IDs
            
            # Validate required fields
            if not title or not message or not recipient_rp_ids:
                return Response(
                    {'error': 'Missing required fields: title, message, recipient_rp_ids'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get recipient ResidentProfiles
            from apps.profiling.models import ResidentProfile
            recipients = ResidentProfile.objects.filter(rp_id__in=recipient_rp_ids)
            
            if not recipients.exists():
                return Response(
                    {'error': 'No valid recipients found'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create notification
            notification_data = {
                'notif_title': title,
                'notif_message': message,
                'notif_type': notif_type,
                'sender': None  # System notification
            }
            
            notification = Notification.objects.create(**notification_data)
            
            # Create recipient entries
            for rp in recipients:
                Recipient.objects.create(
                    notif=notification,
                    rp=rp
                )
            
            # Send FCM push notifications
            from apps.account.models import Account
            for rp in recipients:
                accounts = Account.objects.filter(rp=rp)
                for account in accounts:
                    tokens = FCMToken.objects.filter(acc=account)
                    for token_obj in tokens:
                        try:
                            send_push_notification(
                                token=token_obj.fcm_token,
                                title=title,
                                message=message,
                                data={
                                    'notification_id': str(notification.notif_id),
                                    'notif_type': notif_type
                                }
                            )
                        except Exception as e:
                            logger.error(f"Failed to send FCM notification: {e}")
            
            return Response(
                {
                    'success': True,
                    'notification_id': str(notification.notif_id),
                    'recipients_count': recipients.count()
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Error in CreateNotificationView: {str(e)}")
            return Response(
                {'error': f'Failed to create notification: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )