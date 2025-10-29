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
from apps.act_log.utils import ActivityLogMixin
from apps.pagination import StandardResultsPagination
from django.db.models import Q
from utils.supabase_client import remove_from_storage
from django.db.models import Sum, DecimalField
from django.db.models.functions import Coalesce
from decimal import Decimal

logger = logging.getLogger(__name__)

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
                    from apps.act_log.utils import create_activity_log
                    from apps.administration.models import Staff
                    
                    # Get staff from request data or user
                    staff_id = request.data.get('staff_id') or request.data.get('staffId') or request.data.get('staff')
                    
                    # Try to get staff from user if not in request
                    if not staff_id:
                        try:
                            staff_id = getattr(request.user, 'staff', None)
                            if staff_id:
                                staff_id = getattr(staff_id, 'staff_id', None)
                        except:
                            pass
                    
                    if staff_id:
                        # Format staff_id properly (pad with leading zeros if needed)
                        if isinstance(staff_id, str) and len(staff_id) < 11:
                            staff_id = staff_id.zfill(11)
                        elif isinstance(staff_id, int):
                            staff_id = str(staff_id).zfill(11)
                        
                        staff = Staff.objects.filter(staff_id=staff_id).first()
                        
                        if staff:
                            # Create activity log
                            create_activity_log(
                                act_type="Project Proposal Created",
                                act_description=f"Project proposal {instance.gpr_id} created for development plan {instance.dev_id}",
                                staff=staff,
                                record_id=str(instance.gpr_id)
                            )
                            logger.info(f"Activity logged for project proposal creation: {instance.gpr_id}")
                        else:
                            logger.warning(f"Staff not found for ID: {staff_id}, cannot log activity")
                    else:
                        logger.warning("No staff_id provided in request for activity logging")
                except Exception as log_error:
                    logger.error(f"Failed to log activity for project proposal creation: {str(log_error)}")
                    # Don't fail the request if logging fails
                
                # Verify the instance was actually saved
                saved_instance = ProjectProposal.objects.get(pk=instance.gpr_id)
                logger.info(f"Verified saved instance: {saved_instance.gpr_id}")
                
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

            
Staff = apps.get_model('administration', 'Staff')

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
            
            # Get budget items from dev_gad_items
            budget_items = dev_plan.dev_gad_items or []
            
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
                'dev_indicator', 'dev_gad_items', 'dev_date'
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
                budget_items_raw = dev_plan.get('dev_gad_items') or []
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
                if proposal.dev and proposal.dev.dev_gad_items:
                    for item in proposal.dev.dev_gad_items:
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
            # Create the development plan first
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            development_plan = serializer.save()
            
            # Log the activity
            try:
                from apps.act_log.utils import create_activity_log
                from apps.administration.models import Staff
                
                # Get staff member from the request or use default
                staff_id = request.data.get('staff_id') or request.data.get('staff')
                staff = Staff.objects.filter(staff_id=staff_id).first()
                
                if staff:
                    # Create activity log
                    create_activity_log(
                        act_type="GAD Development Plan Created",
                        act_description=f"GAD development plan '{development_plan.dev_project}' created for {development_plan.dev_date} with budget ₱{development_plan.dev_gad_budget}",
                        staff=staff,
                        record_id=str(development_plan.dev_id)
                    )
                    logger.info(f"Activity logged for GAD development plan creation: {development_plan.dev_id}")
                else:
                    logger.warning(f"Staff not found for ID: {staff_id}, cannot log activity")
                    
            except Exception as log_error:
                logger.error(f"Failed to log activity for GAD development plan creation: {str(log_error)}")
                # Don't fail the request if logging fails
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
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
        
        updated = DevelopmentPlan.objects.filter(
            dev_id__in=dev_ids
        ).update(dev_archived=dev_archived)
        
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

    def perform_update(self, serializer):
        serializer.save(dev_archived=True)

class GADDevelopmentPlanRestoreView(generics.UpdateAPIView):
    queryset = DevelopmentPlan.objects.filter(dev_archived=True)
    serializer_class = GADDevelopmentPlanSerializer
    lookup_field = 'dev_id'
    permission_classes = [AllowAny]

    def perform_update(self, serializer):
        serializer.save(dev_archived=False)

class GADDevelopmentPlanYears(APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        # Add search functionality for years
        search = request.query_params.get('search', None)
        queryset = DevelopmentPlan.objects.all()
        
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
            
            # Perform the update
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            development_plan = serializer.save()
            
            # Log the activity
            try:
                from apps.act_log.utils import create_activity_log
                from apps.administration.models import Staff
                
                # Get staff member from the request or use default
                staff_id = request.data.get('staff_id') or request.data.get('staff')
                staff = Staff.objects.filter(staff_id=staff_id).first()
                
                if staff:
                    # Create activity log
                    create_activity_log(
                        act_type="GAD Development Plan Updated",
                        act_description=f"GAD development plan '{development_plan.dev_project}' updated for {development_plan.dev_date} with budget ₱{development_plan.dev_gad_budget}",
                        staff=staff,
                        record_id=str(development_plan.dev_id)
                    )
                    logger.info(f"Activity logged for GAD development plan update: {development_plan.dev_id}")
                else:
                    logger.warning(f"Staff not found for ID: {staff_id}, cannot log activity")
                    
            except Exception as log_error:
                logger.error(f"Failed to log activity for GAD development plan update: {str(log_error)}")
                # Don't fail the request if logging fails
            
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
