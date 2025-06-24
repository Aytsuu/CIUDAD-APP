from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer
from rest_framework.decorators import api_view

class NotificationListCreateView(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(recipient=self.request.user)

class NotificationMarkAsReadView(generics.UpdateAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.recipient != request.user:
            return Response(
                {"error": "You can't mark this notification as read"},
                status=status.HTTP_403_FORBIDDEN
            )
        instance.mark_as_read()
        return Response(self.get_serializer(instance).data)
    
class SendNotificationAPI(generics.CreateAPIView):
    serializer_class = NotificationSerializer
    
    def perform_create(self, serializer):
        notification = serializer.save()
        
        # Trigger Supabase realtime event
        supabase.table('notification').insert({
            'id' : str(notification.id),
            'recipient_id' : str(notification.recipient.supabase_id),
            'title' : notification.title,
            'message' : notification.message,
            'notification_type' : notification.notification_type,
            'created_at' : notification.created_at.isoformat()
        }).execute
        
@api_view(['PATCH'])
def mark_notification_read(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id, recipient=request.user)
        notification.is_read = True
        notification.save()
        
        # Sync read status to Supabase
        supabase.table('notification').update({'is_read': True}).eq('django_id', notification_id).execute()
        
        return Response({'status': 'success'})
    except Notification.DoesNotExist:
        return Response({'status': 'error'}, status=404)