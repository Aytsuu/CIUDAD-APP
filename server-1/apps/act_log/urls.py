from rest_framework import routers
from .views import ActivityLogViewSet
from django.urls import path, include

router = routers.DefaultRouter()

urlpatterns = [
    path('', ActivityLogViewSet.as_view({'get': 'list'}), name='activity-log-list'),
    path('<int:pk>/', ActivityLogViewSet.as_view({'get': 'retrieve'}), name='activity-log-detail'),
]