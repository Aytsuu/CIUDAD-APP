from django.urls import path
from .views.incident_report_views import *
from .views.report_type_views import *

urlpatterns = [
  path('ir/create/', IRCreateView.as_view(), name="create-ir"),
  path('ir/list/table/', IRTableView.as_view(), name='ir-list'),
  path('rt/create/', ReportTypeCreateView.as_view(), name="create-rt"),
  path('rt/list/<str:rt_category>/', ReportTypeListView.as_view(), name='rt-list')
]