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
    path('waste-ass-collectors/', WasteCollectorView.as_view(), name='waste-ass-collectors'),   

    # Sitio URL
    path("sitio/", SitioListView.as_view(), name="sitio-list")

    path('garbage-pickup-request-pending/', GarbagePickupRequestPendingView.as_view(), name='garbage-pickup-request-pending'), #retrieve pending requests
    path('garbage-pickup-request-rejected/', GarbagePickupRequestRejectedView.as_view(), name='garbage-pickup-request-rejected'), #retrieve rejected requests
    path('garbage-pickup-request-accepted/', GarbagePickupRequestAcceptedView.as_view(), name='garbage-pickup-request-accepted'), #retrieve accepted requests
    path('garbage-pickup-request-completed/', GarbagePickupRequestCompletedView.as_view(), name='garbage-pickup-request-completed'), #retrieve completed requests
    path('update-garbage-pickup-request/<int:garb_id>/', UpdateGarbagePickupRequestStatusView.as_view(), name='update-garbage-pickup-request'), #reject request update status to rejected
    path('update-pickup-assignment/<int:pick_id>/', UpdatePickupAssignmentView.as_view(), name='update-pickup-assignment'), #update pickup assignment
    path('delete-assignment-collector/<int:acl_id>/', AssignmentCollectorDeleteView.as_view(), name='delete-assignment-collector'), #update pickup assignment
    path('pickup-request-decision/', PickupRequestDecisionView.as_view(), name='pickup-request-decision'),
    path('pickup-assignment/', PickupAssignmentView.as_view(), name='pickup-assignment'),
    path('assignment-collector/', AssignmentCollectorView.as_view(), name='assignment-collector'),
    path('pickup-confirmation/', PickupConfirmationView.as_view(), name='pickup-confirmation'),

]  
