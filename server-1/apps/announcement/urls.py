from django.urls import path
from .views import (
    AnnouncementView, AnnouncementDetailView,
    AnnouncementRecipientView, AnnouncementRecipientDetailView,
    AnnouncementRecipientByModeView,
    AnnouncementFileCreateView
)

urlpatterns = [
    # Announcement
    path("create/", AnnouncementView.as_view(), name="create-announcements"),
    path("announcements/<int:ann_id>/", AnnouncementDetailView.as_view(), name="announcements-detail"),
    path("list/", AnnouncementView.as_view(), name="retrieve-announcements"),

    # Recipients
    path("create-recipient/", AnnouncementRecipientView.as_view(), name="recipient"),
    path("recipients/<int:ar_id>/", AnnouncementRecipientDetailView.as_view(), name="recipient-detail"),
    path("recipients-by-mode/<str:ar_mode>/", AnnouncementRecipientByModeView.as_view(), name="recipients-by-mode"),

    # Files
    path("upload-files/", AnnouncementFileCreateView.as_view(), name="file"),
]
