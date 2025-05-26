#KANI 4TH
#AFTER ANI KAY COMMAND PYTHON MANAGE.PY MAKEMIGRATIONS WASTE 
#AFTER KAY PYTHON MANAGE.PY MIGRATE WASTE

from django.urls import path
from .views import *

urlpatterns = [
    # Waste Event URLs
    path("waste-event/", WasteEventView.as_view(), name="waste-event-list"),

    # Waste Collection Staff URLs
    path("waste-collection-staff/", WasteCollectionStaffView.as_view(), name="waste-collection-staff-list"),

    # Waste Collection Assignment URLs
    path("waste-collection-assignment/", WasteCollectionAssignmentView.as_view(), name="waste-collection-assignment-list"),

    # Waste Collection Schedule URLs
    path("waste-collection-sched/", WasteCollectionSchedView.as_view(), name="waste-collection-sched-list"),

    # Waste Hotspot URLs
    path("waste-hotspot/", WasteHotspotView.as_view(), name="waste-hotspot-list"),

    # Waste Report URLs
    path("waste-report/", WasteReportView.as_view(), name="waste-report-list"),

    path('waste-personnel/', WasteTruckView.as_view(), name='waste-truck'),
    path('waste-personnel/<int:pk>/', WasteTruckDetailView.as_view(), name='waste-truck-detail'),
]