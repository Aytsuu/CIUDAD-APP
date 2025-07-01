import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = AnonymousUser()
        
        # Authenticate via token
        token = self.scope['query_string'].decode().split('token=')[1]
        user = await self.get_user_from_token(token)
        
        if not user:
            await self.close()
            return
            
        self.user = user
        await self.channel_layer.group_add(
            f"user_{user.id}",
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            f"user_{self.user.id}",
            self.channel_name
        )

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            "type": "notification",
            "notification": event["notification"]
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data["type"] == "read_notification":
            await self.mark_notification_read(data["notification_id"])