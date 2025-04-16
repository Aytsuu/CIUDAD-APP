from django.urls import path
from .views import *

urlpatterns = [
    path('notify-users/', NotifyUserView.as_view(), name='notify-user'),
]