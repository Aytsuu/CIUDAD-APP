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
        sort = self.request.query_params.get('sort', '').lower()
        filter = self.request.query_params.get('filter', '').lower()
        recipient = self.request.query_params.get('recipient', '').lower()

        queryset = Announcement.objects.filter(
            ann_status__iexact="ACTIVE"
        ).order_by('-ann_created_at')

        if staff:
            print("Retrieving data created by you...")
            queryset = Announcement.objects.filter(staff=Staff.objects.filter(staff_id=staff).first())
        
        if filter:
            if filter == 'event':
                queryset = queryset.filter(ann_type__icontains='event')
            elif filter == 'general':
                queryset = queryset.filter(~Q(ann_type__icontains='event'))

        if recipient:
            if recipient == 'staff':
                queryset = queryset.filter(announcement_recipients__ar_category__iexact='staff').distinct()
            elif recipient == 'resident':
                queryset = queryset.filter(Q(announcement_recipients__ar_category__iexact='resident') | Q(ann_type__iexact='public'))
            elif recipient == 'public':
                queryset = queryset.filter(Q(ann_type__iexact='public'))

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

class AnnouncementUpdateView(generics.UpdateAPIView):
    serializer_class = AnnouncementBaseSerializer
    queryset = Announcement.objects.all()
    lookup_field = 'ann_id'

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        ar_types = request.data.pop('ar_type', [])
        files = request.data.pop('files', [])

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        recipients = instance.announcement_recipients.all()
        flattened = [
            rec.ar_type
            for rec in recipients
        ]

        if len(ar_types) > 0:
            for rec in recipients:
                if rec.ar_type not in ar_types:
                    rec.delete()

            for type in ar_types:
                if type not in flattened:
                    AnnouncementRecipient.objects.create(
                        ann=instance,
                        ar_type=type
                    )
        
        if len(files) > 0:
            instance.announcement_files.all().delete()
            self._upload_files(instance, files)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def _upload_files(self, announcement_instance, files):
        announcement_files = []
        for file_data in files:
            announcement_file = AnnouncementFile(
                ann=announcement_instance,
                af_name=file_data.get('name'),
                af_type=file_data.get('type'),
                af_path=file_data.get('name'),
            )
            url = upload_to_storage(file_data, 'announcement-bucket', "")
            announcement_file.af_url = url
            announcement_files.append(announcement_file)

        if announcement_files:
            AnnouncementFile.objects.bulk_create(announcement_files)


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