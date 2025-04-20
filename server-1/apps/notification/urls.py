from django.urls import path
from .views import SaveTokenView, NotificationListCreateView, MarkNotificationReadView

urlpatterns = [
    path('', NotificationListCreateView.as_view(), name='notification-list'),
    path('save-token/', SaveTokenView.as_view(), name='save-token'),
    path('mark-read/', MarkNotificationReadView.as_view(), name='mark-read'),
]