from django.shortcuts import render
from django.db.models import OuterRef, Exists
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from datetime import datetime
from django.db.models import Count, Prefetch
from django.http import Http404
from apps.healthProfiling.models import PersonalAddress
from apps.healthProfiling.models import ResidentProfile
from apps.healthProfiling.serializers.resident_profile_serializers import ResidentProfileListSerializer
from ..utils import *
from ..models import FollowUpVisit

from ..serializers.followvisits_serializers import FollowUpVisitSerializer, PatientSerializer, FollowUpVisitWithPatientSerializer
      
      
      
class FollowUpVisitView(generics.ListCreateAPIView):
        serializer_class = FollowUpVisitSerializer
        queryset = FollowUpVisit.objects.all()
        
        def create(self, request, *args, **kwargs):
            return super().create(request, *args, **kwargs)

class AllFollowUpVisitsView(APIView):
    """
    API endpoint to get all follow-up visits with patient details
    """
    serializer_class = FollowUpVisitWithPatientSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = FollowUpVisit.objects.select_related('patrec').all()

        # filtering options 
        status = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        time_frame = self.request.query_params.get('time_frame')

        if status and status != 'All':
            queryset = queryset.filter(followv_status=status)
        
        if search:
            queryset = queryset.filter(
                Q(patient__per_fname__icontains=search) |
                Q(patient__per_lname__icontains=search) |
                Q(followv_description__icontains=search)
            )
        
        if time_frame:
            today = timezone.now()

            if time_frame == 'today':
                queryset =queryset.filter(followv_date__date=today)
            elif time_frame == 'thisWeek':
                start_week = today -timedelta(days=today.weekday())
                end_week = start_week + timedelta(days=6)
                queryset =queryset.filter(followv_date__range=[start_week, end_week])
            elif time_frame == 'thisMonth':
                queryset = queryset.filter(
                    followv_date__year=today.year,
                    followv_date__month=today.month
                )
        return queryset.order_by('-followv_date')



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
                'updated_at': visit.updated_at.isoformat() if visit.updated_at else None
            } for visit in visits]
            
            response_data = {
                'count': visits.count(),
                'results': serialized_visits
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        


class GetPendingFollowUpVisits(APIView):
    def get(self, request, patrec_id):
        try:
            # Get completed visits using the utility function
            visits = get_pending_followup_visits(patrec_id)
            
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
