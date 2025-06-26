from django.urls import path
from .views import *

urlpatterns = [
    path('list/', NotificationListCreateView.as_view(), name='notification-list'),
    path('<int:pk>/mark_as_read/', NotificationMarkAsReadView.as_view(), name='mark-as-read'),
    # path('view-notif/', NotificationListView.as_view(), name='notification-list'),
]