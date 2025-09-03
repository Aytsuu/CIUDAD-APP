from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Announcement, AnnouncementFile, AnnouncementRecipient
from .serializers import (
    AnnouncementCreateSerializer,
    AnnouncementFileSerializer,
    AnnouncementRecipientSerializer,
    BulkAnnouncementRecipientSerializer,
    AnnouncementRecipientFilteredSerializer
)
from django.db import transaction
from django.utils import timezone
from django.db.models import Q

class AnnouncementView(generics.ListCreateAPIView):
    serializer_class = AnnouncementCreateSerializer

    def get_queryset(self):
        now = timezone.now()
        return Announcement.objects.filter(
            ann_status="Active"
        ).filter(
            Q(ann_start_at__lte=now) | Q(ann_start_at__isnull=True),
            Q(ann_end_at__gte=now) | Q(ann_end_at__isnull=True)
        ).order_by('-ann_created_at')


class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementCreateSerializer
    lookup_field = 'ann_id'


class AnnouncementFileCreateView(generics.CreateAPIView):
    queryset = AnnouncementFile.objects.all()
    serializer_class = AnnouncementFileSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)

        instances = [
            AnnouncementFile(**item) for item in serializer.validated_data
        ]
        created_instances = AnnouncementFile.objects.bulk_create(instances)

        return Response(status=status.HTTP_201_CREATED)


class AnnouncementFileDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AnnouncementFile.objects.all()
    serializer_class = AnnouncementFileSerializer


class AnnouncementRecipientView(generics.ListCreateAPIView):
    queryset = AnnouncementRecipient.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST' and isinstance(self.request.data, dict) and 'recipients' in self.request.data:
            return BulkAnnouncementRecipientSerializer
        return AnnouncementRecipientSerializer

    def create(self, request, *args, **kwargs):
        if 'recipients' in request.data:
            serializer = BulkAnnouncementRecipientSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Recipients created successfully"}, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = AnnouncementRecipientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AnnouncementRecipientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AnnouncementRecipient.objects.all()
    serializer_class = AnnouncementRecipientSerializer
    lookup_field = 'ar_id'


class AnnouncementRecipientByTypeView(APIView):
    def get(self, request):
        ar_type = request.query_params.get('ar_type')
        queryset = AnnouncementRecipient.objects.filter(ar_type=ar_type)
        serializer = AnnouncementRecipientFilteredSerializer(queryset, many=True)
        return Response(serializer.data)
