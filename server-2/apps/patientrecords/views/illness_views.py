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
from ..models import  Illness
from ..serializers.illness_serializers import IllnessSerializer

class IllnessView(generics.ListCreateAPIView):
    serializer_class = IllnessSerializer
    queryset = Illness.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class DeleteUpdateIllnessView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IllnessSerializer
    queryset = Illness.objects.all()
    lookup_field = 'ill_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Illness record not found."}, status=status.HTTP_404_NOT_FOUND)

class PHIllnessAPIView(APIView):
    """
    API view to get all illnesses with PH-1 to PH-20 codes without serializer
    """
    
    def get(self, request):
        try:
            # Generate the list of PH codes from PH-1 to PH-20
            ph_codes = [f'PH-{i}' for i in range(1, 21)]
            
            # Get illnesses with these specific codes, ordered by ill_code
            illnesses = Illness.objects.filter(ill_code__in=ph_codes).order_by('ill_code')
            
            # Convert queryset to list of dictionaries
            illness_data = []
            for illness in illnesses:
                illness_data.append({
                    'ill_id': illness.ill_id,
                    'illname': illness.illname,
                    'ill_description': illness.ill_description,
                    'ill_code': illness.ill_code,
                    'created_at': illness.created_at.isoformat() if illness.created_at else None
                })
            
            # Return successful response
            return Response({
                'status': 'success',
                'message': 'PH illnesses retrieved successfully',
                'count': len(illness_data),
                'data': illness_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Return error response if something goes wrong
            return Response({
                'status': 'error',
                'message': 'Failed to retrieve PH illnesses',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)