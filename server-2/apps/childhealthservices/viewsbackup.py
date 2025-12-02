# Standard library imports
from collections import defaultdict
from datetime import datetime, timedelta
import logging

# Django imports
from django.db.models import (
   OuterRef, Subquery, Q, Prefetch, Count, Subquery
)
from django.db.models.functions import TruncMonth
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

# DRF imports
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

# Local app imports
from .models import *
from .serializers import *
from .utils import *
from apps.patientrecords.models import *
from apps.healthProfiling.models import *
from pagination import *
from apps.inventory.models import * 
from apps.medicalConsultation.utils import apply_patient_type_filter





class ChildHealthRecordsView(generics.ListAPIView):
    serializer_class = ChildHealthrecordSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        # Subquery to get the latest child health history date for each record
        latest_history_subquery = ChildHealth_History.objects.filter(
            chrec=OuterRef('pk')
        ).order_by('-created_at').values('created_at')[:1]

        # Base queryset with annotations for health history count and latest date
        queryset = ChildHealthrecord.objects.annotate(
            health_checkup_count=Count(
                'child_health_histories',
                distinct=True
            ),
            latest_child_history_date=Subquery(latest_history_subquery)
        ).select_related(
            'patrec__pat_id',
            'patrec__pat_id__rp_id',
            'patrec__pat_id__rp_id__per',
            'patrec__pat_id__trans_id'
        ).prefetch_related(
            'patrec__pat_id__rp_id__per__personal_addresses',
            'patrec__pat_id__rp_id__per__personal_addresses__add',
            'child_health_histories'
        )

        # Order by latest child health history date (most recent first) then by created_at
        queryset = queryset.order_by('-latest_child_history_date', '-created_at')
        
        # Track if any filter is applied
        filters_applied = False
        original_count = queryset.count()
        
        # Combined search (patient name, patient ID, household number, and sitio)
        search_query = self.request.query_params.get('search', '').strip()
        sitio_search = self.request.query_params.get('sitio', '').strip()
        
        # Combine search and sitio parameters
        combined_search_terms = []
        if search_query and len(search_query) >= 2:  # Allow shorter search terms
            combined_search_terms.append(search_query)
        if sitio_search:
            combined_search_terms.append(sitio_search)
        
        if combined_search_terms:
            filters_applied = True
            combined_search = ','.join(combined_search_terms)
            queryset = self._apply_child_search_filter(queryset, combined_search)
            if queryset.count() == 0 and original_count > 0:
                return ChildHealthrecord.objects.none()
        
        # Patient type filter - FIXED: Use correct relationship path
        patient_type_search = self.request.query_params.get('patient_type', '').strip()
        if patient_type_search:
            filters_applied = True
            # Use the correct path: patrec__pat_id__pat_type instead of just pat_type
            if patient_type_search.lower() == 'resident':
                queryset = queryset.filter(patrec__pat_id__pat_type='Resident')
            elif patient_type_search.lower() == 'transient':
                queryset = queryset.filter(patrec__pat_id__pat_type='Transient')
            
            if queryset.count() == 0 and original_count > 0:
                return ChildHealthrecord.objects.none()
        
        return queryset 
    
    def _apply_child_search_filter(self, queryset, search_query):
        """Reusable search filter for child health records with multiple term support"""
        search_terms = [term.strip() for term in search_query.split(',') if term.strip()]
        if not search_terms:
            return queryset
        
        combined_query = Q()
        
        for term in search_terms:
            term_query = Q()
            
            # Search by child/patient name (both resident and transient)
            term_query |= (
                Q(patrec__pat_id__rp_id__per__per_fname__icontains=term) |
                Q(patrec__pat_id__rp_id__per__per_mname__icontains=term) |
                Q(patrec__pat_id__rp_id__per__per_lname__icontains=term) |
                Q(patrec__pat_id__trans_id__tran_fname__icontains=term) |
                Q(patrec__pat_id__trans_id__tran_mname__icontains=term) |
                Q(patrec__pat_id__trans_id__tran_lname__icontains=term)
            )
            
            # Search by patient ID, resident profile ID, and transient ID
            term_query |= (
                Q(patrec__pat_id__pat_id__icontains=term) |
                Q(patrec__pat_id__rp_id__rp_id__icontains=term) |
                Q(patrec__pat_id__trans_id__trans_id__icontains=term)
            )
            
            # Search by family number and UFC number
            term_query |= (
                Q(family_no__icontains=term) |
                Q(ufc_no__icontains=term)
            )
            
            # Search by address for residents
            term_query |= (
                Q(patrec__pat_id__rp_id__per__personal_addresses__add__add_external_sitio__icontains=term) |
                Q(patrec__pat_id__rp_id__per__personal_addresses__add__add_province__icontains=term) |
                Q(patrec__pat_id__rp_id__per__personal_addresses__add__add_city__icontains=term) |
                Q(patrec__pat_id__rp_id__per__personal_addresses__add__add_street__icontains=term) |
                Q(patrec__pat_id__rp_id__per__personal_addresses__add__add_barangay__icontains=term) |
                Q(patrec__pat_id__rp_id__per__personal_addresses__add__sitio__sitio_name__icontains=term)
            )
            
            # Search by address for transients
            term_query |= (
                Q(patrec__pat_id__trans_id__tradd_id__tradd_sitio__icontains=term) |
                Q(patrec__pat_id__trans_id__tradd_id__tradd_street__icontains=term) |
                Q(patrec__pat_id__trans_id__tradd_id__tradd_barangay__icontains=term) |
                Q(patrec__pat_id__trans_id__tradd_id__tradd_province__icontains=term) |
                Q(patrec__pat_id__trans_id__tradd_id__tradd_city__icontains=term)
            )
            
            # Add this term's query to the combined OR query
            combined_query |= term_query
        
        return queryset.filter(combined_query).distinct()
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
class ChildHealthHistoryView(generics.ListCreateAPIView):
    queryset = ChildHealth_History.objects.all()
    serializer_class = ChildHealthHistorySerializer
    
class CheckUPChildHealthHistoryView(generics.ListAPIView):
    serializer_class = ChildHealthHistoryFullSerializer

    def get_queryset(self):
        return ChildHealth_History.objects.filter(status="check-up").order_by('-created_at')  # Filter by check-up and order by most recent first
    
class ChildHealthImmunizationStatusListView(generics.ListAPIView):
    serializer_class = ChildHealthHistoryFullSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        # Get assigned_to from URL parameters
        assigned_to = self.kwargs.get('assigned_to')
        
        queryset = ChildHealth_History.objects.filter(
            status="immunization",
            assigned_to=assigned_to  # Add the assigned_to filter
        ).order_by('-created_at')
        
        # Get query parameters
        search_query = self.request.query_params.get('search', '')
        patient_type = self.request.query_params.get('patient_type', 'all')
        
        # Apply search filter
        if search_query:
            queryset = queryset.filter(
                Q(chrec__ufc_no__icontains=search_query) |
                Q(chrec__family_no__icontains=search_query) |
                Q(tt_status__icontains=search_query) |
                Q(chrec__patrec__pat_id__rp_id__per__per_lname__icontains=search_query) |
                Q(chrec__patrec__pat_id__rp_id__per__per_fname__icontains=search_query) |
                Q(chrec__patrec__pat_id__trans_id__tran_lname__icontains=search_query) |
                Q(chrec__patrec__pat_id__trans_id__tran_fname__icontains=search_query)
            )
        
        # Apply patient type filter
        if patient_type != 'all':
            if patient_type == 'resident':
                queryset = queryset.filter(chrec__patrec__pat_id__pat_type='Resident')
            elif patient_type == 'transient':
                queryset = queryset.filter(chrec__patrec__pat_id__pat_type='Transient')
        
        return queryset
    
class UpdateChildHealthHistoryView(generics.RetrieveUpdateAPIView):
    queryset = ChildHealth_History.objects.all()
    serializer_class = ChildHealthHistorySerializer
    lookup_field = 'chhist_id'

class PendingMedConChildCountView(APIView):
    def get(self, request, *args, **kwargs):
        count = (
            ChildHealth_History.objects
            .filter(status="check-up")
            .count()
        )
        return Response({"count": count})

class ChildHealthNotesView(generics.ListCreateAPIView):
    queryset = ChildHealthNotes.objects.all()
    serializer_class = ChildHealthNotesSerializer


class ChildHealthNotesUpdateView(generics.RetrieveUpdateAPIView):
    queryset = ChildHealthNotes.objects.all()
    serializer_class = ChildHealthNotesSerializer
 
    def get_object(self):
        chnotes_id = self.kwargs.get("chnotes_id")
        if not chnotes_id:
            raise NotFound(detail="Child health notes ID not provided", code=status.HTTP_400_BAD_REQUEST)
        return get_object_or_404(ChildHealthNotes, chnotes_id=chnotes_id)
class DeleteChildHealthNotesView(generics.DestroyAPIView):
    queryset = ChildHealthNotes.objects.all()
    serializer_class = ChildHealthNotesSerializer
    lookup_field = 'chnotes_id'

    
class ChildHealthSupplementsView(generics.ListCreateAPIView):
    queryset = ChildHealthSupplements.objects.all()
    serializer_class = ChildHealthSupplementsSerializer
    
class ChildHealthSupplementStatusView(generics.ListCreateAPIView):
    queryset = ChildHealthSupplementsStatus.objects.all()
    serializer_class = ChildHealthSupplementStatusSerializer


class UpdateChildHealthSupplementsStatusView(generics.RetrieveUpdateAPIView):
    def patch(self, request, *args, **kwargs):
        data = request.data  # Expecting a list of updates
        if not isinstance(data, list) or not data:
            return Response(
                {"detail": "Expected a non-empty list of updates."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated = []
        errors = []

        for item in data:
            chssupplementstat_id = item.get("chssupplementstat_id")
            date_completed = item.get("date_completed")

            if not chssupplementstat_id:
                errors.append(
                    {
                        "error": "Missing chssupplementstat_id",
                        "item": item,
                    }
                )
                continue

            try:
                instance = ChildHealthSupplementsStatus.objects.get(
                    pk=chssupplementstat_id
                )
            except ChildHealthSupplementsStatus.DoesNotExist:
                errors.append(
                    {
                        "error": f"Record with id {chssupplementstat_id} not found",
                    }
                )
                continue

            # Only include the allowed field(s)
            update_data = {}
            if date_completed is not None:
                update_data["date_completed"] = date_completed
           

            serializer = ChildHealthSupplementStatusSerializer(
                instance, data=update_data, partial=True
            )

            if serializer.is_valid():
                serializer.save()
                updated.append(serializer.data)
            else:
                errors.append(
                    {
                        "id": chssupplementstat_id,
                        "errors": serializer.errors,
                    }
                )

        return Response(
            {
                "updated": updated,
                "errors": errors,
            },
            status=status.HTTP_200_OK,
        )

    

class NutritionalStatusView(generics.ListCreateAPIView):
    serializer_class = NutritionalStatusSerializerBase
    
    def get_queryset(self):
        queryset = NutritionalStatus.objects.all()
        pat_id = self.kwargs.get('pat_id')
        
        if pat_id:
            queryset = queryset.filter(pat_id=pat_id)
        
        return queryset
    


class ChildHealthVitalSignsView(generics.ListCreateAPIView):
    queryset = ChildHealthVitalSigns.objects.all()
    serializer_class = ChildHealthVitalSignsSerializer
    
class UpdateChildHealthVitalSignsView(generics.RetrieveUpdateAPIView):
    queryset = ChildHealthVitalSigns.objects.all()
    serializer_class = ChildHealthVitalSignsSerializer
    lookup_field = 'chvital_id'
    
    
class ChildHealthNutrionalStatusListView(APIView):
    def get(self, request, chrec_id):
        vitals = ChildHealthVitalSigns.objects.filter(
            chhist__chrec_id=chrec_id
        ).order_by('-created_at')

        if not vitals.exists():
            return Response(
                {"detail": "No vital signs found for this child."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ChildHealthVitalSignsSerializerFull(vitals, many=True)
        return Response(serializer.data)
    

class ExclusiveBFCheckView(generics.ListCreateAPIView):
    queryset = ExclusiveBFCheck.objects.all()
    serializer_class = ExclusiveBFCheckSerializer

    def create(self, request, *args, **kwargs):
        chhist_id = request.data.get("chhist")
        bf_dates = request.data.get("BFchecks", [])

        if not chhist_id or not isinstance(bf_dates, list):
            return Response({"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)

        instances = []
        for date in bf_dates:
            instances.append(ExclusiveBFCheck(ebf_date=date, chhist_id=chhist_id))

        ExclusiveBFCheck.objects.bulk_create(instances)

        serializer = self.get_serializer(instances, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ChildHealthImmunizationHistoryView(generics.ListCreateAPIView):
    queryset = ChildHealthImmunizationHistory.objects.all()
    serializer_class = ChildHealthImmunizationHistorySerializer
class DeleteChildHealthImmunizationHistoryView(generics.DestroyAPIView):
    queryset = ChildHealthImmunizationHistory.objects.all()
    serializer_class = ChildHealthImmunizationHistorySerializer
    lookup_field = 'imt_id'

class IndivChildHealthHistoryView(generics.ListAPIView):
    serializer_class = ChildHealthHistoryFullSerializer

    def get_queryset(self):
        chhist_id = self.kwargs['chhist_id']
        return ChildHealth_History.objects.filter(chhist_id=chhist_id, status="recorded").order_by('-created_at')  # Optional: most recent first
    
    
    

class IndivChildHealthHistoryView(generics.ListAPIView):
    serializer_class = ChildHealthrecordSerializerFull

    def get_queryset(self):
        chrec_id = self.kwargs['chrec_id']

        # Prefetch ChildHealth_History and its deep relations
        child_health_history_qs = (
            ChildHealth_History.objects
            .filter(status__in=["recorded", "immunization", "check-up"])
            .select_related('chrec')  # already implied, but safe
            .prefetch_related(
                'child_health_notes',
                'child_health_notes__followv',
                'child_health_notes__staff',
                'child_health_vital_signs',
                'child_health_vital_signs__vital',
                'child_health_vital_signs__bm',
                'child_health_vital_signs__find',
                'child_health_supplements',
                'child_health_supplements__medrec',
                'exclusive_bf_checks',
                'immunization_tracking',
                'immunization_tracking__vachist',
                'supplements_statuses',
            )
        )

        return (
            ChildHealthrecord.objects
            .filter(chrec_id=chrec_id)
            .select_related('patrec', 'staff')
            .prefetch_related(
                Prefetch(
                    'child_health_histories',
                    queryset=child_health_history_qs
                ),
                Prefetch('patrec__patient_disabilities')  # For disabilities
            )
        )
        
class GeChildHealthRecordCountView(APIView):
    def get(self, request, pat_id):
        try:
            count = get_childhealth_record_count(pat_id)
            return Response({'pat_id': pat_id, 'childhealthrecord_count': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
class ChildHealthRecordByPatIDView(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request, pat_id):
        try:
            chrec = ChildHealthrecord.objects.get(
                patrec__pat_id=pat_id,
                patrec__patrec_type="Child Health Record"
            )
        except ChildHealthrecord.DoesNotExist:
            return Response({"detail": "Child health record not found."})

        # Check if pagination parameters are present
        if any(param in request.query_params for param in ['page', 'page_size']):
            # Paginate health histories
            health_histories = chrec.child_health_histories.all().order_by('-created_at')
            paginator = self.pagination_class()
            paginated_histories = paginator.paginate_queryset(health_histories, request)
            
            if paginated_histories is not None:
                # Get the main serialized data
                serializer = ChildHealthrecordSerializerFull(chrec)
                data = serializer.data
                
                # Serialize paginated health histories
                history_serializer = ChildHealthHistorySerializer(paginated_histories, many=True)
                data['child_health_histories'] = history_serializer.data
                
                # Add pagination metadata
                data['health_histories_pagination'] = {
                    'count': paginator.page.paginator.count,
                    'next': paginator.get_next_link(),
                    'previous': paginator.get_previous_link(),
                    'page_size': paginator.page_size,
                    'total_pages': paginator.page.paginator.num_pages,
                    'current_page': paginator.page.number,
                }
                
                return Response(data)

        # Return original response if no pagination requested
        serializer = ChildHealthrecordSerializerFull(chrec)
        return Response(serializer.data)

class ChildHealthImmunizationCountView(APIView):
    def get(self, request, *args, **kwargs):
        count = (
            ChildHealthrecord.objects
            .filter(child_health_histories__status="immunization")
            .distinct()
            .count()
        )
        return Response({"count": count})
   



class ChildHealthPendingFollowUpView(APIView):
    """
    Retrieve pending follow-up visits for a specific child health record (chrec_id)
    using ChildHealthNotesBaseSerializer
    """
    def get(self, request, chrec_id):
        try:
            # Get the child health record
            child_health_record = get_object_or_404(ChildHealthrecord, chrec_id=chrec_id)
            
            # Get ChildHealthNotes for this record that have PENDING follow-up visits
            child_health_notes = ChildHealthNotes.objects.filter(
                chhist__chrec=child_health_record,  # Link through chhist->chrec
                # Only notes with follow-up visits
                followv__followv_status__in=['pending', 'missed']  # Only pending or missed status
            ).select_related('followv', 'staff', 'chhist', 'chhist__chrec')
            
            # Group notes by their follow-up visit
            followups_dict = {}
            
            for note in child_health_notes:
                if note.followv:  # Ensure followv exists
                    followv_id = note.followv.followv_id
                    
                    if followv_id not in followups_dict:
                        # Create follow-up visit entry
                        followup_data = FollowUpVisitSerializerBase(note.followv).data
                        followup_data['child_health_notes'] = []
                        followups_dict[followv_id] = followup_data
                    
                    # Add the note to the follow-up visit using ChildHealthNotesBaseSerializer
                    note_data = ChildHealthNotesBaseSerializer(note).data
                    followups_dict[followv_id]['child_health_notes'].append(note_data)
            
            # Convert dictionary to list
            followups_data = list(followups_dict.values())
            
            # Add notes count to each follow-up
            for followup in followups_data:
                followup['notes_count'] = len(followup['child_health_notes'])
            
            return Response({
                'success': True,
                'chrec_id': chrec_id,
                'pending_followups': followups_data,
                'count': len(followups_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            

class FollowUpVisitUpdateView(APIView):
    """
    Update a specific follow-up visit status
    """
    def patch(self, request, followv_id):
        try:
            # Get the follow-up visit instance
            followup_visit = get_object_or_404(FollowUpVisit, followv_id=followv_id)
            
            # Get the new status from request data
            new_status = request.data.get('followv_status')
            
            # Validate the status
            valid_statuses = ['pending', 'completed','missed']
            if new_status and new_status not in valid_statuses:
                return Response({
                    'success': False,
                    'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update the follow-up visit
            if new_status:
                followup_visit.followv_status = new_status
                
                # Set completed_at if status is changed to 'completed'
                if new_status == 'completed' and not followup_visit.completed_at:
                    followup_visit.completed_at = timezone.now().date()
                
                # Clear completed_at if status is changed from 'completed' to something else
                if new_status != 'completed' and followup_visit.followv_status == 'completed':
                    followup_visit.completed_at = None
            
            # You can also allow updating other fields if needed
            if 'followv_description' in request.data:
                followup_visit.followv_description = request.data.get('followv_description')
            
            if 'followv_date' in request.data:
                followup_visit.followv_date = request.data.get('followv_date')
            
            # Save the changes
            followup_visit.save()
            
            # Return the updated data
            return Response({
                'success': True,
                'message': 'Follow-up visit updated successfully',
                'data': {
                    'followv_id': followup_visit.followv_id,
                    'followv_status': followup_visit.followv_status,
                    'followv_date': followup_visit.followv_date,
                    'followv_description': followup_visit.followv_description,
                    'completed_at': followup_visit.completed_at,
                    'created_at': followup_visit.created_at
                }
            }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)       
            
class MonthlyNutritionalStatusViewChart(generics.ListAPIView):
    serializer_class = NutritionalStatusSerializerBase
    
    def get_queryset(self):
        """
        Get nutritional status records for a specific month
        Defaults to current month if no parameters provided
        """
        # Get month and year from query parameters
        month = self.request.query_params.get('month', None)
        year = self.request.query_params.get('year', None)
        
        # If no parameters provided, use current month
        if not month or not year:
            current_date = timezone.now()
            month = current_date.month
            year = current_date.year
        
        # Filter by month and year
        queryset = NutritionalStatus.objects.filter(
            created_at__month=month,
            created_at__year=year
        ).order_by('-created_at')
        
        return queryset
    

logger = logging.getLogger(__name__)

class LatestVitalBMAPIView(APIView):
    """
    API to get the latest body measurement and vital signs data for a specific patient
    pat_id is required in the URL path
    """
    
    def get(self, request, pat_id):
        try:
            # Validate that pat_id is provided
            if not pat_id:
                return Response({
                    'success': False,
                    'message': 'Patient ID is required',
                    'data': None
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Build the base queryset with correct relationship chain
            queryset = ChildHealthVitalSigns.objects.select_related(
                'bm',
                'vital',
                'chhist',
                'chhist__chrec',
                'chhist__chrec__patrec',
                'chhist__chrec__patrec__pat_id',
                'chhist__chrec__patrec__pat_id__rp_id',
                'chhist__chrec__patrec__pat_id__rp_id__per',
                'chhist__chrec__patrec__pat_id__trans_id'
            ).filter(
                bm__isnull=False,
                vital__isnull=False,
                chhist__chrec__patrec__pat_id__pat_id=pat_id  # Filter by patient ID from URL
            ).order_by('-created_at')
            
            # Get the latest record for this patient
            latest_record = queryset.first()
            
            if not latest_record:
                return Response({
                    'success': False,
                    'message': f'No vital signs or body measurements found for patient ID: {pat_id}',
                    'data': None
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Debug logging (remove in production)
            logger.info(f"Found latest record for patient {pat_id}")
            logger.info(f"ChildHealthVitalSigns ID: {latest_record.chvital_id}")
            logger.info(f"Record created at: {latest_record.created_at}")
            
            # Serialize the data
            try:
                serializer = LatestVitalBMSerializer(latest_record)
                serialized_data = serializer.data
                
                # Add patient ID to response for confirmation
                serialized_data['queried_patient_id'] = pat_id
                
            except Exception as serializer_error:
                logger.error(f"Serializer error for patient {pat_id}: {serializer_error}")
                return Response({
                    'success': False,
                    'error': f'Serializer error: {str(serializer_error)}',
                    'message': 'Failed to serialize data'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'success': True,
                'message': f'Latest vital signs and body measurements retrieved successfully for patient {pat_id}',
                'data': serialized_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"API error for patient {pat_id}: {e}")
            return Response({
                'success': False,
                'error': str(e),
                'message': f'Failed to retrieve latest vital signs and body measurements for patient {pat_id}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class NextUFCNumberAPIView(APIView):
    """
    API to get the next available UFC number by finding the latest number and incrementing it by 1
    Returns only the incremented number as a string
    """
    
    def get(self, request):
        """
        GET method to retrieve the next UFC number
        """
        try:
            # Get the latest UFC number (assuming ufc_no is numeric)
            latest_ufc = ChildHealthrecord.objects.exclude(
                ufc_no__isnull=True
            ).exclude(
                ufc_no=''
            ).order_by('-ufc_no').values_list('ufc_no', flat=True).first()
            
            if latest_ufc:
                try:
                    # Convert to integer and increment by 1
                    next_number = int(latest_ufc) + 1
                except (ValueError, TypeError):
                    # If conversion fails, start from 1
                    next_number = 1
            else:
                # If no UFC numbers exist, start from 1
                next_number = 1
            
            # Return just the incremented number as a string
            return Response(str(next_number), status=status.HTTP_200_OK)
            
        except Exception as e:
            # Fallback: return "1" if anything goes wrong
            return Response("1", status=status.HTTP_200_OK)
    
class ChildHealthTotalCountAPIView(APIView):
    def get(self, request):
        try:
            # Count total unique child health records
            total_records = ChildHealthrecord.objects.count()
            
            return Response({
                'success': True,
                'total_records': total_records
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




# ======================================================
class CompleteChildHealthRecordAPIView(APIView):
    """
    Comprehensive API endpoint that handles ALL child health record operations in one atomic transaction
    """
    
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            
            # Extract all necessary data
            submitted_data = data.get('submittedData', {})
            staff_id = data.get('staff')
            
            # Validate required fields
            if not submitted_data.get('pat_id'):
                return Response({"error": "Patient ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            if submitted_data.get('residenceType') == "Transient" and not submitted_data.get('trans_id'):
                return Response({"error": "Transient ID is required for transient residents"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate all date fields before processing
            date_validation_errors = self._validate_date_fields(submitted_data)
            if date_validation_errors:
                return Response({
                    "error": "Invalid date format(s)",
                    "details": date_validation_errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get staff instance if provided
            staff_instance = None
            if staff_id:
                try:
                    staff_instance = Staff.objects.get(staff_id=staff_id)
                except Staff.DoesNotExist:
                    print(f"Staff with ID {staff_id} not found")
            
            # Handle transient updates if needed
            if submitted_data.get('residenceType') == "Transient":
                self._handle_transient_update(submitted_data)
            
            return self._handle_new_record_creation(submitted_data, staff_instance)
                
        except Exception as e:
            import traceback
            error_traceback = traceback.format_exc()
            print(f"Error occurred: {str(e)}")
            print(f"Traceback: {error_traceback}")
            
            return Response({
                "error": f"An error occurred: {str(e)}",
                "traceback": error_traceback
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _validate_date_fields(self, submitted_data):
        """Validate all date fields in the submitted data"""
        errors = []
        
        # Check newborn_screening date
        newborn_screening = submitted_data.get('newborn_screening')
        if newborn_screening and self._is_invalid_date(newborn_screening):
            errors.append(f"newborn_screening: Invalid date format '{newborn_screening}'")
        
        # Check vital signs dates
        if submitted_data.get('vitalSigns'):
            for i, vital_sign in enumerate(submitted_data['vitalSigns']):
                # Check followUpVisit date
                follow_up_visit = vital_sign.get('followUpVisit')
                if follow_up_visit and self._is_invalid_date(follow_up_visit):
                    errors.append(f"vitalSigns[{i}].followUpVisit: Invalid date format '{follow_up_visit}'")
                
                # Check date field if exists
                date_field = vital_sign.get('date')
                if date_field and self._is_invalid_date(date_field):
                    errors.append(f"vitalSigns[{i}].date: Invalid date format '{date_field}'")
        
        # Check breastfeeding dates
        bf_dates = submitted_data.get('BFchecks', [])
        for i, date in enumerate(bf_dates):
            if self._is_invalid_date(date):
                errors.append(f"BFchecks[{i}]: Invalid date format '{date}'")
        
        # Check supplement status dates
        birthwt_data = submitted_data.get('birthwt', {})
        if birthwt_data:
            seen_date = birthwt_data.get('seen')
            given_iron_date = birthwt_data.get('given_iron')
            if seen_date and self._is_invalid_date(seen_date):
                errors.append(f"birthwt.seen: Invalid date format '{seen_date}'")
            if given_iron_date and self._is_invalid_date(given_iron_date):
                errors.append(f"birthwt.given_iron: Invalid date format '{given_iron_date}'")
        
        anemic_data = submitted_data.get('anemic', {})
        if anemic_data:
            seen_date = anemic_data.get('seen')
            given_iron_date = anemic_data.get('given_iron')
            if seen_date and self._is_invalid_date(seen_date):
                errors.append(f"anemic.seen: Invalid date format '{seen_date}'")
            if given_iron_date and self._is_invalid_date(given_iron_date):
                errors.append(f"anemic.given_iron: Invalid date format '{given_iron_date}'")
        
        return errors
    
    def _is_invalid_date(self, date_value):
        """Check if date value is invalid"""
        if not date_value or not isinstance(date_value, str):
            return False
        
        invalid_patterns = [
            "NaN-NaN-NaN",
            "Invalid Date",
            "null",
            "undefined"
        ]
        
        return any(pattern in date_value for pattern in invalid_patterns)
    
    def _clean_date_value(self, date_value):
        """Clean date value by converting invalid formats to None"""
        if self._is_invalid_date(date_value):
            return None
        return date_value
    
    def _handle_transient_update(self, submitted_data):
        """Handle transient patient information updates"""
        trans_id = submitted_data.get('trans_id')
        if not trans_id:
            return
        
        try:
            transient = Transient.objects.get(trans_id=trans_id)
            
            # Update transient information
            update_fields = [
                'tran_fname', 'tran_lname', 'tran_mname', 'tran_suffix', 'tran_dob',
                'tran_sex', 'tran_status', 'tran_ed_attainment', 'tran_religion', 'tran_contact',
                'mother_fname', 'mother_lname', 'mother_mname', 'mother_age', 'mother_dob',
                'father_fname', 'father_lname', 'father_mname', 'father_age', 'father_dob'
            ]
            
            for field in update_fields:
                if field in submitted_data:
                    # Clean date fields specifically
                    if field.endswith('_dob') and submitted_data.get(field):
                        cleaned_value = self._clean_date_value(submitted_data.get(field))
                        setattr(transient, field, cleaned_value)
                    else:
                        setattr(transient, field, submitted_data.get(field))
            
            transient.save()
            
        except Transient.DoesNotExist:
            raise Exception(f"Transient with ID {trans_id} not found")
    
    def _handle_new_record_creation(self, submitted_data, staff_instance):
        """Handle creation of completely new child health record"""
        
        # Get patient instance
        try:
            patient = Patient.objects.get(pat_id=submitted_data['pat_id'])
        except Patient.DoesNotExist:
            raise Exception(f"Patient with ID {submitted_data['pat_id']} not found")
        
        # Create patient record
        patient_record = PatientRecord.objects.create(
            pat_id=patient,
            patrec_type="Child Health Record"
        )
        
        # Clean newborn_screening date
        newborn_screening = self._clean_date_value(submitted_data.get('newborn_screening'))
        
        # Create child health record
        child_health_record = ChildHealthrecord.objects.create(
            ufc_no=submitted_data.get('ufc_no', ''),
            family_no=submitted_data.get('family_no', ''),
            place_of_delivery_type=submitted_data.get('place_of_delivery_type'),
            pod_location=submitted_data.get('pod_location', ''),
            mother_occupation=submitted_data.get('mother_occupation', ''),
            father_occupation=submitted_data.get('father_occupation', ''),
            birth_order=submitted_data.get('birth_order', 0),
            newborn_screening=newborn_screening,
            staff=staff_instance,
            patrec=patient_record,  
            landmarks=submitted_data.get('landmarks'),
            nbscreening_result=submitted_data.get('nbscreening_result'), 
            newbornInitiatedbf=submitted_data.get('newbornInitiatedbf', False)
        )
        
        # Create child health history
        # Get the staff instance if selectedStaffId is provided
        # This code might need a check:
        assigned_staff = None
        selected_staff_id = submitted_data.get('selectedStaffId')
        if selected_staff_id:  # This checks for truthy values (not None, not empty string)
            try:
                assigned_staff = Staff.objects.get(staff_id=selected_staff_id)
            except Staff.DoesNotExist:
                print(f"Staff with ID {selected_staff_id} does not exist")
       
        # Create the child health history record
        child_health_history = ChildHealth_History.objects.create(
            chrec=child_health_record,
            status=submitted_data.get('status', 'recorded'),
            tt_status=submitted_data.get('tt_status'),
            assigned_to=assigned_staff
        )
        
        # Handle follow-up visit
        followv_id = None
        if submitted_data.get('vitalSigns') and len(submitted_data['vitalSigns']) > 0:
            vital_sign = submitted_data['vitalSigns'][0]
            follow_up_visit_date = self._clean_date_value(vital_sign.get('followUpVisit'))
            
            if follow_up_visit_date:
                follow_up_visit = FollowUpVisit.objects.create(
                    followv_date=follow_up_visit_date,
                    followv_description=vital_sign.get('follov_description', 'Follow Up for Child Health'),
                    patrec=patient_record,
                    followv_status="pending"
                )
                followv_id = follow_up_visit.followv_id
        
        # Create health notes
        if submitted_data.get('vitalSigns') and len(submitted_data['vitalSigns']) > 0:
            vital_sign = submitted_data['vitalSigns'][0]
            if vital_sign.get('notes'):
                ChildHealthNotes.objects.create(
                    chn_notes=vital_sign['notes'],
                    followv_id=followv_id,
                    chhist=child_health_history,
                    staff=staff_instance
                )
        
        # Create body measurements and vital signs
        bmi_id = None
        chvital_id = None
        
        if (submitted_data.get('vitalSigns') and 
            len(submitted_data['vitalSigns']) == 1 and 
            submitted_data['vitalSigns'][0].get('date') and
            submitted_data.get('nutritionalStatus')):
            
            vital_sign = submitted_data['vitalSigns'][0]
            nutritional_status = submitted_data['nutritionalStatus']
            
            # Create body measurement
            body_measurement = BodyMeasurement.objects.create(
                height=vital_sign.get('ht', Decimal('0.00')),
                weight=vital_sign.get('wt', Decimal('0.00')),
                wfa=nutritional_status.get('wfa', ''),
                lhfa=nutritional_status.get('lhfa', ''),
                wfl=nutritional_status.get('wfh', ''),
                muac=str(nutritional_status.get('muac', '')),
                muac_status=nutritional_status.get('muac_status', ''),
                edemaSeverity=submitted_data.get('edemaSeverity', 'none'),
                pat=patient,
                remarks=vital_sign.get('remarks', ''),
                is_opt=vital_sign.get('is_opt', False),
                staff=staff_instance
            )
            bmi_id = body_measurement.bm_id
        
        # Create vital signs
        if submitted_data.get('vitalSigns') and len(submitted_data['vitalSigns']) > 0:
            vital_sign = submitted_data['vitalSigns'][0]
            vital_signs = VitalSigns.objects.create(
                vital_temp=vital_sign.get('temp', ''),
                staff=staff_instance,
                patrec=patient_record
            )
            
            # Create child health vital sign
            child_vital_sign = ChildHealthVitalSigns.objects.create(
                vital=vital_signs,
                bm_id=bmi_id,
                chhist=child_health_history
            )
            chvital_id = child_vital_sign.chvital_id
        
        # Handle breastfeeding dates
        if submitted_data.get('BFchecks'):
            self._handle_breastfeeding_dates(submitted_data['BFchecks'], child_health_history.chhist_id)
        
        # Handle supplement statuses (low birth weight and anemia)
        if submitted_data.get('vitalSigns') and len(submitted_data['vitalSigns']) > 0:
            weight = submitted_data['vitalSigns'][0].get('wt')
            if weight and float(weight) < 2.5 and submitted_data.get('birthwt'):
                self._create_supplement_status(
                    'birthwt', 
                    submitted_data['birthwt'], 
                    child_health_history.chhist_id, 
                    weight
                )
            
            if submitted_data.get('anemic', {}).get('is_anemic'):
                self._create_supplement_status(
                    'anemic', 
                    submitted_data['anemic'], 
                    child_health_history.chhist_id, 
                    weight
                )
        
        # Handle medicines
        if submitted_data.get('medicines'):
            self._handle_medicines(
                submitted_data['medicines'], 
                submitted_data['pat_id'], 
                child_health_history.chhist_id, 
                staff_instance
            )
        
        return Response({
            "success": True,
            "message": "Child health record created successfully",
            "patrec_id": patient_record.patrec_id,
            "chrec_id": child_health_record.chrec_id,
            "chhist_id": child_health_history.chhist_id,
            "chvital_id": chvital_id,
            "followv_id": followv_id
        }, status=status.HTTP_201_CREATED)
    
    def _handle_breastfeeding_dates(self, bf_dates, chhist_id):
        """Handle exclusive breastfeeding check dates"""
        chhist = ChildHealth_History.objects.get(chhist_id=chhist_id)
        
        for bf_data in bf_dates:
            # Extract the ebf_date and type_of_feeding from the object
            if isinstance(bf_data, dict):
                date_value = bf_data.get('ebf_date')
                type_of_feeding = bf_data.get('type_of_feeding')
            else:
                # Handle case where it might be just a date string
                date_value = bf_data
                type_of_feeding = None
            
            # Clean date before creating
            cleaned_date = self._clean_date_value(date_value)
            if cleaned_date:
                ExclusiveBFCheck.objects.create(
                    chhist=chhist,
                    ebf_date=cleaned_date,
                    type_of_feeding=type_of_feeding
                )
    
    def _handle_medicines(self, medicines, pat_id, chhist_id, staff_instance):
        """Handle medicine processing in bulk"""
        if not medicines:
            return
        
        # Get patient and child health history instances
        try:
            patient = Patient.objects.get(pat_id=pat_id)
            chhist = ChildHealth_History.objects.get(chhist_id=chhist_id)
        except (Patient.DoesNotExist, ChildHealth_History.DoesNotExist) as e:
            raise Exception(f"Required instance not found: {str(e)}")
        
        # Create single patient record for all medicines
        patient_record = PatientRecord.objects.create(
            pat_id=patient,
            patrec_type="Medicine Record"
        )
        
        # Process each medicine
        for med in medicines:
            minv_id = med.get('minv_id')
            medrec_qty = med.get('medrec_qty', 0)
            reason = med.get('reason', 'Child Health Supplement')
            
            if not minv_id or medrec_qty <= 0:
                continue
            try:
                # Get medicine inventory
                medicine_inv = MedicineInventory.objects.select_for_update().get(pk=minv_id)
                # Check stock
                if medicine_inv.minv_qty_avail < medrec_qty:
                    raise Exception(f"Insufficient stock for medicine {minv_id}")
                # Create medicine record
                medicine_record = MedicineRecord.objects.create(
                    patrec_id=patient_record,
                    minv_id=medicine_inv,
                    medrec_qty=medrec_qty,
                    reason=reason,
                    requested_at=timezone.now(),
                    fulfilled_at=timezone.now(),
                    staff=staff_instance
                )
                # Update inventory
                medicine_inv.minv_qty_avail -= medrec_qty
                medicine_inv.save()
                
                # Create transaction
                unit = medicine_inv.minv_qty_unit or 'pcs'
                if unit.lower() == 'boxes':
                    mdt_qty = f"{medrec_qty} pcs"
                else:
                    mdt_qty = f"{medrec_qty} {unit}"
                
                MedicineTransactions.objects.create(
                    mdt_qty=mdt_qty,
                    mdt_action="Deducted",
                    staff=staff_instance,
                    minv_id=medicine_inv
                )
                
                # Create child health supplement relationship
                ChildHealthSupplements.objects.create(
                    chhist=chhist,
                    medrec=medicine_record
                )
                
            except MedicineInventory.DoesNotExist:
                raise Exception(f"Medicine inventory {minv_id} not found") 
           
    def _create_supplement_status(self, status_type, status_data, chhist_id, weight):
        """Create supplement status record"""
        chhist = ChildHealth_History.objects.get(chhist_id=chhist_id)
        
        # Clean date fields
        seen_date = self._clean_date_value(status_data.get('seen'))
        given_iron_date = self._clean_date_value(status_data.get('given_iron'))
        
        ChildHealthSupplementsStatus.objects.create(
            status_type=status_type,
            date_seen=seen_date,
            date_given_iron=given_iron_date,
            chhist=chhist,
            birthwt=Decimal(str(weight)) if weight else None,
            date_completed=None
        )



class UpdateChildHealthRecordAPIView(APIView): 
    """
    API endpoint for updating child health records with all related data
    """
    
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        data = request.data
        
        # Extract main parameters
        submitted_data = data.get('submittedData', {})
        staff_id = data.get('staff')
        todays_historical_record = data.get('todaysHistoricalRecord', {})
        original_record = data.get('originalRecord', {})
        
        print("SubmittedData", submitted_data)
        try:
            # Validate required fields
            if not submitted_data.get('pat_id'):
                return Response(
                    {"error": "Patient ID is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if (submitted_data.get('residenceType') == 'Transient' and 
                not submitted_data.get('trans_id')):
                return Response(
                    {"error": "Transient ID is required for transient residents"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get staff instance
            staff_instance = None
            if staff_id:
                try:
                    staff_instance = Staff.objects.get(staff_id=staff_id)
                except Staff.DoesNotExist:
                    print(f"Staff with ID {staff_id} not found, continuing without staff")
            
            # Extract existing IDs
            original_chrec_details = original_record.get('chrec_details', {})
            original_patrec_details = original_chrec_details.get('patrec_details', {})
            
            old_chhist = original_record.get('chhist_id')
            old_chrec_id = original_chrec_details.get('chrec_id')
            old_patrec_id = original_patrec_details.get('patrec_id')
            chnotes_id = todays_historical_record.get('chnotes_id')
            
            # Initialize return variables
            patrec_id = old_patrec_id
            chrec_id = old_chrec_id
            current_chhist_id = old_chhist
            chvital_id = None
            followv_id = None
            bmi_id = None
            
            # FIXED: Check if this is a same-day update using existing chhist_id and its creation date
            is_same_day_update = self._is_same_day_update(old_chhist, todays_historical_record)
            
            if is_same_day_update:
                print(f"Processing same-day update for chhist_id: {old_chhist}")
                result = self._handle_same_day_update(
                    submitted_data, staff_instance, todays_historical_record,
                    original_record, current_chhist_id, chnotes_id, chrec_id
                )
            else:
                print(f"Creating new record - not same day or no existing record")
                result = self._handle_new_record_creation(
                    submitted_data, staff_instance, chrec_id, patrec_id,
                    original_record
                )
                current_chhist_id = result['chhist_id']
                chvital_id = result.get('chvital_id')
                followv_id = result.get('followv_id')
                bmi_id = result.get('bmi_id')
            
            return Response({
                "success": True,
                "message": "Child health record updated successfully",
                "data": {
                    "patrec_id": patrec_id,
                    "chrec_id": chrec_id,
                    "chhist_id": current_chhist_id,
                    "chvital_id": chvital_id,
                    "followv_id": followv_id
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as error:
            print(f"Error updating child health record: {str(error)}")
            return Response({
                "error": f"Failed to update child health record: {str(error)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _is_same_day_update(self, chhist_id, todays_historical_record):
        """
        FIXED: Check if we should update existing record instead of creating new one
        - Check if chhist_id exists and was created today (date only, ignore time)
        """
        if not chhist_id:
            return False
            
        try:
            # Check if the chhist record exists and was created today
            chhist_record = ChildHealth_History.objects.get(chhist_id=chhist_id)
            
            # Extract just the date part (ignore time)
            record_date = chhist_record.created_at.date()
            today = timezone.now().date()
            
            is_today = record_date == today
            print(f"Checking chhist_id {chhist_id}: record_date={record_date}, today={today}, is_same_day={is_today}")
            
            return is_today
            
        except ChildHealth_History.DoesNotExist:
            print(f"ChildHealth_History with id {chhist_id} does not exist")
            return False
        except Exception as e:
            print(f"Error checking same day update: {str(e)}")
            return False
    
    def _is_same_day(self, created_at_str):
        """
        DEPRECATED: This method is no longer used but kept for reference
        Check if the created_at date is the same as today
        """
        try:
            from datetime import datetime
            created_date = datetime.fromisoformat(created_at_str.replace('Z', '+00:00')).date()
            return created_date == timezone.now().date()
        except:
            return False
    
    def _handle_same_day_update(self, submitted_data, staff_instance, 
                        todays_historical_record, original_record, 
                        current_chhist_id, chnotes_id, chrec_id):
        """Handle updates for same-day records"""
        
        print(f"Handling same-day update for chhist_id: {current_chhist_id}")
        
        followv_id = None
        chvital_id = None
        bmi_id = None
        
        # NEW: Check if we should use PATCH for immunization status
        passed_status = submitted_data.get('passed_status')
        use_patch = passed_status == 'immunization'
        
        if use_patch:
            print("Using PATCH method for immunization status update")
            return self._handle_patch_update(
                submitted_data, staff_instance, todays_historical_record,
                original_record, current_chhist_id, chnotes_id, chrec_id
            )
        
        # Original same-day update logic (PUT method)
        if submitted_data.get('vitalSigns') and len(submitted_data['vitalSigns']) > 0:
            vital_sign = submitted_data['vitalSigns'][0]
            
            # Handle body measurements update
            existing_chvital_id = todays_historical_record.get('chvital_id')
            
            # Handle follow-up visit (existing logic)
            original_followv_id = todays_historical_record.get('followv_id')
            follow_up_date = vital_sign.get('followUpVisit')
            follow_up_description = vital_sign.get('follov_description')
            notes_content = vital_sign.get('notes', '').strip()
            
            # Check if there's actual follow-up data
            is_follow_up_data_present = follow_up_date or (follow_up_description and follow_up_description.strip())
            
            # Check if there's actual note content
            has_note_content = notes_content and notes_content != ''
            
            # Only proceed if there's actual content to save
            should_create_or_update_notes = has_note_content or is_follow_up_data_present
            
            if not should_create_or_update_notes:
                # No content to save, skip note creation/update
                print("No note content or follow-up data to save, skipping note operations")
            else:
                # Proceed with note operations only if there's actual content
                if not original_followv_id and is_follow_up_data_present and not chnotes_id:
                    # Create new follow-up visit
                    follow_up = FollowUpVisit.objects.create(
                        followv_date=follow_up_date or timezone.now().date(),
                        created_at=timezone.now(),
                        followv_description=follow_up_description or "Follow Up for Child Health",
                        patrec_id=original_record['chrec_details']['patrec_details']['patrec_id'],
                        followv_status="pending"
                    )
                    followv_id = follow_up.followv_id
                    
                    # Create child health notes only if there's actual content
                    if has_note_content or is_follow_up_data_present:
                        ChildHealthNotes.objects.create(
                            chn_notes=notes_content,
                            created_at=timezone.now(),
                            followv_id=followv_id,
                            chhist_id=current_chhist_id,
                            staff=staff_instance
                        )

                elif has_note_content and not is_follow_up_data_present and not chnotes_id:
                    # Only create notes if there's actual note content
                    ChildHealthNotes.objects.create(
                        chn_notes=notes_content,
                        created_at=timezone.now(),
                        followv_id=followv_id,
                        chhist_id=current_chhist_id,
                        staff=staff_instance
                    )
                    
                elif not original_followv_id and is_follow_up_data_present and chnotes_id:
                    # Create new follow-up visit
                    follow_up = FollowUpVisit.objects.create(
                        followv_date=follow_up_date or timezone.now().date(),
                        created_at=timezone.now(),
                        followv_description=follow_up_description or "Follow Up for Child Health",
                        patrec_id=original_record['chrec_details']['patrec_details']['patrec_id'],
                        followv_status="pending"
                    )
                    followv_id = follow_up.followv_id
                    
                    # Update existing child health notes only if there's content
                    try:
                        notes_instance = ChildHealthNotes.objects.get(chnotes_id=chnotes_id)
                        # Only update if there's actual content or meaningful changes
                        if has_note_content or is_follow_up_data_present:
                            notes_instance.chn_notes = notes_content
                            notes_instance.staff = staff_instance
                            notes_instance.followv_id = followv_id
                            notes_instance.save()  # This will trigger Simple History
                    except ChildHealthNotes.DoesNotExist:
                        # Fallback: create new notes only if there's actual content
                        if has_note_content or is_follow_up_data_present:
                            ChildHealthNotes.objects.create(
                                chn_notes=notes_content,
                                created_at=timezone.now(),
                                followv_id=followv_id,
                                chhist_id=current_chhist_id,
                                staff=staff_instance
                            )
            
                elif chnotes_id:
                    # Update existing notes only if there's meaningful content or changes
                    original_notes = todays_historical_record.get('notes', '').strip()
                    
                    # Check if there's a meaningful difference
                    content_changed = notes_content != original_notes
                    has_meaningful_content = has_note_content or is_follow_up_data_present
                    
                    if content_changed and has_meaningful_content:
                        try:
                            notes_instance = ChildHealthNotes.objects.get(chnotes_id=chnotes_id)
                            notes_instance.chn_notes = notes_content
                            notes_instance.staff = staff_instance
                            notes_instance.save()  # This will trigger Simple History
                            print(f"Updated existing notes: '{notes_content}'")
                        except ChildHealthNotes.DoesNotExist:
                            # Create new notes only if there's actual content
                            if has_meaningful_content:
                                ChildHealthNotes.objects.create(
                                    chn_notes=notes_content,
                                    created_at=timezone.now(),
                                    followv_id=followv_id,
                                    chhist_id=current_chhist_id,
                                    staff=staff_instance
                                )
                    elif not has_meaningful_content and chnotes_id:
                        # If there's no meaningful content but there's an existing note, 
                        # consider if you want to delete it or leave it as is
                        print("No meaningful content to update in existing notes")
        
        # Create child health history
        # Get the staff instance if selectedStaffId is provided
        assigned_staff = None
        selected_staff_id = submitted_data.get('selectedStaffId')
        if selected_staff_id:
            try:
                assigned_staff = Staff.objects.get(staff_id=selected_staff_id)
            except Staff.DoesNotExist:
                raise ValueError(f"Staff with ID {selected_staff_id} does not exist")

        
        # Update child health history status - DON'T CREATE NEW, JUST UPDATE
        ChildHealth_History.objects.filter(chhist_id=current_chhist_id).update(
            status=submitted_data.get('status', 'recorded'),
            assigned_to=assigned_staff
        )
        
        # Update the child health record timestamp
        ChildHealthrecord.objects.filter(chrec_id=chrec_id).update(updated_at=timezone.now())
        
        # Handle other updates (existing logic)
        self._handle_breastfeeding_dates(submitted_data, current_chhist_id, original_record)
        self._handle_medicines(submitted_data, staff_instance, current_chhist_id)
        self._handle_historical_supplement_statuses(submitted_data, original_record)
        
        return {
            "success": True,
            "chvital_id": chvital_id,
            "bmi_id": bmi_id,
            "followv_id": followv_id
        }

    def _handle_patch_update(self, submitted_data, staff_instance, 
                           todays_historical_record, original_record, 
                           current_chhist_id, chnotes_id, chrec_id):
        """Handle PATCH update specifically for immunization status"""
        print("Performing PATCH update for immunization status")
        
        # For PATCH updates, only update specific fields without creating new records
        update_fields = {}
        
        # Update status if provided
        if 'status' in submitted_data:
            update_fields['status'] = submitted_data['status']
        
        # Update assigned staff if provided
        assigned_staff = None
        selected_staff_id = submitted_data.get('selectedStaffId')
        if selected_staff_id:
            try:
                assigned_staff = Staff.objects.get(staff_id=selected_staff_id)
                update_fields['assigned_to'] = assigned_staff
            except Staff.DoesNotExist:
                print(f"Staff with ID {selected_staff_id} not found")
        
        # Only update if there are fields to update
        if update_fields:
            ChildHealth_History.objects.filter(chhist_id=current_chhist_id).update(**update_fields)
            print(f"PATCH updated ChildHealth_History {current_chhist_id} with fields: {list(update_fields.keys())}")
        
        # Update timestamp
        ChildHealthrecord.objects.filter(chrec_id=chrec_id).update(updated_at=timezone.now())
        
        # For PATCH updates, we only handle specific operations:
        # 1. Update supplement statuses if provided
        if 'historicalSupplementStatuses' in submitted_data:
            self._handle_historical_supplement_statuses(submitted_data, original_record)
        
        # 2. Update breastfeeding dates if provided  
        if 'BFchecks' in submitted_data:
            self._handle_breastfeeding_dates(submitted_data, current_chhist_id, original_record)
        
        # 3. Handle medicines if provided (immunization might involve medicine dispensing)
        if 'medicines' in submitted_data:
            self._handle_medicines(submitted_data, staff_instance, current_chhist_id)
        
        # Note: For PATCH, we skip creating new vital signs, notes, or follow-up visits
        # as these are typically not needed for immunization-only updates
        
        return {
            "success": True,
            "chvital_id": None,  # No new vital signs in PATCH
            "bmi_id": None,      # No new BMI in PATCH  
            "followv_id": None   # No new follow-up in PATCH
        }

    def _handle_new_record_creation(self, submitted_data, staff_instance, 
                                chrec_id, patrec_id, original_record):
        """Handle creation of new child health records"""
        # Create child health history
        # Get the staff instance if selectedStaffId is provided
        assigned_staff = None
        selected_staff_id = submitted_data.get('selectedStaffId')
        if selected_staff_id:
            try:
                assigned_staff = Staff.objects.get(staff_id=selected_staff_id)
            except Staff.DoesNotExist:
                raise ValueError(f"Staff with ID {selected_staff_id} does not exist")

        # Create new child health history
        new_chhist = ChildHealth_History.objects.create(
            created_at=timezone.now(),
            chrec_id=chrec_id,
            status=submitted_data.get('status', 'recorded'),
            tt_status=submitted_data.get('tt_status'),
            assigned_to=assigned_staff
        )
        current_chhist_id = new_chhist.chhist_id
        
        followv_id = None
        bmi_id = None
        chvital_id = None
        
        # Get notes and follow-up data
        notes_text = ""
        follow_up_date = None
        follow_up_description = None
        
        if (submitted_data.get('vitalSigns') and 
            len(submitted_data['vitalSigns']) > 0):
            vital_sign = submitted_data['vitalSigns'][0]
            notes_text = vital_sign.get('notes', '').strip()
            follow_up_date = vital_sign.get('followUpVisit')
            follow_up_description = vital_sign.get('follov_description', '').strip()
        
        # Handle follow-up visit if there's actual follow-up data
        has_follow_up_data = follow_up_date or follow_up_description
        if has_follow_up_data:
            follow_up = FollowUpVisit.objects.create(
                followv_date=follow_up_date or timezone.now().date(),
                created_at=timezone.now(),
                followv_description=follow_up_description or 'Follow Up for Child Health',
                patrec_id=patrec_id,
                followv_status="pending"
            )
            followv_id = follow_up.followv_id
        
        # Only create notes if there's actual content (notes or follow-up data)
        has_note_content = notes_text and notes_text != ''
        should_create_notes = has_note_content or has_follow_up_data
        
        if should_create_notes:
            ChildHealthNotes.objects.create(
                chn_notes=notes_text,
                created_at=timezone.now(),
                followv_id=followv_id,
                chhist_id=current_chhist_id,
                staff=staff_instance
            )
            print(f"Created notes with content: '{notes_text}' and follow-up: {bool(followv_id)}")
        else:
            print("No notes created - no meaningful content provided")
        
        # Handle vital signs and body measurements
        if (submitted_data.get('vitalSigns') and 
            len(submitted_data['vitalSigns']) == 1):
            
            vital = submitted_data['vitalSigns'][0]
            
            if (not vital.get('chvital_id') and 
                vital.get('date') and 
                submitted_data.get('nutritionalStatus')):
                
                # Create body measurements
                body_measurement = BodyMeasurement.objects.create(
                    height=Decimal(str(vital.get('ht', 0) or 0)),
                    weight=Decimal(str(vital.get('wt', 0) or 0)),
                    wfa=submitted_data['nutritionalStatus'].get('wfa', ''),
                    lhfa=submitted_data['nutritionalStatus'].get('lhfa', ''),
                    wfl=submitted_data['nutritionalStatus'].get('wfh', ''),
                    muac=str(submitted_data['nutritionalStatus'].get('muac', '')),
                    muac_status=submitted_data['nutritionalStatus'].get('muac_status', ''),
                    edemaSeverity=submitted_data.get('edemaSeverity', 'none'),
                    pat_id=submitted_data['pat_id'],
                    remarks=vital.get('remarks', ''),
                    is_opt=vital.get('is_opt', False),
                    staff=staff_instance
                )
                bmi_id = body_measurement.bm_id
        
        # Handle vital signs creation and child vital sign relationship properly
        if (submitted_data.get('vitalSigns', [{}])[0].get('temp')):
            # Create vital signs
            vital_signs = VitalSigns.objects.create(
                vital_temp=submitted_data['vitalSigns'][0]['temp'],
                staff=staff_instance,
                patrec_id=patrec_id
            )
            
            # Create child vital sign relationship
            child_vital = ChildHealthVitalSigns.objects.create(
                vital=vital_signs,
                bm_id=bmi_id,
                chhist_id=current_chhist_id
            )
            chvital_id = child_vital.chvital_id
        
        # Handle additional data
        self._handle_breastfeeding_dates(submitted_data, current_chhist_id)
        self._handle_low_birth_weight(submitted_data, current_chhist_id)
        self._handle_medicines(submitted_data, staff_instance, current_chhist_id)
        self._handle_anemia(submitted_data, current_chhist_id)
        self._handle_historical_supplement_statuses(submitted_data, original_record)
        
        return {
            "chhist_id": current_chhist_id,
            "chvital_id": chvital_id,
            "followv_id": followv_id,
            "bmi_id": bmi_id
        }
        

        
    def _handle_breastfeeding_dates(self, submitted_data, chhist_id, original_record=None):
        """
        Handle breastfeeding dates creation and updates
        - Creates new BF checks for newly added dates
        - Updates existing BF checks if they've changed
        """
        submitted_bf_checks = submitted_data.get('BFchecks', [])
        
        if not submitted_bf_checks:
            return
        
        print(f"Processing {len(submitted_bf_checks)} BF checks for chhist_id: {chhist_id}")
        
        # Process submitted BF checks
        for bf_check in submitted_bf_checks:
            ebf_id = bf_check.get('ebf_id')
            ebf_date = bf_check.get('ebf_date')
            chhist = bf_check.get('chhist')  # Note: using 'chhist' not 'chhist_id'
            type_of_feeding = bf_check.get('type_of_feeding')  
            if not ebf_date:
                print(f"Skipping BF check {ebf_id} - no ebf_date provided")
                continue
                
            if ebf_id:
                # This is an existing BF check - try to update it
                try:
                    # First check if the record exists and get current data
                    existing_bf = ExclusiveBFCheck.objects.filter(ebf_id=ebf_id).first()
                    
                    if existing_bf:
                        # Check if the date has actually changed
                        if existing_bf.ebf_date != ebf_date:
                            # Update the existing record
                            ExclusiveBFCheck.objects.filter(ebf_id=ebf_id).update(
                                ebf_date=ebf_date,
                                type_of_feeding=type_of_feeding
                            )
                            print(f"Updated BF check {ebf_id}: {existing_bf.ebf_date} -> {ebf_date}")
                        else:
                            print(f"BF check {ebf_id} date unchanged: {ebf_date}")
                   
                except Exception as e:
                    print(f"Error handling BF check {ebf_id}: {str(e)}")
                    continue
            else:
                # This is a new BF check - create it
                try:
                    # Check if a BF check with this date already exists for this chhist_id
                    existing_check = ExclusiveBFCheck.objects.filter(
                        chhist_id=chhist_id,
                        ebf_date=ebf_date,
                        type_of_feeding=type_of_feeding
                    ).first()
                    
                    if existing_check:
                        print(f"BF check for date {ebf_date} already exists with ID {existing_check.ebf_id}")
                    else:
                        new_bf_check = ExclusiveBFCheck.objects.create(
                            chhist_id=chhist_id,
                            ebf_date=ebf_date,
                            type_of_feeding=type_of_feeding
                            
                        )
                        print(f"Created new BF check {new_bf_check.ebf_id} with date: {ebf_date}")
                        
                except Exception as e:
                    print(f"Error creating new BF check for date {ebf_date}: {str(e)}")
                    continue

        
    def _handle_medicines(self, submitted_data, staff_instance, chhist_id):
        """Handle medicine processing"""
        if not submitted_data.get('medicines'):
            return
        
        for med in submitted_data['medicines']:
            try:
                # Get patient
                patient = Patient.objects.get(pat_id=submitted_data['pat_id'])
                
                # Create patient record
                patient_record = PatientRecord.objects.create(
                    pat_id=patient,
                    patrec_type="Medicine Record"
                )
                
                # Create medicine record
                medicine_record = MedicineRecord.objects.create(
                    patrec_id=patient_record,
                    minv_id_id=med['minv_id'],
                    medrec_qty=med['medrec_qty'],
                    reason=med.get('reason', ''),
                    requested_at=timezone.now(),
                    fulfilled_at=timezone.now(),
                    staff=staff_instance
                )
                
                # Update medicine inventory
                self._update_medicine_inventory(
                    med['minv_id'], 
                    med['medrec_qty'], 
                    staff_instance
                )
                
                # Create child health relationship
                ChildHealthSupplements.objects.create(
                    chhist_id=chhist_id,
                    medrec=medicine_record
                )
                
            except Exception as e:
                print(f"Error processing medicine {med.get('minv_id')}: {str(e)}")
                continue
    
    def _update_medicine_inventory(self, minv_id, quantity, staff_instance):
        """Update medicine inventory and create transaction"""
        try:
            medicine_inv = MedicineInventory.objects.select_for_update().get(pk=minv_id)
            
            if medicine_inv.minv_qty_avail < quantity:
                raise Exception(f"Insufficient stock for medicine {minv_id}")
            
            # Update inventory
            medicine_inv.minv_qty_avail -= quantity
            medicine_inv.save()
            
            # Create transaction record if you have this model
            # Uncomment if you have MedicineTransactions model
            # from apps.inventory.models import MedicineTransactions
            # 
            unit = medicine_inv.minv_qty_unit or 'pcs'
            if medicine_inv.minv_qty_unit and medicine_inv.minv_qty_unit.lower() == 'boxes':
                mdt_qty = f"{quantity} pcs"
            else:
                mdt_qty = f"{quantity} {unit}"
            
            MedicineTransactions.objects.create(
                mdt_qty=mdt_qty,
                mdt_action="Deducted",
                staff=staff_instance,
                minv_id=medicine_inv 
            )
            
        except MedicineInventory.DoesNotExist:
            raise Exception(f"Medicine inventory {minv_id} not found")
    
    def _handle_low_birth_weight(self, submitted_data, chhist_id):
        """Handle low birth weight supplement status"""
        if not submitted_data.get('vitalSigns'):
            return
            
        vital_sign = submitted_data['vitalSigns'][0]
        weight = vital_sign.get('wt')
        
        if weight and float(weight) < 2.5:
            birthwt_data = submitted_data.get('birthwt', {})
            if birthwt_data.get('seen') or birthwt_data.get('given_iron'):
                ChildHealthSupplementsStatus.objects.create(
                    status_type='birthwt',
                    date_seen=birthwt_data.get('seen'),
                    date_given_iron=birthwt_data.get('given_iron'), 
                    chhist_id=chhist_id,
                    created_at=timezone.now(),
                    birthwt=Decimal(str(weight)),
                    date_completed=None
                )
    
    def _handle_anemia(self, submitted_data, chhist_id):
        """Handle anemia supplement status"""
        anemic_data = submitted_data.get('anemic', {})
        
        if anemic_data.get('is_anemic'):
            weight = 0
            if (submitted_data.get('vitalSigns') and 
                len(submitted_data['vitalSigns']) > 0):
                weight = submitted_data['vitalSigns'][0].get('wt', 0)
            
            ChildHealthSupplementsStatus.objects.create(
                status_type='anemic',
                date_seen=anemic_data.get('seen'),
                date_given_iron=anemic_data.get('given_iron'),
                chhist_id=chhist_id,
                created_at=timezone.now(),
                birthwt=Decimal(str(weight)) if weight else None,
                date_completed=None
            )
    
    def _handle_historical_supplement_statuses(self, submitted_data, original_record):
        """Handle historical supplement status updates"""
        historical_statuses = submitted_data.get('historicalSupplementStatuses', [])
        if not historical_statuses:
            return
        
        original_statuses = original_record.get('supplements_statuses', [])
        
        updates_to_process = []
        
        for status in historical_statuses:
            if not status.get('chssupplementstat_id'):
                continue
            
            # Find original status for comparison
            original_status = next(
                (s for s in original_statuses 
                 if s.get('chssupplementstat_id') == status['chssupplementstat_id']),
                None
            )
            
            # Check if update is needed
            is_new_record = not original_status
            original_date = original_status.get('date_completed') if original_status else None
            submitted_date = status.get('date_completed')
            
            has_changed = (
                original_date != submitted_date and 
                not (original_date is None and submitted_date is None)
            )
            
            if is_new_record or has_changed:
                updates_to_process.append({
                    'chssupplementstat_id': status['chssupplementstat_id'],
                    'date_completed': submitted_date
                })
        
        # Bulk update
        if updates_to_process:
            try:
                for update in updates_to_process:
                    ChildHealthSupplementsStatus.objects.filter(
                        chssupplementstat_id=update['chssupplementstat_id']
                    ).update(
                        date_completed=update['date_completed']
                    )
                    
                print(f"Successfully updated {len(updates_to_process)} supplement status records")
            except Exception as e:
                print(f"Supplement status update failed: {str(e)}")
                raise Exception(f"Failed to update supplement statuses: {str(e)}")
     
     
        
      
      
# CHILD IMMUNIZAION  
class SaveImmunizationDataAPIView(APIView):
    
    def post(self, request):
        """
        Handle saving immunization data with rollback on error
        """
        try:
            data = request.data
            
            # Extract parameters
            form_data = data.get('data', {})
            vaccines = data.get('vaccines', [])
            existing_vaccines = data.get('existingVaccines', [])
            child_health_record = data.get('ChildHealthRecord', {})
            staff_id = data.get('staff_id')
            pat_id = data.get('pat_id')
            vital_id=data.get('vital_id')
            
            # Validation
            if not pat_id:
                return Response(
                    {"error": "Patient ID is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if there's anything to process
            has_vaccines = len(vaccines) > 0
            has_existing_vaccines = len(existing_vaccines) > 0
            has_notes = bool(form_data.get('notes', '').strip())
            has_follow_up = bool(form_data.get('followUpVisit', '').strip())
            
            if not (has_vaccines or has_existing_vaccines or has_notes or has_follow_up):
                return Response(
                    {"message": "No changes have been made"}, 
                    status=status.HTTP_200_OK
                )
            
            # Start transaction with savepoint
            with transaction.atomic():
                created_records = self.save_immunization_data(
                    form_data, vaccines, existing_vaccines, 
                    child_health_record, staff_id, pat_id,vital_id
                )
                
                return Response({
                    "message": "Immunization data saved successfully",
                    "created_records": created_records
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {"error": f"Failed to save immunization data: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def save_immunization_data(self, form_data, vaccines, existing_vaccines, child_health_record, staff_id, pat_id,vital_id):
        """
        Save immunization data with proper transaction handling
        """
        created_records = {
            'patrec_ids': [],
            'vacrec_ids': [],
            'vachist_ids': [],
            'imt_ids': [],
            'followv_ids': [],
            'antigen_transaction_ids': [],
            'notes_updated': False
        }
        
        # Get required data
        chhist_id = child_health_record.get('record', {}).get('chhist_id')
        patrec_id = child_health_record.get('record', {}).get('chrec_details', {}).get('patrec_details', {}).get('patrec_id')
        
        if not chhist_id:
            raise ValueError("Child health history ID is required")
        
        # Get staff instance if provided
        staff_instance = None
        if staff_id:
            try:
                staff_instance = Staff.objects.get(staff_id=staff_id)
            except Staff.DoesNotExist:
                raise ValueError(f"Staff with ID {staff_id} not found")
        
        # Get child health history instance
        try:
            chhist_instance = ChildHealth_History.objects.get(chhist_id=chhist_id)
        except ChildHealth_History.DoesNotExist:
            raise ValueError(f"Child health history with ID {chhist_id} not found")
        
        # Handle follow-up visit creation if needed
        followv_instance = None
        if form_data.get('followUpVisit', '').strip() or form_data.get('follov_description', '').strip():
            if not patrec_id:
                raise ValueError("Patient record ID is required for follow-up visit")
            
            try:
                patrec_instance = PatientRecord.objects.get(patrec_id=patrec_id)
                followv_instance = FollowUpVisit.objects.create(
                    followv_date=self.parse_date(form_data.get('followUpVisit')),
                    followv_description=form_data.get('follov_description', 'Vaccination Follow-up'),
                    patrec=patrec_instance,
                    followv_status='pending'
                )
                created_records['followv_ids'].append(followv_instance.followv_id)
            except PatientRecord.DoesNotExist:
                raise ValueError(f"Patient record with ID {patrec_id} not found")
        
        # Handle notes creation/update
        if form_data.get('notes', '').strip():
            self.handle_notes(
                chhist_instance, 
                form_data.get('notes'), 
                followv_instance, 
                staff_instance,
                created_records
            )
        
        # Process new vaccines
        for vaccine in vaccines:
            self.process_new_vaccine(
                vaccine, child_health_record, staff_instance, 
                pat_id, patrec_id, chhist_instance, created_records,vital_id
            )
        
        # Process existing vaccines
        for existing_vaccine in existing_vaccines:
            self.process_existing_vaccine(
                existing_vaccine, child_health_record, staff_instance, 
                pat_id, chhist_instance, created_records,vital_id
            )
        
        # Update child health history status
        chhist_instance.status = 'recorded'
        chhist_instance.save()
        
        return created_records
    
    def handle_notes(self, chhist_instance, notes_text, followv_instance, staff_instance, created_records):
        """
        Handle notes creation or update
        """
        # Check if notes already exist for this child health history
        existing_notes = ChildHealthNotes.objects.filter(chhist=chhist_instance).first()
        
        if existing_notes:
            # Update existing notes
            existing_notes.chn_notes = notes_text
            if followv_instance:
                existing_notes.followv = followv_instance
            if staff_instance:
                existing_notes.staff = staff_instance
            existing_notes.save()
            created_records['notes_updated'] = True
        else:
            # Create new notes
            ChildHealthNotes.objects.create(
                chn_notes=notes_text,
                chhist=chhist_instance,
                followv=followv_instance,
                staff=staff_instance
            )
    
    def process_new_vaccine(self, vaccine, child_health_record, staff_instance, pat_id, patrec_id, chhist_instance, created_records,vital_id):
        """
        Process a new vaccine administration
        """
        # Handle existing follow-up update if needed
        if vaccine.get('existingFollowvId'):
            try:
                existing_followv = FollowUpVisit.objects.get(followv_id=vaccine['existingFollowvId'])
                existing_followv.followv_status = 'completed'
                existing_followv.completed_at = date.today()
                existing_followv.save()
            except FollowUpVisit.DoesNotExist:
                pass
        
        # Get vaccine stock data
        vaccine_stock = None
        if vaccine.get('vacStck_id'):
            try:
                vaccine_stock = VaccineStock.objects.get(vacStck_id=vaccine['vacStck_id'])
            except VaccineStock.DoesNotExist:
                raise ValueError(f"Vaccine stock with ID {vaccine['vacStck_id']} not found")
        
        vaccine_type = vaccine_stock.vac_id.vac_type_choices if vaccine_stock else 'routine'
        current_dose = int(vaccine.get('dose', 1))
        total_doses = int(vaccine.get('totalDoses', 1))
        
        # Update vaccine stock if needed
        if vaccine_stock:
            if vaccine_stock.vacStck_qty_avail <= 0:
                raise ValueError(f"Insufficient vaccine stock for {vaccine_stock.vac_id.vac_name}")
            
            vaccine_stock.vacStck_qty_avail -= 1
            vaccine_stock.save()
            
            # Create antigen transaction
            antigen_transaction = AntigenTransaction.objects.create(
                antt_qty='1',
                antt_action='dispensed',
                vacStck_id=vaccine_stock,
                staff=staff_instance
            )
            created_records['antigen_transaction_ids'].append(antigen_transaction.antt_id)
        
        # Create new records if needed
        vacrec_id = vaccine.get('vacrec')
        if (vaccine_type != 'routine' and current_dose == 1) or not vacrec_id:
            # Create patient record
            patient_instance = get_object_or_404(Patient, pat_id=pat_id)
            patient_record = PatientRecord.objects.create(
                pat_id=patient_instance,
                patrec_type='Vaccination Record',
                # Note: staff field doesn't exist in PatientRecord model based on your schema
            )
            created_records['patrec_ids'].append(patient_record.patrec_id)
            
            # Create vaccination record
            vaccination_record = VaccinationRecord.objects.create(
                patrec_id=patient_record,
                vacrec_totaldose=total_doses
            )
            created_records['vacrec_ids'].append(vaccination_record.vacrec_id)
            vacrec_id = vaccination_record.vacrec_id
        else:
            vaccination_record = get_object_or_404(VaccinationRecord, vacrec_id=vacrec_id)
        
        # Handle follow-up for vaccine
        vaccine_followv_instance = None
        is_routine = vaccine_type == 'routine'
        is_last_dose = current_dose >= total_doses
        
        if vaccine.get('nextFollowUpDate') and (is_routine or not is_last_dose):
            if not patrec_id:
                raise ValueError("Patient record ID is required for vaccine follow-up")
            
            patrec_instance = get_object_or_404(PatientRecord, patrec_id=patrec_id)
            vaccine_followv_instance = FollowUpVisit.objects.create(
                followv_date=self.parse_date(vaccine.get('nextFollowUpDate')),
                followv_description=f"{vaccine.get('vac_name', 'Vaccine')} Follow-up",
                patrec=patrec_instance,
                followv_status='pending'
            )
            created_records['followv_ids'].append(vaccine_followv_instance.followv_id)
        
        # Get vital signs
        vital_instance = None
        vital_signs = vital_id
        if vital_signs :
            try:
                vital_instance = VitalSigns.objects.get(vital_id=vital_id)
            except VitalSigns.DoesNotExist:
                pass
        
        # Create vaccination history
        vaccination_history = VaccinationHistory.objects.create(
            vacrec=vaccination_record,
            vacStck_id=vaccine_stock,
            vachist_doseNo=current_dose,
            vachist_status='completed',
            vital=vital_instance,
            staff=staff_instance,
            followv=vaccine_followv_instance,
            date_administered=self.parse_date(vaccine.get('date')) or date.today()
        )
        created_records['vachist_ids'].append(vaccination_history.vachist_id)
        
        # Create immunization record
        immunization_record = ChildHealthImmunizationHistory.objects.create(
            vachist=vaccination_history,
            chhist=chhist_instance,
            hasExistingVaccination=False
        )
        created_records['imt_ids'].append(immunization_record.imt_id)
    
    def process_existing_vaccine(self, existing_vaccine, child_health_record, staff_instance, pat_id, chhist_instance, created_records,vital_id):
        """
        Process an existing vaccine record
        """
        vaccine_type = existing_vaccine.get('vaccineType', 'routine')
        current_dose = int(existing_vaccine.get('dose', 1))
        total_doses = int(existing_vaccine.get('totalDoses', 1))
        
        # Create new records if needed
        vacrec_id = existing_vaccine.get('vacrec')
        if (vaccine_type != 'routine' and current_dose == 1) or not vacrec_id:
            # Create patient record
            patient_instance = get_object_or_404(Patient, pat_id=pat_id)
            patient_record = PatientRecord.objects.create(
                pat_id=patient_instance,
                patrec_type='Vaccination Record'
            )
            created_records['patrec_ids'].append(patient_record.patrec_id)
            
            # Create vaccination record
            vaccination_record = VaccinationRecord.objects.create(
                patrec_id=patient_record,
                vacrec_totaldose=total_doses
            )
            created_records['vacrec_ids'].append(vaccination_record.vacrec_id)
            vacrec_id = vaccination_record.vacrec_id
        else:
            vaccination_record = get_object_or_404(VaccinationRecord, vacrec_id=vacrec_id)
        
        #
        
        # Get vaccine list instance
        vaccine_instance = None
        if existing_vaccine.get('vac_id'):
            try:
                from apps.inventory.models import VaccineList
                vaccine_instance = VaccineList.objects.get(vac_id=existing_vaccine['vac_id'])
            except:
                pass
        
        # Create vaccination history
        vaccination_history = VaccinationHistory.objects.create(
            vacrec=vaccination_record,
            vac=vaccine_instance,
            vachist_doseNo=current_dose,
            vachist_status='completed',
            vital=None,
            staff=staff_instance,
            followv=None,
            date_administered=self.parse_date(existing_vaccine.get('date')) or date.today()
        )
        created_records['vachist_ids'].append(vaccination_history.vachist_id)
        
        # Create immunization record
        immunization_record = ChildHealthImmunizationHistory.objects.create(
            vachist=vaccination_history,
            chhist=chhist_instance,
            hasExistingVaccination=True
        )
        created_records['imt_ids'].append(immunization_record.imt_id)
    
    def parse_date(self, date_string):
        """
        Parse date string to date object
        """
        if not date_string:
            return None
        
        try:
            if isinstance(date_string, str):
                return datetime.strptime(date_string, '%Y-%m-%d').date()
            return date_string
        except ValueError:
            return None