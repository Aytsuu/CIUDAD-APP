from django.urls import path
from .views.incident_report_views import *
from .views.report_type_views import *
from .views.ar_views import *
from .views.weekly_ar_views import *

urlpatterns = [
  path('ir/create/', IRCreateView.as_view(), name="create-ir"),
  path('ir/active/list/table/', IRActiveTableView.as_view(), name='ir-active-list'),
  path('ir/archive/list/table/', IRArchiveTableView.as_view(), name='ir-archive-list'),
  path('rt/create/', ReportTypeCreateView.as_view(), name="create-rt"),
  path('rt/list/<str:rt_category>/', ReportTypeListView.as_view(), name='rt-list'),
  path('ar/list/table/', ARTableView.as_view(), name='ar-list'),
  path('ar/create/', ARCreateView.as_view(), name='create-ar'),
  path('war/create/', WARCreateView.as_view(), name='create-war'),
  path('war/comp/create/', WARCompCreateView.as_view(), name='create-war-comp'),
  path('war/comp/list/', WARListView.as_view(), name='war-comp-list')
]