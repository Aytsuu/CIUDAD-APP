from django.urls import path
from .views import *

urlpatterns = [
    # Waste Event URLs
    path("waste-event/", WasteEventView.as_view(), name="waste-event-list"),
    path("waste-event/<int:we_num>/", WasteEventDetailView.as_view(), name="waste-event-detail"),
    path("waste-event/<int:we_num>/restore/", WasteEventRestoreView.as_view(), name="waste-event-restore"),

    # Waste Collection Staff URLs
    path("waste-collection-staff/", WasteCollectionStaffView.as_view(), name="waste-collection-staff-list"),

    # Waste COLLECTION Schedule View
    path("waste-collection-sched/", WasteCollectionSchedView.as_view(), name="waste-collection-sched-list"),
    path("waste-collection-sched-full/", WasteCollectionSchedFullDataView.as_view(), name="waste-collection-sched-full"),

    # Waste COLLECTION Assign Collectors
    path('waste-ass-collectors/', WasteCollectorView.as_view(), name='waste-ass-collectors'),   
    path('waste-ass-collectors/list/', WasteCollectorListView.as_view(), name='waste-ass-collectors-list'),

    # Waste COLLECTION UPDATE
    path("waste-collection-sched/<int:wc_num>/", WasteCollectionSchedUpdateView.as_view(), name="waste-collection-sched-update"),
    path('waste-ass-collectors/<int:wasc_id>/', WasteCollectorDeleteView.as_view(), name='waste-ass-collectors-delete'),

    # Waste COLLECTION DELETE
    path('waste-collection-sched-delete/<int:wc_num>/', WasteCollectionSchedDeleteView.as_view(), name='waste-ass-schedule-delete'),

    # Waste COLLECTION ANNOUNCMENT
    path('create-collection-reminders/', CreateCollectionRemindersView.as_view(), name='create-collection-reminders'),

    # Waste Hotspot URLs
    path("waste-hotspot/", WasteHotspotView.as_view(), name="waste-hotspot-list"),
    path('upcoming-hotspots/', UpcomingHotspotView.as_view(), name='upcoming-hotspots'),
    path("waste-watchman/", WatchmanView.as_view(), name="waste-watchman"),
    path('update-waste-hotspot/<int:wh_num>/', UpdateHotspotView.as_view(), name='update-waste-hotspot'),
    path('delete-waste-hotspot/<int:wh_num>/', DeleteHotspotView.as_view(), name='delete-waste-hotpot'),

    # Waste Report URLs
    path("waste-report/", WasteReportView.as_view(), name="waste-report-list"),
    path('update-waste-report/<str:rep_id>/', UpdateWasteReportView.as_view(), name='waste-report-update'),
    path('delete-waste-report/<str:rep_id>/', DeleteWasteReportView.as_view(), name = 'waste-report-delete'),

    # Waste Report File
    path("waste-rep-file/", WasteReportFileView.as_view(), name="waste-report-file"),
    path('delete-waste-rep-file/<int:wrf_id>/', WasteReportDeleteFileView.as_view(), name='income-expense-file-detail'),
    path("waste-rep-rslv-file/", WasteReportResolveFileView.as_view(), name="waste-report-resolve-file"),

    path('waste-personnel/', WastePersonnelView.as_view(), name='waste-personnel'),
    path('waste-trucks/', WasteTruckView.as_view(), name='waste-truck'),
    path('waste-trucks/<int:pk>/', WasteTruckDetailView.as_view(), name='waste-truck-detail'),
    path('waste-trucks/<int:truck_id>/restore/', WasteTruckRestoreView.as_view(), name='waste-truck-restore'),

    path('waste-drivers/', DriverPersonnelAPIView.as_view(), name='waste-drivers'),
    path('waste-collectors/', CollectorPersonnelAPIView.as_view(), name='waste-collectors'),

    # Sitio URL
    path("sitio/", SitioListView.as_view(), name="sitio-list"),

    # Garbage Pickup Urls
    # Staff and Resident
    path('all-trucks/', WasteAllTruckView.as_view(), name='all-truck'),
    path('garbage-pickup-request-analytics/', GarbagePickupRequestAnalyticsView.as_view(), name='agarbage-pickup-request-analytics'),
    path('garbage-pickup-file/', GarbagePickupFileView.as_view(), name='garbage-pickup-file'),
    path('garbage-pickup-request-pending/', GarbagePickupRequestPendingView.as_view(), name='garbage-pickup-request-pending'), #retrieve pending requests
    path('garbage-pickup-view-pending/<str:garb_id>/', GarbagePickupRequestPendingDetailView.as_view(), name='garbage-pickup-view-pending'), #retrieve pending request details
    path('garbage-pickup-view-rejected/<str:garb_id>/', GarbagePickupRequestRejectedDetailView.as_view(), name='garbage-pickup-view-rejected'), #retrieve rejected request details
    path('garbage-pickup-request-rejected/', GarbagePickupRequestRejectedView.as_view(), name='garbage-pickup-request-rejected'), #retrieve rejected requests
    path('garbage-pickup-request-accepted/', GarbagePickupRequestAcceptedView.as_view(), name='garbage-pickup-request-accepted'), #retrieve accepted requests
    path('garbage-pickup-request-completed/', GarbagePickupRequestCompletedView.as_view(), name='garbage-pickup-request-completed'), #retrieve completed requests
    path('garbage-pickup-view-completed/<str:garb_id>/', GarbagePickupCompletedRequestDetailView.as_view(), name='garbage-pickup-view-completed'), #retrieve completed request details
    path('garbage-pickup-view-accepted/<str:garb_id>/', GarbagePickupAcceptedRequestDetailView.as_view(), name='garbage-pickup-view-accepted'), #retrieve accted request details
    path('update-garbage-pickup-request/<str:garb_id>/', UpdateGarbagePickupRequestStatusView.as_view(), name='update-garbage-pickup-request'), #reject request update status to rejected
    path('update-pickup-assignment/<int:pick_id>/', UpdatePickupAssignmentView.as_view(), name='update-pickup-assignment'), #update pickup assignment
    path('delete-assignment-collector/<int:acl_id>/', AssignmentCollectorDeleteView.as_view(), name='delete-assignment-collector'), #update pickup assignment
    path('pickup-request-decision/', PickupRequestDecisionView.as_view(), name='pickup-request-decision'),
    path('pickup-assignment/', PickupAssignmentView.as_view(), name='pickup-assignment'),
    path('assignment-collector/', AssignmentCollectorView.as_view(), name='assignment-collector'),
    path('pickup-confirmation/', PickupConfirmationView.as_view(), name='pickup-confirmation'),
 
    # Resident
    path('garbage-pickup-pending/<str:rp_id>/', GarbagePickupRequestPendingByRPView.as_view(), name = 'garbage-pickup-pending-resident'),
    path('garbage-pickup-rejected/<str:rp_id>/', GarbagePickupRequestRejectedByRPView.as_view(), name="garbage-pickup-rejected"),
    path('garbage-pickup-accepted/<str:rp_id>/', GarbagePickupRequestAcceptedByRPView.as_view(), name="garbage-pickup-accepted"),
    path('garbage-pickup-completed/<str:rp_id>/', GarbagePickupRequestCompletedByRPView.as_view(), name="garbage-pickup-completed"),
    path('garbage-pickup-cancelled/<str:rp_id>/', GarbagePickupRequestCancelledByRPView.as_view(), name="garbage-pickup-cancelled"),
    path('garbage-pickup-accepted-detail/<str:garb_id>/', GarbagePickupRequestAcceptedDetailView.as_view(), name='garbage-pickup-accepted-detail'),
    path('update-pickup-confirmation/<str:garb_id>/', UpdatePickupConfirmationView.as_view(), name='update-pickup-confirmation'),

    # Driver
    path('driver-garbage-pickup-tasks/', GarbagePickupRequestsByDriverView.as_view(), name='garbage-pickup-tasks'),
    path('driver-garbage-completed-tasks/', GarbagePickupCompletedByDriverView.as_view(), name='garbage-completed-tasks'),

]  