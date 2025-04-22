import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if not user.is_authenticated:
            await self.close()
        await self.channel_layer.group_add(
            f"user_{user.id}",
            self.channel_name
        )
        await self.accept()
    
    async def send_notification(self, event):
        await self.send(text_data=json.dumps(event["data"]))