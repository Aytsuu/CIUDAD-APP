from django.urls import path
from .views import *
from apps.administration.views.staff_views import HealthStaffListView


urlpatterns=[
        path('healthstaff/', HealthStaffListView.as_view(), name='healthstaff-list'),
        path('update/monthly_recipient_list_report/<int:monthlyrcplist_id>/', UpdateMonthlyRCPReportDetailView.as_view(), name='healthstaff-detail'),

]