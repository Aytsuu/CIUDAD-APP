from rest_framework import generics, status
from rest_framework.response import Response
from django.db.models import Count, Q
from django.db import transaction
from apps.administration.models import Staff
from apps.administration.serializers.staff_serializers import StaffFullSerializer
from apps.reports.models import BHWDailyNotes, BHWReferOrFollowUp, BHWAttendanceRecord
from apps.reports.serializers import BHWDailyNotesSerializer
from apps.pagination import StandardResultsPagination
import logging

logger = logging.getLogger(__name__)


class StaffWithBHWDailyNotesView(generics.ListAPIView):
    """
    Fetch all staff members who have BHWDailyNotes records.
    Returns staff details along with their daily notes count.
    Supports pagination and search.
    """
    serializer_class = StaffFullSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        # Get staff who have at least one BHWDailyNotes record
        queryset = Staff.objects.filter(
            daily_notes__isnull=False
        ).select_related(
            'rp',
            'rp__per',
            'pos'
        ).annotate(
            daily_notes_count=Count('daily_notes')
        )
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(staff_id__icontains=search) |
                Q(rp__per__fname__icontains=search) |
                Q(rp__per__lname__icontains=search) |
                Q(rp__per__mname__icontains=search) |
                Q(staff_type__icontains=search)
            )
            logger.info(f"Filtering staff with search term: {search}")
        
        # Optional staff_type filter
        staff_type = self.request.query_params.get('staff_type', None)
        if staff_type:
            queryset = queryset.filter(staff_type=staff_type)
            logger.info(f"Filtering by staff type: {staff_type}")
        
        # Order by most daily notes first
        return queryset.order_by('-daily_notes_count')
    
    def list(self, request, *args, **kwargs):
        """Custom list method with pagination and metadata"""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            
            # Get total count before pagination
            total_count = queryset.count()
            
            # Paginate the queryset
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                
                # Add daily_notes_count to each staff record
                data = serializer.data
                for i, staff in enumerate(page):
                    data[i]['daily_notes_count'] = staff.daily_notes_count
                    # Add latest daily note created_at if exists
                    latest_note = getattr(staff, 'daily_notes', None).order_by('-created_at').first() if hasattr(staff, 'daily_notes') else None
                    data[i]['latest_daily_note_date'] = latest_note.created_at.isoformat() if latest_note else None
                    # Add full list of daily notes (id + created_at)
                    notes_qs = staff.daily_notes.all().order_by('-created_at')
                    data[i]['daily_notes'] = [
                        {
                            'bhwdn_id': n.bhwdn_id,
                            'created_at': n.created_at.isoformat(),
                        } for n in notes_qs
                    ]
                
                response = self.get_paginated_response(data)
                
                # Add custom metadata
                response.data['total_records'] = total_count
                
                logger.info(f"Retrieved {len(page)} staff (page of {total_count} total)")
                return response
            
            # If pagination is disabled
            serializer = self.get_serializer(queryset, many=True)
            
            # Add daily_notes_count to each staff record
            data = serializer.data
            for i, staff in enumerate(queryset):
                data[i]['daily_notes_count'] = staff.daily_notes_count
            
            logger.info(f"Retrieved {total_count} staff (no pagination)")
            
            return Response({
                'message': 'Staff with BHW daily notes retrieved successfully',
                'total_records': total_count,
                'results': data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving staff with BHW daily notes: {str(e)}")
            return Response({
                'error': 'Failed to retrieve staff records',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreateBHWDailyNoteView(generics.CreateAPIView):
    """
    Create a new BHW Daily Note with:
    - Body measurements (child anthropometric data)
    - Illness referrals/follow-ups
    - Attendance record (optional)
    """
    serializer_class = BHWDailyNotesSerializer
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Creating BHW Daily Note with data: {request.data}")
            
            staff_id = request.data.get('staffId')
            logger.info(f"Staff ID received: {staff_id} (type: {type(staff_id)})")
            
            # Verify staff exists
            staff_exists = Staff.objects.filter(pk=staff_id).exists()
            logger.info(f"Staff exists: {staff_exists}")
            
            # Prepare payload
            payload = {
                'staff': staff_id,
                'description': request.data.get('description', ''),
                'body_measurement': {
                    'pat_id': request.data.get('pat_id'),
                    'weight': request.data.get('weight'),
                    'height': request.data.get('height'),
                    'nutritionalStatus': request.data.get('nutritionalStatus')
                },
                'illnesses': request.data.get('illnesses', []),
            }
            
            # Add attendance data if provided
            attendance_fields = ['numOfWorkingDays', 'daysPresent', 'daysAbsent', 'notedBy', 'approvedBy']
            if any(request.data.get(field) for field in attendance_fields):
                # Get staff IDs from names
                noted_by_name = request.data.get('notedBy')
                approved_by_name = request.data.get('approvedBy')
                
                noted_by_staff = None
                approved_by_staff = None
                
                if noted_by_name:
                    # Try to find staff by full name
                    name_parts = noted_by_name.split()
                    if len(name_parts) >= 2:
                        noted_by_staff = Staff.objects.filter(
                            Q(rp__per__fname__icontains=name_parts[0]) &
                            Q(rp__per__lname__icontains=name_parts[-1])
                        ).first()
                
                if approved_by_name:
                    name_parts = approved_by_name.split()
                    if len(name_parts) >= 2:
                        approved_by_staff = Staff.objects.filter(
                            Q(rp__per__fname__icontains=name_parts[0]) &
                            Q(rp__per__lname__icontains=name_parts[-1])
                        ).first()
                
                payload['attendance'] = {
                    'numOfWorkingDays': request.data.get('numOfWorkingDays', 0),
                    'daysPresent': request.data.get('daysPresent', 0),
                    'daysAbsent': request.data.get('daysAbsent', 0),
                    'notedBy': noted_by_staff.staff_id if noted_by_staff else None,
                    'approvedBy': approved_by_staff.staff_id if approved_by_staff else None
                }
            
            # Create serializer instance
            serializer = self.get_serializer(data=payload)
            serializer.is_valid(raise_exception=True)
            
            # Save the daily note
            daily_note = serializer.save()
            
            logger.info(f"BHW Daily Note created successfully: {daily_note.bhwdn_id}")
            
            return Response({
                'message': 'BHW Daily Note created successfully',
                'bhwdn_id': daily_note.bhwdn_id,
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating BHW Daily Note: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({
                'error': 'Failed to create BHW Daily Note',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
 