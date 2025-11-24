from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from .models import *
from .serializers import *
from django.apps import apps
from django.utils import timezone
from rest_framework.permissions import AllowAny
from django.db.models.functions import ExtractYear
import logging
from rest_framework.views import APIView
from django.db import transaction
from apps.act_log.utils import ActivityLogMixin, create_activity_log, resolve_staff_from_request
from apps.pagination import StandardResultsPagination
from django.db.models import Q
from utils.supabase_client import remove_from_storage
from django.db.models import Sum, DecimalField
from django.db.models.functions import Coalesce
from decimal import Decimal
from datetime import timedelta

logger = logging.getLogger(__name__)

Staff = apps.get_model('administration', 'Staff')

def create_gad_announcement(development_plan, staff, reason="mandated"):
    """
    Create an announcement for a GAD development plan.
    
    Args:
        development_plan: DevelopmentPlan instance
        staff: Staff instance (for announcement creator)
        reason: "mandated" or "proposal_resolution"
    """
    try:
        from apps.announcement.models import Announcement, AnnouncementRecipient
        from apps.announcement.serializers import BulkAnnouncementRecipientSerializer
        
        # Check if announcement already exists for this dev plan
        project_title = development_plan.dev_project or 'Untitled Project'
        
        # Format date
        if development_plan.dev_date:
            if isinstance(development_plan.dev_date, str):
                date_str = development_plan.dev_date
            else:
                date_str = development_plan.dev_date.strftime('%B %d, %Y')
        else:
            date_str = 'TBD'
        
        # Build announcement title and details
        if reason == "mandated":
            ann_title = f"GAD Mandated Development Plan: {project_title}"
        else:  # proposal_resolution
            ann_title = f"GAD Development Plan Approved: {project_title}"
        
        # Build details with only project, date, and client
        ann_details = f"Project: {project_title}\n"
        ann_details += f"Date: {date_str}\n"
        
        if development_plan.dev_client:
            ann_details += f"Client Focus: {development_plan.dev_client}\n"
        
        # Check if announcement already exists (to avoid duplicates)
        existing_announcement = Announcement.objects.filter(
            ann_title=ann_title,
            ann_created_at__date=timezone.now().date()
        ).first()
        
        if existing_announcement:
            logger.info(f"Announcement already exists for dev plan {development_plan.dev_id}")
            return existing_announcement
        
        # Create announcement
        announcement = Announcement.objects.create(
            ann_title=ann_title,
            ann_details=ann_details,
            ann_created_at=timezone.now(),
            ann_start_at=timezone.now(),
            ann_end_at=timezone.now() + timedelta(days=7),  # Active for 7 days
            ann_type="GENERAL",
            ann_to_email=True,
            ann_to_sms=True,
            ann_status="ACTIVE",
            staff=staff if staff else None
        )
        
        # Create recipient for residents only
        recipients_data = [{
            'ann': announcement.ann_id,
            'ar_category': 'resident',
            'ar_type': 'RESIDENT'
        }]
        
        # Use BulkAnnouncementRecipientSerializer to create recipients and send notifications/emails
        bulk_serializer = BulkAnnouncementRecipientSerializer(
            data={'recipients': recipients_data}
        )
        
        if bulk_serializer.is_valid():
            bulk_serializer.save()
            logger.info(f"Announcement created successfully for dev plan {development_plan.dev_id}")
        else:
            logger.error(f"Failed to create announcement recipients: {bulk_serializer.errors}")
        
        return announcement
        
    except Exception as e:
        logger.error(f"Error creating announcement for dev plan {development_plan.dev_id}: {str(e)}", exc_info=True)
        return None

class GAD_Budget_TrackerView(ActivityLogMixin, generics.ListCreateAPIView):
    serializer_class = GAD_Budget_TrackerSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsPagination

    # def get_queryset(self):
    #     year = self.kwargs.get('year')
    #     if not year:
    #         raise NotFound("Year parameter is required")
        
    #     return GAD_Budget_Tracker.objects.filter(
    #         gbudy__gbudy_year=year,
    #         # gbud_is_archive=False
    #     ).select_related('gbudy', 'dev', 'staff').prefetch_related('files')
    
    def get_queryset(self):
        year = self.kwargs.get('year')
        if not year:
            raise NotFound("Year parameter is required")
        
        queryset = GAD_Budget_Tracker.objects.filter(
            gbudy__gbudy_year=year,
        ).select_related('gbudy', 'dev', 'staff').prefetch_related('files')
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(gbud_reference_num__icontains=search) |
                Q(gbud_exp_particulars__icontains=search) |
                Q(staff__rp__per__per_fname__icontains=search) |
                Q(staff__rp__per__per_lname__icontains=search)
            )
        
        # Month filter
        month = self.request.query_params.get('month', None)
        if month:
            queryset = queryset.filter(gbud_datetime__month=month)
        
        # Archive filter
        is_archive = self.request.query_params.get('is_archive', None)
        if is_archive is not None:
            queryset = queryset.filter(gbud_is_archive=is_archive.lower() == 'true')
        
        return queryset.order_by('-gbud_datetime')
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):      
        try:
            # Let the parent class handle the creation
            response = super().create(request, *args, **kwargs)
            return response
            
        except Exception as e:            
            # If it's a validation error, log the details
            if hasattr(e, 'detail'):
                logger.error(f"Validation errors: {e.detail}")
            
            # Re-raise the exception to maintain normal error handling
            raise
    
    def perform_create(self, serializer):
        validated_data = serializer.validated_data
        staff_provided = 'staff' in validated_data and validated_data['staff'] is not None      
        save_kwargs = {}
        
        if not staff_provided:
            try:
                save_kwargs['staff'] = getattr(self.request.user, 'staff', None)
            except:
                save_kwargs['staff'] = None
                logger.warning("No staff available for this request")
        
        serializer.save(**save_kwargs)
    
class GAD_Budget_TrackerDetailView(ActivityLogMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = GAD_Budget_Tracker.objects.all()
    serializer_class = GAD_Budget_TrackerSerializer
    lookup_field = 'gbud_num'
    permission_classes = [AllowAny]

    def get_queryset(self):
        return super().get_queryset().select_related('gbudy', 'dev', 'staff').prefetch_related('files')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        if permanent:
            # Permanent delete
            instance.delete()
        else:
            # Soft delete (archive)
            instance.gbud_is_archive = True
            instance.save()
            
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class GADBudgetRestoreView(generics.UpdateAPIView):
    queryset = GAD_Budget_Tracker.objects.filter(gbud_is_archive=True)
    serializer_class = GAD_Budget_TrackerSerializer
    lookup_field = 'gbud_num'
    permission_classes = [AllowAny]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.gbud_is_archive = False
        instance.save()
        return Response(status=status.HTTP_200_OK)

class GAD_Budget_YearView(generics.ListCreateAPIView):
    queryset = GAD_Budget_Year.objects.all()
    serializer_class = GADBudgetYearSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        queryset = GAD_Budget_Year.objects.all()
        
        # Add search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(gbudy_year__icontains=search)
            )
        
        # Filter out archived items
        queryset = queryset.filter(gbudy_is_archive=False)
        
        return queryset.order_by('-gbudy_year')

class GADBudgetFileView(generics.ListCreateAPIView):
    serializer_class = GADBudgetFileSerializer
    queryset = GAD_Budget_File.objects.all()
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        gbud_num = request.data.get('gbud_num')
        if not gbud_num:
            return Response({"error": "gbud_num is required"}, status=400)

        files = request.data.get('files', [])
        files_to_delete = request.data.get('filesToDelete', [])

        serializer = self.get_serializer()

        if files_to_delete:
            serializer._delete_files(files_to_delete, gbud_num=gbud_num)
            return Response({"status": "Files deleted successfully"}, status=200)

        if not files:
            return Response({"status": "No files uploaded"}, status=201)

        serializer._upload_files(files, gbud_num=gbud_num)
        return Response({"status": "Files uploaded successfully"}, status=201)

class GADBudgetFileDetailView(ActivityLogMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = GAD_Budget_File.objects.all()
    serializer_class = GADBudgetFileSerializer
    permission_classes = [AllowAny]
    
class GADBudgetLogListView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    pagination_class = StandardResultsPagination
    
    def get(self, request, year):
        search = request.query_params.get('search', None)
        page = request.query_params.get('page', 1)
        page_size = request.query_params.get('page_size', 10)
        
        logs = GADBudgetLog.objects.filter(
            gbudl_budget_entry__gbudy__gbudy_year=year,
        ).select_related('gbudl_budget_entry')
        
        # Add search functionality
        if search:
            logs = logs.filter(
                Q(gbudl_budget_entry__dev__dev_project__icontains=search) |
                Q(gbudl_budget_entry__gbud_exp_particulars__icontains=search) |
                Q(gbudl_id__icontains=search)
            )
        
        logs = logs.order_by("-gbudl_created_at")
        
        # Apply pagination
        paginator = self.pagination_class()
        paginator.page_size = page_size
        result_page = paginator.paginate_queryset(logs, request)
        
        serializer = GADBudgetLogSerializer(result_page, many=True)
        
        return paginator.get_paginated_response(serializer.data)

class ProjectProposalView(ActivityLogMixin, generics.ListCreateAPIView):
    serializer_class = ProjectProposalSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsPagination

    # def get_queryset(self):
    #     queryset = ProjectProposal.objects.all().select_related('staff', 'dev')

    #     # Order by a field in ProjectProposal (example: created date or ID)
    #     queryset = queryset.order_by('-gpr_id')  

    #     # Get archive status from query params
    #     archive_status = self.request.query_params.get('archive', None)
    #     if archive_status == 'true':
    #         queryset = queryset.filter(gpr_is_archive=True)
    #     elif archive_status == 'false':
    #         queryset = queryset.filter(gpr_is_archive=False)

    #     return queryset
    
    def get_queryset(self):
        queryset = ProjectProposal.objects.all().select_related('staff', 'dev')
        queryset = queryset.order_by('-gpr_id')

        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(gpr_background__icontains=search) |
                Q(gpr_venue__icontains=search) |
                Q(gpr_monitoring__icontains=search) |
                Q(dev__dev_project__icontains=search)
            )

        # Archive status filter - check both 'archive' and 'is_archive' params
        archive_status = self.request.query_params.get('archive', None) or self.request.query_params.get('is_archive', None)
        if archive_status:
            if archive_status.lower() == 'true':
                queryset = queryset.filter(gpr_is_archive=True)
            elif archive_status.lower() == 'false':
                queryset = queryset.filter(gpr_is_archive=False)
                
        year = self.request.query_params.get('year', None)
        if year:
            try:
                year_int = int(year)
                queryset = queryset.filter(
                    dev__dev_date__year=year_int
                )
            except (ValueError, TypeError):
                # If year is not a valid integer, ignore the filter
                pass

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
            logger.error(f"Error in ProjectProposalView list: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Creating project proposal with data: {request.data}")
            
            # Validate required fields for new structure
            dev_id = request.data.get('dev')
            
            if not dev_id:
                logger.error("Development plan (dev) is required but not provided")
                return Response(
                    {"error": "Development plan (dev) is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            try:
                # Validate that the dev plan exists
                dev_plan = DevelopmentPlan.objects.get(pk=dev_id)
                logger.info(f"Found development plan: {dev_plan.dev_id}")
                
                # Check if proposal already exists for this dev plan
                existing_proposal = ProjectProposal.objects.filter(
                    dev_id=dev_id,
                    gpr_is_archive=False
                ).exists()
                
                if existing_proposal:
                    logger.warning(f"Proposal already exists for dev plan {dev_id}")
                    return Response(
                        {"error": "A proposal already exists for this development plan project"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
            except DevelopmentPlan.DoesNotExist:
                logger.error(f"Development plan with id {dev_id} does not exist")
                return Response(
                    {"error": f"Development plan with id {dev_id} does not exist"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create the serializer and validate
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                logger.error(f"Serializer validation failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Save the instance and log activity
            try:
                instance = serializer.save()
                logger.info(f"Successfully created proposal with ID: {instance.gpr_id}")
                
                # Log the activity if staff exists with staff_id
                try:
                    staff, staff_identifier = resolve_staff_from_request(request)
                    
                    # Only log if we have a valid staff with staff_id
                    if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                        create_activity_log(
                            act_type="Project Proposal Created",
                            act_description=f"Project proposal {instance.gpr_id} created for development plan {instance.dev_id}",
                            staff=staff,
                            record_id=str(instance.gpr_id)
                        )
                        logger.info(f"Activity logged for project proposal creation: {instance.gpr_id}")
                        
                        # Always log GAD Development Plan Updated when a project proposal is created
                        try:
                            from apps.council.models import Resolution
                            dev_plan = instance.dev
                            
                            # Check if there's a resolution linked to this proposal
                            has_resolution = Resolution.objects.filter(
                                gpr_id=instance.gpr_id,
                                res_is_archive=False
                            ).exists()
                            
                            # Build description with dev plan details - highlight the dev plan
                            project_title = dev_plan.dev_project or 'N/A'
                            description_parts = [f"GAD Development Plan ({project_title})"]
                            
                            if dev_plan.dev_date:
                                date_str = dev_plan.dev_date.strftime('%Y-%m-%d') if not isinstance(dev_plan.dev_date, str) else dev_plan.dev_date
                                description_parts.append(f"Date: {date_str}")
                            if dev_plan.dev_client:
                                description_parts.append(f"Client: {dev_plan.dev_client}")
                            
                            if has_resolution:
                                description_parts.append("now has both project proposal and resolution")
                            else:
                                description_parts.append("now has project proposal")
                            
                            description = ". ".join(description_parts)
                            
                            create_activity_log(
                                act_type="GAD Development Plan Updated",
                                act_description=description,
                                staff=staff,
                                record_id=str(dev_plan.dev_id)
                            )
                            logger.info(f"Activity logged: Dev plan {dev_plan.dev_id} updated with project proposal")
                        except Exception as check_error:
                            logger.debug(f"Error logging dev plan update for project proposal: {str(check_error)}")
                            # Don't fail if this check fails
                    else:
                        logger.warning(
                            f"No valid staff with staff_id resolved for activity logging "
                            f"(input id: {staff_identifier or 'not provided'})"
                        )
                except Exception as log_error:
                    logger.error(f"Failed to log activity for project proposal creation: {str(log_error)}")
                    # Don't fail the request if logging fails
                
                # Verify the instance was actually saved
                saved_instance = ProjectProposal.objects.get(pk=instance.gpr_id)
                logger.info(f"Verified saved instance: {saved_instance.gpr_id}")
                
                # Check if there's already a resolution for this proposal's dev plan
                # If so, create announcement (dev plan now has both proposal and resolution)
                try:
                    from apps.council.models import Resolution
                    dev_plan = instance.dev
                    if dev_plan:
                        # Check if there's a resolution linked to this proposal
                        has_resolution = Resolution.objects.filter(
                            gpr_id=instance.gpr_id,
                            res_is_archive=False
                        ).exists()
                        
                        if has_resolution:
                            # Create announcement since dev plan now has both proposal and resolution
                            staff_for_announcement, _ = resolve_staff_from_request(request)
                            create_gad_announcement(dev_plan, staff_for_announcement, reason="proposal_resolution")
                except Exception as ann_error:
                    logger.error(f"Failed to create announcement when proposal created with existing resolution: {str(ann_error)}")
                    # Don't fail if announcement creation fails
                
            except Exception as save_error:
                logger.error(f"Error saving proposal: {str(save_error)}", exc_info=True)
                return Response(
                    {"error": f"Failed to save proposal: {str(save_error)}"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            headers = self.get_success_headers(serializer.data)
            response_data = serializer.data
            logger.info(f"Returning response data: {response_data}")
            
            return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            logger.error(f"Unexpected error in create method: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
class ProjectProposalYearsView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        try:
            # Get distinct years from dev_date field
            years_query = ProjectProposal.objects.filter(
                dev__dev_date__isnull=False
            )
            
            years = years_query.annotate(
                year=ExtractYear('dev__dev_date')
            ).values_list('year', flat=True).distinct().order_by('-year')
            
            years_list = list(years)
            
            return Response(years_list)
            
        except Exception as e:
            logger.error(f"Error fetching proposal years: {str(e)}", exc_info=True)
            return Response([], status=status.HTTP_200_OK)

class ProjectProposalDetailView(ActivityLogMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = ProjectProposal.objects.all().select_related('staff')
    serializer_class = ProjectProposalSerializer
    lookup_field = 'gpr_id'
    permission_classes = [AllowAny]
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Extract header image data from request before validation
        header_img_data = request.data.get('gpr_header_img')
        if header_img_data and isinstance(header_img_data, str):
            try:
                header_img_data = json.loads(header_img_data)
            except (json.JSONDecodeError, TypeError):
                header_img_data = None
        
        # Remove header image from request data to avoid validation issues
        request_data = request.data.copy()
        if 'gpr_header_img' in request_data:
            del request_data['gpr_header_img']
        
        serializer = self.get_serializer(instance, data=request_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # UPLOAD HEADER IMAGE FIRST (OUTSIDE ANY TRANSACTION)
        header_img_url = None
        if header_img_data:
            try:
                logger.info("Starting header image upload to Supabase")
                header_img_url = upload_to_storage(header_img_data, 'project-proposal-bucket', 'header_images')
                logger.info(f"Header image uploaded successfully: {header_img_url}")
            except Exception as e:
                logger.error(f"Header image upload failed: {str(e)}")
                # Return error immediately if image upload fails
                return Response(
                    {"error": f"Header image upload failed: {str(e)}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            # Use a simpler approach without transaction.atomic()
            # Let the serializer handle the update
            updated_instance = serializer.save()
            
            # Update header image URL if upload was successful
            if header_img_url:
                updated_instance.gpr_header_img = header_img_url
                updated_instance.save(update_fields=['gpr_header_img'])
                logger.info(f"Header image URL saved to database: {header_img_url}")
            
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Failed to update proposal: {str(e)}")
            
            # If database update failed but image was uploaded, you might want to delete the image
            if header_img_url:
                try:
                    # You would need to implement delete_from_storage
                    remove_from_storage('project-proposal-bucket', header_img_url)
                    logger.warning(f"Image was uploaded but proposal update failed: {header_img_url}")
                except Exception as cleanup_error:
                    logger.error(f"Failed to cleanup uploaded image: {str(cleanup_error)}")
            
            return Response(
                {"error": f"Failed to update proposal: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
 
class ProposalSuppDocCreateView(generics.ListCreateAPIView):
    serializer_class = ProposalSuppDocSerializer
    queryset = ProposalSuppDoc.objects.all()
    permission_classes = [AllowAny]

    def get_queryset(self):
        return self.queryset.filter(gpr_id=self.kwargs['proposal_id'])

    def create(self, request, *args, **kwargs):
        gpr_id = self.kwargs.get('proposal_id') or request.data.get('gpr_id')
        if not gpr_id:
            return Response({"error": "gpr_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        files = request.data.get('files', [])
        if not files:
            return Response({"error": "No files provided"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer()
        serializer._upload_files(files, gpr_id=gpr_id)

        return Response({"status": "Files uploaded successfully"}, status=status.HTTP_201_CREATED)

class ProposalSuppDocDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProposalSuppDocSerializer
    queryset = ProposalSuppDoc.objects.all()
    lookup_field = 'psd_id'
    permission_classes = [AllowAny]
    
    def perform_destroy(self, instance):
        if not instance.psd_is_archive:
            # First deletion - archive it
            instance.psd_is_archive = True
            instance.save()
        else:
            # Already archived - permanent delete
            instance.delete()
class StaffListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Staff.objects.select_related('rp__per', 'pos').only(
        'staff_id',
        'rp__per__per_fname',
        'rp__per__per_lname',
        'pos__pos_title'
    )
    serializer_class = StaffSerializer

class ProjectProposalArchiveView(generics.UpdateAPIView):
    queryset = ProjectProposal.objects.filter(gpr_is_archive=False)
    serializer_class = ProjectProposalSerializer
    lookup_field = 'gpr_id'
    permission_classes = [AllowAny]

    def perform_update(self, serializer):
        serializer.save(gpr_is_archive=True)

class ProjectProposalRestoreView(generics.UpdateAPIView):
    queryset = ProjectProposal.objects.filter(gpr_is_archive=True)
    serializer_class = ProjectProposalSerializer
    lookup_field = 'gpr_id'
    permission_classes = [AllowAny]
 
    def perform_update(self, serializer):
        serializer.save(gpr_is_archive=False)
        
class ProjectProposalForBT(generics.ListAPIView):
    serializer_class = GADDevelopmentPlanSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        year = self.kwargs.get('year')
        if not year:
            return DevelopmentPlan.objects.none()
        
        # Get development plans for the specified year
        return DevelopmentPlan.objects.filter(
            dev_date__year=year
        ).distinct()

    def list(self, request, *args, **kwargs):
        year = self.kwargs.get('year')
        if not year:
            raise NotFound("Year parameter is required")

        queryset = self.get_queryset()
        
        response_data = []
        for dev_plan in queryset:
            # Get the project titles from dev_project (which is a JSONField)
            projects = dev_plan.dev_project if isinstance(dev_plan.dev_project, list) else [dev_plan.dev_project] if dev_plan.dev_project else []
            
            # Get budget items from dev_budget_items
            budget_items = dev_plan.dev_budget_items or []
            
            for project_index, project_title in enumerate(projects):
                if not project_title:  # Skip empty project titles
                    continue
                    
                # Check existing GAD_Budget_Tracker entries for this specific project and year
                existing_entries = GAD_Budget_Tracker.objects.filter(
                    gbudy__gbudy_year=year,
                    dev=dev_plan,
                    gbud_project_index=project_index,
                    gbud_is_archive=False
                )
                is_used = existing_entries.exists()

                # Collect all recorded budget item names for this specific project
                recorded_items = set()
                for entry in existing_entries:
                    for item in entry.gbud_exp_particulars or []:
                        recorded_items.add(item.get('name', ''))

                # Determine unrecorded items from development plan budget items
                unrecorded_items = []
                recorded_budget_items = []
                
                for item in budget_items:
                    item_name = item.get('name', item.get('gdb_name', ''))
                    if not item_name:
                        continue
                        
                    normalized_item = {
                        'name': item_name,
                        'pax': item.get('pax', item.get('gdb_pax', 1)),
                        "amount": item.get("amount", item.get("price", item.get("gdb_price", 0))),
                    }
                    
                    if item_name in recorded_items:
                        recorded_budget_items.append(normalized_item)
                    else:
                        unrecorded_items.append(normalized_item)

                response_data.append({
                    'gpr_id': f"{dev_plan.dev_id}_{project_index}", 
                    'gpr_title': project_title,
                    'gpr_budget_items': [{
                        'name': item.get('name', item.get('gdb_name', '')),
                        'pax': item.get('pax', item.get('gdb_pax', 1)),
                        'amount': item.get("amount", item.get("price", item.get("gdb_price", 0))),
                    } for item in budget_items if item.get('name', item.get('gdb_name', ''))],
                    'recorded_items': recorded_items,
                    'unrecorded_items': unrecorded_items,
                    'is_editable': not is_used,
                    'dev_id': dev_plan.dev_id,
                    'dev_client': dev_plan.dev_client,
                    'dev_issue': dev_plan.dev_issue,
                    'project_index': project_index 
                })

        return Response({
            'data': response_data,
            'count': len(response_data)
        })

class ProjectProposalForProposal(generics.ListAPIView):
    permission_classes = [AllowAny]
    
    def get(self, request, year=None):
        if not year:
            year = timezone.now().year
            
        try:
            dev_plans = DevelopmentPlan.objects.filter(
                dev_date__year=year
            ).values(
                'dev_id', 'dev_client', 'dev_issue', 'dev_project', 
                'dev_indicator', 'dev_budget_items', 'dev_date'
            )
            
            available_projects = []
            
            for dev_plan in dev_plans:
                # ---- projects (dev_project stored as TextField with JSON text or plain string)
                dev_project = dev_plan['dev_project']
                projects = []
                if dev_project:
                    try:
                        parsed = json.loads(dev_project)
                        if isinstance(parsed, list):
                            projects = parsed
                        elif isinstance(parsed, str):
                            projects = [parsed]
                    except (json.JSONDecodeError, TypeError):
                        projects = [dev_project]

                # ---- participants (parse dev_indicator into [{category, count}])
                participants = parse_dev_indicator_to_participants(dev_plan.get('dev_indicator'))

                # ---- budget items (normalize to {name, pax, amount})
                budget_items_raw = dev_plan.get('dev_budget_items') or []
                norm_budget_items = []
                for item in (budget_items_raw or []):
                    if not isinstance(item, dict):
                        continue
                    norm_budget_items.append({
                        "name": item.get("name", item.get("gdb_name", "")),
                        "pax": item.get("pax", item.get("gdb_pax", 1)),
                        "amount": item.get("amount", item.get("price", item.get("gdb_price", 0))),
                    })

                # ---- filter out dev plans that already have a proposal
                existing_proposal = ProjectProposal.objects.filter(
                    dev_id=dev_plan['dev_id'],
                    gpr_is_archive=False
                ).exists()
                
                if not existing_proposal:
                    for project_title in projects:
                        if not project_title:
                            continue
                        available_projects.append({
                            'dev_id': dev_plan['dev_id'],
                            'dev_client': dev_plan['dev_client'],
                            'dev_issue': dev_plan['dev_issue'],
                            'project_title': project_title,
                            'participants': participants,         
                            'budget_items': norm_budget_items,     
                            'dev_date': dev_plan['dev_date']
                        })
            
            return Response({
                'data': available_projects,
                'year': year,
                'count': len(available_projects)
            })
            
        except Exception as e:
            logger.error(f"Error fetching development plan projects: {str(e)}", exc_info=True)
            return Response(
                {"error": "Internal server error", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
class GADBudgetAggregatesView(APIView):
    """Returns budget totals for a given year (excluding archived entries)"""
    permission_classes = [AllowAny]
    
    def get(self, request, year):
        try:
            # Get the yearly budget from GAD_Budget_Year
            yearly_budget = GAD_Budget_Year.objects.filter(
                gbudy_year=year,
                gbudy_is_archive=False
            ).first()
            
            if not yearly_budget:
                return Response({
                    'total_budget': 0,
                    'total_expenses': 0,
                    'pending_expenses': 0,
                    'remaining_balance': 0,
                })
            
            # Get active entries for calculating pending expenses
            entries_queryset = GAD_Budget_Tracker.objects.filter(
                gbudy__gbudy_year=year,
                gbud_is_archive=False
            )
            
            # Calculate pending expenses (entries with 0 actual expense)
            pending_expenses_queryset = entries_queryset.filter(gbud_actual_expense=0)
            pending_aggregates = pending_expenses_queryset.aggregate(
                pending_expenses=Coalesce(Sum('gbud_proposed_budget'), 0, output_field=DecimalField())
            )
            
            total_budget = Decimal(str(yearly_budget.gbudy_budget))
            total_expenses = Decimal(str(yearly_budget.gbudy_expenses))
            pending_expenses = Decimal(str(pending_aggregates['pending_expenses']))
            remaining = total_budget - total_expenses
            
            return Response({
                'total_budget': float(total_budget),
                'total_expenses': float(total_expenses),
                'pending_expenses': float(pending_expenses),
                'remaining_balance': float(remaining),
            })
        except Exception as e:
            logger.error(f"Error calculating budget aggregates: {str(e)}")
            return Response({
                'total_budget': 0,
                'total_expenses': 0,
                'pending_expenses': 0,
                'remaining_balance': 0,
            })

class ProjectProposalGrandTotalView(APIView):
    """Returns grand total for all non-archived project proposals"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            queryset = ProjectProposal.objects.filter(
                gpr_is_archive=False
            ).select_related('dev')
            
            total = Decimal('0')
            
            for proposal in queryset:
                if proposal.dev and proposal.dev.dev_budget_items:
                    for item in proposal.dev.dev_budget_items:
                        if not isinstance(item, dict):
                            continue
                        
                        # Get amount
                        amount = item.get('amount') or item.get('price') or 0
                        try:
                            amount = Decimal(str(amount))
                        except:
                            amount = Decimal('0')
                        
                        # Get pax and parse if string
                        pax = item.get('pax', 1)
                        if isinstance(pax, str):
                            # Extract first number from string like "10 pax"
                            match = re.search(r'(\d+)', pax)
                            pax = int(match.group(1)) if match else 1
                        else:
                            pax = int(pax) if pax else 1
                        
                        total += amount * pax
            
            return Response({
                'grand_total': float(total)
            })
        except Exception as e:
            logger.error(f"Error calculating grand total: {str(e)}")
            return Response({
                'grand_total': 0
            })

# ===========================================================================================================

class GADDevelopmentPlanListCreate(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = GADDevelopmentPlanSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        # Auto-archive GAD development plans that have passed
        # COMMENTED OUT: Archiving disabled
        # from .signals import archive_passed_gad_plans
        # archive_passed_gad_plans()
        
        year = self.request.query_params.get('year')
        qs = DevelopmentPlan.objects.all()
        
        if year:
            qs = qs.filter(dev_date__year=year)
        
        # Archive filter - MUST come before search
        dev_archived = self.request.query_params.get('dev_archived', None)
        if dev_archived is not None:
            # Convert string to boolean
            is_archived = dev_archived.lower() == 'true'
            qs = qs.filter(dev_archived=is_archived)
        
        # Add search functionality
        search = self.request.query_params.get('search', None)
        if search:
            qs = qs.filter(
                Q(dev_project__icontains=search) |
                Q(dev_client__icontains=search) |
                Q(dev_issue__icontains=search) |
                Q(dev_indicator__icontains=search)
            )
        
        # Support dynamic ordering
        ordering = self.request.query_params.get('ordering', '-dev_date')
        return qs.order_by(ordering)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        try:
            # Create the development plan
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            development_plan = serializer.save()
            
            # Log activity if staff exists
            try:
                staff, staff_identifier = resolve_staff_from_request(request)
                
                # Only log if we have a valid staff with staff_id
                if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                    # Build comprehensive activity log description
                    description_parts = []
                    
                    # Project title
                    project_title = development_plan.dev_project or 'N/A'
                    description_parts.append(f"Project: {project_title}")
                    
                    # Date
                    if development_plan.dev_date:
                        if isinstance(development_plan.dev_date, str):
                            date_str = development_plan.dev_date
                        else:
                            date_str = development_plan.dev_date.strftime('%Y-%m-%d')
                        description_parts.append(f"Date: {date_str}")
                    
                    # Client focused
                    if development_plan.dev_client:
                        description_parts.append(f"Client: {development_plan.dev_client}")
                    
                    # Gender issue
                    if development_plan.dev_issue:
                        issue = development_plan.dev_issue[:100] + '...' if len(development_plan.dev_issue) > 100 else development_plan.dev_issue
                        description_parts.append(f"Issue: {issue}")
                    
                    # Responsible person(s)
                    if development_plan.dev_res_person:
                        try:
                            import json
                            if isinstance(development_plan.dev_res_person, str):
                                # Try to parse if it's a JSON string
                                try:
                                    res_persons = json.loads(development_plan.dev_res_person)
                                except:
                                    res_persons = [development_plan.dev_res_person]
                            else:
                                res_persons = development_plan.dev_res_person
                            
                            if isinstance(res_persons, list) and len(res_persons) > 0:
                                res_person_str = ", ".join(str(p) for p in res_persons if p)
                                if res_person_str:
                                    description_parts.append(f"Responsible Person(s): {res_person_str}")
                        except Exception as e:
                            logger.debug(f"Error parsing responsible persons: {str(e)}")
                    
                    # Budget total
                    try:
                        budget_items = development_plan.dev_budget_items or []
                        if isinstance(budget_items, str):
                            import json
                            try:
                                budget_items = json.loads(budget_items)
                            except:
                                budget_items = []
                        
                        if isinstance(budget_items, list) and len(budget_items) > 0:
                            total_budget = Decimal('0')
                            for item in budget_items:
                                if isinstance(item, dict):
                                    quantity = Decimal(str(item.get('quantity', 0) or 0))
                                    price = Decimal(str(item.get('price', 0) or 0))
                                    total_budget += quantity * price
                            
                            if total_budget > 0:
                                description_parts.append(f"Budget: ₱{total_budget:,.2f}")
                    except Exception as e:
                        logger.debug(f"Error calculating budget: {str(e)}")
                    
                    # Mandated status
                    if development_plan.dev_mandated:
                        description_parts.append("Status: Mandated")
                    
                    # Build final description
                    description = f"GAD Development Plan created. {'. '.join(description_parts)}"
                    
                    create_activity_log(
                        act_type="GAD Development Plan Created",
                        act_description=description,
                        staff=staff,
                        record_id=str(development_plan.dev_id)
                    )
                    logger.info(f"Activity logged for GAD development plan creation: {development_plan.dev_id}")
                else:
                    logger.warning(
                        f"No valid staff with staff_id resolved for activity logging "
                        f"(input id: {staff_identifier or 'not provided'})"
                    )
            except Exception as log_error:
                logger.error(f"Failed to log activity for GAD development plan creation: {str(log_error)}")
                # Don't fail the request if logging fails
            
            # Create announcement if dev plan is mandated
            if development_plan.dev_mandated:
                try:
                    staff_for_announcement, _ = resolve_staff_from_request(request)
                    create_gad_announcement(development_plan, staff_for_announcement, reason="mandated")
                except Exception as ann_error:
                    logger.error(f"Failed to create announcement for mandated dev plan: {str(ann_error)}")
                    # Don't fail the request if announcement creation fails
            
            response_data = serializer.data
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating GAD development plan: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

# GET years with data

class GADDevelopmentPlanBulkUpdate(APIView):
    permission_classes = [AllowAny]
    
    def patch(self, request):
        """Bulk archive/restore development plans"""
        dev_ids = request.data.get('dev_ids', [])
        dev_archived = request.data.get('dev_archived', False)
        
        if not dev_ids:
            return Response(
                {"error": "dev_ids is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get plans BEFORE updating for activity logging (important: fetch before update)
        plans = list(DevelopmentPlan.objects.filter(dev_id__in=dev_ids))
        
        if not plans:
            return Response(
                {"error": "No development plans found with the provided IDs"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Perform the update
        updated = DevelopmentPlan.objects.filter(
            dev_id__in=dev_ids
        ).update(dev_archived=dev_archived)
        
        # Log activity for each plan (using the plans fetched before update)
        try:
            logger.info(f"Bulk update: {len(plans)} plans to {('archive' if dev_archived else 'restore')}")
            logger.info(f"Request data: {request.data}")
            logger.info(f"Request user: {request.user if hasattr(request, 'user') else 'No user'}")
            
            staff, staff_identifier = resolve_staff_from_request(request)
            
            logger.info(f"Resolved staff: {staff}, staff_id: {staff.staff_id if staff and hasattr(staff, 'staff_id') else 'N/A'}, identifier: {staff_identifier}")
            
            # Only log if we have a valid staff with staff_id
            if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                action = "archived" if dev_archived else "restored"
                act_type = "GAD Development Plan Archived" if dev_archived else "GAD Development Plan Restored"
                
                logged_count = 0
                for plan in plans:
                    try:
                        # Build comprehensive activity log description
                        description_parts = []
                        
                        # Project title
                        project_title = plan.dev_project or 'N/A'
                        description_parts.append(f"Project: {project_title}")
                        
                        # Date
                        if plan.dev_date:
                            if isinstance(plan.dev_date, str):
                                date_str = plan.dev_date
                            else:
                                date_str = plan.dev_date.strftime('%Y-%m-%d')
                            description_parts.append(f"Date: {date_str}")
                        
                        # Client focused
                        if plan.dev_client:
                            description_parts.append(f"Client: {plan.dev_client}")
                        
                        # Build final description
                        description = f"GAD Development Plan {action}. {'. '.join(description_parts)}"
                        
                        result = create_activity_log(
                            act_type=act_type,
                            act_description=description,
                            staff=staff,
                            record_id=str(plan.dev_id)
                        )
                        if result:
                            logged_count += 1
                            logger.info(f"Activity logged for plan {plan.dev_id}: {description}")
                        else:
                            logger.warning(f"Activity log creation returned None for plan {plan.dev_id}")
                    except Exception as e:
                        logger.error(f"Failed to log activity for plan {plan.dev_id}: {str(e)}", exc_info=True)
                
                logger.info(f"Successfully logged {logged_count} out of {len(plans)} GAD development plan(s) {action}")
            else:
                logger.warning(
                    f"No valid staff with staff_id resolved for activity logging. "
                    f"Staff: {staff}, Has staff_id attr: {hasattr(staff, 'staff_id') if staff else False}, "
                    f"Staff_id value: {staff.staff_id if staff and hasattr(staff, 'staff_id') else 'N/A'}, "
                    f"Input identifier: {staff_identifier or 'not provided'}"
                )
        except Exception as log_error:
            logger.error(f"Failed to log activity for bulk update: {str(log_error)}", exc_info=True)
            # Don't fail the request if logging fails
        
        return Response({
            "updated": updated,
            "dev_archived": dev_archived
        }, status=status.HTTP_200_OK)

class GADDevelopmentPlanBulkDelete(APIView):
    permission_classes = [AllowAny]

    def delete(self, request):
        dev_ids = request.data.get('dev_ids', [])
        if not dev_ids:
            return Response(
                {"error": "dev_ids is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        deleted_count, _ = DevelopmentPlan.objects.filter(dev_id__in=dev_ids).delete()

        return Response(
            {"deleted": deleted_count},
            status=status.HTTP_200_OK
        )
class GADDevelopmentPlanArchiveView(generics.UpdateAPIView):
    queryset = DevelopmentPlan.objects.filter(dev_archived=False)
    serializer_class = GADDevelopmentPlanSerializer
    lookup_field = 'dev_id'
    permission_classes = [AllowAny]

    def update(self, request, *args, **kwargs):
        try:
            # Get the instance before updating
            instance = self.get_object()
            
            # Perform the update
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            development_plan = serializer.save(dev_archived=True)
            
            # Log activity if staff exists
            try:
                staff, staff_identifier = resolve_staff_from_request(request)
                
                # Only log if we have a valid staff with staff_id
                if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                    # Build comprehensive activity log description
                    description_parts = []
                    
                    # Project title
                    project_title = development_plan.dev_project or 'N/A'
                    description_parts.append(f"Project: {project_title}")
                    
                    # Date
                    if development_plan.dev_date:
                        if isinstance(development_plan.dev_date, str):
                            date_str = development_plan.dev_date
                        else:
                            date_str = development_plan.dev_date.strftime('%Y-%m-%d')
                        description_parts.append(f"Date: {date_str}")
                    
                    # Client focused
                    if development_plan.dev_client:
                        description_parts.append(f"Client: {development_plan.dev_client}")
                    
                    # Build final description
                    description = f"GAD Development Plan archived. {'. '.join(description_parts)}"
                    
                    create_activity_log(
                        act_type="GAD Development Plan Archived",
                        act_description=description,
                        staff=staff,
                        record_id=str(development_plan.dev_id)
                    )
                    logger.info(f"Activity logged for GAD development plan archive: {development_plan.dev_id}")
                else:
                    logger.warning(
                        f"No valid staff with staff_id resolved for activity logging "
                        f"(input id: {staff_identifier or 'not provided'})"
                    )
            except Exception as log_error:
                logger.error(f"Failed to log activity for GAD development plan archive: {str(log_error)}")
                # Don't fail the request if logging fails
            
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error archiving GAD development plan: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class GADDevelopmentPlanRestoreView(generics.UpdateAPIView):
    queryset = DevelopmentPlan.objects.filter(dev_archived=True)
    serializer_class = GADDevelopmentPlanSerializer
    lookup_field = 'dev_id'
    permission_classes = [AllowAny]

    def update(self, request, *args, **kwargs):
        try:
            # Get the instance before updating
            instance = self.get_object()
            
            # Perform the update
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            development_plan = serializer.save(dev_archived=False)
            
            # Log activity if staff exists
            try:
                staff, staff_identifier = resolve_staff_from_request(request)
                
                # Only log if we have a valid staff with staff_id
                if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                    # Build comprehensive activity log description
                    description_parts = []
                    
                    # Project title
                    project_title = development_plan.dev_project or 'N/A'
                    description_parts.append(f"Project: {project_title}")
                    
                    # Date
                    if development_plan.dev_date:
                        if isinstance(development_plan.dev_date, str):
                            date_str = development_plan.dev_date
                        else:
                            date_str = development_plan.dev_date.strftime('%Y-%m-%d')
                        description_parts.append(f"Date: {date_str}")
                    
                    # Client focused
                    if development_plan.dev_client:
                        description_parts.append(f"Client: {development_plan.dev_client}")
                    
                    # Build final description
                    description = f"GAD Development Plan restored. {'. '.join(description_parts)}"
                    
                    create_activity_log(
                        act_type="GAD Development Plan Restored",
                        act_description=description,
                        staff=staff,
                        record_id=str(development_plan.dev_id)
                    )
                    logger.info(f"Activity logged for GAD development plan restore: {development_plan.dev_id}")
                else:
                    logger.warning(
                        f"No valid staff with staff_id resolved for activity logging "
                        f"(input id: {staff_identifier or 'not provided'})"
                    )
            except Exception as log_error:
                logger.error(f"Failed to log activity for GAD development plan restore: {str(log_error)}")
                # Don't fail the request if logging fails
            
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error restoring GAD development plan: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class GADDevelopmentPlanYears(APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        # Add search functionality for years
        search = request.query_params.get('search', None)
        dev_archived = request.query_params.get('dev_archived', None)
        queryset = DevelopmentPlan.objects.all()
        
        # Filter by archived status if provided
        if dev_archived is not None:
            is_archived = dev_archived.lower() == 'true'
            queryset = queryset.filter(dev_archived=is_archived)
        
        if search:
            queryset = queryset.filter(
                Q(dev_project__icontains=search) |
                Q(dev_client__icontains=search) |
                Q(dev_issue__icontains=search) |
                Q(dev_indicator__icontains=search)
            )
        
        years = queryset.annotate(year=ExtractYear('dev_date')).values_list('year', flat=True).distinct()
        return Response(sorted(years, reverse=True))

class GADDevelopmentPlanUpdate(generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]
    queryset = DevelopmentPlan.objects.all()
    serializer_class = GADDevelopmentPlanSerializer
    lookup_field = 'dev_id'
    
    def update(self, request, *args, **kwargs):
        try:
            # Get the instance before updating
            instance = self.get_object()
            
            # Store old values for comparison
            old_values = {
                'dev_project': instance.dev_project,
                'dev_date': instance.dev_date,
                'dev_client': instance.dev_client,
                'dev_issue': instance.dev_issue,
                'dev_res_person': instance.dev_res_person,
                'dev_indicator': instance.dev_indicator,
                'dev_budget_items': instance.dev_budget_items,
                'dev_mandated': instance.dev_mandated,
            }
            
            # Calculate old budget
            old_budget = Decimal('0')
            try:
                old_budget_items = old_values['dev_budget_items'] or []
                if isinstance(old_budget_items, str):
                    import json
                    try:
                        old_budget_items = json.loads(old_budget_items)
                    except:
                        old_budget_items = []
                
                if isinstance(old_budget_items, list):
                    for item in old_budget_items:
                        if isinstance(item, dict):
                            quantity = Decimal(str(item.get('quantity', item.get('pax', 0)) or 0))
                            price = Decimal(str(item.get('price', item.get('amount', 0)) or 0))
                            old_budget += quantity * price
            except:
                pass
            
            # Perform the update
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            development_plan = serializer.save()
            
            # Log the activity
            try:
                staff, staff_identifier = resolve_staff_from_request(request)
                
                # Only log if we have a valid staff with staff_id
                if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                    # Track what changed
                    changes = []
                    
                    # Project title
                    if old_values['dev_project'] != development_plan.dev_project:
                        old_proj = old_values['dev_project'] or 'N/A'
                        new_proj = development_plan.dev_project or 'N/A'
                        changes.append(f"Project: '{old_proj}' → '{new_proj}'")
                    
                    # Date
                    old_date = old_values['dev_date']
                    new_date = development_plan.dev_date
                    if old_date != new_date:
                        old_date_str = old_date.strftime('%Y-%m-%d') if old_date and not isinstance(old_date, str) else (old_date or 'N/A')
                        new_date_str = new_date.strftime('%Y-%m-%d') if new_date and not isinstance(new_date, str) else (new_date or 'N/A')
                        changes.append(f"Date: '{old_date_str}' → '{new_date_str}'")
                    
                    # Client focused
                    if old_values['dev_client'] != development_plan.dev_client:
                        old_client = old_values['dev_client'] or 'N/A'
                        new_client = development_plan.dev_client or 'N/A'
                        changes.append(f"Client: '{old_client}' → '{new_client}'")
                    
                    # Gender issue
                    if old_values['dev_issue'] != development_plan.dev_issue:
                        old_issue = (old_values['dev_issue'] or 'N/A')[:50]
                        new_issue = (development_plan.dev_issue or 'N/A')[:50]
                        changes.append(f"Issue: '{old_issue}' → '{new_issue}'")
                    
                    # Responsible person(s)
                    old_res_person = old_values['dev_res_person']
                    new_res_person = development_plan.dev_res_person
                    if old_res_person != new_res_person:
                        try:
                            import json
                            # Parse old
                            if isinstance(old_res_person, str):
                                try:
                                    old_res = json.loads(old_res_person)
                                except:
                                    old_res = [old_res_person] if old_res_person else []
                            else:
                                old_res = old_res_person if old_res_person else []
                            
                            # Parse new
                            if isinstance(new_res_person, str):
                                try:
                                    new_res = json.loads(new_res_person)
                                except:
                                    new_res = [new_res_person] if new_res_person else []
                            else:
                                new_res = new_res_person if new_res_person else []
                            
                            old_res_str = ", ".join(str(p) for p in old_res if p) if isinstance(old_res, list) else str(old_res or 'N/A')
                            new_res_str = ", ".join(str(p) for p in new_res if p) if isinstance(new_res, list) else str(new_res or 'N/A')
                            changes.append(f"Responsible Person(s): '{old_res_str}' → '{new_res_str}'")
                        except Exception as e:
                            logger.debug(f"Error comparing responsible persons: {str(e)}")
                    
                    # Budget total
                    try:
                        budget_items = development_plan.dev_budget_items or []
                        if isinstance(budget_items, str):
                            import json
                            try:
                                budget_items = json.loads(budget_items)
                            except:
                                budget_items = []
                        
                        new_budget = Decimal('0')
                        if isinstance(budget_items, list) and len(budget_items) > 0:
                            for item in budget_items:
                                if isinstance(item, dict):
                                    quantity = Decimal(str(item.get('quantity', item.get('pax', 0)) or 0))
                                    price = Decimal(str(item.get('price', item.get('amount', 0)) or 0))
                                    new_budget += quantity * price
                        
                        if old_budget != new_budget:
                            changes.append(f"Budget: ₱{old_budget:,.2f} → ₱{new_budget:,.2f}")
                    except Exception as e:
                        logger.debug(f"Error comparing budget: {str(e)}")
                    
                    # Mandated status
                    if old_values['dev_mandated'] != development_plan.dev_mandated:
                        old_mandated = "Mandated" if old_values['dev_mandated'] else "Not Mandated"
                        new_mandated = "Mandated" if development_plan.dev_mandated else "Not Mandated"
                        changes.append(f"Status: '{old_mandated}' → '{new_mandated}'")
                    
                    # Build final description
                    if changes:
                        description = f"GAD Development Plan updated: {', '.join(changes)}"
                    else:
                        # If no changes detected, show current state
                        description_parts = []
                        project_title = development_plan.dev_project or 'N/A'
                        description_parts.append(f"Project: {project_title}")
                        if development_plan.dev_date:
                            date_str = development_plan.dev_date.strftime('%Y-%m-%d') if not isinstance(development_plan.dev_date, str) else development_plan.dev_date
                            description_parts.append(f"Date: {date_str}")
                        if development_plan.dev_client:
                            description_parts.append(f"Client: {development_plan.dev_client}")
                        description = f"GAD Development Plan updated. {'. '.join(description_parts)}"
                    
                    create_activity_log(
                        act_type="GAD Development Plan Updated",
                        act_description=description,
                        staff=staff,
                        record_id=str(development_plan.dev_id)
                    )
                    logger.info(f"Activity logged for GAD development plan update: {development_plan.dev_id}")
                else:
                    logger.warning(
                        f"No valid staff with staff_id found for activity logging (input id: {staff_identifier or 'not provided'})"
                    )
                    
            except Exception as log_error:
                logger.error(f"Failed to log activity for GAD development plan update: {str(log_error)}")
                # Don't fail the request if logging fails
            
            # Create announcement if dev_mandated changed from False to True
            if not old_values['dev_mandated'] and development_plan.dev_mandated:
                try:
                    staff_for_announcement, _ = resolve_staff_from_request(request)
                    create_gad_announcement(development_plan, staff_for_announcement, reason="mandated")
                except Exception as ann_error:
                    logger.error(f"Failed to create announcement for mandated dev plan: {str(ann_error)}")
                    # Don't fail the request if announcement creation fails
            
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error updating GAD development plan: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            
            
            
            
 # ==================================================== parsing helper                 
def parse_dev_indicator_to_participants(value):
    """
    Accepts:
      - list of strings (e.g., ["LGBTQIA+ (5 participants), Erpat (5 participants)"])
      - single string (same as above)
      - list of already-shaped dicts (kept as-is with keys normalized)
    Returns: list[{"category": str, "count": str}]
    """
    if not value:
        return []

    # If value is JSON text, try to parse it
    if isinstance(value, str):
        s = value.strip()
        try:
            value = json.loads(s)
        except Exception:
            value = [s]

    out = []
    if isinstance(value, list):
        for v in value:
            # Already objects? normalize keys
            if isinstance(v, dict):
                cat = v.get("category") or v.get("group") or v.get("name") or ""
                cnt = v.get("count") or v.get("participants") or v.get("value")
                if cat:
                    out.append({"category": str(cat).strip(), "count": str(cnt) if cnt is not None else "0"})
                continue

            if isinstance(v, str):
                # split on commas into tokens like "LGBTQIA+ (5 participants)"
                parts = [p.strip() for p in v.split(",") if p.strip()]
                for part in parts:
                    m = re.match(r'^(?P<cat>.+?)\s*(?:\((?P<count>\d+)\s*participants?\))?$', part, re.IGNORECASE)
                    if m:
                        cat = m.group("cat").strip()
                        cnt = m.group("count") or "0"
                        out.append({"category": cat, "count": str(cnt)})
                    else:
                        # fallback: strip parentheses, grab first number if any
                        cat = re.sub(r'\(.*\)', '', part).strip()
                        m2 = re.search(r'(\d+)', part)
                        cnt = m2.group(1) if m2 else "0"
                        if cat:
                            out.append({"category": cat, "count": str(cnt)})
    return out
