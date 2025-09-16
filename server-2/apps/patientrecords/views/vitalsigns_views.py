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
from ..serializers.vitalsigns_serializers import VitalSignsSerializer
from ..models import VitalSigns
from ..utils import get_latest_vital_signs

class VitalSignsView(generics.ListCreateAPIView):
    serializer_class = VitalSignsSerializer
    queryset  =VitalSigns.objects.all()
    
class GetLatestVitalSignsView(APIView):
    def get(self, request, pat_id):
        try:
            vital_signs = get_latest_vital_signs(pat_id)
            if vital_signs:
                return Response(vital_signs, status=status.HTTP_200_OK)
            else:
                return Response({"error": "No vital signs found for this patient."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class  DeleteUpdateVitalSignsView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VitalSignsSerializer
    queryset = VitalSigns.objects.all()
    lookup_field = 'vital_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Vital signs record not found."}, status=status.HTTP_404_NOT_FOUND)
       