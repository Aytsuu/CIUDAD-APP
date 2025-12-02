from rest_framework import generics, status
from rest_framework.response import Response
from django.db.models import Count, Q
from django.db import transaction
from apps.administration.models import Staff
from apps.patientrecords.models import BodyMeasurement, Patient
from apps.administration.serializers.staff_serializers import StaffFullSerializer
from apps.reports.models import BHWDailyNotes, BHWReferOrFollowUp, BHWAttendanceRecord
from apps.reports.serializers import BHWDailyNotesSerializer, BHWAttendanceRecordSerializer
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
        ).distinct()
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(staff_id__icontains=search) |
                Q(rp__per__per_fname__icontains=search) |
                Q(rp__per__per_lname__icontains=search) |
                Q(rp__per__per_mname__icontains=search) |
                Q(staff_type__icontains=search)
            )
            logger.info(f"Filtering staff with search term: {search}")
        
        # Optional staff_id filter (for BHW role filtering)
        staff_id = self.request.query_params.get('staff_id', None)
        if staff_id:
            queryset = queryset.filter(staff_id=staff_id)
            logger.info(f"Filtering by staff ID: {staff_id}")
        
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
            
            # Extract body measurement data from nested object
            bm_data = request.data.get('body_measurement', {})
            
            # Prepare payload
            payload = {
                'staff': staff_id,
                'description': request.data.get('description', ''),
                'body_measurement': bm_data,
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


class CreateBHWAttendanceSummaryView(generics.CreateAPIView):
    """
    Create a new BHW Attendance Summary for a staff member.
    This is separate from the daily notes and can be submitted at the end of the reporting period.
    """
    serializer_class = BHWAttendanceRecordSerializer
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Creating BHW Attendance Summary with data: {request.data}")
            
            staff_id = request.data.get('staffId')
            num_working_days = request.data.get('numOfWorkingDays', 0)
            days_present = request.data.get('daysPresent', 0)
            days_absent = request.data.get('daysAbsent', 0)
            noted_by_name = request.data.get('notedBy', '')
            approved_by_name = request.data.get('approvedBy', '')
            
            # Verify staff exists
            try:
                staff = Staff.objects.get(pk=staff_id)
            except Staff.DoesNotExist:
                return Response({
                    'error': 'Staff not found',
                    'detail': f'Staff with ID {staff_id} does not exist'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Find noted_by staff
            noted_by_staff = None
            if noted_by_name:
                name_parts = noted_by_name.strip().split()
                if len(name_parts) >= 2:
                    noted_by_staff = Staff.objects.filter(
                        Q(rp__per__per_fname__icontains=name_parts[0]) &
                        Q(rp__per__per_lname__icontains=name_parts[-1])
                    ).first()
                    
                if not noted_by_staff:
                    logger.warning(f"Could not find staff for 'Noted By': {noted_by_name}")
            
            # Find approved_by staff
            approved_by_staff = None
            if approved_by_name:
                name_parts = approved_by_name.strip().split()
                if len(name_parts) >= 2:
                    approved_by_staff = Staff.objects.filter(
                        Q(rp__per__per_fname__icontains=name_parts[0]) &
                        Q(rp__per__per_lname__icontains=name_parts[-1])
                    ).first()
                    
                if not approved_by_staff:
                    logger.warning(f"Could not find staff for 'Approved By': {approved_by_name}")
            
            # Validate required fields
            if not noted_by_staff:
                return Response({
                    'error': 'Invalid noted by name',
                    'detail': f'Could not find staff member for "Noted By": {noted_by_name}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not approved_by_staff:
                return Response({
                    'error': 'Invalid approved by name',
                    'detail': f'Could not find staff member for "Approved By": {approved_by_name}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create attendance record directly (no longer needs a daily note)
            attendance_record = BHWAttendanceRecord.objects.create(
                staff=staff,
                num_working_days=num_working_days or 0,
                days_present=days_present or 0,
                days_absent=days_absent or 0,
                noted_by=noted_by_staff,
                approved_by=approved_by_staff
            )
            
            logger.info(f"BHW Attendance Summary created successfully: {attendance_record.bhwa_id}")
            
            return Response({
                'message': 'Attendance summary created successfully',
                'bhwa_id': attendance_record.bhwa_id,
                'data': {
                    'staff_id': staff.staff_id,
                    'num_working_days': attendance_record.num_working_days,
                    'days_present': attendance_record.days_present,
                    'days_absent': attendance_record.days_absent,
                    'noted_by': noted_by_staff.staff_id,
                    'approved_by': approved_by_staff.staff_id,
                    'created_at': attendance_record.created_at.isoformat()
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating BHW Attendance Summary: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({
                'error': 'Failed to create Attendance Summary',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class CheckBHWAttendanceSummaryView(generics.GenericAPIView):
    """
    Check if a BHW staff member has already submitted an attendance summary for a given month.
    """
    
    def get(self, request, *args, **kwargs):
        try:
            staff_id = request.query_params.get('staff_id')
            month = request.query_params.get('month')  # Format: YYYY-MM
            
            if not staff_id or not month:
                return Response({
                    'error': 'Missing parameters',
                    'detail': 'Both staff_id and month are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Parse month to get year and month
            try:
                year, month_num = month.split('-')
                year = int(year)
                month_num = int(month_num)
            except ValueError:
                return Response({
                    'error': 'Invalid month format',
                    'detail': 'Month should be in YYYY-MM format'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if attendance record exists for this staff in this month
            attendance_exists = BHWAttendanceRecord.objects.filter(
                staff_id=staff_id,
                created_at__year=year,
                created_at__month=month_num
            ).exists()
            
            return Response({
                'exists': attendance_exists,
                'staff_id': staff_id,
                'month': month
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error checking BHW Attendance Summary: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({
                'error': 'Failed to check Attendance Summary',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class PatientsWithOptionalBodyMeasurementsView(generics.GenericAPIView):
    """
    Return patients that have body measurements flagged as optional (is_opt = True).
    Useful for understanding relationships between patients and measurements.
    Supports pagination via StandardResultsPagination.
    """
    pagination_class = StandardResultsPagination

    def get(self, request, *args, **kwargs):
        try:
            # Base queryset: body measurements with is_opt True
            queryset = BodyMeasurement.objects.filter(is_opt=True).select_related(
                'pat', 'staff',
            ).order_by('-created_at')

            # Optional basic search by patient id
            search = request.query_params.get('search')
            if search:
                queryset = queryset.filter(pat__pat_id__icontains=search)

            total_count = queryset.count()

            page = self.paginate_queryset(queryset)
            items = page if page is not None else queryset

            results = []
            for bm in items:
                pat = getattr(bm, 'pat', None)
                staff = getattr(bm, 'staff', None)

                # Try to enrich resident name if available
                patient_name = None
                try:
                    # For resident patients with linked personal info
                    rp = getattr(pat, 'rp_id', None)
                    per = getattr(rp, 'per', None)
                    if per and getattr(per, 'per_fname', None) and getattr(per, 'per_lname', None):
                        patient_name = f"{per.per_lname}, {per.per_fname}"
                except Exception:
                    patient_name = None

                results.append({
                    'pat_id': getattr(pat, 'pat_id', None),
                    'pat_type': getattr(pat, 'pat_type', None),
                    'patient_name': patient_name,
                    'measurement': {
                        'is_opt': bool(getattr(bm, 'is_opt', False)),
                        'weight': str(getattr(bm, 'weight', '')),
                        'height': str(getattr(bm, 'height', '')),
                        'wfa': getattr(bm, 'wfa', None),
                        'lhfa': getattr(bm, 'lhfa', None),
                        'wfl': getattr(bm, 'wfl', None),
                        'muac': getattr(bm, 'muac', None),
                        'muac_status': getattr(bm, 'muac_status', None),
                        'edemaSeverity': getattr(bm, 'edemaSeverity', None),
                        'created_at': bm.created_at.isoformat() if getattr(bm, 'created_at', None) else None,
                    },
                    'staff_id': getattr(staff, 'staff_id', None),
                })

            if page is not None:
                response = self.get_paginated_response(results)
                response.data['total_records'] = total_count
                return response

            return Response({
                'message': 'Patients with optional body measurements retrieved successfully',
                'total_records': total_count,
                'results': results,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error retrieving patients with optional body measurements: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({
                'error': 'Failed to retrieve data',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class BHWDailyNoteDetailView(generics.RetrieveAPIView):
    """
    Retrieve a single BHW Daily Note by bhwdn_id with all related data:
    - Body measurements
    - Illness referrals/follow-ups  
    - Staff information
    - Patient information
    """
    serializer_class = BHWDailyNotesSerializer
    lookup_field = 'bhwdn_id'
    
    def get_queryset(self):
        return BHWDailyNotes.objects.select_related(
            'staff',
            'staff__rp',
            'staff__rp__per',
            'staff__pos',
            'bm',
            'bm__pat',
            'bm__pat__rp_id',
            'bm__pat__rp_id__per',
            'bm__pat__trans_id'  # Add transient relationship
        ).prefetch_related(
            'bhwreferorfollowup_set',
            'bhwreferorfollowup_set__ill'
        )
    
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            data = serializer.data
            
            # Enrich with staff info
            staff = instance.staff
            staff_name = None
            if staff:
                if hasattr(staff, 'rp') and staff.rp and hasattr(staff.rp, 'per') and staff.rp.per:
                    per = staff.rp.per
                    staff_name = f"{per.per_lname}, {per.per_fname}"
                
                data['staff_info'] = {
                    'staff_id': staff.staff_id,
                    'name': staff_name,
                    'position': staff.pos.pos_title if hasattr(staff, 'pos') and staff.pos else None
                }
            
            # Enrich with patient info
            if instance.bm and instance.bm.pat:
                pat = instance.bm.pat
                patient_name = None
                patient_dob = None
                patient_gender = None
                
                # Handle Resident patients
                if pat.pat_type == 'Resident' and hasattr(pat, 'rp_id') and pat.rp_id:
                    if hasattr(pat.rp_id, 'per') and pat.rp_id.per:
                        per = pat.rp_id.per
                        patient_name = f"{per.per_lname}, {per.per_fname}"
                        patient_dob = per.per_dob if hasattr(per, 'per_dob') else None
                        patient_gender = per.per_sex if hasattr(per, 'per_sex') else None
                
                # Handle Transient patients
                elif pat.pat_type == 'Transient' and hasattr(pat, 'trans_id') and pat.trans_id:
                    trans = pat.trans_id
                    patient_name = f"{trans.tran_lname}, {trans.tran_fname}"
                    patient_dob = trans.tran_dob if hasattr(trans, 'tran_dob') else None
                    patient_gender = trans.tran_sex if hasattr(trans, 'tran_sex') else None
                
                # Calculate age if DOB is available
                age_string = None
                if patient_dob:
                    from datetime import date
                    today = date.today()
                    years = today.year - patient_dob.year
                    months = today.month - patient_dob.month
                    if months < 0:
                        years -= 1
                        months += 12
                    
                    if years > 0:
                        age_string = f"{years} year{'s' if years != 1 else ''}"
                        if months > 0:
                            age_string += f" {months} month{'s' if months != 1 else ''}"
                    else:
                        age_string = f"{months} month{'s' if months != 1 else ''}"
                
                data['patient_info'] = {
                    'pat_id': pat.pat_id,
                    'pat_type': pat.pat_type,
                    'name': patient_name,
                    'age': age_string,
                    'gender': patient_gender.capitalize() if patient_gender else None
                }
            
            # Note: BHWAttendanceRecord is linked to staff, not to daily notes
            # So we don't include attendance info in the daily note detail view
            
            return Response({
                'message': 'BHW Daily Note retrieved successfully',
                'data': data
            }, status=status.HTTP_200_OK)
            
        except BHWDailyNotes.DoesNotExist:
            return Response({
                'error': 'BHW Daily Note not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error retrieving BHW Daily Note: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return Response({
                'error': 'Failed to retrieve BHW Daily Note',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
