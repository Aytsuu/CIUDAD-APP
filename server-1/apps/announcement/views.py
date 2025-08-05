from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db import transaction
from django.db.models import Q

from .models import Announcement, AnnouncementFile, AnnouncementRecipient
from .serializers import (
    AnnouncementBaseSerializer,
    AnnouncementFileSerializer,
    AnnouncementRecipientSerializer,
    BulkAnnouncementRecipientSerializer,
    AnnouncementRecipientFilteredSerializer
)

class AnnouncementView(generics.ListCreateAPIView):
    serializer_class = AnnouncementBaseSerializer

    def get_queryset(self):
        now = timezone.now()
        show_all = self.request.query_params.get('show_all') == 'true'

        if show_all:
            return Announcement.objects.all().order_by('-ann_publish_at', '-ann_created_at')

        return Announcement.objects.filter(
            Q(ann_publish_at__lte=now) | Q(ann_publish_at__isnull=True)
        ).order_by('-ann_publish_at', '-ann_created_at')

    def create(self, request, *args, **kwargs):
        print("📥 Original request.data:", request.data)

        # Copy request data
        data = request.data.copy()

        # If frontend did NOT send a publish date, default to now
        if not data.get("ann_publish_at"):
            data["ann_publish_at"] = timezone.now().isoformat()
            print("📆 Publish date not provided. Using now:", data["ann_publish_at"])
        else:
            print("📆 Using frontend-provided publish date:", data["ann_publish_at"])

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        print("✅ Saved announcement with publish_at:", serializer.validated_data.get("ann_publish_at"))

        return Response(serializer.data, status=status.HTTP_201_CREATED)



# ✅ View/Update/Delete single announcement
class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementBaseSerializer
    lookup_field = 'ann_id'


# ✅ Upload announcement files (bulk)
class AnnouncementFileCreateView(generics.CreateAPIView):
    queryset = AnnouncementFile.objects.all()
    serializer_class = AnnouncementFileSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)

        instances = [AnnouncementFile(**item) for item in serializer.validated_data]
        AnnouncementFile.objects.bulk_create(instances)

        return Response(status=status.HTTP_201_CREATED)


# ✅ View/Update/Delete single announcement file
class AnnouncementFileDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AnnouncementFile.objects.all()
    serializer_class = AnnouncementFileSerializer


# ✅ Add/view announcement recipients (supports bulk add)
class AnnouncementRecipientView(generics.ListCreateAPIView):
    queryset = AnnouncementRecipient.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST' and isinstance(self.request.data, dict) and 'recipients' in self.request.data:
            return BulkAnnouncementRecipientSerializer
        return AnnouncementRecipientSerializer

    def create(self, request, *args, **kwargs):
        if 'recipients' in request.data:
            serializer = BulkAnnouncementRecipientSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Recipients created successfully"}, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = AnnouncementRecipientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ✅ View/Update/Delete single announcement recipient
class AnnouncementRecipientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AnnouncementRecipient.objects.all()
    serializer_class = AnnouncementRecipientSerializer
    lookup_field = 'ar_id'


# 🔄 Replace broken ar_type filter with actual mode filter
class AnnouncementRecipientByModeView(APIView):
    def get(self, request):
        ar_mode = request.query_params.get('ar_mode')  # sms or email
        if not ar_mode:
            return Response({"detail": "Missing `ar_mode` query param"}, status=status.HTTP_400_BAD_REQUEST)

        queryset = AnnouncementRecipient.objects.filter(ar_mode=ar_mode)
        serializer = AnnouncementRecipientFilteredSerializer(queryset, many=True)
        return Response(serializer.data)
