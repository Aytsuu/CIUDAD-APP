from django.urls import path
from .views import *

urlpatterns = [
    path('register-token/', RegisterFCMTokenView.as_view(), name='fcm-token'),
    path('list/', NotificationListView.as_view(), name='notification-list'),
    path('bulk-update/', BulkMarkAsReadView.as_view(), name='notification-list'),
    path('single-update/', SingleMarkAsReadView.as_view(), name='notification-list'),
    path('create/', CreateNotificationView.as_view(), name='create-notification'),
]