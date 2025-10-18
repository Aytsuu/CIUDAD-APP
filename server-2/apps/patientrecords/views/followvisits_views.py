from django.shortcuts import render
from django.db.models import OuterRef, Exists, Q
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Count, Prefetch
from django.http import Http404
from apps.pagination import StandardResultsPagination
from apps.healthProfiling.models import PersonalAddress
from apps.healthProfiling.models import ResidentProfile
from apps.healthProfiling.serializers.resident_profile_serializers import ResidentProfileListSerializer
from apps.patientrecords.utils import get_completed_followup_visits, get_pending_followup_visits

from apps.patientrecords.models import FollowUpVisit

from apps.patientrecords.serializers.followvisits_serializers import FollowUpVisitSerializer, PatientSerializer, FollowUpVisitWithPatientSerializer

      
      
      
class FollowUpVisitView(generics.ListCreateAPIView):
        serializer_class = FollowUpVisitSerializer
        queryset = FollowUpVisit.objects.all()
        
        def create(self, request, *args, **kwargs):
            return super().create(request, *args, **kwargs)

class AllFollowUpVisitsView(generics.ListAPIView):
    """
    API endpoint to get all follow-up visits with patient details
    """
    serializer_class = FollowUpVisitWithPatientSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = FollowUpVisit.objects.select_related(
            'patrec',
            'patrec__pat_id',
            'patrec__pat_id__rp_id',
            'patrec__pat_id__rp_id__per',
            'patrec__pat_id__trans_id'
        ).all( )

        # filtering options 
        params = self.request.query_params
        status = params.get('status')
        search = params.get('search')
        time_frame = params.get('time_frame')

        filters = Q()

        if status and status.lower() not in ['all', '']:
            filters &= Q(followv_status__iexact=status)

        if search:
            search = search.strip()
            if search:
                search_filters = Q()

                search_filters |= (
                    Q(patrec__pat_id__rp_id__per__per_fname__icontains=search) |
                    Q(patrec__pat_id__rp_id__per__per_lname__icontains=search) 
                )

                search_filters |= (
                    Q(patrec__pat_id__trans_id__tran_fname__icontains=search) |
                    Q(patrec__pat_id__trans_id__tran_lname__icontains=search) 
                )

                search_filters |= Q(followv_description__icontains=search)

                filters &= search_filters
        
        if time_frame:
            today = timezone.now().date()
            date_filters = None

            if time_frame == 'today':
                date_filters = Q(followv_date=today)
                
            elif time_frame == 'thisWeek':
                date_filters = Q(
                    followv_date__week=today.isocalendar()[1],
                    followv_date__year=today.year
                )

            elif time_frame == 'thisMonth':
                date_filters = Q(
                    followv_date__month=today.month,
                    followv_date__year=today.year
                )
            if date_filters:
                filters &= date_filters

        if filters:
            queryset = queryset.filter(filters)

        return queryset.order_by('followv_date')


class DeleteUpdateFollowUpVisitView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FollowUpVisitSerializer
    queryset = FollowUpVisit.objects.all()
    lookup_field = 'followv_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Follow-up visit record not found."}, status=status.HTTP_404_NOT_FOUND)


class GetCompletedFollowUpVisits(APIView):
    def get(self, request, pat_id):
        try:
            # Get completed visits using the utility function
            visits = get_completed_followup_visits(pat_id)
            
            # Serialize the data
            serialized_visits = [{
                'id': visit.followv_id,
                'date': visit.followv_date.isoformat(),
                'description': visit.followv_description,
                'status': visit.followv_status,
                'patrec_id': visit.patrec_id,
                'created_at': visit.created_at.isoformat() if visit.created_at else None,
                'completed_at': visit.completed_at.isoformat() if visit.completed_at else None
            } for visit in visits]
            
            response_data = {
                'count': visits.count(),
                'results': serialized_visits
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        


class GetPendingFollowUpVisits(APIView):
    def get(self, request, pat_id):
        try:
            # Get completed visits using the utility function
            visits = get_pending_followup_visits(pat_id)
            
            # Serialize the data
            serialized_visits = [{
                'id': visit.followv_id,
                'date': visit.followv_date.isoformat(),
                'description': visit.followv_description,
                'status': visit.followv_status,
                'patrec_id': visit.patrec_id,
                'created_at': visit.created_at.isoformat() if visit.created_at else None
            } for visit in visits]
            
            response_data = {
                'count': visits.count(),
                'results': serialized_visits
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
