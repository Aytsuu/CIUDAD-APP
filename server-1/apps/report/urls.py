from django.urls import path
from .views.incident_report_views import *

urlpatterns = [
  path('ir/create/', IRCreateView.as_view(), name="create-ir")
]