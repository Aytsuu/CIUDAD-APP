from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from .models import Notification, FCMToken
from .serializers import NotificationSerializer, FCMTokenSerializer
from firebase_admin import messaging

class SaveTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token required'}, status=400)

        FCMToken.objects.update_or_create(user=request.user, defaults={'token': token})
        return Response({'status': 'Token saved'})

class NotificationListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        notification = serializer.save(user=self.request.user)
        try:
            fcm = FCMToken.objects.get(user=self.request.user)
            message = messaging.Message(
                notification=messaging.Notification(
                    title=notification.sender,
                    body=notification.message,
                ),
                token=fcm.token,
            )
            messaging.send(message)
        except Exception as e:
            print(f"Error sending FCM notification: {e}")

class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'Marked as read'})