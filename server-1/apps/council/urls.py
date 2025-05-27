from django.urls import path
from .views import *


urlpatterns=[
    path("event-meeting/", CouncilSchedulingView.as_view(), name="council-event-meeting"),
    path("attendees/", AttendeesView.as_view(), name="council-attendees"),
    path("attendance-sheet/", AttendanceView.as_view(), name="council-attendance-sheet"),
]