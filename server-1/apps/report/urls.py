from django.urls import path
from .views.incident_report_views import *
from .views.report_type_views import *
from .views.ar_views import *
from .views.weekly_ar_views import *
from .views.rep_template_views import *

urlpatterns = [
  path('ir/create/', IRCreateView.as_view(), name="create-ir"),
  path('ir/active/list/table/', IRActiveTableView.as_view(), name='ir-active-list'),
  path('ir/archive/list/table/', IRArchiveTableView.as_view(), name='ir-archive-list'),
  path('rt/create/', ReportTypeCreateView.as_view(), name="create-rt"),
  path('rt/list/<str:rt_category>/', ReportTypeListView.as_view(), name='rt-list'),
  path('ar/list/table/', ARTableView.as_view(), name='ar-list'),
  path('ar/list/by-date/', ARByDateView.as_view(), name='ar-list-by-date'),
  path('ar/create/', ARCreateView.as_view(), name='create-ar'),
  path('ar/file/create/', ARFileCreateView.as_view(), name='ar-create'),
  path('war/create/', WARCreateView.as_view(), name='create-war'),
  path('war/comp/create/', WARCompCreateView.as_view(), name='create-war-comp'),
  path('war/comp/list/', WARListView.as_view(), name='war-comp-list'),
  path('war/file/create/', WARFileCreateView.as_view(), name='war-create'),
  path('template/list/create/', RTEListCreateView.as_view(), name="list-create-template"),
  path('template/<str:rte_type>/', RTESpecificTypeView.as_view(), name="specific-template"),
  path('template/<str:rte_type>/update/', RTEUpdateView.as_view(), name="template-update"),
]