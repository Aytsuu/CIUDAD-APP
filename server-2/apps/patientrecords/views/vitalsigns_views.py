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

class VitalSignsView(generics.ListCreateAPIView):
    serializer_class = VitalSignsSerializer
    queryset  =VitalSigns.objects.all()
   
class  DeleteUpdateVitalSignsView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VitalSignsSerializer
    queryset = VitalSigns.objects.all()
    lookup_field = 'vital_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Vital signs record not found."}, status=status.HTTP_404_NOT_FOUND)
       