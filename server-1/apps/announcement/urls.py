from django.urls import path
from .views import (
    AnnouncementView, AnnouncementDetailView,
    AnnouncementRecipientView, AnnouncementRecipientDetailView,
    AnnouncementRecipientByTypeView,
    AnnouncementFileView, AnnouncementFileDetailView
)

urlpatterns = [
    # Announcement
    path("create/", AnnouncementView.as_view(), name="create-announcements"),
    path("announcements/<int:ann_id>/", AnnouncementDetailView.as_view(), name="announcements-detail"),
    path("announcements/", AnnouncementView.as_view(), name="retrieve-announcements"),

    # Recipients
    path("create-recipient/", AnnouncementRecipientView.as_view(), name="recipient"),
    path("recipients/<int:ar_id>/", AnnouncementRecipientDetailView.as_view(), name="recipient-detail"),
    path("recipients-by-type", AnnouncementRecipientByTypeView.as_view(), name="recipients-by-type"),

    # Files
    path("upload-files/", AnnouncementFileView.as_view(), name="file"),
]
