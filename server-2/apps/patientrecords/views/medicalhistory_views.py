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
from ..models import  MedicalHistory
from ..serializers.medicalhistory_serializers import MedicalHistorySerializer


class MedicalHistoryView(generics.ListCreateAPIView):
    serializer_class = MedicalHistorySerializer
    queryset = MedicalHistory.objects.all()
    
    def create(self, request, *args, **kwargs):
        # Handle single object creation
        if isinstance(request.data, dict):
            return super().create(request, *args, **kwargs)
        
        # Handle multiple object creation
        elif isinstance(request.data, list):
            serializer = self.get_serializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
        return Response({"error": "Invalid data format"}, status=status.HTTP_400_BAD_REQUEST)

class DeleteMedicalHistoryByPatrecView(APIView):
    def delete(self, request, patrec):
        deleted_count, _ = MedicalHistory.objects.filter(patrec=patrec).delete()
        if deleted_count > 0:
            return Response({"message": f"Deleted {deleted_count} medical history record(s)."}, status=status.HTTP_204_NO_CONTENT)
        return Response({"message": "No medical history records found."}, status=status.HTTP_404_NOT_FOUND)
    

    