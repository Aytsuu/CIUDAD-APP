from django.urls import path, include
from .views import *
from rest_framework.routers import DefaultRouter

urlpatterns = [
    path('account/', UserAccountSerializer, name="user-account"),
    path('account/<int:pk>/', UserAccountRetrieveUpdateDestroyView.as_view(), name="one-user"),
    path("login/", UserAccountLoginView.as_view(), name="useraccount-login"),
]