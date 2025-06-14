from django.urls import path
from .views import *


urlpatterns=[
    path("event-meeting/", CouncilSchedulingView.as_view(), name="council-event-meeting"),
    path("event-meeting/<int:ce_id>/", CouncilSchedulingDetailView.as_view(), name="council-event-meeting-detail"),
    path("attendees/", AttendeesView.as_view(), name="council-attendees"),
    path("attendees/<int:atn_id>/", AttendeesDetailView.as_view(), name="council-attendees-detail"),
    path("attendees/bulk/", AttendeesBulkView.as_view(), name="council-attendees-bulk"),
    path("attendance-sheet/", AttendanceView.as_view(), name="council-attendance-sheet"),
    path("attendance-sheet/<int:att_id>/", AttendanceDetailView.as_view(), name="council-attendance-sheet-detail"),
    path('api/staff/', StaffListView.as_view(), name='staff-list'),

    path("template/", TemplateView.as_view(), name="document-template"),
    path("update-template/<int:temp_id>/", UpdateTemplateView.as_view(), name="update-document-template"),

    path('minutes-of-meeting/', MinutesOfMeetingView.as_view(), name="minutes-of-meeting"),
    path('mom-area-of-focus/', MOMAreaOfFocusView.as_view(), name='mom-area-of-focus'),
    path('mom-file/', MOMFileView.as_view(), name='mom-file'),
    path('update-minutes-of-meeting/<int:mom_id>/', UpdateMinutesOfMeetingView.as_view(), name='update-minutes-of-meeting'),
    path('delete-minutes-of-meeting/<int:mom_id>/', DeleteMinutesOfMeetingView.as_view(), name='delete-minutes-of-meeting'),
    path('update-mom-file/<int:momf_id>/', UpdateMOMFileView.as_view(), name="update-mom-file"),
    path('delete-mom-area-of-focus/<int:mom_id>/', DeleteMOMAreaOfFocusView.as_view(), name='delete-mom-area-of-focus'),
]