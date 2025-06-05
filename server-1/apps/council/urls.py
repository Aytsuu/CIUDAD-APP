from django.urls import path
from .views import *


urlpatterns=[
    path("event-meeting/", CouncilSchedulingView.as_view(), name="council-event-meeting"),
    path("event-meeting/<int:ce_id>/", CouncilSchedulingDetailView.as_view(), name="council-event-meeting-detail"),
    path("attendees/", AttendeesView.as_view(), name="council-attendees"),
    path("attendees/<int:atn_id>/", AttendeesDetailView.as_view(), name="council-attendees-detail"),
    path("attendance-sheet/", AttendanceView.as_view(), name="council-attendance-sheet"),
    path("attendance-sheet/<int:att_id>/", AttendanceDetailView.as_view(), name="council-attendance-sheet-detail"),
    path('api/staff/', StaffListView.as_view(), name='staff-list'),

    path("template/", TemplateView.as_view(), name="document-template"),
    path("update-template/<int:temp_id>/", UpdateTemplateView.as_view(), name="update-document-template"),
]