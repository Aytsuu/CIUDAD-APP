from django.urls import path
from .views import *

urlpatterns = [
    # Announcement
    path("create/", AnnouncementView.as_view(), name="create-announcements"),
    path("<int:ann_id>/", AnnouncementDetailView.as_view(), name="announcements-detail"),
    # path("list/", AnnouncementView.as_view(), name="retrieve-announcements"),
    path('list/', AnnouncementListView.as_view(), name='announcements-list'),
    
    # Recipients
    path("create-recipient/", AnnouncementRecipientView.as_view(), name="recipient"),
    path("recipients/<int:ar_id>/", AnnouncementRecipientDetailView.as_view(), name="recipient-detail"),
    path("recipients-by-type", AnnouncementRecipientByTypeView.as_view(), name="recipients-by-type"),

    # Files
    path("upload-files/", AnnouncementFileCreateView.as_view(), name="file"),
]
