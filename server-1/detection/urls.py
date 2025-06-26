from django.urls import path
from .views import *

urlpatterns = [
  path('face/', FaceDetectionView.as_view(), name="face-detection")
]