from django.urls import path
from .views import *


urlpatterns=[
    path("event-meeting/", CouncilSchedulingView.as_view(), name="council-event-meeting"),
    path("event-meeting/<int:ce_id>/", CouncilSchedulingDetailView.as_view(), name="council-event-meeting-detail"),
    path("event-meeting/<int:ce_id>/restore/", CouncilSchedulingRestoreView.as_view(), name="council-event-meeting-restore"),
    path("attendees/", AttendeesView.as_view(), name="council-attendees"),
    path("attendees/<int:atn_id>/", AttendeesDetailView.as_view(), name="council-attendees-detail"),
    path("attendees/bulk/", AttendeesBulkView.as_view(), name="council-attendees-bulk"),
    path("attendance-sheets/", AttendanceSheetListView.as_view(), name="attendance-sheet-list"),
    path("attendance-sheets/<int:att_id>/", AttendanceSheetDetailView.as_view(), name="attendance-sheet-detail"),
    path("attendance-sheets/<int:att_id>/restore/", RestoreAttendanceView.as_view(), name="attendance-sheet-restore"),
    path('api/staff/', StaffListView.as_view(), name='staff-list'),
    path('staff-attendance-ranking/', StaffAttendanceRankingView.as_view(), name='staff-attendance-ranking'),

    path("template/", TemplateView.as_view(), name="document-template"),
    path("update-template/<int:temp_id>/", UpdateTemplateView.as_view(), name="update-document-template"),
    path('delete-template/<int:temp_id>/', DeleteTemplateView.as_view(), name='delete-document-template'), 
    path('update-template-pr-id/', update_template_pr_id, name='update-template-pr-id'),
    
    # RESOLUTION
    path("resolution/", ResolutionView.as_view(), name="council-resolution"),
    path("update-resolution/<int:res_num>/", UpdateResolutionView.as_view(), name="update-resolution"),
    path('delete-resolution/<int:res_num>/', DeleteResolutionView.as_view(), name='delete-resolution'),
    # RESOLUTION FILE
    path("resolution-file/", ResolutionFileView.as_view(), name="council-resolution-file"),
    path('resolution-file-delete/<int:rf_id>/', ResolutionFileDetailView.as_view(), name='council-file-detail'),
    # RESOLUTION SUPP DOCS
    path("resolution-supp/", ResolutionSupDocsView.as_view(), name="council-supp-docs"),
    path('resolution-supp-delete/<int:rsd_id>/', ResolutionSupDocsDetailView.as_view(), name='council-supp-detail'), 
]
