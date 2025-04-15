from django.urls import path
from .views import *

urlpatterns = [
  path('ar', ARView.as_view(), name="ar-details"),
  path('ar/file/', ARFView.as_view(), name="ar-files")
]
