from rest_framework import generics
from .models import Announcement
from .serializers import AnnouncementSerializer

class AnnouncementView(generics.ListCreateAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    lookup_field = 'ann_id'

class AnnouncementRecipientView(generics.ListCreateAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    lookup_field = 'ann_id'

class AnnouncementRecipientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    lookup_field = 'ann_id'

class AnnouncementFileView(generics.ListCreateAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    lookup_field = 'ann_id'

class AnnouncementFileDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    lookup_field = 'ann_id'
