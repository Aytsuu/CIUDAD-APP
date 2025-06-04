from django.urls import path
from .views import *


urlpatterns=[
    path("event-meeting/", CouncilSchedulingView.as_view(), name="council-event-meeting"),
    path("attendees/", AttendeesView.as_view(), name="council-attendees"),
    path("attendance-sheet/", AttendanceView.as_view(), name="council-attendance-sheet"),

    path("template/", TemplateView.as_view(), name="document-template"),
    path("update-template/<int:temp_id>/", UpdateTemplateView.as_view(), name="update-document-template"),
]