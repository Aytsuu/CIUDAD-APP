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
from ..utils import *
from ..models import FollowUpVisit

from ..serializers.followvisits_serializers import FollowUpVisitSerializer, PatientSerializer, FollowUpVisitWithPatientSerializer
      
      
      
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
        ).all(  )

        # filtering options 
        status = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        time_frame = self.request.query_params.get('time_frame')

        if status and status != 'All':
            queryset = queryset.filter(followv_status=status)
        
        if search:
            queryset = queryset.filter(
                Q(patrec__pat_id__rp_id__per__per_fname__icontains=search) |
                Q(patrec__pat_id__rp_id__per__per_lname__icontains=search) |
                Q(patrec__pat_id__trans_id__tran_fname__icontains=search) |
                Q(patrec__pat_id__trans_id__tran_lname__icontains=search) |
                Q(followv_description__icontains=search)
            )
        
        if time_frame:
            today = timezone.now().date()

            if time_frame == 'today':
                queryset = queryset.filter(followv_date=today)
                
            elif time_frame == 'thisWeek':
                start_week = today - timedelta(days=today.weekday()) # Monday 
                end_week = start_week + timedelta(days=6) # Sunday
                queryset = queryset.filter(followv_date__range=[start_week, end_week])

            elif time_frame == 'thisMonth':
                start_month = today.replace(day=1)
                if today.month == 12:
                    end_month = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
                else:
                    end_month = today.replace(month=today.month + 1, day=1) - timedelta(days=1)

                queryset = queryset.filter(
                    followv_date__range=[start_month, end_month]
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
