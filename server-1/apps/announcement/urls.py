from django.urls import path
from .views import AnnouncementView, AnnouncementDetailView, AnnouncementRecipientView, AnnouncementRecipientDetailView,    AnnouncementFileView, AnnouncementFileDetailView

urlpatterns = [
    path("announcement/", AnnouncementView.as_view(), name="announcement-list-create"),
    path("announcement/<int:ann_id>/", AnnouncementDetailView.as_view(), name="announcement-detail-update"),
    path("announcement/<int:ann_id>/", AnnouncementDetailView.as_view(), name="announcement-detail-delete"),
]
