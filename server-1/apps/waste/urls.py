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
    path('update-waste-report/<int:rep_id>/', UpdateWasteReportView.as_view(), name='waste-report-update'),
    path('delete-waste-report/<int:rep_id>/', DeleteWasteReportView.as_view(), name = 'waste-report-delete'),

    path('waste-personnel/', WastePersonnelView.as_view(), name='waste-personnel'),
    path('waste-trucks/', WasteTruckView.as_view(), name='waste-truck'),
    path('waste-trucks/<int:pk>/', WasteTruckDetailView.as_view(), name='waste-truck-detail'),

    path('waste-drivers/', DriverPersonnelAPIView.as_view(), name='waste-drivers'),
    path('waste-collectors/', CollectorPersonnelAPIView.as_view(), name='waste-collectors'),

    path('garbage-pickup-request/', GarbagePickupRequestView.as_view(), name='garbage-pickup-request'),
    path('pickup-request-decision/', PickupRequestDecisionView.as_view(), name='pickup-request-decision'),
    path('update-garbage-pickup-request/<int:garb_id>/', UpdateGarbagePickupRequestStatusView.as_view(), name='update-garbage-pickup-request')


]  