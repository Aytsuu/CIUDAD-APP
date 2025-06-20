from django.urls import path
from .views import *

urlpatterns = [
    path('', UserAccountListView.as_view(), name='user-list'),
    path('<int:pk>/', UserAccountDetailView.as_view(), name='user-detail'),
]