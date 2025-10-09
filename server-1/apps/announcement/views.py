from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import *
from .serializers import *
from django.db import transaction
from django.utils import timezone
from django.db.models import Q
from apps.administration.models import Staff
from pagination import *

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


class AnnouncementListView(generics.ListAPIView):
    serializer_class = AnnouncementListSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        search = self.request.query_params.get('search', '').strip()
        staff = self.request.query_params.get('staff', None)
        sort = self.request.query_params.get('sort', None).lower()
        filter = self.request.query_params.get('filter', None).lower()
        recipient = self.request.query_params.get('recipient', None).lower()

        queryset = Announcement.objects.filter(
            ann_status__iexact="ACTIVE"
        ).order_by('-ann_created_at')

        if staff:
            print("Retrieving data created by you...")
            queryset = queryset.filter(staff=Staff.objects.filter(staff_id=staff).first())
        
        if filter:
            print(f"Handling {filter} filter...")
            if filter == 'event':
                queryset = queryset.filter(ann_type__icontains='event')
            elif filter == 'general':
                queryset = queryset.filter(~Q(ann_type__icontains='event'))

        if recipient:
            if recipient == 'staff only':
                queryset = queryset.filter(announcement_recipients__ar_category__iexact='staff').distinct()
            elif recipient == 'resident only':
                queryset = queryset.filter(Q(announcement_recipients__ar_category__iexact='resident') | Q(ann_type__iexact='public'))

        if search:
            print("Handling search...")
            queryset = queryset.filter(
                Q(ann_title__icontains=search)
            )

        if sort:
            print("Handling sort...")
            if sort == "newest":
                queryset = queryset.order_by('-ann_created_at') 
            elif sort == "oldest":
                queryset = queryset.order_by('ann_created_at') 
            elif sort == "A - Z":
                queryset = queryset.order_by('-ann_title') 
            else:
                queryset = queryset.order_by('ann_title') 
                
        return queryset
        

        # now = timezone.now()

        # Announcements created (ONLY active + valid date)
        # created = Announcement.objects.filter(
        #     staff=staff,
        #     ann_status="Active"
        # ).filter(
        #     Q(ann_start_at__lte=now) | Q(ann_start_at__isnull=True),
        #     Q(ann_end_at__gte=now) | Q(ann_end_at__isnull=True)
        # )

        # Announcements received (ONLY active + valid date)
        # received_ids = AnnouncementRecipient.objects.filter(
        #     Q(ar_category=staff_id) | Q(ar_type__iexact=staff.pos.pos_title)
        # ).values_list("ann_id", flat=True).distinct()

        # received = Announcement.objects.filter(
        #     ann_id__in=received_ids,
        #     ann_status="Active"
        # ).filter(
        #     Q(ann_start_at__lte=now) | Q(ann_start_at__isnull=True),
        #     Q(ann_end_at__gte=now) | Q(ann_end_at__isnull=True)
        # )

        # Public announcements (ONLY active + valid date)
        # public_announcements = Announcement.objects.filter(
        #     ann_type="public",
        #     ann_status="Active"
        # ).filter(
        #     Q(ann_start_at__lte=now) | Q(ann_start_at__isnull=True),
        #     Q(ann_end_at__gte=now) | Q(ann_end_at__isnull=True)
        # )

        # Union with public
        # received = received.union(public_announcements)

        # Apply filters (backend side)
        # def apply_filters(queryset):
        #     if search:
        #         queryset = queryset.filter(ann_title__icontains=search)

        #     if filter_param == "toSms":
        #         queryset = queryset.filter(ann_to_sms=True)
        #     elif filter_param == "toEmail":
        #         queryset = queryset.filter(ann_to_email=True)
        #     elif filter_param == "general":
        #         queryset = queryset.filter(ann_type="general")
        #     elif filter_param == "public":
        #         queryset = queryset.filter(ann_type="public")
        #     elif filter_param == "event":
        #         queryset = queryset.filter(ann_type="event")
        #     elif filter_param == "dateRecent":
        #         queryset = queryset.order_by("-ann_created_at")

        #     return queryset

        # created = apply_filters(created)
        # received = apply_filters(received)

        # created_data = AnnouncementCreateSerializer(created, many=True).data
        # received_data = AnnouncementCreateSerializer(received, many=True).data




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
