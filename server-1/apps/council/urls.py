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
    path('update-template-pr-id/', UpdateTemplateByPrIdView.as_view(), name='update-template-pr-id'),
    path('delete-template-with-pr-id/<int:pr_id>/', DeleteTemplateByPrIdView.as_view(), name='delete-template-pr-id'),
    path('summon-template/', SummonTemplateView.as_view(), name='summon-template'),

    path("template-file/", TemplateFileView.as_view(), name="council-template-file"),

    # MINUTES OF MEETING
    # mobile and web
    path('minutes-of-meeting/', MinutesOfMeetingView.as_view(), name="minutes-of-meeting"),
    path('mom-area-of-focus/', MOMAreaOfFocusView.as_view(), name='mom-area-of-focus'),
    path('delete-mom-area-of-focus/<int:mom_id>/', DeleteMOMAreaOfFocusView.as_view(), name='delete-mom-area-of-focus'),
    path('update-minutes-of-meeting/<int:mom_id>/', UpdateMinutesOfMeetingView.as_view(), name='update-minutes-of-meeting'),
    path('delete-minutes-of-meeting/<int:mom_id>/', DeleteMinutesOfMeetingView.as_view(), name='delete-minutes-of-meeting'),
    path('mom-file/', MOMFileView.as_view(), name='mom-file'),
    path('delete-mom-file/<int:mom_id>/', DeleteMOMFileView.as_view(), name="delete-mom-file"),
    # mobile
    path('mom-details-view/<int:mom_id>/', MinutesOfMeetingDetailView.as_view(), name='mom-detail-view' ),
    path('mom-supp-doc/', MOMSuppDocView.as_view(), name='mom-supp-doc',),
    path('meeting-supp-docs/<int:mom_id>/', MeetingSuppDocsView.as_view(), name='meeting-supp-docs'),
    path('delete-mom-supp-doc/<int:momsp_id>/', DeleteMOMSuppDocView.as_view(), name = 'delete-mom-supp-doc'),
    
    path("purpose-rates-view/", PurposeRatesListView.as_view(), name="purpose-rates-list"),

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
