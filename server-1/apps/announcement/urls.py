# urls.py
from django.urls import path
from .views import (
    AnnouncementView, AnnouncementDetailView,
    AnnouncementRecipientView, AnnouncementRecipientDetailView,
    AnnouncementFileView, AnnouncementFileDetailView
)

urlpatterns = [
    path("announcements/", AnnouncementView.as_view(), name="announcements"),
    path("announcements/<int:ann_id>/", AnnouncementDetailView.as_view(), name="announcements-delete"),
    path("announcements/<int:ann_id>/", AnnouncementDetailView.as_view(), name="announcements-update"),


    path("announcements/<int:ann_id>/recipients/", AnnouncementRecipientView.as_view(), name="recipient"),
    path("announcements/<int:ann_id>/recipients/", AnnouncementRecipientDetailView.as_view(), name="recipient-delete"),
    path("announcements/<int:ann_id>/recipients/", AnnouncementRecipientDetailView.as_view(), name="recipient-update"),

    path("announcements/<int:ann_id>/files/", AnnouncementFileView.as_view(), name="file"),
    path("announcements/<int:ann_id>/files/", AnnouncementFileDetailView.as_view(), name="file-delete"),
    path("announcements/<int:ann_id>/files/", AnnouncementFileDetailView.as_view(), name="file-update"),
]
