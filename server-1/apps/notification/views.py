from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification, Recipient
from .serializers import NotificationSerializer
from rest_framework.decorators import api_view
from django.utils import timezone
from supabase import create_client
from django.conf import settings

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

class UserNotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get notifications where user is a recipient
        return Notification.objects.filter(
            recipients__acc=self.request.user
        ).order_by('-notif_created_at')

class NotificationCreateView(generics.CreateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        notification = serializer.save(sender=self.request.user)
        
        # Add recipients (example - adjust as needed)
        recipients = self.request.data.get('recipients', [])
        for acc_id in recipients:
            Recipient.objects.create(notif=notification, acc_id=acc_id)
        
        # Sync to Supabase
        notification.push_to_supabase()

class NotificationMarkAsReadView(generics.UpdateAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        notification = self.get_object()
        recipient = notification.recipients.filter(acc=request.user).first()
        
        if not recipient:
            return Response(
                {"error": "Not authorized to mark this notification as read"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        recipient.is_read = True
        recipient.read_at = timezone.now()
        recipient.save()
        
        # Update main notification if all recipients read it
        if not notification.recipients.filter(is_read=False).exists():
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
        
        # Sync to Supabase
        notification.push_to_supabase()
        
        return Response(self.get_serializer(notification).data)

@api_view(['GET'])
def unread_count(request):
    count = Recipient.objects.filter(
        acc=request.user,
        is_read=False
    ).count()
    return Response({'unread_count': count})