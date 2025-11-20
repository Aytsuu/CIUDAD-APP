from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, filters
from .models import WasteTruck
from apps.profiling.models import Sitio
from rest_framework import generics
from .signals import archive_completed_hotspots, archive_passed_waste_events
from rest_framework.permissions import AllowAny
from apps.act_log.utils import ActivityLogMixin
from django.db.models import OuterRef, Subquery
from django.db.models import Q
from datetime import date, timedelta
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Case, When, Value, IntegerField
from apps.announcement.models import Announcement, AnnouncementRecipient
from apps.pagination import StandardResultsPagination
from apps.announcement.serializers import BulkAnnouncementRecipientSerializer
from apps.notification.utils import create_notification
import logging

logger = logging.getLogger(__name__)

class WasteEventView(ActivityLogMixin, generics.ListCreateAPIView):
    serializer_class = WasteEventSerializer
    queryset = WasteEvent.objects.all()
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        # Auto-archive waste events that have passed
        archive_passed_waste_events()
        
        queryset = WasteEvent.objects.all()
        
        # Archive filter
        is_archive = self.request.query_params.get('is_archive', None)
        if is_archive is not None:
            queryset = queryset.filter(we_is_archive=is_archive.lower() == 'true')
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        # Create the waste event first
        response = super().create(request, *args, **kwargs)
        
        # Get the created event data
        event_data = response.data
        
        # Check if announcements were requested
        selected_announcements = request.data.get('selectedAnnouncements', [])
        event_subject = request.data.get('eventSubject', '')
        
        if selected_announcements and len(selected_announcements) > 0:
            try:
                # Create announcement for the event
                announcement = Announcement.objects.create(
                    ann_title=f"WASTE EVENT: {event_data.get('we_name', 'Waste Management Event')}",
                    ann_details=event_subject or f"Event: {event_data.get('we_name')}\nLocation: {event_data.get('we_location')}\nDate: {event_data.get('we_date')} at {event_data.get('we_time')}\nOrganizer: {event_data.get('we_organizer')}\n\n{event_data.get('we_description', '')}",
                    ann_created_at=timezone.now(),
                    ann_type="event",
                    ann_to_email=True,
                    ann_to_sms=True,
                    ann_status="Active",
                    staff_id=event_data.get('staff')
                )
                
                # Prepare recipients data for BulkAnnouncementRecipientSerializer
                recipients_data = []
                for announcement_type in selected_announcements:
                    recipient_dict = {'ann': announcement.ann_id}
                    
                    if announcement_type == "all":
                        recipient_dict['ar_category'] = "all"
                        recipient_dict['ar_type'] = "ALL"
                    elif announcement_type == "allbrgystaff":
                        recipient_dict['ar_category'] = "staff"
                        recipient_dict['ar_type'] = "ALL"
                    elif announcement_type == "residents":
                        recipient_dict['ar_category'] = "resident"
                        recipient_dict['ar_type'] = "RESIDENT"
                    elif announcement_type == "wmstaff":
                        recipient_dict['ar_category'] = "staff"
                        recipient_dict['ar_type'] = "WASTE_MANAGEMENT"
                    elif announcement_type == "drivers":
                        recipient_dict['ar_category'] = "staff"
                        recipient_dict['ar_type'] = "DRIVER"
                    elif announcement_type == "collectors":
                        recipient_dict['ar_category'] = "staff"
                        recipient_dict['ar_type'] = "LOADER"
                    elif announcement_type == "watchmen":
                        recipient_dict['ar_category'] = "staff"
                        recipient_dict['ar_type'] = "WATCHMAN"
                    
                    recipients_data.append(recipient_dict)
                
                # Use BulkAnnouncementRecipientSerializer to create recipients and send notifications/emails
                bulk_serializer = BulkAnnouncementRecipientSerializer(
                    data={'recipients': recipients_data},
                    context={'request': request}
                )
                
                if bulk_serializer.is_valid():
                    try:
                        bulk_serializer.save()
                        logger.info(f"Announcement recipients created and notifications sent for waste event announcement {announcement.ann_id}")
                        # Add announcement ID to response
                        response.data['announcement_id'] = announcement.ann_id
                        response.data['announcement_created'] = True
                    except Exception as e:
                        logger.error(f"Error saving announcement recipients: {str(e)}")
                        response.data['announcement_id'] = announcement.ann_id
                        response.data['announcement_created'] = False
                        response.data['announcement_error'] = str(e)
                else:
                    logger.error(f"Error validating announcement recipients: {bulk_serializer.errors}")
                    response.data['announcement_id'] = announcement.ann_id
                    response.data['announcement_created'] = False
                    response.data['announcement_error'] = bulk_serializer.errors
                
            except Exception as e:
                # Log error but don't fail the event creation
                print(f"Error creating announcement for waste event: {str(e)}")
                response.data['announcement_created'] = False
                response.data['announcement_error'] = str(e)
        
        return response

class WasteEventDetailView(ActivityLogMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WasteEventSerializer
    queryset = WasteEvent.objects.all()
    lookup_field = 'we_num'
    permission_classes = [AllowAny]

    def get_object(self):
        queryset = self.get_queryset()
        lookup_value = self.kwargs[self.lookup_field]
        try:
            obj = queryset.get(pk=lookup_value)
        except WasteEvent.DoesNotExist:
            raise status.HTTP_404_NOT_FOUND
        return obj

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        from apps.act_log.utils import create_activity_log, resolve_staff_from_request
        
        staff, staff_identifier = resolve_staff_from_request(request)
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        if permanent:
            # Log before permanent delete
            if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                description_parts = []
                if instance.we_name:
                    description_parts.append(f"Event: {instance.we_name}")
                if instance.we_location:
                    description_parts.append(f"Location: {instance.we_location}")
                if instance.we_date:
                    date_str = instance.we_date.strftime('%Y-%m-%d') if not isinstance(instance.we_date, str) else instance.we_date
                    description_parts.append(f"Date: {date_str}")
                description_parts.append("Status: Deleted")
                description = ". ".join(description_parts)
                
                create_activity_log(
                    act_type="Waste Event Deleted",
                    act_description=description,
                    staff=staff,
                    record_id=str(instance.we_num)
                )
                logger.info(f"Activity logged: Waste event {instance.we_num} deleted")
            
            # Permanent delete
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            # Soft delete (archive)
            instance.we_is_archive = True
            instance.save()
            
            # Log archive
            if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                description_parts = []
                if instance.we_name:
                    description_parts.append(f"Event: {instance.we_name}")
                if instance.we_location:
                    description_parts.append(f"Location: {instance.we_location}")
                if instance.we_date:
                    date_str = instance.we_date.strftime('%Y-%m-%d') if not isinstance(instance.we_date, str) else instance.we_date
                    description_parts.append(f"Date: {date_str}")
                description_parts.append("Status: Archived")
                description = ". ".join(description_parts)
                
                create_activity_log(
                    act_type="Waste Event Archived",
                    act_description=description,
                    staff=staff,
                    record_id=str(instance.we_num)
                )
                logger.info(f"Activity logged: Waste event {instance.we_num} archived")
            
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)

class WasteEventRestoreView(generics.UpdateAPIView):
    queryset = WasteEvent.objects.filter(we_is_archive=True)
    serializer_class = WasteEventSerializer
    lookup_field = 'we_num'
    permission_classes = [AllowAny]

    def update(self, request, *args, **kwargs):
        from apps.act_log.utils import create_activity_log, resolve_staff_from_request
        
        instance = self.get_object()
        instance.we_is_archive = False
        instance.save()
        
        # Log restore
        staff, staff_identifier = resolve_staff_from_request(request)
        if staff and hasattr(staff, 'staff_id') and staff.staff_id:
            description_parts = []
            if instance.we_name:
                description_parts.append(f"Event: {instance.we_name}")
            if instance.we_location:
                description_parts.append(f"Location: {instance.we_location}")
            if instance.we_date:
                date_str = instance.we_date.strftime('%Y-%m-%d') if not isinstance(instance.we_date, str) else instance.we_date
                description_parts.append(f"Date: {date_str}")
            description_parts.append("Status: Restored")
            description = ". ".join(description_parts)
            
            create_activity_log(
                act_type="Waste Event Restored",
                act_description=description,
                staff=staff,
                record_id=str(instance.we_num)
            )
            logger.info(f"Activity logged: Waste event {instance.we_num} restored")
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

class WasteCollectionStaffView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = WasteCollectionStaffSerializer
    queryset = WasteCollectionStaff.objects.all()

# WASTE COLLECTION RETRIEVE / VIEW
class WasteCollectionSchedView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]        
    serializer_class = WasteCollectionSchedSerializer
    queryset = WasteCollectionSched.objects.all()

    def perform_create(self, serializer):
        instance = serializer.save()
        return instance  # Return the created instance including wc_num


class WasteCollectorView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]    
    serializer_class = WasteCollectorSerializer
    queryset = WasteCollector.objects.all()
    

class WasteCollectionSchedFullDataView(generics.ListAPIView):
    permission_classes = [AllowAny]   
    serializer_class = WasteCollectionSchedFullDataSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        search_query = self.request.query_params.get('search', '')
        day = self.request.query_params.get('day', '')
        is_archive = self.request.query_params.get('is_archive', None)
        
        queryset = WasteCollectionSched.objects.all()
        
        # Apply archive filter if provided
        if is_archive is not None:
            # Convert string to boolean
            if is_archive.lower() in ['true', '1', 'yes']:
                is_archive_bool = True
            elif is_archive.lower() in ['false', '0', 'no']:
                is_archive_bool = False
            else:
                # Default behavior if invalid value
                is_archive_bool = None
                
            if is_archive_bool is not None:
                queryset = queryset.filter(wc_is_archive=is_archive_bool)
        
        # Apply search filter if search query exists
        if search_query:
            queryset = queryset.filter(
                Q(wc_add_info__icontains=search_query) |
                Q(sitio__sitio_name__icontains=search_query) |
                Q(wc_day__icontains=search_query) |
                # Search driver name (wstp field)
                Q(wstp__staff__rp__per__per_lname__icontains=search_query) |
                Q(wstp__staff__rp__per__per_fname__icontains=search_query) |
                Q(wstp__staff__rp__per__per_mname__icontains=search_query) |
                # Search collectors names (through WasteCollector model)
                Q(wastecollector__wstp__staff__rp__per__per_lname__icontains=search_query) |
                Q(wastecollector__wstp__staff__rp__per__per_fname__icontains=search_query) |
                Q(wastecollector__wstp__staff__rp__per__per_mname__icontains=search_query)
            ).distinct()
        
        # Apply day filter
        if day:
            queryset = queryset.filter(wc_day=day)
        
        # Custom day ordering
        day_order = Case(
            When(wc_day='Monday', then=Value(1)),
            When(wc_day='Tuesday', then=Value(2)),
            When(wc_day='Wednesday', then=Value(3)),
            When(wc_day='Thursday', then=Value(4)),
            When(wc_day='Friday', then=Value(5)),
            When(wc_day='Saturday', then=Value(6)),
            When(wc_day='Sunday', then=Value(7)),
            default=Value(8),
            output_field=IntegerField()
        )
        
        return queryset.order_by(day_order, 'wc_time')
    

class WasteCollectorDeleteView(generics.DestroyAPIView):
    permission_classes = [AllowAny]    
    queryset = WasteCollector.objects.all()
    serializer_class = WasteCollectorSerializer

    def get_object(self):
        wasc_id = self.kwargs.get('wasc_id')
        return get_object_or_404(WasteCollector, wasc_id=wasc_id)
    
    def destroy(self, request, *args, **kwargs):
        from apps.act_log.utils import create_activity_log, resolve_staff_from_request
        
        instance = self.get_object()
        
        # Log before delete
        staff, staff_identifier = resolve_staff_from_request(request)
        if staff and hasattr(staff, 'staff_id') and staff.staff_id:
            description_parts = []
            if instance.wc_num:
                description_parts.append(f"Collection Schedule: {instance.wc_num}")
            if instance.wstp and instance.wstp.staff:
                staff_name = f"{instance.wstp.staff.rp.per.per_fname} {instance.wstp.staff.rp.per.per_lname}" if instance.wstp.staff.rp and instance.wstp.staff.rp.per else "N/A"
                description_parts.append(f"Collector: {staff_name}")
            description_parts.append("Status: Deleted")
            description = ". ".join(description_parts)
            
            create_activity_log(
                act_type="Waste Collector Deleted",
                act_description=description,
                staff=staff,
                record_id=str(instance.wasc_id)
            )
            logger.info(f"Activity logged: Waste collector {instance.wasc_id} deleted")
        
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT) 

# WASTE COLLECTION DELETE
class WasteCollectionSchedDeleteView(generics.DestroyAPIView):
    permission_classes = [AllowAny]    
    queryset = WasteCollectionSched.objects.all()
    serializer_class = WasteCollectionSchedSerializer

    def get_object(self):
        wc_num = self.kwargs.get('wc_num')
        return get_object_or_404(WasteCollectionSched, wc_num=wc_num)
    
    def destroy(self, request, *args, **kwargs):
        from apps.act_log.utils import create_activity_log, resolve_staff_from_request
        
        instance = self.get_object()
        
        # Log before delete
        staff, staff_identifier = resolve_staff_from_request(request)
        if staff and hasattr(staff, 'staff_id') and staff.staff_id:
            description_parts = []
            if instance.sitio:
                description_parts.append(f"Sitio: {instance.sitio.sitio_name}")
            if instance.wc_day:
                description_parts.append(f"Day: {instance.wc_day}")
            if instance.wc_time:
                time_str = instance.wc_time.strftime('%I:%M %p') if not isinstance(instance.wc_time, str) else instance.wc_time
                description_parts.append(f"Time: {time_str}")
            description_parts.append("Status: Deleted")
            description = ". ".join(description_parts)
            
            create_activity_log(
                act_type="Waste Collection Schedule Deleted",
                act_description=description,
                staff=staff,
                record_id=str(instance.wc_num)
            )
            logger.info(f"Activity logged: Waste collection schedule {instance.wc_num} deleted")
        
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT) 


    def perform_create(self, serializer):
        instance = serializer.save()
        return instance  # Return the created instance including wc_num

# class WasteCollectionAssignmentView(generics.ListCreateAPIView):
#     serializer_class = WasteCollectionAssignmentSerializer
#     queryset = WasteCollectionAssignment.objects.all()


class WasteCollectorListView(generics.ListAPIView):
    permission_classes = [AllowAny]    
    serializer_class = WasteCollectorSerializer
    
    def get_queryset(self):
        queryset = WasteCollector.objects.all()
        wc_num = self.request.query_params.get('wc_num')
        wstp = self.request.query_params.get('wstp')
        
        if wc_num:
            queryset = queryset.filter(wc_num=wc_num)
        if wstp:
            queryset = queryset.filter(wstp=wstp)
            
        return queryset


# WASTE COLLECTION UPDATE
class WasteCollectionSchedUpdateView(ActivityLogMixin, generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]    
    queryset = WasteCollectionSched.objects.all()
    serializer_class = WasteCollectionSchedSerializer
    lookup_field = 'wc_num'
    permission_classes = [AllowAny]
    

#WASTE COLLECTION ANNOUNCEMENT
class CreateCollectionRemindersView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        tomorrow_day = tomorrow.strftime('%A')

        schedules = WasteCollectionSched.objects.filter(
            wc_day__iexact=tomorrow_day,
            wc_is_archive=False
        ).select_related('sitio', 'staff')

        created_announcements = []
        
        for schedule in schedules:
            sitio_name = schedule.sitio.sitio_name if schedule.sitio else "Unknown Location"
            time_str = schedule.wc_time.strftime('%I:%M %p') if schedule.wc_time else "TBD"
            
            # Check if announcement already exists for today
            existing_announcement = Announcement.objects.filter(
                ann_title=f"WASTE COLLECTION: SITIO {sitio_name}",
                ann_details=f"WHEN: {schedule.wc_day.upper()} AT {time_str}\nLOCATION: SITIO {sitio_name.upper()}",
                ann_created_at__date=today,
                ann_type="GENERAL"
            ).first()
            
            if existing_announcement:
                continue  # Skip if already created today
            
            # Create announcement
            announcement = Announcement.objects.create(
                ann_title=f"WASTE COLLECTION: SITIO {sitio_name}",
                ann_details=f"WHEN: {schedule.wc_day} AT {time_str}\nLOCATION: SITIO {sitio_name}",
                ann_created_at=timezone.now(),
                ann_start_at=timezone.now(),
                ann_end_at=timezone.now() + timedelta(days=2),
                ann_type="GENERAL",
                ann_to_email=True,
                ann_to_sms=True,
                ann_status="ACTIVE",
                staff=schedule.staff
            )

            # Create recipients
            AnnouncementRecipient.objects.create(
                ann=announcement,
                ar_category="STAFF",
                ar_type="LOADER"
            )

            AnnouncementRecipient.objects.create(
                ann=announcement,
                ar_category="STAFF",
                ar_type="DRIVER LOADER"
            )

            created_announcements.append({
                'ann_id': announcement.ann_id,
                'sitio': sitio_name,
                'day': schedule.wc_day,
                'time': time_str
            })

        return Response({
            'message': f'Created {len(created_announcements)} announcements',
            'announcements': created_announcements
        }, status=status.HTTP_201_CREATED)


#============================= WASTE HOTSPOT ================================

class UpcomingHotspotView(generics.ListAPIView):
    permission_classes = [AllowAny]    
    serializer_class = WasteHotspotSerializer

    def get_queryset(self):
        today = date.today()
        time_range = self.request.query_params.get('range', 'week')  # default to week
        
        queryset = WasteHotspot.objects.select_related(
            'wstp_id__staff__rp__per', 
            'sitio_id'
        ).filter(
            wh_is_archive=False,
            wh_date__gte=today
        )
        
        if time_range == 'today':
            queryset = queryset.filter(wh_date=today)
        else:  # week
            end_of_week = today + timedelta(days=7)
            queryset = queryset.filter(wh_date__lte=end_of_week)
            
        return queryset.order_by('wh_date', 'wh_start_time', 'wh_end_time')
    

# class UpdateHotspotView(generics.RetrieveUpdateAPIView): 
#     serializer_class = WasteHotspotSerializer
#     queryset = WasteHotspot.objects.all()
#     lookup_field = 'wh_num'

#     def update(self, request, *args, **kwargs):
#         instance = self.get_object()
#         serializer = self.get_serializer(instance, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class WasteHotspotView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]   
    serializer_class = WasteHotspotSerializer

    def get_queryset(self):
        # archive_completed_hotspots()
        return WasteHotspot.objects.select_related(
            'wstp_id__staff__rp__per', 
            'sitio_id'                   
        ).all().order_by('wh_date', 'wh_start_time', 'wh_end_time')

class UpdateHotspotView(ActivityLogMixin, generics.RetrieveUpdateAPIView): 
    permission_classes = [AllowAny]    
    serializer_class = WasteHotspotSerializer
    queryset = WasteHotspot.objects.all()
    lookup_field = 'wh_num'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class DeleteHotspotView(generics.DestroyAPIView):
    permission_classes = [AllowAny]    
    serializer_class = WasteHotspotSerializer    
    queryset = WasteHotspot.objects.all()

    def get_object(self):
        wh_num = self.kwargs.get('wh_num')
        return get_object_or_404(WasteHotspot, wh_num=wh_num)
    
    def destroy(self, request, *args, **kwargs):
        from apps.act_log.utils import create_activity_log, resolve_staff_from_request
        
        instance = self.get_object()
        
        # Log before delete
        staff, staff_identifier = resolve_staff_from_request(request)
        if staff and hasattr(staff, 'staff_id') and staff.staff_id:
            description_parts = []
            if instance.sitio_id:
                description_parts.append(f"Sitio: {instance.sitio_id.sitio_name}")
            if instance.wh_date:
                date_str = instance.wh_date.strftime('%Y-%m-%d') if not isinstance(instance.wh_date, str) else instance.wh_date
                description_parts.append(f"Date: {date_str}")
            if instance.wh_start_time and instance.wh_end_time:
                start_str = instance.wh_start_time.strftime('%I:%M %p') if not isinstance(instance.wh_start_time, str) else instance.wh_start_time
                end_str = instance.wh_end_time.strftime('%I:%M %p') if not isinstance(instance.wh_end_time, str) else instance.wh_end_time
                description_parts.append(f"Time: {start_str} - {end_str}")
            description_parts.append("Status: Deleted")
            description = ". ".join(description_parts)
            
            create_activity_log(
                act_type="Waste Hotspot Deleted",
                act_description=description,
                staff=staff,
                record_id=str(instance.wh_num)
            )
            logger.info(f"Activity logged: Waste hotspot {instance.wh_num} deleted")
        
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT) 


# ============================ ILLEGAL DUMPING ================================

class WasteReportFileView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]    
    serializer_class = WasteReportFileSerializer
    queryset = WasteReport_File.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        rep_num = self.request.query_params.get('rep_num')
        if rep_num:
            queryset = queryset.filter(rep_num=rep_num)
        return queryset
    
    def create(self, request, *args, **kwargs):
        # Get iet_num from either query params or request data
        rep_id = request.query_params.get('rep_id') or request.data.get('rep_id')
        
        if not rep_id:
            return Response(
                {"error": "rep_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Call your serializer's upload method
        files = request.data.get('files', [])
        self.get_serializer()._upload_files(files, rep_id=rep_id)
        
        return Response({"status": "Files uploaded successfully"}, status=status.HTTP_201_CREATED)   


class WasteReportDeleteFileView(generics.RetrieveDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = WasteReport_File.objects.all()
    serializer_class = WasteReportFileSerializer
    lookup_field = 'wrf_id' 
    

class WasteReportResolveFileView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]    
    serializer_class = WasteReportResolveFileSerializer
    queryset = WasteReportResolve_File.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        rep_num = self.request.query_params.get('rep_num')
        if rep_num:
            queryset = queryset.filter(rep_num=rep_num)
        return queryset
    
    def create(self, request, *args, **kwargs):
        # Get iet_num from either query params or request data
        rep_id = request.query_params.get('rep_id') or request.data.get('rep_id')
        
        if not rep_id:
            return Response(
                {"error": "rep_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Call your serializer's upload method
        files = request.data.get('files', [])
        self.get_serializer()._upload_files(files, rep_id=rep_id)
        
        return Response({"status": "Files uploaded successfully"}, status=status.HTTP_201_CREATED)    


class WasteReportView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]    
    serializer_class = WasteReportSerializer
    pagination_class = StandardResultsPagination  # Add pagination
    
    def get_queryset(self):
        queryset = WasteReport.objects.select_related(
            'sitio_id',
            'rp_id__per',
            'staff_id'
        ).prefetch_related(
            'waste_report_file',
            'waste_report_rslv_file'
        ).all()                                                                                                     
        
        # Get filter parameters from request
        search_query = self.request.query_params.get('search', '')
        report_matter = self.request.query_params.get('report_matter', '')
        status = self.request.query_params.get('status', '')
        rp_id = self.request.query_params.get('rp_id')
        rep_id = self.request.query_params.get('rep_id')                                                                                                                                                                                                                                                                                                                                                                                                                                                                
        
        # Apply status filter
        if status:
            queryset = queryset.filter(rep_status=status)
        
        # Apply search filter
        if search_query:
            queryset = queryset.filter(
                Q(rep_id__icontains=search_query) |
                Q(rep_matter__icontains=search_query) |
                Q(rep_location__icontains=search_query) |
                Q(rep_violator__icontains=search_query) |
                Q(rep_contact__icontains=search_query) |
                Q(rep_add_details__icontains=search_query) |
                Q(sitio_id__sitio_name__icontains=search_query) |
                Q(rp_id__per__per_lname__icontains=search_query) |
                Q(rp_id__per__per_fname__icontains=search_query)
            )
        
        # Apply report matter filter
        if report_matter and report_matter != "0":
            queryset = queryset.filter(rep_matter=report_matter)
        
        # Apply resident profile filter if provided
        if rp_id:
            queryset = queryset.filter(rp_id=rp_id)

        # Apply report ID filter if provided (for fetching specific report)
        if rep_id:
            queryset = queryset.filter(rep_id=rep_id)            
        
        return queryset.order_by('-rep_id')  
    

class UpdateWasteReportView(ActivityLogMixin, generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]
    serializer_class = WasteReportSerializer
    queryset = WasteReport.objects.all()
    lookup_field = 'rep_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteWasteReportView(generics.DestroyAPIView):
    permission_classes = [AllowAny]
    serializer_class = WasteReportSerializer    
    queryset = WasteReport.objects.all()

    def get_object(self):
        rep_id = self.kwargs.get('rep_id')
        return get_object_or_404(WasteReport, rep_id=rep_id)
    
    def destroy(self, request, *args, **kwargs):
        from apps.act_log.utils import create_activity_log, resolve_staff_from_request
        
        instance = self.get_object()
        
        # Log before delete
        staff, staff_identifier = resolve_staff_from_request(request)
        if staff and hasattr(staff, 'staff_id') and staff.staff_id:
            description_parts = []
            if instance.rep_id:
                description_parts.append(f"Report ID: {instance.rep_id}")
            if instance.rep_matter:
                description_parts.append(f"Matter: {instance.rep_matter}")
            if instance.rep_location:
                description_parts.append(f"Location: {instance.rep_location}")
            if instance.rep_date:
                date_str = instance.rep_date.strftime('%Y-%m-%d %I:%M %p') if not isinstance(instance.rep_date, str) else instance.rep_date
                description_parts.append(f"Date: {date_str}")
            description_parts.append("Status: Deleted")
            description = ". ".join(description_parts)
            
            create_activity_log(
                act_type="Illegal Dumping Report Deleted",
                act_description=description,
                staff=staff,
                record_id=str(instance.rep_id)
            )
            logger.info(f"Activity logged: Illegal dumping report {instance.rep_id} deleted")
        
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT) 


class WastePersonnelView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = WastePersonnelSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        queryset = WastePersonnel.objects.all()
        queryset = queryset.select_related(
            'staff__pos',
            'staff__rp__per',
            'staff__manager__rp__per'
        )
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(staff__rp__per__per_lname__icontains=search) |
                Q(staff__rp__per__per_fname__icontains=search) |
                Q(staff__pos__pos_title__icontains=search) |
                Q(staff__rp__per__per_contact__icontains=search)
            )
        
        position = self.request.query_params.get('position', None)
        if position:
            queryset = queryset.filter(staff__pos__pos_title=position)
            
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            data = [{
                'wstp_id': p.wstp_id,
                'staff': {
                    'staff_id': p.staff.staff_id,
                    'assign_date': p.staff.staff_assign_date.isoformat(),
                    'profile': {  # Changed from 'rp' to 'profile'
                        'rp_id': p.staff.rp.rp_id,
                        'rp_date_registered': p.staff.rp.rp_date_registered.isoformat(),
                        'personal': {  # Changed from 'per' to 'personal'
                            'per_id': p.staff.rp.per.per_id,
                            'lname': p.staff.rp.per.per_lname,  # Remove 'per_' prefix
                            'fname': p.staff.rp.per.per_fname,
                            'mname': p.staff.rp.per.per_mname,
                            'suffix': p.staff.rp.per.per_suffix,
                            'dob': p.staff.rp.per.per_dob.isoformat(),
                            'sex': p.staff.rp.per.per_sex,
                            'status': p.staff.rp.per.per_status,
                            'education': p.staff.rp.per.per_edAttainment,
                            'religion': p.staff.rp.per.per_religion,
                            'contact': p.staff.rp.per.per_contact  # Remove 'per_' prefix
                        }
                    },
                    'position': {  # Changed from 'pos' to 'position'
                        'pos_id': p.staff.pos.pos_id,
                        'title': p.staff.pos.pos_title,  # Changed from 'pos_title'
                        'max': p.staff.pos.pos_max
                    },
                    'manager': {
                        'staff_id': p.staff.manager.staff_id,
                        'name': f"{p.staff.manager.rp.per.per_lname}, {p.staff.manager.rp.per.per_fname}"
                    } if p.staff.manager else None
                }
            } for p in page]
            return self.get_paginated_response(data)
        
        # Handle non-paginated response
        data = [{
            'wstp_id': p.wstp_id,
            'staff': {
                'staff_id': p.staff.staff_id,
                'assign_date': p.staff.staff_assign_date.isoformat(),
                'profile': {
                    'rp_id': p.staff.rp.rp_id,
                    'rp_date_registered': p.staff.rp.rp_date_registered.isoformat(),
                    'personal': {
                        'per_id': p.staff.rp.per.per_id,
                        'lname': p.staff.rp.per.per_lname,
                        'fname': p.staff.rp.per.per_fname,
                        'mname': p.staff.rp.per.per_mname,
                        'suffix': p.staff.rp.per.per_suffix,
                        'dob': p.staff.rp.per.per_dob.isoformat(),
                        'sex': p.staff.rp.per.per_sex,
                        'status': p.staff.rp.per.per_status,
                        'education': p.staff.rp.per.per_edAttainment,
                        'religion': p.staff.rp.per.per_religion,
                        'contact': p.staff.rp.per.per_contact
                    }
                },
                'position': {
                    'pos_id': p.staff.pos.pos_id,
                    'title': p.staff.pos.pos_title,
                    'max': p.staff.pos.pos_max
                },
                'manager': {
                    'staff_id': p.staff.manager.staff_id,
                    'name': f"{p.staff.manager.rp.per.per_lname}, {p.staff.manager.rp.per.per_fname}"
                } if p.staff.manager else None
            }
        } for p in queryset]
        return Response(data)

class WasteTruckView(APIView):
    serializer_class = WasteTruckSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsPagination

    def get(self, request):
        is_archive = request.query_params.get('is_archive', None)
        search = request.query_params.get('search', None)
        
        # Base queryset
        if is_archive is not None:
            is_archive = is_archive.lower() == 'true'
            trucks = WasteTruck.objects.filter(truck_is_archive=is_archive)
        else:
            trucks = WasteTruck.objects.all()
        
        # Apply search filter
        if search:
            trucks = trucks.filter(
                Q(truck_plate_num__icontains=search) |
                Q(truck_model__icontains=search) |
                Q(truck_status__icontains=search)
            )
        
        # Apply pagination
        paginator = StandardResultsPagination()
        paginator.page_size = request.query_params.get('page_size', 10)
        result_page = paginator.paginate_queryset(trucks, request)
        
        serializer = WasteTruckSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        from apps.act_log.utils import create_activity_log, resolve_staff_from_request
        
        serializer = WasteTruckSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            
            # Log create
            staff, staff_identifier = resolve_staff_from_request(request)
            if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                description_parts = []
                if instance.truck_plate_num:
                    description_parts.append(f"Plate Number: {instance.truck_plate_num}")
                if instance.truck_model:
                    description_parts.append(f"Model: {instance.truck_model}")
                if instance.truck_status:
                    description_parts.append(f"Status: {instance.truck_status}")
                description = ". ".join(description_parts)
                
                create_activity_log(
                    act_type="Waste Truck Created",
                    act_description=description,
                    staff=staff,
                    record_id=str(instance.truck_id)
                )
                logger.info(f"Activity logged: Waste truck {instance.truck_id} created")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class WasteAllTruckView(APIView):
    serializer_class = WasteTruckSerializer
    permission_classes = [AllowAny]

    def get(self, request):
        is_archive = request.query_params.get('is_archive', None)
        if is_archive is not None:
            is_archive = is_archive.lower() == 'true'
            trucks = WasteTruck.objects.filter(truck_is_archive=is_archive)
        else:
            trucks = WasteTruck.objects.all()  # Fetch all trucks
        serializer = WasteTruckSerializer(trucks, many=True)
        return Response(serializer.data)
    

class WasteTruckDetailView(ActivityLogMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WasteTruckSerializer
    queryset = WasteTruck.objects.all()
    lookup_field = 'truck_id'
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return WasteTruck.objects.get(pk=pk)
        except WasteTruck.DoesNotExist:
            return None
    
    def get(self, request, pk):
        truck = self.get_object(pk)
        if not truck:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = WasteTruckSerializer(truck)
        return Response(serializer.data)
    
    def put(self, request, pk):
        truck = self.get_object(pk)
        if not truck:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = WasteTruckSerializer(truck, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # def delete(self, request, pk):
    #     truck = self.get_object(pk)
    #     if not truck:
    #         return Response(status=status.HTTP_404_NOT_FOUND)
    #     truck.delete()
    #     return Response(status=status.HTTP_204_NO_CONTENT)

    def destroy(self, request, pk):
        from apps.act_log.utils import create_activity_log, resolve_staff_from_request
        
        instance = self.get_object(pk)
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        staff, staff_identifier = resolve_staff_from_request(request)
        
        if permanent:
            # Log before permanent delete
            if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                description_parts = []
                if instance.truck_plate_num:
                    description_parts.append(f"Plate Number: {instance.truck_plate_num}")
                if instance.truck_model:
                    description_parts.append(f"Model: {instance.truck_model}")
                description_parts.append("Status: Deleted")
                description = ". ".join(description_parts)
                
                create_activity_log(
                    act_type="Waste Truck Deleted",
                    act_description=description,
                    staff=staff,
                    record_id=str(instance.truck_id)
                )
                logger.info(f"Activity logged: Waste truck {instance.truck_id} deleted")
            
            # Permanent delete
            instance.delete()
        else:
            # Soft delete (archive)
            instance.truck_is_archive = True
            instance.save()
            
            # Log archive
            if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                description_parts = []
                if instance.truck_plate_num:
                    description_parts.append(f"Plate Number: {instance.truck_plate_num}")
                if instance.truck_model:
                    description_parts.append(f"Model: {instance.truck_model}")
                description_parts.append("Status: Archived")
                description = ". ".join(description_parts)
                
                create_activity_log(
                    act_type="Waste Truck Archived",
                    act_description=description,
                    staff=staff,
                    record_id=str(instance.truck_id)
                )
                logger.info(f"Activity logged: Waste truck {instance.truck_id} archived")
            
        return Response(status=status.HTTP_204_NO_CONTENT)

class WasteTruckRestoreView(ActivityLogMixin, generics.UpdateAPIView):
    queryset = WasteTruck.objects.filter(truck_is_archive=True)
    serializer_class = WasteTruckSerializer
    lookup_field = 'truck_id'
    permission_classes = [AllowAny]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.truck_is_archive = False
        instance.save()
        return Response(status=status.HTTP_200_OK)

# get Driver for garbage Collection Form
class DriverPersonnelAPIView(APIView):
    permission_classes = [AllowAny]  

    def get(self, request, *args, **kwargs): 
        allowed_positions = ["WASTE DRIVER", "TRUCK DRIVER", "DRIVER", "DRIVER LOADER"]  
        
        drivers = WastePersonnel.objects.filter(
            staff_id__pos__pos_title__in=allowed_positions
        ).select_related(  # Optimize query
            'staff__pos',
            'staff__rp__per'
        )
        
        data = [driver.to_dict() for driver in drivers]
        return Response(data)
     
#get Collectors for garbage collection Form
class CollectorPersonnelAPIView(APIView):
    permission_classes = [AllowAny]  

    def get(self, request, *args, **kwargs): 
        allowed_positions = ["WASTE COLLECTOR", "COLLECTOR","LOADER"]  
        
        collectors = WastePersonnel.objects.filter( 
            staff_id__pos__pos_title__in=allowed_positions
        ).select_related(  # Optimize query
            'staff__pos',
            'staff__rp__per'
        )
        
        data = [collector.to_dict() for collector in collectors]
        return Response(data)
    
#get Sitio 
class SitioListView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = Sitio.objects.all()
    serializer_class = SitioSerializer


class WatchmanView(generics.GenericAPIView): 
    permission_classes = [AllowAny]      

    def get(self, request, *args, **kwargs):
        watchmen = WastePersonnel.objects.filter(
            staff_id__pos__pos_title="Watchman"  
        ).select_related(
            'staff__pos',
            'staff__rp__per'
        )

        data = [watchman.to_dict() for watchman in watchmen]
        return Response(data)
    
# ============== GARBAGE PICKUP ================

class GarbagePickupRequestAnalyticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        counts = {
            'pending': Garbage_Pickup_Request.objects.filter(garb_req_status__iexact='pending').count(),
            'accepted': Garbage_Pickup_Request.objects.filter(garb_req_status__iexact='accepted').count(),
            'rejected': Garbage_Pickup_Request.objects.filter(garb_req_status__iexact='rejected').count(),
            'completed': Garbage_Pickup_Request.objects.filter(garb_req_status__iexact='completed').count(),
            'total': Garbage_Pickup_Request.objects.count()
        }
        
        return Response(counts, status=status.HTTP_200_OK)
    

class GarbagePickupFileView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = GarbagePickupFileSerializer
    queryset = GarbagePickupRequestFile.objects.all()
     
class GarbagePickupRequestPendingView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = GarbagePickupRequestPendingSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = (
            Garbage_Pickup_Request.objects.filter(garb_req_status='pending')
            .select_related('rp__per', 'sitio_id', 'gprf')
            .only(
                'garb_id',
                'garb_location',
                'garb_waste_type',
                'garb_pref_date',
                'garb_pref_time',
                'garb_req_status',
                'garb_additional_notes',
                'garb_created_at',
                'rp__per__per_lname',
                'rp__per__per_fname',
                'rp__per__per_mname',
                'sitio_id__sitio_name',
                'gprf__gprf_url',
            )
        )

        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(garb_id__icontains=search_query)
                | Q(garb_location__icontains=search_query)
                | Q(garb_waste_type__icontains=search_query)
                | Q(garb_additional_notes__icontains=search_query)
                | Q(garb_pref_date__icontains=search_query)
                | Q(garb_pref_time__icontains=search_query)
                | Q(rp__per__per_lname__icontains=search_query)
                | Q(rp__per__per_fname__icontains=search_query)
                | Q(rp__per__per_mname__icontains=search_query)
                | Q(sitio_id__sitio_name__icontains=search_query)
            ).distinct()

        sitio_param = self.request.query_params.get('sitio', '').strip()
        if sitio_param:
            queryset = queryset.filter(sitio_id__sitio_name__iexact=sitio_param)

        return queryset.order_by('-garb_created_at')



class GarbagePickupRequestRejectedView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = GarbagePickupRequestRejectedSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = (
            Garbage_Pickup_Request.objects.filter(garb_req_status='rejected')
            .select_related(
                'rp__per',
                'sitio_id',
                'gprf'
            )
            .prefetch_related(
                'pickup_decisions__staff_id__rp__per'
            )
            .only(
                'garb_id',
                'garb_location',
                'garb_waste_type',
                'garb_pref_date',
                'garb_pref_time',
                'garb_req_status',
                'garb_additional_notes',
                'garb_created_at',
                'rp__per__per_lname',
                'rp__per__per_fname',
                'rp__per__per_mname',
                'sitio_id__sitio_name',
                'gprf__gprf_url'
            )
        )

        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(garb_id__icontains=search_query)
                | Q(garb_location__icontains=search_query)
                | Q(garb_waste_type__icontains=search_query)
                | Q(garb_additional_notes__icontains=search_query)
                | Q(garb_pref_date__icontains=search_query)
                | Q(garb_pref_time__icontains=search_query)
                | Q(rp__per__per_lname__icontains=search_query)
                | Q(rp__per__per_fname__icontains=search_query)
                | Q(rp__per__per_mname__icontains=search_query)
                | Q(sitio_id__sitio_name__icontains=search_query)
                | Q(pickup_decisions__dec_reason__icontains=search_query)
                | Q(pickup_decisions__staff_id__rp__per__per_lname__icontains=search_query)
                | Q(pickup_decisions__staff_id__rp__per__per_fname__icontains=search_query)
                | Q(pickup_decisions__staff_id__rp__per__per_mname__icontains=search_query)
            ).distinct()

        sitio_param = self.request.query_params.get('sitio', '').strip()
        if sitio_param:
            queryset = queryset.filter(sitio_id__sitio_name__iexact=sitio_param)

        return queryset.order_by('-garb_created_at')


class GarbagePickupRequestAcceptedView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = GarbagePickupRequestAcceptedSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        queryset = (
            Garbage_Pickup_Request.objects.filter(
                garb_req_status='accepted'
            )
            .select_related(
                'rp', 'rp__per', 'gprf', 'sitio_id'
            )
            .prefetch_related(
                'pickup_decisions',
                'pickup_decisions__staff_id',
                'pickup_decisions__staff_id__rp',
                'pickup_decisions__staff_id__rp__per',
                'pickup_assignments',
                'pickup_assignments__truck_id',
                'pickup_assignments__wstp_id',
                'pickup_assignments__collectors',
                'pickup_assignments__collectors__wstp_id',
                'pickup_assignments__collectors__wstp_id__staff_id__rp__per',  
            )
        )

        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(garb_id__icontains=search_query) |
                Q(garb_location__icontains=search_query) |
                Q(garb_waste_type__icontains=search_query) |
                Q(garb_additional_notes__icontains=search_query) |
                Q(garb_pref_date__icontains=search_query) |
                Q(garb_pref_time__icontains=search_query) |
                Q(rp__per__per_lname__icontains=search_query) |
                Q(rp__per__per_fname__icontains=search_query) |
                Q(rp__per__per_mname__icontains=search_query) |
                Q(sitio_id__sitio_name__icontains=search_query) |
                Q(pickup_decisions__staff_id__rp__per__per_lname__icontains=search_query) |
                Q(pickup_decisions__staff_id__rp__per__per_fname__icontains=search_query) |
                Q(pickup_decisions__staff_id__rp__per__per_mname__icontains=search_query) |
                Q(pickup_assignments__truck_id__truck_plate_num__icontains=search_query) |  
                Q(pickup_assignments__wstp_id__staff_id__rp__per__per_lname__icontains=search_query) |
                Q(pickup_assignments__wstp_id__staff_id__rp__per__per_fname__icontains=search_query) |
                Q(pickup_assignments__wstp_id__staff_id__rp__per__per_mname__icontains=search_query) |
                Q(pickup_assignments__collectors__wstp_id__staff_id__rp__per__per_lname__icontains=search_query) |
                Q(pickup_assignments__collectors__wstp_id__staff_id__rp__per__per_fname__icontains=search_query) |
                Q(pickup_assignments__collectors__wstp_id__staff_id__rp__per__per_mname__icontains=search_query)
            ).distinct()


        sitio_param = self.request.query_params.get('sitio', '').strip()
        if sitio_param:
            queryset = queryset.filter(sitio_id__sitio_name__iexact=sitio_param)

        return queryset.order_by('-garb_created_at')
    
class GarbagePickupAcceptedRequestDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = GarbagePickupRequestAcceptedSerializer
    queryset = Garbage_Pickup_Request.objects.all()
    lookup_field = 'garb_id'  

    def get_object(self):
        obj = super().get_object()
        return obj


class GarbagePickupRequestsByDriverView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = GarbagePickupRequestAcceptedSerializer

    def get_queryset(self):
        driver_id = self.request.query_params.get('wstp_id')

        if not driver_id:
            return Garbage_Pickup_Request.objects.none()

        assigned_garb_ids = Pickup_Assignment.objects.filter(
            wstp_id=driver_id
        ).values_list('garb_id', flat=True)

        return Garbage_Pickup_Request.objects.filter(
            garb_id__in=assigned_garb_ids,
            garb_req_status__iexact='accepted'  # Filter only accepted requests
        )

class GarbagePickupRequestCompletedView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = GarbagePickupRequestCompletedSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = (
            Garbage_Pickup_Request.objects.filter(garb_req_status='completed')
            .select_related(
                'rp__per',
                'sitio_id',
                'gprf'
            )
            .prefetch_related(
                'pickup_decisions__staff_id__rp__per',
                'pickup_assignments__truck_id',
                'pickup_assignments__wstp_id__staff_id__rp__per',
                'pickup_assignments__collectors',
                'pickup_assignments__collectors__wstp_id__staff_id__rp__per',
                'pickup_confirmation',
            )
        )

        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(garb_id__icontains=search_query) |
                Q(garb_location__icontains=search_query) |
                Q(garb_waste_type__icontains=search_query) |
                Q(garb_additional_notes__icontains=search_query) |
                Q(garb_pref_date__icontains=search_query) |
                Q(garb_pref_time__icontains=search_query) |
                Q(rp__per__per_lname__icontains=search_query) |
                Q(rp__per__per_fname__icontains=search_query) |
                Q(rp__per__per_mname__icontains=search_query) |
                Q(sitio_id__sitio_name__icontains=search_query) |
                Q(pickup_decisions__staff_id__rp__per__per_lname__icontains=search_query) |
                Q(pickup_decisions__staff_id__rp__per__per_fname__icontains=search_query) |
                Q(pickup_decisions__staff_id__rp__per__per_mname__icontains=search_query) |
                Q(pickup_assignments__truck_id__truck_plate_num__icontains=search_query) |
                Q(pickup_assignments__wstp_id__staff_id__rp__per__per_lname__icontains=search_query) |
                Q(pickup_assignments__wstp_id__staff_id__rp__per__per_fname__icontains=search_query) |
                Q(pickup_assignments__wstp_id__staff_id__rp__per__per_mname__icontains=search_query) |
                Q(pickup_assignments__collectors__wstp_id__staff_id__rp__per__per_lname__icontains=search_query) |
                Q(pickup_assignments__collectors__wstp_id__staff_id__rp__per__per_fname__icontains=search_query) |
                Q(pickup_assignments__collectors__wstp_id__staff_id__rp__per__per_mname__icontains=search_query)
            ).distinct()

        sitio_param = self.request.query_params.get('sitio', '').strip()
        if sitio_param:
            queryset = queryset.filter(sitio_id__sitio_name__iexact=sitio_param)

        return queryset.order_by('-garb_created_at')

class GarbagePickupCompletedRequestDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = GarbagePickupRequestCompletedSerializer
    queryset = Garbage_Pickup_Request.objects.all()
    lookup_field = 'garb_id'  # or 'id' depending on your model

    def get_object(self):
        obj = super().get_object()
        return obj
    
class GarbagePickupCompletedByDriverView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = GarbagePickupRequestCompletedSerializer

    def get_queryset(self):
        driver_id = self.request.query_params.get('wstp_id')

        if not driver_id:
            return Garbage_Pickup_Request.objects.none()

        return Garbage_Pickup_Request.objects.filter(
            pickup_assignment__wstp_id=driver_id,
            pickup_confirmation__conf_staff_conf=True
        ).prefetch_related(
            'pickup_request_decision_set' 
        ).distinct()

class UpdateGarbagePickupRequestStatusView(ActivityLogMixin, generics.UpdateAPIView):
    permission_classes = [AllowAny]
    serializer_class = GarbagePickupRequestPendingSerializer
    queryset = Garbage_Pickup_Request.objects.all()
    lookup_field = 'garb_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UpdatePickupAssignmentView(ActivityLogMixin, generics.UpdateAPIView):
    permission_classes = [AllowAny]
    serializer_class = PickupAssignmentSerializer
    queryset = Pickup_Assignment.objects.all()
    lookup_field = 'pick_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PickupRequestDecisionView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = PickupRequestDecisionSerializer
    queryset = Pickup_Request_Decision.objects.all()

class PickupAssignmentView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = PickupAssignmentSerializer
    queryset = Pickup_Assignment.objects.all()
    
    def create(self, request, *args, **kwargs):
        from apps.act_log.utils import create_activity_log, resolve_staff_from_request
        from .models import Assignment_Collector
        
        response = super().create(request, *args, **kwargs)
        
        if response.status_code in [200, 201]:
            instance_data = response.data
            pick_id = instance_data.get('pick_id')
            
            if pick_id:
                try:
                    instance = Pickup_Assignment.objects.select_related(
                        'garb_id', 'garb_id__rp', 'garb_id__rp__per',
                        'garb_id__sitio_id',
                        'truck_id',
                        'wstp_id', 'wstp_id__staff', 'wstp_id__staff__rp', 'wstp_id__staff__rp__per'
                    ).prefetch_related(
                        'collectors', 'collectors__wstp_id', 'collectors__wstp_id__staff',
                        'collectors__wstp_id__staff__rp', 'collectors__wstp_id__staff__rp__per'
                    ).get(pick_id=pick_id)
                    
                    staff, staff_identifier = resolve_staff_from_request(request)
                    
                    if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                        description_parts = []
                        
                        # Garbage pickup request info
                        if instance.garb_id:
                            description_parts.append(f"Request ID: {instance.garb_id.garb_id}")
                            if instance.garb_id.garb_location:
                                description_parts.append(f"Location: {instance.garb_id.garb_location}")
                            if instance.garb_id.garb_waste_type:
                                description_parts.append(f"Waste Type: {instance.garb_id.garb_waste_type}")
                            if instance.garb_id.rp and instance.garb_id.rp.per:
                                requester_name = f"{instance.garb_id.rp.per.per_fname} {instance.garb_id.rp.per.per_lname}".strip()
                                description_parts.append(f"Requester: {requester_name}")
                            if instance.garb_id.sitio_id:
                                description_parts.append(f"Sitio: {instance.garb_id.sitio_id.sitio_name}")
                        
                        # Truck info
                        if instance.truck_id:
                            description_parts.append(f"Truck: {instance.truck_id.truck_plate_num}")
                        
                        # Driver info
                        if instance.wstp_id and instance.wstp_id.staff:
                            driver_name = instance.wstp_id.get_staff_name()
                            if driver_name:
                                description_parts.append(f"Driver: {driver_name}")
                        
                        # Date and time
                        if instance.pick_date:
                            date_str = instance.pick_date.strftime('%Y-%m-%d') if not isinstance(instance.pick_date, str) else instance.pick_date
                            description_parts.append(f"Scheduled Date: {date_str}")
                        if instance.pick_time:
                            time_str = instance.pick_time.strftime('%I:%M %p') if not isinstance(instance.pick_time, str) else instance.pick_time
                            description_parts.append(f"Scheduled Time: {time_str}")
                        
                        # Collectors
                        collectors = Assignment_Collector.objects.filter(pick_id=instance).select_related(
                            'wstp_id__staff__rp__per'
                        )
                        if collectors.exists():
                            collector_names = []
                            for collector in collectors:
                                if collector.wstp_id:
                                    name = collector.wstp_id.get_staff_name()
                                    if name:
                                        collector_names.append(name)
                            if collector_names:
                                description_parts.append(f"Collectors: {', '.join(collector_names)}")
                        
                        description = ". ".join(description_parts)
                        
                        create_activity_log(
                            act_type="Pickup_Assignment Created",
                            act_description=description,
                            staff=staff,
                            record_id=str(instance.pick_id)
                        )
                        logger.info(f"Activity logged: Pickup assignment {instance.pick_id} created")
                except Pickup_Assignment.DoesNotExist:
                    logger.debug(f"Pickup assignment {pick_id} not found for logging")
                except Exception as e:
                    logger.debug(f"Error logging pickup assignment creation: {str(e)}")
        
        return response

class AssignmentCollectorView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = AssignmentCollectorSerializer
    queryset = Assignment_Collector.objects.all()

class PickupConfirmationView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = PickupConfirmationSerializer
    queryset = Pickup_Confirmation.objects.all()

    
class UpdatePickupConfirmationView(ActivityLogMixin, generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]
    serializer_class = PickupConfirmationSerializer
    queryset = Pickup_Confirmation.objects.all()
    lookup_field = 'garb_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AssignmentCollectorDeleteView(generics.DestroyAPIView):
    permission_classes = [AllowAny]
    serializer_class = AssignmentCollectorSerializer
    queryset = Assignment_Collector.objects.all()
    lookup_field = 'acl_id'  # Or the primary key field name for Assignment_Collector

    def get_object(self):
        acl_id = self.kwargs.get('acl_id')
        return get_object_or_404(Assignment_Collector, acl_id=acl_id)
    
class GarbagePickupRequestPendingByRPView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = GarbagePickupRequestPendingSerializer
    
    def get_queryset(self):
        rp_id = self.kwargs.get('rp_id')
        print(f"Filtering for rp_id: {rp_id}")  
        queryset = Garbage_Pickup_Request.objects.filter(
            rp_id=rp_id, 
            garb_req_status='pending'  
        ).order_by('-garb_created_at')  # Most recent first
        print(f"Found {queryset.count()} records") 
        return queryset


class GarbagePickupRequestRejectedByRPView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = GarbagePickupRequestRejectedSerializer
    
    def get_queryset(self):
        rp_id = self.kwargs.get('rp_id')

        latest_decision = Pickup_Request_Decision.objects.filter(
            garb_id=OuterRef('pk')
        ).order_by('-dec_date')

        return (
            Garbage_Pickup_Request.objects
            .filter(rp_id=rp_id, garb_req_status='rejected')
            .annotate(latest_dec_date=Subquery(latest_decision.values('dec_date')[:1]))
            .order_by('-latest_dec_date')  # newest on top
        )
    
class GarbagePickupRequestAcceptedByRPView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResidentAcceptedPickupRequestsSerializer
        
    def get_queryset(self):
        rp_id = self.kwargs.get('rp_id')
        latest_decision = Pickup_Request_Decision.objects.filter(
            garb_id=OuterRef('pk')
        ).order_by('-dec_date').values('dec_date')[:1]
        
        accepted_requests = Garbage_Pickup_Request.objects.filter(
            rp_id=rp_id, 
            garb_req_status='accepted'
        ).annotate(
            latest_dec_date=Subquery(latest_decision)
        )
        
        completed_requests = Garbage_Pickup_Request.objects.filter(
            rp_id=rp_id,
            garb_req_status='completed'
        ).filter(
            pickup_confirmation__conf_resident_conf=False
        ).annotate(
            latest_dec_date=Subquery(latest_decision)
        )
        
        queryset = (accepted_requests | completed_requests).order_by(
            '-latest_dec_date',  
            '-garb_created_at'   
        )
        
        return queryset
    

class GarbagePickupRequestAcceptedDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResidentAcceptedPickupRequestsSerializer  
    queryset = Garbage_Pickup_Request.objects.all()
    lookup_field = 'garb_id'

    def get_object(self):
        garb_id = self.kwargs.get('garb_id')
        return generics.get_object_or_404(self.get_queryset(), garb_id=garb_id)
    

class GarbagePickupRequestCompletedByRPView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResidentCompletedPickupRequestSerializer
    
    def get_queryset(self):
        rp_id = self.kwargs.get('rp_id')
        
        resident_conf_date = Pickup_Confirmation.objects.filter(
            garb_id=OuterRef('pk'),
            conf_resident_conf=True
        ).values('conf_resident_conf_date')[:1]
        
        return Garbage_Pickup_Request.objects.filter(
            rp_id=rp_id, 
            garb_req_status='completed'
        ).filter(
            Q(pickup_confirmation__conf_resident_conf=True) &
            Q(pickup_confirmation__conf_staff_conf=True)
        ).annotate(
            resident_confirmation_date=Subquery(resident_conf_date)
        ).order_by(
            '-resident_confirmation_date' 
        ).distinct()

class GarbagePickupRequestCancelledByRPView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = GarbagePickupRequestRejectedSerializer

    def get_queryset(self):
        rp_id = self.kwargs.get('rp_id')

        latest_decision = Pickup_Request_Decision.objects.filter(
            garb_id=OuterRef('pk')
        ).order_by('-dec_date')

        return (
            Garbage_Pickup_Request.objects
            .filter(rp_id=rp_id, garb_req_status='cancelled')
            .annotate(latest_dec_date=Subquery(latest_decision.values('dec_date')[:1]))
            .order_by('-latest_dec_date')  # newest on top
        )

