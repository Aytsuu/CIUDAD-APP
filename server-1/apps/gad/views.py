from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from .models import *
from .serializers import *
from django.db.models import OuterRef, Subquery, Count, Q
from django.apps import apps
from django.utils import timezone
from rest_framework.permissions import AllowAny
from django.db.models.functions import ExtractYear
import logging
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

class GAD_Budget_TrackerView(generics.ListCreateAPIView):
    serializer_class = GAD_Budget_TrackerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        year = self.kwargs.get('year')
        if not year:
            raise NotFound("Year parameter is required")
        
        return GAD_Budget_Tracker.objects.filter(
            gbudy__gbudy_year=year,
            # gbud_is_archive=False
        ).select_related('gbudy', 'dev', 'staff').prefetch_related('files')
    
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
    
class GAD_Budget_TrackerDetailView(generics.RetrieveUpdateDestroyAPIView):
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

class GADBudgetFileDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = GAD_Budget_File.objects.all()
    serializer_class = GADBudgetFileSerializer
    permission_classes = [AllowAny]
    
class GADBudgetLogListView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    def get(self, request, year):
        logs = GADBudgetLog.objects.filter(
            gbudl_budget_entry__gbudy__gbudy_year=year,
        ).select_related(
            'gbudl_budget_entry'
        ).order_by("-gbudl_created_at")
        
        serializer = GADBudgetLogSerializer(logs, many=True)
        return Response({"data": serializer.data})

class ProjectProposalView(generics.ListCreateAPIView):
    serializer_class = ProjectProposalSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = ProjectProposal.objects.all().select_related('staff', 'dev')

        # Order by a field in ProjectProposal (example: created date or ID)
        queryset = queryset.order_by('-gpr_id')  

        # Get archive status from query params
        archive_status = self.request.query_params.get('archive', None)
        if archive_status == 'true':
            queryset = queryset.filter(gpr_is_archive=True)
        elif archive_status == 'false':
            queryset = queryset.filter(gpr_is_archive=False)

        return queryset


    def create(self, request, *args, **kwargs):
        # Validate required fields for new structure
        dev_id = request.data.get('dev')
        
        if not dev_id:
            return Response(
                {"error": "Development plan (dev) is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Validate that the dev plan exists and has the specified project
            dev_plan = DevelopmentPlan.objects.get(pk=dev_id)
            projects = dev_plan.dev_project if isinstance(dev_plan.dev_project, list) else [dev_plan.dev_project] if dev_plan.dev_project else []
                
            # Check if proposal already exists for this dev plan + project index
            existing_proposal = ProjectProposal.objects.filter(
                dev_id=dev_id,
                gpr_is_archive=False
            ).exists()
            
            if existing_proposal:
                return Response(
                    {"error": "A proposal already exists for this development plan project"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except DevelopmentPlan.DoesNotExist:
            return Response(
                {"error": f"Development plan with id {dev_id} does not exist"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class ProjectProposalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProjectProposal.objects.all().select_related('staff')
    serializer_class = ProjectProposalSerializer
    lookup_field = 'gpr_id'
    permission_classes = [AllowAny]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        participants = request.data.get('participants')
        budget_items = request.data.get('budget_items')
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Save with the additional data
        serializer.save(
            participants=participants,
            budget_items=budget_items
        )

        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        if permanent:
            # Permanent delete
            instance.delete()
        else:
            # Soft delete (archive)
            instance.gpr_is_archive = True
            instance.save()
            
        return Response(status=status.HTTP_204_NO_CONTENT)
 
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

# ===========================================================================================================

class GADDevelopmentPlanListCreate(generics.ListCreateAPIView):
    serializer_class = GADDevelopmentPlanSerializer

    def get_queryset(self):
        year = self.request.query_params.get('year')
        qs = DevelopmentPlan.objects.all()
        if year:
            qs = qs.filter(dev_date__year=year)
        return qs
    
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
                staff_id = request.data.get('staff') or '00003250722'  # Default staff ID
                staff = Staff.objects.filter(staff_id=staff_id).first()
                
                if staff:
                    # Create activity log
                    create_activity_log(
                        act_type="GAD Development Plan Created",
                        act_description=f"GAD development plan '{development_plan.dev_project}' created for {development_plan.dev_date} with budget ₱{development_plan.dev_gad_budget}",
                        staff=staff,
                        record_id=str(development_plan.dev_id),
                        feat_name="GAD Development Plan Management"
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
class GADDevelopmentPlanYears(APIView):
    def get(self, request, *args, **kwargs):
        years = DevelopmentPlan.objects.annotate(year=ExtractYear('dev_date')).values_list('year', flat=True).distinct()
        return Response(sorted(years))

class GADDevelopmentPlanUpdate(generics.RetrieveUpdateAPIView):
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
                staff_id = request.data.get('staff') or '00003250722'  # Default staff ID
                staff = Staff.objects.filter(staff_id=staff_id).first()
                
                if staff:
                    # Create activity log
                    create_activity_log(
                        act_type="GAD Development Plan Updated",
                        act_description=f"GAD development plan '{development_plan.dev_project}' updated for {development_plan.dev_date} with budget ₱{development_plan.dev_gad_budget}",
                        staff=staff,
                        record_id=str(development_plan.dev_id),
                        feat_name="GAD Development Plan Management"
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
