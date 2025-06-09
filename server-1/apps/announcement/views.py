from rest_framework import generics
from .models import Announcement, AnnouncementRecipient, AnnouncementFile
from .serializers import AnnouncementSerializer, AnnouncementRecipientSerializer, AnnouncementFileSerializer

class AnnouncementView(generics.ListCreateAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    lookup_field = 'ann_id'

class AnnouncementRecipientView(generics.ListCreateAPIView):
    serializer_class = AnnouncementRecipientSerializer
    queryset = AnnouncementRecipient.objects.all()

class AnnouncementRecipientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AnnouncementRecipient.objects.all()
    serializer_class = AnnouncementRecipientSerializer
    lookup_field = 'ar_id' 

class AnnouncementFileView(generics.ListCreateAPIView):
    serializer_class = AnnouncementFileSerializer
    queryset = AnnouncementFile.objects.all()
    
class AnnouncementFileDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AnnouncementFile.objects.all()
    serializer_class = AnnouncementFileSerializer
    lookup_field = 'af_id'  
