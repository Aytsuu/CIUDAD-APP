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
from apps.administration.models import Staff

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


class AnnouncementCreatedReceivedView(APIView):
    def get(self, request, staff_id):
        print(f"FETCHING CREATED + RECEIVED ANNOUNCEMENTS for staff_id={staff_id}")

        # Staff + Position
        staff = Staff.objects.filter(staff_id=staff_id).select_related("pos").first()
        staff_pos_title = getattr(getattr(staff, "pos", None), "pos_title", None)

        if staff_pos_title:
            staff_pos_title = staff_pos_title.upper().strip()

        print(f" Staff found: {getattr(staff, 'staff_id', None)}, pos={staff_pos_title}")

        # Announcements created by this staff
        created = Announcement.objects.filter(staff__staff_id=staff_id)
        created_data = AnnouncementCreateSerializer(created, many=True).data
        print(f"Created count: {created.count()}")

        received_ids = AnnouncementRecipient.objects.filter(
            Q(ar_category=staff_id) | Q(ar_type__iexact=staff_pos_title)
        ).values_list("ann_id", flat=True).distinct()

        received = Announcement.objects.filter(ann_id__in=received_ids)
        print(f"Received by staff_id/pos count: {received.count()}")

        public_announcements = Announcement.objects.filter(ann_type="public")
        received = received.union(public_announcements)
        print(f"Public announcements count: {public_announcements.count()}")

        #Include created announcements if they also match staff position
        overlap = created.filter(ann_id__in=received.values_list("ann_id", flat=True))
        received = received.union(overlap)

        received_data = AnnouncementCreateSerializer(received, many=True).data

        # Debug all recipients
        all_recs = AnnouncementRecipient.objects.all()
        print("All AnnouncementRecipient entries:")
        for rec in all_recs:
            print(f"   - ann_id={rec.ann_id}, ar_type={rec.ar_type}, ar_category={rec.ar_category}")

        return Response({
            "created": created_data,
            "received": received_data,
            "staff_pos_title": staff_pos_title,
        })


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
    # serializer_class = BulkAnnouncementRecipientSerializer
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
