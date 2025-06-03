from django.urls import path
from .views.incident_report_views import *
from .views.report_type_views import *

urlpatterns = [
  path('ir/create/', IRCreateView.as_view(), name="create-ir"),
  path('rt/create/', ReportTypeCreateView.as_view(), name="create-rt")
]