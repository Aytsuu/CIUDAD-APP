from django.shortcuts import render
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

from ..serializers.followvisits_serializers import FollowUpVisitSerializer, PatientSerializer
      
      
      
class FollowUpVisitView(generics.ListCreateAPIView):
        serializer_class = FollowUpVisitSerializer
        queryset = FollowUpVisit.objects.all()
        
        def create(self, request, *args, **kwargs):
            return super().create(request, *args, **kwargs)

class AllFollowUpVisitsView(APIView):
    """
    API endpoint to get all follow-up visits with patient details
    """
    def get(self, request):
        try:
            # Fetch all follow-up visits with related patient data
            visits = FollowUpVisit.objects.select_related(
                'patrec_id__pat_id__rp_id__per',
                'patrec_id__pat_id__trans_id__tradd_id'
            ).prefetch_related(
                'patrec_id__pat_id__rp_id__per__personaladdress_set__add__sitio',
                'patrec_id__pat_id__rp_id__household_set__add__sitio'
            ).order_by('-followv_date')
            
            # Serialize the data with patient information
            serialized_visits = []
            for visit in visits:
                patient = visit.patrec_id.pat_id
                
                # Get patient serializer data
                patient_serializer = PatientSerializer(patient, context={'request': request})
                patient_data = patient_serializer.data
                
                visit_data = {
                    'followv_id': visit.followv_id,
                    'followv_date': visit.followv_date,
                    'followv_description': visit.followv_description,
                    'followv_status': visit.followv_status,
                    'patrec_id': visit.patrec_id.patrec_id,
                    'created_at': visit.created_at,
                    'updated_at': visit.updated_at,
                    'patient': patient_data,  # Include full patient data
                }
                serialized_visits.append(visit_data)
            
            response_data = {
                'count': len(serialized_visits),
                'results': serialized_visits
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



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
