from django.urls import path
from .views import *

urlpatterns = [
    path('lists/', NotificationListCreateView.as_view(), name='notification-list'),
    path('view-notif/', NotificationListView.as_view(), name='notification-list'),
    path('save-token/', SaveTokenView.as_view(), name='save-token'),
    path('mark-read/', MarkAsReadView.as_view(), name='mark-all-read'),
    path('mark-read/<int:pk>/', MarkAsReadView.as_view(), name='mark-single-read'),
    ]