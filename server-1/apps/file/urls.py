from django.urls import path
from .views import *

urlpatterns = [
  path('upload/', FileView.as_view(), name="file-uploads")
]