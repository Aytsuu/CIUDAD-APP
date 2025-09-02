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
        # Log the incoming request data
        logger.debug(f"Received POST request to {request.path}")
        logger.debug(f"Request data: {request.data}")
        logger.debug(f"Request user: {request.user}")
        logger.debug(f"Request headers: {dict(request.headers)}")
        
        try:
            # Let the parent class handle the creation
            response = super().create(request, *args, **kwargs)
            logger.debug(f"Request successful: {response.status_code}")
            return response
            
        except Exception as e:
            # Log any exceptions that occur
            logger.error(f"Error in create method: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            
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
        # Get the most recent log date for each proposal
        latest_log_dates = ProjectProposalLog.objects.filter(
            gpr_id=OuterRef('gpr_id')
        ).order_by('-gprl_date_approved_rejected').values('gprl_date_approved_rejected')[:1]
        
        queryset = ProjectProposal.objects.all().select_related('staff').annotate(
            latest_log_date=Subquery(latest_log_dates)
        ).order_by('-latest_log_date')  # Newest first

        # Get archive status from query params
        archive_status = self.request.query_params.get('archive', None)
        if archive_status == 'true':
            queryset = queryset.filter(gpr_is_archive=True)
        elif archive_status == 'false':
            queryset = queryset.filter(gpr_is_archive=False)
        
        # Get the latest log for each proposal
        latest_logs = ProjectProposalLog.objects.filter(
            gpr_id=OuterRef('gpr_id')
        ).order_by('-gprl_date_approved_rejected')
        
        queryset = queryset.annotate(
            latest_status=Subquery(latest_logs.values('gprl_status')[:1]),
        )
        
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            latest_status = ProjectProposalLog.objects.filter(
                gpr_id=OuterRef('gpr_id')
            ).order_by('-gprl_date_approved_rejected').values('gprl_status')[:1]
            queryset = queryset.annotate(
                current_status=Subquery(latest_status)
            ).filter(current_status=status_filter)
            
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        proposal = serializer.save()
        
        # Create initial log entry with Pending status
        ProjectProposalLog.objects.create(
            gpr=proposal,
            gprl_status='Pending',
            staff=proposal.staff,
            gprl_reason='Initial submission'
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class ProjectProposalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProjectProposal.objects.all().select_related('staff').prefetch_related('logs')
    serializer_class = ProjectProposalSerializer
    lookup_field = 'gpr_id'
    permission_classes = [AllowAny]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Check if status was updated in the request
        if 'status' in request.data:
            new_status = request.data['status']
            reason = request.data.get('reason', 'Status updated')
            date_approved_rejected = timezone.now()
            
            # Create new log entry for status change
            ProjectProposalLog.objects.create(
                gpr=instance,
                gprl_status=new_status,
                gprl_reason=reason,
                gprl_date_approved_rejected=date_approved_rejected,
                gprl_date_submitted=timezone.now(),
                staff=instance.staff
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

class ProjectProposalLogView(generics.ListCreateAPIView):
    serializer_class = ProjectProposalLogSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        gpr_id = self.kwargs.get('gpr_id')
        return ProjectProposalLog.objects.filter(gpr__gpr_id=gpr_id).order_by('-gprl_date_approved_rejected')

class AllProjectProposalLogView(generics.ListAPIView):
    serializer_class = ProjectProposalLogSerializer
    queryset = ProjectProposalLog.objects.all().order_by('-gprl_date_approved_rejected')
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return super().get_queryset().select_related('staff', 'staff__rp__per', 'staff__pos' ,'gpr')

class UpdateProposalStatusView(generics.GenericAPIView):
    serializer_class = ProjectProposalLogSerializer
    permission_classes = [AllowAny]

    def patch(self, request, gpr_id):
        try:
            proposal = ProjectProposal.objects.get(gpr_id=gpr_id)
            status = request.data.get('gprl_status')
            reason = request.data.get('gprl_reason', 'Status updated')  # Default reason if not provided

            if status not in dict(ProjectProposal.STATUS_CHOICES):
                return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

            # Always set gprl_date_approved_rejected for any status change
            date_approved_rejected = timezone.now()

            # Create a new log entry
            ProjectProposalLog.objects.create(
                gpr=proposal,
                gprl_status=status,
                gprl_reason=reason,
                gprl_date_approved_rejected=date_approved_rejected,
                gprl_date_submitted=timezone.now(),  # Set to current time
                staff=request.user.staff if hasattr(request.user, 'staff') else None
            )

            return Response({"message": "Status updated successfully"})
        except ProjectProposal.DoesNotExist:
            return Response({"error": "Proposal not found"})
        
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

class ProjectProposalStatusCountView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        # Base queryset for ProjectProposal
        queryset = ProjectProposal.objects.filter(gpr_is_archive=False)

        # Get the latest log status for each proposal
        latest_logs = ProjectProposalLog.objects.filter(
            gpr_id=OuterRef('gpr_id')
        ).order_by('-gprl_id')
        
        # Annotate queryset with latest_status
        queryset = queryset.annotate(
            latest_status=Subquery(latest_logs.values('gprl_status')[:1])
        )
        
        # Aggregate counts for each status
        status_counts = queryset.aggregate(
            pending=Count('pk', filter=Q(latest_status='Pending')),
            viewed=Count('pk', filter=Q(latest_status='Viewed')),
            amend=Count('pk', filter=Q(latest_status='Amend')),
            resubmitted=Count('pk', filter=Q(latest_status='Resubmitted')),
            approved=Count('pk', filter=Q(latest_status='Approved')),
            rejected=Count('pk', filter=Q(latest_status='Rejected'))
        )

        # Return JSON response with counts
        return Response({
            'pending': status_counts['pending'] or 0,
            'viewed': status_counts['viewed'] or 0,
            'amend': status_counts['amend'] or 0,
            'resubmitted': status_counts['resubmitted'] or 0,
            'approved': status_counts['approved'] or 0,
            'rejected': status_counts['rejected'] or 0
        })
        
class ProjectProposalAvailabilityView(generics.ListAPIView):
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
                        'amount': item.get('price', item.get('gdb_price', 0))
                    }
                    
                    if item_name in recorded_items:
                        recorded_budget_items.append(normalized_item)
                    else:
                        unrecorded_items.append(normalized_item)

                response_data.append({
                    'gpr_id': f"{dev_plan.dev_id}_{project_index}",  # Unique identifier combining dev_id and project index
                    'gpr_title': project_title,
                    'gpr_budget_items': [{
                        'name': item.get('name', item.get('gdb_name', '')),
                        'pax': item.get('pax', item.get('gdb_pax', 1)),
                        'amount': item.get('price', item.get('gdb_price', 0))
                    } for item in budget_items if item.get('name', item.get('gdb_name', ''))],
                    'recorded_items': list(recorded_items),
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