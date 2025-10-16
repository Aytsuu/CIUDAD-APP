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
    permission_classes = [IsAuthenticated]

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