from rest_framework import routers
from .views import ActivityLogViewSet
from django.urls import path, include

router = routers.DefaultRouter()

urlpatterns = [
    path('', ActivityLogViewSet.as_view({'get': 'list'}), name='activity-log-list'),
]