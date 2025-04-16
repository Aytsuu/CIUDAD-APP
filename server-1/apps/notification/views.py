from django.shortcuts import render
from backend.firebase.notifications import send_push_notification
from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.
class NotifyUserView(APIView):
    def post(self, request):
        # Token comes from the frontend (stored in Supabase or passed as payload)
        token = request.data.get('token')  
        title = request.data.get('title', 'New Notification')
        body = request.data.get('body', 'You have a new notification.')

        send_push_notification(token, title, body)
        return Response({'status': 'Notification Sent!'})