from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from .models import *
from .serializers import *
from django.db.models import OuterRef, Subquery, Count, Q
from django.apps import apps
from django.utils import timezone

class DevelopmentBudgetItemsView(generics.ListAPIView):
    queryset = DevelopmentBudget.objects.all()
    serializer_class = DevelopmentBudgetSerializer 

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'data': serializer.data,
            'count': queryset.count()
        })

class GAD_Budget_TrackerView(generics.ListCreateAPIView):
    serializer_class = GAD_Budget_TrackerSerializer

    def get_queryset(self):
        year = self.kwargs.get('year')
        if not year:
            raise NotFound("Year parameter is required")
        
        return GAD_Budget_Tracker.objects.filter(
            gbudy__gbudy_year=year,
            # gbud_is_archive=False
        ).select_related('gbudy', 'gdb', 'staff').prefetch_related('files')
    
    def perform_create(self, serializer):
        serializer.save(
            # gbud_datetime=timezone.now(),
            staff=getattr(self.request.user, 'staff', None)  # Safely get staff or None
        )
    
class GAD_Budget_TrackerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = GAD_Budget_Tracker.objects.all()
    serializer_class = GAD_Budget_TrackerSerializer
    lookup_field = 'gbud_num'

    def get_queryset(self):
        return super().get_queryset().select_related('gbudy', 'gdb', 'staff').prefetch_related('files')

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

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.gbud_is_archive = False
        instance.save()
        return Response(status=status.HTTP_200_OK)

class GAD_Budget_YearView(generics.ListCreateAPIView):
    queryset = GAD_Budget_Year.objects.all()
    serializer_class = GADBudgetYearSerializer

class GADBudgetFileView(generics.ListCreateAPIView):
    queryset = GAD_Budget_File.objects.all()
    serializer_class = GADBudgetFileSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        gbud_num = self.request.data.get('gbud')
        try:
            budget_tracker = GAD_Budget_Tracker.objects.get(gbud_num=gbud_num)
            serializer.save(gbud=budget_tracker)
        except GAD_Budget_Tracker.DoesNotExist:
            raise serializers.ValidationError("Invalid budget tracker ID")
    
    def delete(self, request, *args, **kwargs):
        gbf_ids = request.data.get('gbf_ids', [])
        gbud_num = request.data.get('gbud_num')
        
        if not gbf_ids:
            return Response({"detail": "No file IDs provided"}, status=400)

        try:
            # Verify files belong to the specified budget entry
            files_to_delete = GAD_Budget_File.objects.filter(
                gbf_id__in=gbf_ids,
                gbud__gbud_num=gbud_num
            )
            
            # Delete files from storage first
            for file in files_to_delete:
                if file.gbf_path:  # If using storage like S3 or local
                    default_storage.delete(file.gbf_path)
            
            # Then delete DB records
            count = files_to_delete.delete()[0]
            
            return Response({
                "detail": f"Successfully deleted {count} files",
                "deleted_ids": gbf_ids
            }, status=200)
            
        except Exception as e:
            return Response({
                "detail": f"Error deleting files: {str(e)}",
                "error": True
            }, status=400)

class GADBudgetFileDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = GAD_Budget_File.objects.all()
    serializer_class = GADBudgetFileSerializer

class ProjectProposalView(generics.ListCreateAPIView):
    serializer_class = ProjectProposalSerializer

    def get_queryset(self):
        queryset = ProjectProposal.objects.all().select_related('staff')

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
            queryset = queryset.filter(latest_status=status_filter)
            
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

    def get_queryset(self):
        gpr_id = self.kwargs.get('gpr_id')
        return ProjectProposalLog.objects.filter(gpr__gpr_id=gpr_id).order_by('-gprl_date_approved_rejected')

class AllProjectProposalLogView(generics.ListAPIView):
    serializer_class = ProjectProposalLogSerializer
    queryset = ProjectProposalLog.objects.all().order_by('-gprl_date_approved_rejected')
    
    def get_queryset(self):
        return super().get_queryset().select_related('staff', 'staff__rp__per', 'staff__pos' ,'gpr')

class UpdateProposalStatusView(generics.GenericAPIView):
    serializer_class = ProjectProposalLogSerializer

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
    
    def get_queryset(self):
        return self.queryset.filter(gpr_id=self.kwargs['proposal_id'])
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        try:
            context['proposal'] = ProjectProposal.objects.get(pk=self.kwargs['proposal_id'])
        except ProjectProposal.DoesNotExist:
            raise Response("Project proposal not found")
        return context

    def perform_create(self, serializer):
        # Ensure gpr_id is set from URL parameter
        serializer.save(gpr_id=self.kwargs['proposal_id'])
    
    def perform_destroy(self, instance):
        """Soft delete by archiving"""
        instance.psd_is_archive = True
        instance.save() 

class ProposalSuppDocDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProposalSuppDocSerializer
    queryset = ProposalSuppDoc.objects.all()
    lookup_field = 'psd_id'
    
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

    def perform_update(self, serializer):
        serializer.save(gpr_is_archive=True)

class ProjectProposalRestoreView(generics.UpdateAPIView):
    queryset = ProjectProposal.objects.filter(gpr_is_archive=True)
    serializer_class = ProjectProposalSerializer
    lookup_field = 'gpr_id'
 
    def perform_update(self, serializer):
        serializer.save(gpr_is_archive=False)

class ProjectProposalStatusCountView(generics.GenericAPIView):
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
        print("Status Counts:", status_counts)
        # Return JSON response with counts
        return Response({
            'pending': status_counts['pending'] or 0,
            'viewed': status_counts['viewed'] or 0,
            'amend': status_counts['amend'] or 0,
            'resubmitted': status_counts['resubmitted'] or 0,
            'approved': status_counts['approved'] or 0,
            'rejected': status_counts['rejected'] or 0
        })