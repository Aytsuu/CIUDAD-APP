from django.urls import path
from .views.incident_report_views import *
from .views.report_type_views import *
from .views.ar_views import *
from .views.weekly_ar_views import *
from .views.rep_template_views import *
from .views.analytics_views import *

urlpatterns = [
  path('ir/create/', IRCreateView.as_view(), name="create-ir"),
  path('ir/create/from-securado/', TrackerReportCreateView.as_view(), name="create-from-securado"),
  path('ir/list/table/', IRTableView.as_view(), name='ir-list-table'),
  path('rt/create/', ReportTypeCreateView.as_view(), name="create-rt"),
  path('rt/list/<str:rt_category>/', ReportTypeListView.as_view(), name='rt-list'),
  path('ar/list/table/', ARTableView.as_view(), name='ar-list'),
  path('ar/list/by-date/', ARByDateView.as_view(), name='ar-list-by-date'),
  path('ar/<int:ar_id>/info/', ARInfoView.as_view(), name='ar-info'),
  path('ar/create/', ARCreateView.as_view(), name='create-ar'),
  path('ar/<int:ar_id>/update/', ARUpdateView.as_view(), name='ar-update'),
  path('ar/file/create/', ARFileCreateView.as_view(), name='ar-create'),
  path('ar/file/<int:arf_id>/delete/', ARFileDeleteView.as_view(), name="ar-file-delete"),
  path('war/create/', WARCreateView.as_view(), name='create-war'),
  path('war/comp/create/', WARCompCreateView.as_view(), name='create-war-comp'),
  path('war/comp/list/', WARListView.as_view(), name='war-comp-list'),
  path('war/<int:war_id>/info/', WARInfoView.as_view(), name='war-info'),
  path('war/<int:war_id>/update/', WARUpdateView.as_view(), name='war-update'),
  path('war/file/create/', WARFileCreateView.as_view(), name='war-create'),
  path('war/file/<int:warf_id>/delete/', WARFileDeleteView.as_view(), name="war-file-delete"),
  path('template/list/create/', RTEListCreateView.as_view(), name="list-create-template"),
  path('template/<str:rte_type>/', RTESpecificTypeView.as_view(), name="specific-template"),
  path('template/<str:rte_type>/update/', RTEUpdateView.as_view(), name="template-update"),
  path('card/analytics/data/', CardAnalyticsView.as_view(), name='card-analytics'),
  path('sidebar/analytics/data/', SidebarAnalyticsView.as_view(), name='sidebar-analytics'),
  path('chart/analytics/data/', ChartAnalyticsView.as_view(), name='chart-analytics'),
]