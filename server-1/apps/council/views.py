# council/views.py (unchanged)
from rest_framework import generics
from .serializers import *
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.act_log.utils import ActivityLogMixin
import logging
from apps.treasurer.models import Purpose_And_Rates
# from apps.gad.models import ProjectProposalLog
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from rest_framework import generics, status
from rest_framework.response import Response
from apps.pagination import StandardResultsPagination
from django.db.models import Q
from django.db.models.functions import ExtractYear


logger = logging.getLogger(__name__)

class UpdateTemplateByPrIdView(generics.UpdateAPIView):
    def update(self, request, *args, **kwargs):
        old_id = request.data.get("old_pr_id")
        new_id = request.data.get("new_pr_id")
        
        try:
            new_purpose_rate = get_object_or_404(Purpose_And_Rates, pk=new_id)
            templates = Template.objects.filter(pr_id=old_id)
            
            updated_count = templates.update(pr_id=new_purpose_rate)  # More efficient bulk update
            
            return Response({
                "status": "updated",
                "count": updated_count,
                "message": f"Updated {updated_count} template(s)"
            })
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CouncilSchedulingView(ActivityLogMixin, generics.ListCreateAPIView):
    serializer_class = CouncilSchedulingSerializer
    queryset = CouncilScheduling.objects.all()
    permission_classes = [AllowAny]
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = CouncilScheduling.objects.all().order_by('-ce_date')
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(ce_title__icontains=search) |
                Q(ce_description__icontains=search) |
                Q(ce_date__icontains=search)
            )
        
        # Year filter
        year = self.request.query_params.get('year', None)
        if year and year != 'all':
            queryset = queryset.filter(ce_date__year=year)
        
        # Archive filter
        is_archive = self.request.query_params.get('is_archive', None)
        if is_archive is not None:
            queryset = queryset.filter(ce_is_archive=is_archive.lower() == 'true')
        
        return queryset

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in CouncilSchedulingView list: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        """Override to add logging for announcement creation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            self.perform_create(serializer)
            logger.info(
                f"Council event created: {serializer.data.get('ce_title')} - "
                f"Announcement sent to all barangay staff"
            )
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, 
                status=status.HTTP_201_CREATED, 
                headers=headers
            )
        except Exception as e:
            logger.error(f"Error creating council event and announcement: {e}")
            return Response(
                {"error": "Failed to create council event and announcement"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CouncilSchedulingDetailView(ActivityLogMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CouncilSchedulingSerializer
    queryset = CouncilScheduling.objects.all()
    lookup_field = 'ce_id'
    permission_classes = [AllowAny]

    def get_object(self):
        queryset = self.get_queryset()
        lookup_value = self.kwargs[self.lookup_field]
        try:
            obj = queryset.get(pk=lookup_value)
        except CouncilScheduling.DoesNotExist:
            raise status.HTTP_404_NOT_FOUND 
        return obj

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(status=status.HTTP_404_NOT_FOUND)
            
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        if permanent:
            # Permanent delete
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            # Soft delete (archive)
            instance.ce_is_archive = True
            instance.save()
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)

class CouncilSchedulingRestoreView(generics.UpdateAPIView):
    queryset = CouncilScheduling.objects.filter(ce_is_archive=True)
    serializer_class = CouncilSchedulingSerializer
    lookup_field = 'ce_id'
    permission_classes = [AllowAny]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.ce_is_archive = False
        instance.save()
        return Response(status=status.HTTP_200_OK)
    
class CouncilEventYearsView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        try:
            years = CouncilScheduling.objects.filter(
                ce_date__isnull=False
            ).annotate(
                year=ExtractYear('ce_date')
            ).values_list('year', flat=True).distinct().order_by('-year')
            
            return Response(list(years))
        except Exception as e:
            logger.error(f"Error fetching council event years: {str(e)}")
            return Response([], status=status.HTTP_200_OK)

# class AttendeesView(generics.ListCreateAPIView):
#     serializer_class = CouncilAttendeesSerializer
#     queryset = CouncilAttendees.objects.all()
#     permission_classes = [AllowAny]

# class AttendeesDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = CouncilAttendeesSerializer
#     queryset = CouncilAttendees.objects.all()
#     lookup_field = 'atn_id'
#     permission_classes = [AllowAny]

# class AttendeesBulkView(generics.GenericAPIView):
#     serializer_class = CouncilAttendeesSerializer
#     queryset = CouncilAttendees.objects.all()
#     permission_classes = [AllowAny]

#     def post(self, request, *args, **kwargs):
#         ce_id = request.data.get('ce_id')
#         logger.debug(f"Received data: {request.data}")
#         if not ce_id:
#             return Response({"detail": "ce_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
#         # Fetch the CouncilScheduling instance
#         council_scheduling = get_object_or_404(CouncilScheduling, pk=ce_id)
        
#         # Delete existing attendees for this ce_id
#         CouncilAttendees.objects.filter(ce_id=council_scheduling).delete()
        
#         # Create new attendees
#         attendees_data = request.data.get('attendees', [])
#         if not attendees_data:
#             return Response({"detail": "attendees array is required and cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)
        
#         serializer = self.get_serializer(data=attendees_data, many=True)
#         if serializer.is_valid():
#             serializer.save(ce_id=council_scheduling)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         logger.error(f"Serializer errors: {serializer.errors}")
#         return Response({"detail": "Invalid data", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)   

class AttendanceSheetListView(ActivityLogMixin, generics.ListCreateAPIView):
    serializer_class = CouncilAttendanceSerializer
    queryset = CouncilAttendance.objects.all()
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        ce_id = self.request.query_params.get('ce_id')
        archive_status = self.request.query_params.get('archive')
        
        if ce_id:
            queryset = queryset.filter(ce_id=ce_id)
            
        if archive_status == 'true':
            queryset = queryset.filter(att_is_archive=True)
        elif archive_status == 'false':
            queryset = queryset.filter(att_is_archive=False)
            
        return queryset

    def create(self, request, *args, **kwargs):
        ce_id = kwargs.get('ce_id') or request.data.get('ce_id')
        files = request.data.get('files', [])
        
        if not ce_id:
            return Response({"error": "ce_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not files:
            return Response({"error": "No files provided"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer()
        serializer._upload_file(files, ce_id=ce_id)
        
        return Response({"message": "Files uploaded successfully"}, status=status.HTTP_201_CREATED)

class AttendanceSheetDetailView(ActivityLogMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CouncilAttendanceSerializer
    queryset = CouncilAttendance.objects.all()
    lookup_field = 'att_id'
    permission_classes = [AllowAny]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        if permanent:
            # Add file deletion logic if needed
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            instance.att_is_archive = True
            instance.save()
            return Response({"message": "Attendance sheet archived"}, 
                          status=status.HTTP_200_OK)

class RestoreAttendanceView(generics.UpdateAPIView):
    queryset = CouncilAttendance.objects.filter(att_is_archive=True)
    serializer_class = CouncilAttendanceSerializer
    lookup_field = 'att_id'
    permission_classes = [AllowAny]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.att_is_archive = False
        instance.save()
        return Response({"message": "Attendance sheet restored"},
                      status=status.HTTP_200_OK)

# class StaffAttendanceRankingView(generics.ListAPIView):
#     serializer_class = StaffAttendanceRankingSerializer
#     permission_classes = [AllowAny]

#     def get_queryset(self):
#         # Aggregate present attendees by atn_name for non-archived events
#         current_year = datetime.now().year
#         return (
#             CouncilAttendees.objects
#             .filter(
#                 atn_present_or_absent='Present',
#                 ce_id__ce_is_archive=False,
#                 ce_id__ce_date__year=current_year,
#             )
#             .values('atn_name', 'atn_designation')
#             .annotate(attendance_count=Count('atn_id'))
#             .order_by('-attendance_count')
#         )

#     def list(self, request, *args, **kwargs):
#         queryset = self.get_queryset()
#         serializer = self.get_serializer(queryset, many=True)
#         return Response(serializer.data)

Staff = apps.get_model('administration', 'Staff')
class StaffListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Staff.objects.select_related('pos', 'rp__per').only(
        'staff_id',
        'rp__per__per_fname',
        'rp__per__per_lname',
        'pos__pos_title'
    )
    serializer_class = StaffSerializer

#TEMPLATE
class TemplateView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = TemplateSerializer
    queryset = Template.objects.all()

    def perform_create(self, serializer):
        instance = serializer.save()
        try:
            from apps.act_log.utils import create_activity_log, resolve_staff_from_request
            
            staff, staff_identifier = resolve_staff_from_request(self.request)
            
            if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                create_activity_log(
                    act_type="Template Create",
                    act_description=f"Template record created. Filename: '{instance.temp_filename}'. Purpose: {instance.pr_id.pr_purpose if instance.pr_id else 'N/A'}",
                    staff=staff,
                    record_id=str(instance.temp_id)
                )
                logger.info(f"Activity logged for template creation: {instance.temp_id}")
            else:
                logger.debug(f"Skipping activity log for Template create: No valid staff")
        except Exception as e:
            logger.error(f"Failed to log activity for template creation: {str(e)}")
        return instance


class TemplateFileView(generics.ListCreateAPIView):
    serializer_class = TemplateFileSerializer
    queryset = TemplateFile.objects.all()

    # def get_queryset(self):
    #     queryset = super().get_queryset()
    #     temp_id = self.request.query_params.get('temp_id')
    #     if temp_id:
    #         queryset = queryset.filter(temp_id=temp_id)
    #     return queryset    

    def get_queryset(self):
        queryset = super().get_queryset()
        temp_id = self.request.query_params.get('temp_id')
        logo_type = self.request.query_params.get('logoType')  # Add this
        
        if temp_id:
            queryset = queryset.filter(temp_id=temp_id)
        if logo_type:  # Add this filter
            queryset = queryset.filter(tf_logoType=logo_type)
            
        return queryset    

    def create(self, request, *args, **kwargs):
        # Get iet_num from either query params or request data
        temp_id = request.query_params.get('temp_id') or request.data.get('temp_id')
        
        if not temp_id:
            return Response(
                {"error": "temp_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Call your serializer's upload method
        files = request.data.get('files', [])
        self.get_serializer()._upload_files(files, temp_id=temp_id)
        
        return Response({"status": "Files uploaded successfully"}, status=status.HTTP_201_CREATED)    


class TemplateFileDetailView(generics.RetrieveDestroyAPIView):
    queryset = TemplateFile.objects.all()
    serializer_class = TemplateFileSerializer
    lookup_field = 'tf_id' 


class SummonTemplateView(APIView):
    def get(self, request):
        filename = request.query_params.get('filename')
        if not filename:
            raise NotFound("Missing 'filename' parameter")

        try:
            template = Template.objects.get(temp_filename=filename, temp_is_archive=False)
        except Template.DoesNotExist:
            raise NotFound("Template not found")

        serializer = TemplateSerializer(template)
        return Response(serializer.data)

#UPDATE TEMPLATE
class UpdateTemplateView(ActivityLogMixin, generics.RetrieveUpdateAPIView):
    serializer_class = TemplateSerializer
    queryset = Template.objects.all()
    lookup_field = 'temp_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Capture old values
        old_values = {
            'temp_filename': instance.temp_filename,
            'pr_id': instance.pr_id.pr_id if instance.pr_id else None
        }
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            updated_instance = serializer.save()
            
            # Log activity with field changes
            try:
                from apps.act_log.utils import create_activity_log, resolve_staff_from_request
                
                staff, staff_identifier = resolve_staff_from_request(request)
                
                if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                    changes = []
                    
                    if 'temp_filename' in serializer.validated_data and old_values['temp_filename'] != updated_instance.temp_filename:
                        changes.append(f"temp_filename: '{old_values['temp_filename']}' → '{updated_instance.temp_filename}'")
                    
                    if 'pr_id' in serializer.validated_data:
                        new_pr_id = serializer.validated_data.get('pr_id')
                        if new_pr_id and hasattr(new_pr_id, 'pr_id'):
                            new_pr_id = new_pr_id.pr_id
                        if old_values['pr_id'] != new_pr_id:
                            changes.append(f"pr_id: '{old_values['pr_id']}' → '{new_pr_id}'")
                    
                    if changes:
                        description = f"Template changes: {'; '.join(changes)}"
                    else:
                        description = f"Template {updated_instance.temp_id} updated (no field-level changes recorded)"
                    
                    create_activity_log(
                        act_type="Template Updated",
                        act_description=description,
                        staff=staff,
                        record_id=str(updated_instance.temp_id)
                    )
                    logger.info(f"Activity logged for template update: {updated_instance.temp_id}")
            except Exception as log_error:
                logger.error(f"Failed to log activity for template update: {str(log_error)}")
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#DELETE TEMPLATE
class DeleteTemplateView(generics.DestroyAPIView):
    serializer_class = TemplateSerializer    
    queryset = Template.objects.all()

    def get_object(self):
        temp_id = self.kwargs.get('temp_id')
        return get_object_or_404(Template, temp_id=temp_id) 



class DeleteTemplateByPrIdView(generics.DestroyAPIView):
    serializer_class = TemplateSerializer
    queryset = Template.objects.all()

    def delete(self, request, *args, **kwargs):
        pr_id = kwargs.get('pr_id')
        deleted_count, _ = Template.objects.filter(pr_id=pr_id).delete()
        
        if deleted_count == 0:
            return Response(
                {"detail": "No templates found with this pr_id."},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


 # =================================  RESOLUTION =================================

# class ResolutionView(generics.ListCreateAPIView):
#     serializer_class = ResolutionSerializer
#     queryset = Resolution.objects.all()

class ResolutionView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResolutionSerializer
    pagination_class = StandardResultsPagination  # Add pagination
    
    def get_queryset(self):
        queryset = Resolution.objects.all().prefetch_related('resolution_files', 'resolution_supp')
        
        # Get filter parameters from request
        search_query = self.request.query_params.get('search', '')
        area_filter = self.request.query_params.get('area', '')
        year_filter = self.request.query_params.get('year', '')
        is_archive = self.request.query_params.get('is_archive', None)
        
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
                queryset = queryset.filter(res_is_archive=is_archive_bool)
        
        # Apply search filter
        if search_query:
            queryset = queryset.filter(
                Q(res_num__icontains=search_query) |
                Q(res_title__icontains=search_query) |
                Q(res_area_of_focus__icontains=search_query) |
                Q(staff__rp__per__per_lname__icontains=search_query) |
                Q(staff__rp__per__per_fname__icontains=search_query) |
                Q(staff__rp__per__per_mname__icontains=search_query)
            )
        
        # Apply area of focus filter
        if area_filter and area_filter != "all":
            queryset = queryset.filter(res_area_of_focus__contains=[area_filter])
        
        # Apply year filter
        if year_filter and year_filter != "all":
            queryset = queryset.filter(res_date_approved__year=year_filter)
        
        return queryset.order_by('-res_num')  # Add ordering
    
    def create(self, request, *args, **kwargs):
        # Check if we need to generate a resolution number
        res_num = request.data.get('res_num', '').strip()
        
        if not res_num:
            # Generate automatic resolution number using the model method
            request.data['res_num'] = Resolution.generate_resolution_number()
        
        # Continue with the normal creation process
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
    
        try:
            from apps.act_log.utils import create_activity_log, log_model_change, resolve_staff_from_request
            from apps.administration.models import Staff
            
            # Resolve staff using the utility function
            staff, staff_identifier = resolve_staff_from_request(request)
            
            # Only log if we have a valid staff with staff_id
            if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                # Build detailed description for resolution creation
                description_parts = []
                
                # Resolution number
                if instance.res_num:
                    description_parts.append(f"Resolution #{instance.res_num}")
                
                # Resolution title
                if instance.res_title:
                    description_parts.append(f"Title: {instance.res_title}")
                
                # Date approved
                if instance.res_date_approved:
                    date_str = instance.res_date_approved.strftime('%Y-%m-%d') if not isinstance(instance.res_date_approved, str) else instance.res_date_approved
                    description_parts.append(f"Date Approved: {date_str}")
                
                # Area of focus
                if instance.res_area_of_focus and len(instance.res_area_of_focus) > 0:
                    areas = ", ".join([area.upper() for area in instance.res_area_of_focus])
                    description_parts.append(f"Area of Focus: {areas}")
                
                # Related project proposal and dev plan
                if instance.gpr_id:
                    try:
                        from apps.gad.models import DevelopmentPlan
                        project_proposal = instance.gpr_id
                        dev_plan = project_proposal.dev
                        project_title = dev_plan.dev_project or 'N/A'
                        description_parts.append(f"Linked to GAD Development Plan: {project_title}")
                    except Exception:
                        pass
                
                description = ". ".join(description_parts) if description_parts else "Resolution record created"
                
                create_activity_log(
                    act_type="Resolution Create",
                    act_description=description,
                    staff=staff,
                    record_id=str(instance.res_num)
                )
                
                # Always log GAD Development Plan Updated when a resolution is created with a project proposal
                if instance.gpr_id:
                    try:
                        from apps.gad.models import DevelopmentPlan
                        project_proposal = instance.gpr_id
                        dev_plan = project_proposal.dev
                        
                        # Build description with dev plan details - highlight the dev plan
                        project_title = dev_plan.dev_project or 'N/A'
                        description_parts = [f"GAD Development Plan ({project_title})"]
                        
                        if dev_plan.dev_date:
                            date_str = dev_plan.dev_date.strftime('%Y-%m-%d') if not isinstance(dev_plan.dev_date, str) else dev_plan.dev_date
                            description_parts.append(f"Date: {date_str}")
                        if dev_plan.dev_client:
                            description_parts.append(f"Client: {dev_plan.dev_client}")
                        
                        # Check if dev plan already had a proposal (it should since we're linking to one)
                        description_parts.append("now has both project proposal and resolution")
                        
                        description = ". ".join(description_parts)
                        
                        create_activity_log(
                            act_type="GAD Development Plan Updated",
                            act_description=description,
                            staff=staff,
                            record_id=str(dev_plan.dev_id)
                        )
                        logger.info(f"Activity logged: Dev plan {dev_plan.dev_id} updated with resolution")
                    except Exception as check_error:
                        logger.debug(f"Error logging dev plan update for resolution: {str(check_error)}")
                        # Don't fail if this check fails
            else:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(
                    f"No valid staff with staff_id resolved for activity logging "
                    f"(input id: {staff_identifier or 'not provided'})"
                )
        except Exception as log_error:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to log activity for resolution creation: {str(log_error)}")
            # Don't fail the request if logging fails
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class DeleteResolutionView(generics.DestroyAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResolutionSerializer    
    queryset = Resolution.objects.all()

    def get_object(self):
        res_num = self.kwargs.get('res_num')
        return get_object_or_404(Resolution, res_num=res_num)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Store resolution details before deletion (for GAD Development Plan logging)
        gpr_id = instance.gpr_id
        
        # Log the activity if staff exists with staff_id (before deletion)
        try:
            from apps.act_log.utils import create_activity_log, resolve_staff_from_request
            from apps.administration.models import Staff
            import logging
            logger = logging.getLogger(__name__)
            
            # Try to get staff_id from request body first, then fall back to resolve_staff_from_request
            staff = None
            staff_id_from_request = request.data.get('staff_id')
            
            if staff_id_from_request:
                try:
                    staff = Staff.objects.get(staff_id=staff_id_from_request)
                    logger.info(f"Found staff from request for deletion: {staff.staff_id}")
                except Staff.DoesNotExist:
                    logger.warning(f"Staff with staff_id {staff_id_from_request} not found, falling back to resolve_staff_from_request")
            
            # Fall back to resolve_staff_from_request if staff_id not in request or not found
            if not staff:
                staff, staff_identifier = resolve_staff_from_request(request)
                logger.info(f"Staff from resolve_staff_from_request for deletion: staff={staff}, staff_identifier={staff_identifier}")
            
            # Only log if we have a valid staff with staff_id
            if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                # Build detailed description for resolution deletion
                description_parts = []
                
                # Resolution number
                if instance.res_num:
                    description_parts.append(f"Resolution #{instance.res_num}")
                
                # Resolution title
                if instance.res_title:
                    description_parts.append(f"Title: {instance.res_title}")
                
                # Date approved
                if instance.res_date_approved:
                    date_str = instance.res_date_approved.strftime('%Y-%m-%d') if not isinstance(instance.res_date_approved, str) else instance.res_date_approved
                    description_parts.append(f"Date Approved: {date_str}")
                
                # Area of focus
                if instance.res_area_of_focus and len(instance.res_area_of_focus) > 0:
                    areas = ", ".join([area.upper() for area in instance.res_area_of_focus])
                    description_parts.append(f"Area of Focus: {areas}")
                
                description_parts.append("Status: Deleted")
                
                description = ". ".join(description_parts) if description_parts else "Resolution deleted"
                
                create_activity_log(
                    act_type="Resolution Delete",
                    act_description=description,
                    staff=staff,
                    record_id=str(instance.res_num)
                )
                logger.info(f"Activity logged: Resolution {instance.res_num} deleted")
                
                # Log GAD Development Plan Updated if resolution is linked to a project proposal
                if gpr_id:
                    try:
                        from apps.gad.models import DevelopmentPlan
                        project_proposal = gpr_id
                        dev_plan = project_proposal.dev
                        
                        if dev_plan:
                            # Build description with dev plan details - highlight the dev plan
                            project_title = dev_plan.dev_project or 'N/A'
                            description_parts = [f"GAD Development Plan ({project_title})"]
                            
                            if dev_plan.dev_date:
                                date_str = dev_plan.dev_date.strftime('%Y-%m-%d') if not isinstance(dev_plan.dev_date, str) else dev_plan.dev_date
                                description_parts.append(f"Date: {date_str}")
                            if dev_plan.dev_client:
                                description_parts.append(f"Client: {dev_plan.dev_client}")
                            
                            description_parts.append("resolution deleted")
                            
                            description = ". ".join(description_parts)
                            
                            create_activity_log(
                                act_type="GAD Development Plan Updated",
                                act_description=description,
                                staff=staff,
                                record_id=str(dev_plan.dev_id)
                            )
                            logger.info(f"Activity logged: Dev plan {dev_plan.dev_id} updated - resolution deleted")
                    except Exception as dev_plan_error:
                        logger.warning(f"Error logging dev plan update for resolution deletion: {str(dev_plan_error)}")
                        # Don't fail if this check fails
            else:
                logger.warning(f"No valid staff found for logging resolution deletion. Staff: {staff}")
        except Exception as log_error:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to log activity for resolution deletion: {str(log_error)}", exc_info=True)
            # Don't fail the request if logging fails
        
        # Proceed with deletion
        return super().destroy(request, *args, **kwargs) 


class UpdateResolutionView(ActivityLogMixin, generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]    
    serializer_class = ResolutionSerializer
    queryset = Resolution.objects.all()
    lookup_field = 'res_num'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_gpr_id = instance.gpr_id  # Store old gpr_id before update
        old_res_is_archive = instance.res_is_archive  # Store old archive status before update
        
        # Store old values for comparison
        old_values = {
            'res_title': instance.res_title,
            'res_date_approved': instance.res_date_approved,
            'res_area_of_focus': instance.res_area_of_focus,
            'gpr_id': instance.gpr_id,
            'res_is_archive': instance.res_is_archive
        }
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            updated_instance = serializer.save()
            
            # Refresh from database to ensure we have the latest relationships
            updated_instance.refresh_from_db()
            
            # Build detailed description for resolution update
            try:
                from apps.act_log.utils import create_activity_log, resolve_staff_from_request
                
                staff, staff_identifier = resolve_staff_from_request(request)
                
                # Only log if we have a valid staff with staff_id
                if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                    description_parts = []
                    
                    # Resolution number (always include)
                    if updated_instance.res_num:
                        description_parts.append(f"Resolution #{updated_instance.res_num}")
                    
                    # Track what changed
                    changes = []
                    
                    # Title changed
                    if 'res_title' in serializer.validated_data and old_values['res_title'] != updated_instance.res_title:
                        changes.append(f"Title: '{old_values['res_title']}' → '{updated_instance.res_title}'")
                    
                    # Date approved changed
                    if 'res_date_approved' in serializer.validated_data and old_values['res_date_approved'] != updated_instance.res_date_approved:
                        old_date = old_values['res_date_approved'].strftime('%Y-%m-%d') if old_values['res_date_approved'] and not isinstance(old_values['res_date_approved'], str) else str(old_values['res_date_approved'])
                        new_date = updated_instance.res_date_approved.strftime('%Y-%m-%d') if updated_instance.res_date_approved and not isinstance(updated_instance.res_date_approved, str) else str(updated_instance.res_date_approved)
                        changes.append(f"Date Approved: '{old_date}' → '{new_date}'")
                    
                    # Area of focus changed
                    if 'res_area_of_focus' in serializer.validated_data and old_values['res_area_of_focus'] != updated_instance.res_area_of_focus:
                        old_areas = ", ".join([area.upper() for area in old_values['res_area_of_focus']]) if old_values['res_area_of_focus'] else 'None'
                        new_areas = ", ".join([area.upper() for area in updated_instance.res_area_of_focus]) if updated_instance.res_area_of_focus else 'None'
                        changes.append(f"Area of Focus: '{old_areas}' → '{new_areas}'")
                    
                    # Archive status changed - include resolution details
                    if old_res_is_archive != updated_instance.res_is_archive:
                        # Include resolution details when archiving/restoring
                        if updated_instance.res_title:
                            changes.append(f"Title: {updated_instance.res_title}")
                        if updated_instance.res_date_approved:
                            date_str = updated_instance.res_date_approved.strftime('%Y-%m-%d') if not isinstance(updated_instance.res_date_approved, str) else updated_instance.res_date_approved
                            changes.append(f"Date Approved: {date_str}")
                        if updated_instance.res_area_of_focus and len(updated_instance.res_area_of_focus) > 0:
                            areas = ", ".join([area.upper() for area in updated_instance.res_area_of_focus])
                            changes.append(f"Area of Focus: {areas}")
                        if updated_instance.res_is_archive:
                            changes.append("Status: Archived")
                        else:
                            changes.append("Status: Restored")
                    
                    # Project proposal link changed
                    if old_gpr_id != updated_instance.gpr_id:
                        if not old_gpr_id and updated_instance.gpr_id:
                            try:
                                from apps.gad.models import DevelopmentPlan
                                project_proposal = updated_instance.gpr_id
                                dev_plan = project_proposal.dev
                                project_title = dev_plan.dev_project or 'N/A'
                                changes.append(f"Linked to GAD Development Plan: {project_title}")
                            except Exception:
                                changes.append("Linked to project proposal")
                        elif old_gpr_id and not updated_instance.gpr_id:
                            changes.append("Unlinked from project proposal")
                        elif old_gpr_id and updated_instance.gpr_id and old_gpr_id != updated_instance.gpr_id:
                            changes.append("Project proposal link changed")
                    
                    if changes:
                        description_parts.extend(changes)
                        description = ". ".join(description_parts)
                    else:
                        description = f"Resolution #{updated_instance.res_num} updated"
                    
                    create_activity_log(
                        act_type="Resolution Update",
                        act_description=description,
                        staff=staff,
                        record_id=str(updated_instance.res_num)
                    )
            except Exception as log_error:
                import logging
                logger = logging.getLogger(__name__)
                logger.debug(f"Error logging resolution update: {str(log_error)}")
                # Don't fail if logging fails
            
            # Check if gpr_id was added (was None, now has value)
            if not old_gpr_id and updated_instance.gpr_id:
                try:
                    from apps.act_log.utils import create_activity_log, resolve_staff_from_request
                    from apps.gad.models import DevelopmentPlan
                    
                    staff, staff_identifier = resolve_staff_from_request(request)
                    
                    # Only log if we have a valid staff with staff_id
                    if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                        project_proposal = updated_instance.gpr_id
                        dev_plan = project_proposal.dev
                        
                        # Build description with dev plan details - highlight the dev plan
                        project_title = dev_plan.dev_project or 'N/A'
                        description_parts = [f"GAD Development Plan ({project_title})"]
                        
                        if dev_plan.dev_date:
                            date_str = dev_plan.dev_date.strftime('%Y-%m-%d') if not isinstance(dev_plan.dev_date, str) else dev_plan.dev_date
                            description_parts.append(f"Date: {date_str}")
                        if dev_plan.dev_client:
                            description_parts.append(f"Client: {dev_plan.dev_client}")
                        
                        description_parts.append("now has both project proposal and resolution")
                        
                        description = ". ".join(description_parts)
                        
                        create_activity_log(
                            act_type="GAD Development Plan Updated",
                            act_description=description,
                            staff=staff,
                            record_id=str(dev_plan.dev_id)
                        )
                        logger.info(f"Activity logged: Dev plan {dev_plan.dev_id} now has both proposal and resolution (via resolution update)")
                except Exception as log_error:
                    logger.debug(f"Error logging dev plan proposal/resolution link: {str(log_error)}")
                    # Don't fail if logging fails
            
            # Log GAD Development Plan Updated when resolution is archived/restored
            # Check if archive status changed and resolution is linked to a project proposal
            archive_status_changed = old_res_is_archive != updated_instance.res_is_archive
            has_project_proposal = updated_instance.gpr_id is not None
            
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Resolution archive/restore check: archive_status_changed={archive_status_changed}, has_project_proposal={has_project_proposal}, old_archive={old_res_is_archive}, new_archive={updated_instance.res_is_archive}, gpr_id={updated_instance.gpr_id}")
            
            if archive_status_changed and has_project_proposal:
                try:
                    from apps.act_log.utils import create_activity_log, resolve_staff_from_request
                    from apps.gad.models import DevelopmentPlan
                    from apps.administration.models import Staff
                    
                    # Try to get staff_id from request body first, then fall back to resolve_staff_from_request
                    staff = None
                    staff_id_from_request = request.data.get('staff_id')
                    logger.info(f"Attempting to get staff: staff_id_from_request={staff_id_from_request}, request.data={request.data}")
                    
                    if staff_id_from_request:
                        try:
                            staff = Staff.objects.get(staff_id=staff_id_from_request)
                            logger.info(f"Found staff from request: {staff.staff_id}")
                        except Staff.DoesNotExist:
                            logger.warning(f"Staff with staff_id {staff_id_from_request} not found, falling back to resolve_staff_from_request")
                    
                    # Fall back to resolve_staff_from_request if staff_id not in request or not found
                    if not staff:
                        staff, staff_identifier = resolve_staff_from_request(request)
                        logger.info(f"Staff from resolve_staff_from_request: staff={staff}, staff_identifier={staff_identifier}")
                    
                    # Only log if we have a valid staff with staff_id
                    if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                        logger.info(f"Staff is valid, proceeding with logging. staff_id={staff.staff_id}")
                        project_proposal = updated_instance.gpr_id
                        if project_proposal:
                            dev_plan = project_proposal.dev
                            if dev_plan:
                                # Build description with dev plan details - highlight the dev plan
                                project_title = dev_plan.dev_project or 'N/A'
                                description_parts = [f"GAD Development Plan ({project_title})"]
                                
                                if dev_plan.dev_date:
                                    date_str = dev_plan.dev_date.strftime('%Y-%m-%d') if not isinstance(dev_plan.dev_date, str) else dev_plan.dev_date
                                    description_parts.append(f"Date: {date_str}")
                                if dev_plan.dev_client:
                                    description_parts.append(f"Client: {dev_plan.dev_client}")
                                
                                # Add archive/restore status
                                if updated_instance.res_is_archive:
                                    description_parts.append("resolution archived")
                                else:
                                    description_parts.append("resolution restored")
                                
                                description = ". ".join(description_parts)
                                
                                create_activity_log(
                                    act_type="GAD Development Plan Updated",
                                    act_description=description,
                                    staff=staff,
                                    record_id=str(dev_plan.dev_id)
                                )
                                logger.info(f"Activity logged: Dev plan {dev_plan.dev_id} updated - resolution {'archived' if updated_instance.res_is_archive else 'restored'}")
                            else:
                                logger.warning(f"Dev plan not found for project proposal {project_proposal.gpr_id}")
                        else:
                            logger.warning(f"Project proposal not found for resolution {updated_instance.res_num}")
                    else:
                        logger.warning(f"No valid staff found for logging resolution archive/restore. Staff: {staff}, hasattr staff_id: {hasattr(staff, 'staff_id') if staff else 'N/A'}, staff_id value: {getattr(staff, 'staff_id', None) if staff else 'N/A'}")
                except Exception as log_error:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Error logging dev plan archive/restore update: {str(log_error)}", exc_info=True)
                    # Don't fail if logging fails
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

 # RESOLUTION FILE
# class ResolutionFileView(generics.ListCreateAPIView):
#     serializer_class = ResolutionFileSerializer
#     queryset = ResolutionFile.objects.all()


class ResolutionFileView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]    
    serializer_class = ResolutionFileSerializer
    queryset = ResolutionFile.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        res_num = self.request.query_params.get('res_num')
        if res_num:
            queryset = queryset.filter(res_num=res_num)
        return queryset

    def create(self, request, *args, **kwargs):
        # Get res_num from either query params or request data
        res_num = request.query_params.get('res_num') or request.data.get('res_num')
        
        if not res_num:
            return Response(
                {"error": "res_num is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Call your serializer's upload method
        files = request.data.get('files', [])
        self.get_serializer()._upload_files(files, res_num=res_num)
        
        return Response({"status": "Files uploaded successfully"}, status=status.HTTP_201_CREATED)    


# Deleting Res File or replace if updated
class ResolutionFileDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [AllowAny]    
    queryset = ResolutionFile.objects.all()
    serializer_class = ResolutionFileSerializer
    lookup_field = 'rf_id' 


 # Resolution Supp Docs
class ResolutionSupDocsView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]    
    serializer_class = ResolutionSupDocsSerializer
    queryset = ResolutionSupDocs.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        res_num = self.request.query_params.get('res_num')
        if res_num:
            queryset = queryset.filter(res_num=res_num)
        return queryset
    
    def create(self, request, *args, **kwargs):
        # Get res_num from either query params or request data
        res_num = request.query_params.get('res_num') or request.data.get('res_num')
        
        if not res_num:
            return Response(
                {"error": "res_num is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Call your serializer's upload method
        files = request.data.get('files', [])
        self.get_serializer()._upload_files(files, res_num=res_num)
        
        return Response({"status": "Files uploaded successfully"}, status=status.HTTP_201_CREATED)      


class ResolutionSupDocsDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [AllowAny]    
    queryset = ResolutionSupDocs.objects.all()
    serializer_class = ResolutionSupDocsSerializer
    lookup_field = 'rsd_id'     


class GADProposalsView(generics.ListAPIView):
    permission_classes = [AllowAny]    
    serializer_class = GADProposalSerializer
    
    def get_queryset(self):
        # Get all project proposals with their related development plan
        return ProjectProposal.objects.all().select_related('dev')


class PurposeRatesListView(generics.ListCreateAPIView):
    queryset = Purpose_And_Rates.objects.all()
    serializer_class = PurposeRatesListViewSerializer
    
# =================== MINUTES OF MEETING VIEWS ======================
class MinutesOfMeetingActiveView(ActivityLogMixin, generics.ListCreateAPIView):
    serializer_class = MinutesOfMeetingSerializer
    pagination_class = StandardResultsPagination
    permission_classes = [AllowAny]  # Add appropriate permissions

    def get_queryset(self):
        # Filter out archived records and select related staff data
        queryset = MinutesOfMeeting.objects.filter(
            mom_is_archive=False
        ).select_related(
            'staff_id__rp__per'
        ).only(
            'mom_id',
            'mom_date',
            'mom_title',
            'mom_agenda',
            'mom_area_of_focus',
            'mom_is_archive',
            'staff_id__rp__per__per_lname',
            'staff_id__rp__per__per_fname',
            'staff_id__rp__per__per_mname',
        )

        # Get search query from request parameters
        search_query = self.request.query_params.get('search', '').strip()
        
        if search_query:
            # Apply search filtering across multiple fields
            queryset = queryset.filter(
                Q(mom_id__icontains=search_query) |
                Q(mom_title__icontains=search_query) |
                Q(mom_agenda__icontains=search_query) |
                Q(mom_area_of_focus__icontains=search_query) |
                Q(mom_date__icontains=search_query) |
                Q(staff_id__rp__per__per_lname__icontains=search_query) |
                Q(staff_id__rp__per__per_fname__icontains=search_query) |
                Q(staff_id__rp__per__per_mname__icontains=search_query)
            ).distinct()

        # Order by date descending (most recent first)
        return queryset.order_by('-mom_date')
    
    def perform_create(self, serializer):
        instance = serializer.save()
        try:
            from apps.act_log.utils import create_activity_log, resolve_staff_from_request
            
            staff, staff_identifier = resolve_staff_from_request(self.request)
            
            if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                # Format area of focus for display
                area_of_focus = instance.mom_area_of_focus
                if isinstance(area_of_focus, list):
                    area_of_focus_display = ", ".join(area_of_focus).upper()
                else:
                    area_of_focus_display = str(area_of_focus).upper() if area_of_focus else "N/A"
                
                # Create detailed activity log
                create_activity_log(
                    act_type="Minutes of Meeting Create",
                    act_description=f"MinutesOfMeeting record created. Title: '{instance.mom_title}'. Date: {instance.mom_date}. Area of Focus: {area_of_focus_display}",
                    staff=staff,
                    record_id=str(instance.mom_id)
                )
                logger.info(f"Activity logged for minutes of meeting creation: {instance.mom_id}")
            else:
                logger.debug(f"Skipping activity log for MinutesOfMeeting create: No valid staff")
        except Exception as e:
            logger.error(f"Failed to log activity for minutes of meeting creation: {str(e)}")
        return instance
    
class MinutesOfMeetingInactiveView(generics.ListCreateAPIView):
    serializer_class = MinutesOfMeetingSerializer
    pagination_class = StandardResultsPagination
    permission_classes = [AllowAny]  

    def get_queryset(self):
        # Filter out archived records and select related staff data
        queryset = MinutesOfMeeting.objects.filter(
            mom_is_archive=True
        ).select_related(
            'staff_id__rp__per'
        ).only(
            'mom_id',
            'mom_date',
            'mom_title',
            'mom_agenda',
            'mom_area_of_focus',
            'mom_is_archive',
            'staff_id__rp__per__per_lname',
            'staff_id__rp__per__per_fname',
            'staff_id__rp__per__per_mname',
        )

        # Get search query from request parameters
        search_query = self.request.query_params.get('search', '').strip()
        
        if search_query:
            # Apply search filtering across multiple fields
            queryset = queryset.filter(
                Q(mom_id__icontains=search_query) |
                Q(mom_title__icontains=search_query) |
                Q(mom_agenda__icontains=search_query) |
                Q(mom_area_of_focus__icontains=search_query) |
                Q(mom_date__icontains=search_query) |
                Q(staff_id__rp__per__per_lname__icontains=search_query) |
                Q(staff_id__rp__per__per_fname__icontains=search_query) |
                Q(staff_id__rp__per__per_mname__icontains=search_query)
            ).distinct()

        # Order by date descending (most recent first)
        return queryset.order_by('-mom_date')

class MinutesOfMeetingDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [AllowAny] 
    queryset = MinutesOfMeeting.objects.all()
    serializer_class = MinutesOfMeetingSerializer
    lookup_field = 'mom_id'

class MOMFileView(generics.ListCreateAPIView):
    permission_classes = [AllowAny] 
    serializer_class = MOMFileCreateSerializer
    queryset = MOMFile.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors) 
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)

class UpdateMinutesOfMeetingView(ActivityLogMixin, generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny] 
    serializer_class = MinutesOfMeetingSerializer
    queryset = MinutesOfMeeting.objects.all()
    lookup_field = 'mom_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Capture old values for all fields that might be updated
        old_values = {
            'mom_title': instance.mom_title,
            'mom_agenda': instance.mom_agenda,
            'mom_date': instance.mom_date,
            'mom_area_of_focus': instance.mom_area_of_focus,
            'mom_is_archive': instance.mom_is_archive,
            'staff_id': instance.staff_id.staff_id if instance.staff_id else None
        }
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            updated_instance = serializer.save()
            
            # Log activity with field-level changes
            try:
                from apps.act_log.utils import create_activity_log, resolve_staff_from_request
                
                staff, staff_identifier = resolve_staff_from_request(request)
                
                if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                    # Track field changes
                    changes = []
                    
                    # Check each field for changes
                    if 'mom_title' in serializer.validated_data and old_values['mom_title'] != updated_instance.mom_title:
                        old_title = old_values['mom_title'] or 'N/A'
                        new_title = updated_instance.mom_title or 'N/A'
                        changes.append(f"mom_title: '{old_title}' → '{new_title}'")
                    
                    if 'mom_agenda' in serializer.validated_data and old_values['mom_agenda'] != updated_instance.mom_agenda:
                        old_agenda = old_values['mom_agenda'] or 'N/A'
                        new_agenda = updated_instance.mom_agenda or 'N/A'
                        # Truncate long strings
                        old_agenda_short = (old_agenda[:60] + '…') if len(old_agenda) > 60 else old_agenda
                        new_agenda_short = (new_agenda[:60] + '…') if len(new_agenda) > 60 else new_agenda
                        changes.append(f"mom_agenda: '{old_agenda_short}' → '{new_agenda_short}'")
                    
                    if 'mom_date' in serializer.validated_data and old_values['mom_date'] != updated_instance.mom_date:
                        old_date = str(old_values['mom_date']) if old_values['mom_date'] else 'N/A'
                        new_date = str(updated_instance.mom_date) if updated_instance.mom_date else 'N/A'
                        changes.append(f"mom_date: '{old_date}' → '{new_date}'")
                    
                    if 'mom_area_of_focus' in serializer.validated_data and old_values['mom_area_of_focus'] != updated_instance.mom_area_of_focus:
                        old_areas = old_values['mom_area_of_focus']
                        if isinstance(old_areas, list):
                            old_areas_display = ", ".join(old_areas).upper()
                        else:
                            old_areas_display = str(old_areas).upper() if old_areas else 'N/A'
                        
                        new_areas = updated_instance.mom_area_of_focus
                        if isinstance(new_areas, list):
                            new_areas_display = ", ".join(new_areas).upper()
                        else:
                            new_areas_display = str(new_areas).upper() if new_areas else 'N/A'
                        
                        changes.append(f"mom_area_of_focus: '{old_areas_display}' → '{new_areas_display}'")
                    
                    if 'mom_is_archive' in serializer.validated_data and old_values['mom_is_archive'] != updated_instance.mom_is_archive:
                        old_archive = 'True' if old_values['mom_is_archive'] else 'False'
                        new_archive = 'True' if updated_instance.mom_is_archive else 'False'
                        changes.append(f"mom_is_archive: '{old_archive}' → '{new_archive}'")
                    
                    if 'staff_id' in request.data:
                        new_staff_id = request.data.get('staff_id')
                        if isinstance(new_staff_id, str) and len(new_staff_id) < 11:
                            new_staff_id = new_staff_id.zfill(11)
                        elif isinstance(new_staff_id, int):
                            new_staff_id = str(new_staff_id).zfill(11)
                        
                        old_staff_id = old_values['staff_id'] or 'N/A'
                        if isinstance(old_staff_id, str) and len(old_staff_id) < 11:
                            old_staff_id = old_staff_id.zfill(11)
                        elif isinstance(old_staff_id, int):
                            old_staff_id = str(old_staff_id).zfill(11)
                        
                        if str(old_staff_id) != str(new_staff_id):
                            changes.append(f"staff_id: '{old_staff_id}' → '{new_staff_id}'")
                    
                    # Determine action type
                        if old_values['mom_is_archive'] != updated_instance.mom_is_archive:
                            if updated_instance.mom_is_archive:
                                act_type = "Minutes of Meeting Archived"
                            else:
                                act_type = "Minutes of Meeting Restored"
                        else:
                            act_type = "Minutes of Meeting Updated"
                    
                    # Build description
                    if changes:
                        description = f"MinutesOfMeeting changes: {'; '.join(changes)}"
                    else:
                        description = "MinutesOfMeeting record updated (no field-level changes recorded)"
                        
                        create_activity_log(
                        act_type=act_type,
                        act_description=description,
                            staff=staff,
                            record_id=str(updated_instance.mom_id)
                        )
                        logger.info(f"Activity logged for minutes of meeting update: {updated_instance.mom_id}")
            except Exception as log_error:
                logger.error(f"Failed to log activity for minutes of meeting update: {str(log_error)}")
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteMinutesOfMeetingView(generics.DestroyAPIView):
    permission_classes = [AllowAny] 
    serializer_class = MinutesOfMeetingSerializer    
    queryset = MinutesOfMeeting.objects.all()

    def get_object(self):
        mom_id = self.kwargs.get('mom_id')
        return get_object_or_404(MinutesOfMeeting, mom_id=mom_id)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Format area of focus for display
        area_of_focus = instance.mom_area_of_focus
        if isinstance(area_of_focus, list):
            area_of_focus_display = ", ".join(area_of_focus).upper()
        else:
            area_of_focus_display = str(area_of_focus).upper() if area_of_focus else "N/A"
        
        # Log activity before deletion
        try:
            from apps.act_log.utils import create_activity_log, resolve_staff_from_request
            
            staff, staff_identifier = resolve_staff_from_request(request)
            
            if not staff:
                # Fallback to instance staff_id
                staff_id = instance.staff_id.staff_id if instance.staff_id else None
            if staff_id:
                if isinstance(staff_id, str) and len(staff_id) < 11:
                    staff_id = staff_id.zfill(11)
                elif isinstance(staff_id, int):
                    staff_id = str(staff_id).zfill(11)
                    from apps.administration.models import Staff
                staff = Staff.objects.filter(staff_id=staff_id).first() if staff_id else None
                
                if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                    create_activity_log(
                        act_type="Minutes of Meeting Deleted",
                    act_description=f"MinutesOfMeeting record deleted. Title: '{instance.mom_title}'. Date: {instance.mom_date}. Area of Focus: {area_of_focus_display}",
                        staff=staff,
                        record_id=str(instance.mom_id)
                    )
                    logger.info(f"Activity logged for minutes of meeting deletion: {instance.mom_id}")
            else:
                logger.debug(f"Skipping activity log for MinutesOfMeeting delete: No valid staff")
        except Exception as log_error:
            logger.error(f"Failed to log activity for minutes of meeting deletion: {str(log_error)}")
        
        return super().destroy(request, *args, **kwargs) 
    

class DeleteMOMFileView(generics.DestroyAPIView):
    permission_classes = [AllowAny] 
    serializer_class = MOMFileViewSerializer    
    queryset = MOMFile.objects.all()

    def get_object(self):
        mom_id = self.kwargs.get('mom_id')
        return get_object_or_404(MOMFile, mom_id=mom_id)

class MeetingSuppDocsView(generics.ListAPIView):
    permission_classes = [AllowAny] 
    serializer_class = MOMSuppDocViewSerializer
    
    def get_queryset(self):
        mom_id = self.kwargs['mom_id']
        return MOMSuppDoc.objects.filter(mom_id=mom_id)

class DeleteMOMSuppDocView(generics.DestroyAPIView):
    permission_classes = [AllowAny] 
    queryset = MOMSuppDoc.objects.all()
    serializer_class = MOMSuppDocViewSerializer
    lookup_field = 'momsp_id'

class MOMSuppDocView(generics.ListCreateAPIView):
    permission_classes = [AllowAny] 
    serializer_class = MOMSuppDocCreateSerializer
    query_set = MOMSuppDoc.objects.all()


# ================================== ORDINANCE VIEWS (from secretary) =================================

class OrdinanceListView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = Ordinance.objects.all()
    serializer_class = OrdinanceSerializer

    def get_queryset(self):
        return Ordinance.objects.filter(
            ord_is_archive=False
        ).order_by('-ord_date_created')
    
    def create(self, request, *args, **kwargs):
        # Extract of_id from request data
        of_id = request.data.get('of_id')
        staff_id = request.data.get('staff_id')
        
        # Remove of_id from data to avoid serializer issues
        ordinance_data = request.data.copy()
        if 'of_id' in ordinance_data:
            del ordinance_data['of_id']
        
        serializer = self.get_serializer(data=ordinance_data)
        serializer.is_valid(raise_exception=True)
        ordinance = serializer.save()
        
        # Link file if provided
        if of_id:
            try:
                file_obj = OrdinanceFile.objects.get(of_id=of_id)
                ordinance.of_id = file_obj
                ordinance.save()
            except OrdinanceFile.DoesNotExist:
                pass  # File doesn't exist, continue without linking
        
        # Log the activity
        try:
            from apps.act_log.utils import create_activity_log
            from apps.administration.models import Staff
            
            # Get staff member from the ordinance or request
            staff_id = getattr(ordinance.staff, 'staff_id', None) or request.data.get('staff_id') or request.data.get('staff')
            if staff_id:
                # Format staff_id properly (pad with leading zeros if needed)
                if isinstance(staff_id, str) and len(staff_id) < 11:
                    staff_id = staff_id.zfill(11)
                elif isinstance(staff_id, int):
                    staff_id = str(staff_id).zfill(11)
            staff = Staff.objects.filter(staff_id=staff_id).first() if staff_id else None
            
            # Only log if we have a valid staff with staff_id
            if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                # Format category for display (remove brackets if array)
                category_display = ordinance.ord_category
                if isinstance(category_display, list):
                    category_display = ", ".join(category_display)
                
                # Create activity log
                create_activity_log(
                    act_type="Ordinance Created",
                    act_description=f"Ordinance {ordinance.ord_num} '{ordinance.ord_title}' created for {category_display}",
                    staff=staff,
                    record_id=ordinance.ord_num
                )
                logger.info(f"Activity logged for ordinance creation: {ordinance.ord_num}")
            else:
                logger.warning(f"No valid staff with staff_id found for ordinance creation logging: {ordinance.ord_num}")
                
        except Exception as log_error:
            logger.error(f"Failed to log activity for ordinance creation: {str(log_error)}")
            # Don't fail the request if logging fails
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class OrdinanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = Ordinance.objects.all()
    serializer_class = OrdinanceSerializer
    lookup_field = 'ord_num'
    
    def update(self, request, *args, **kwargs):
        ordinance = self.get_object()
        
        # Capture old values for all fields that might be updated
        old_values = {
            'ord_title': ordinance.ord_title,
            'ord_date_created': ordinance.ord_date_created,
            'ord_category': ordinance.ord_category,
            'ord_details': ordinance.ord_details,
            'ord_year': ordinance.ord_year,
            'ord_is_archive': ordinance.ord_is_archive,
            'ord_repealed': ordinance.ord_repealed,
            'ord_is_ammend': ordinance.ord_is_ammend,
            'ord_ammend_ver': ordinance.ord_ammend_ver,
            'ord_parent': ordinance.ord_parent,
            'staff_id': ordinance.staff.staff_id if ordinance.staff else None
        }
        
        serializer = self.get_serializer(ordinance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_ordinance = serializer.save()
        
        # Log the activity with field-level changes
        try:
            from apps.act_log.utils import create_activity_log, resolve_staff_from_request
            
            staff, staff_identifier = resolve_staff_from_request(request)
            
            if not staff:
                # Fallback to instance staff_id
                staff_id = updated_ordinance.staff.staff_id if updated_ordinance.staff else None
            if staff_id:
                if isinstance(staff_id, str) and len(staff_id) < 11:
                    staff_id = staff_id.zfill(11)
                elif isinstance(staff_id, int):
                    staff_id = str(staff_id).zfill(11)
                    from apps.administration.models import Staff
            staff = Staff.objects.filter(staff_id=staff_id).first() if staff_id else None
            
            if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                # Track field changes
                changes = []
                
                if 'ord_title' in serializer.validated_data and old_values['ord_title'] != updated_ordinance.ord_title:
                    old_title = old_values['ord_title'] or 'N/A'
                    new_title = updated_ordinance.ord_title or 'N/A'
                    changes.append(f"ord_title: '{old_title}' → '{new_title}'")
                
                if 'ord_date_created' in serializer.validated_data and old_values['ord_date_created'] != updated_ordinance.ord_date_created:
                    old_date = str(old_values['ord_date_created']) if old_values['ord_date_created'] else 'N/A'
                    new_date = str(updated_ordinance.ord_date_created) if updated_ordinance.ord_date_created else 'N/A'
                    changes.append(f"ord_date_created: '{old_date}' → '{new_date}'")
                
                if 'ord_category' in serializer.validated_data and old_values['ord_category'] != updated_ordinance.ord_category:
                    old_cat = ", ".join(old_values['ord_category']) if isinstance(old_values['ord_category'], list) and old_values['ord_category'] else (str(old_values['ord_category']) if old_values['ord_category'] else 'N/A')
                    new_cat = ", ".join(updated_ordinance.ord_category) if isinstance(updated_ordinance.ord_category, list) and updated_ordinance.ord_category else (str(updated_ordinance.ord_category) if updated_ordinance.ord_category else 'N/A')
                    changes.append(f"ord_category: '{old_cat}' → '{new_cat}'")
                
                if 'ord_details' in serializer.validated_data and old_values['ord_details'] != updated_ordinance.ord_details:
                    old_details = (old_values['ord_details'][:60] + '…') if old_values['ord_details'] and len(old_values['ord_details']) > 60 else (old_values['ord_details'] or 'N/A')
                    new_details = (updated_ordinance.ord_details[:60] + '…') if updated_ordinance.ord_details and len(updated_ordinance.ord_details) > 60 else (updated_ordinance.ord_details or 'N/A')
                    changes.append(f"ord_details: '{old_details}' → '{new_details}'")
                
                if 'ord_year' in serializer.validated_data and old_values['ord_year'] != updated_ordinance.ord_year:
                    changes.append(f"ord_year: '{old_values['ord_year']}' → '{updated_ordinance.ord_year}'")
                
                if 'ord_is_archive' in serializer.validated_data and old_values['ord_is_archive'] != updated_ordinance.ord_is_archive:
                    old_archive = 'True' if old_values['ord_is_archive'] else 'False'
                    new_archive = 'True' if updated_ordinance.ord_is_archive else 'False'
                    changes.append(f"ord_is_archive: '{old_archive}' → '{new_archive}'")
                
                if 'ord_repealed' in serializer.validated_data and old_values['ord_repealed'] != updated_ordinance.ord_repealed:
                    old_repealed = 'True' if old_values['ord_repealed'] else 'False'
                    new_repealed = 'True' if updated_ordinance.ord_repealed else 'False'
                    changes.append(f"ord_repealed: '{old_repealed}' → '{new_repealed}'")
                
                if 'ord_is_ammend' in serializer.validated_data and old_values['ord_is_ammend'] != updated_ordinance.ord_is_ammend:
                    old_amend = 'True' if old_values['ord_is_ammend'] else 'False'
                    new_amend = 'True' if updated_ordinance.ord_is_ammend else 'False'
                    changes.append(f"ord_is_ammend: '{old_amend}' → '{new_amend}'")
                
                if 'ord_ammend_ver' in serializer.validated_data and old_values['ord_ammend_ver'] != updated_ordinance.ord_ammend_ver:
                    changes.append(f"ord_ammend_ver: '{old_values['ord_ammend_ver']}' → '{updated_ordinance.ord_ammend_ver}'")
                
                if 'ord_parent' in serializer.validated_data and old_values['ord_parent'] != updated_ordinance.ord_parent:
                    changes.append(f"ord_parent: '{old_values['ord_parent']}' → '{updated_ordinance.ord_parent}'")
                
                if 'staff_id' in request.data:
                    new_staff_id = request.data.get('staff_id')
                    if isinstance(new_staff_id, str) and len(new_staff_id) < 11:
                        new_staff_id = new_staff_id.zfill(11)
                    elif isinstance(new_staff_id, int):
                        new_staff_id = str(new_staff_id).zfill(11)
                    
                    old_staff_id = old_values['staff_id'] or 'N/A'
                    if isinstance(old_staff_id, str) and len(old_staff_id) < 11:
                        old_staff_id = old_staff_id.zfill(11)
                    elif isinstance(old_staff_id, int):
                        old_staff_id = str(old_staff_id).zfill(11)
                    
                    if str(old_staff_id) != str(new_staff_id):
                        changes.append(f"staff_id: '{old_staff_id}' → '{new_staff_id}'")
                
                # Build description
                if changes:
                    description = f"Ordinance changes: {'; '.join(changes)}"
                else:
                    description = f"Ordinance {updated_ordinance.ord_num} '{updated_ordinance.ord_title}' updated (no field-level changes recorded)"
                
                create_activity_log(
                    act_type="Ordinance Updated",
                    act_description=description,
                    staff=staff,
                    record_id=updated_ordinance.ord_num
                )
                logger.info(f"Activity logged for ordinance update: {updated_ordinance.ord_num}")
            else:
                logger.warning(f"No valid staff with staff_id found for ordinance update logging: {updated_ordinance.ord_num}")
                
        except Exception as log_error:
            logger.error(f"Failed to log activity for ordinance update: {str(log_error)}")
            # Don't fail the request if logging fails
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def destroy(self, request, *args, **kwargs):
        ordinance = self.get_object()
        ordinance_num = ordinance.ord_num
        ordinance_title = ordinance.ord_title
        
        # Log the activity before deletion
        try:
            from apps.act_log.utils import create_activity_log
            from apps.administration.models import Staff
            
            # Get staff member from the ordinance or request
            staff_id = getattr(ordinance.staff, 'staff_id', None) or request.data.get('staff_id') or request.data.get('staff')
            if staff_id:
                # Format staff_id properly (pad with leading zeros if needed)
                if isinstance(staff_id, str) and len(staff_id) < 11:
                    staff_id = staff_id.zfill(11)
                elif isinstance(staff_id, int):
                    staff_id = str(staff_id).zfill(11)
            staff = Staff.objects.filter(staff_id=staff_id).first() if staff_id else None
            
            # Only log if we have a valid staff with staff_id
            if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                # Create activity log
                create_activity_log(
                    act_type="Ordinance Deleted",
                    act_description=f"Ordinance {ordinance_num} '{ordinance_title}' deleted",
                    staff=staff,
                    record_id=ordinance_num
                )
                logger.info(f"Activity logged for ordinance deletion: {ordinance_num}")
            else:
                logger.warning(f"No valid staff with staff_id found for ordinance deletion logging: {ordinance_num}")
                
        except Exception as log_error:
            logger.error(f"Failed to log activity for ordinance deletion: {str(log_error)}")
            # Don't fail the request if logging fails
        
        return super().destroy(request, *args, **kwargs)

class OrdinanceArchiveView(generics.UpdateAPIView):
    permission_classes = [AllowAny]
    queryset = Ordinance.objects.all()
    serializer_class = OrdinanceSerializer
    lookup_field = 'ord_num'

    def update(self, request, *args, **kwargs):
        ordinance = self.get_object()
        ordinance.ord_is_archive = True
        ordinance.save()
        
        # Log the activity
        try:
            from apps.act_log.utils import create_activity_log
            from apps.administration.models import Staff
            
            # Get staff member from the ordinance or request
            staff_id = getattr(ordinance.staff, 'staff_id', None) or request.data.get('staff_id') or request.data.get('staff')
            if staff_id:
                # Format staff_id properly (pad with leading zeros if needed)
                if isinstance(staff_id, str) and len(staff_id) < 11:
                    staff_id = staff_id.zfill(11)
                elif isinstance(staff_id, int):
                    staff_id = str(staff_id).zfill(11)
            staff = Staff.objects.filter(staff_id=staff_id).first() if staff_id else None
            
            # Only log if we have a valid staff with staff_id
            if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                # Create activity log
                create_activity_log(
                    act_type="Ordinance Archived",
                    act_description=f"Ordinance {ordinance.ord_num} '{ordinance.ord_title}' archived",
                    staff=staff,
                    record_id=ordinance.ord_num
                )
                logger.info(f"Activity logged for ordinance archiving: {ordinance.ord_num}")
            else:
                logger.warning(f"No valid staff with staff_id found for ordinance archiving logging: {ordinance.ord_num}")
                
        except Exception as log_error:
            logger.error(f"Failed to log activity for ordinance archiving: {str(log_error)}")
            # Don't fail the request if logging fails
        
        return Response({'message': 'Ordinance archived successfully'})

## Supplementary document views removed (unused)

## Ordinance Template views removed (unused)

# Ordinance File Views
class OrdinanceFileView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = OrdinanceFile.objects.all()
    serializer_class = OrdinanceFileSerializer

    def create(self, request, *args, **kwargs):
        # Handle file uploads like resolution does
        files = request.data.get('files', [])
        
        if not files:
            return Response(
                {"error": "No files provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        print(f"Uploading {len(files)} ordinance files")
        
        # Call serializer's upload method and get created files
        created_files = self.get_serializer()._upload_files(files)
        
        # Return the created file data
        serializer = self.get_serializer(created_files, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class OrdinanceFileDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OrdinanceFile.objects.all()
    serializer_class = OrdinanceFileSerializer
    lookup_field = 'of_id'