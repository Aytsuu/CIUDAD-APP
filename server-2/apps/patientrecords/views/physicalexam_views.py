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
from ..models import PESection, PEOption, PEResult
from ..serializers.physicalexam_serializers import PESectionSerializer, PEOptionSerializer, PEResultSerializer

class PESectionView(generics.ListCreateAPIView):
    serializer_class = PESectionSerializer
    queryset = PESection.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
         
class PEOptionView(generics.ListCreateAPIView):
    serializer_class = PEOptionSerializer
    queryset = PEOption.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
         

class DeleteUpdatePEOptionView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PEOptionSerializer
    queryset = PEOption.objects.all()
    lookup_field = 'pe_option_id'

    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "PE Option record not found."}, status=status.HTTP_404_NOT_FOUND)
        
        
class PEResultCreateView(generics.ListCreateAPIView):
    queryset = PEResult.objects.all()
    serializer_class = PEResultSerializer

    def create(self, request, *args, **kwargs):
        # Handle array of option IDs
        option_ids = request.data.get('pe_option', [])
        
        # Create results for each option
        results = []
        for option_id in option_ids:
            data = {
                'pe_option': option_id,
                'find': request.data.get('find', 1)
            }
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            results.append(serializer.data)
            
        headers = self.get_success_headers(results)
        return Response(results, status=status.HTTP_201_CREATED, headers=headers)
    
class DeletePEResultByFindingView(APIView):
    def delete(self, request, find_id):
        deleted_count, _ = PEResult.objects.filter(find_id=find_id).delete()
        if deleted_count > 0:
            return Response(
                {"message": f"Deleted {deleted_count} PE result(s)."},
                status=status.HTTP_204_NO_CONTENT
            )
        return Response(
            {"message": "No PE results found for this finding."},
            status=status.HTTP_404_NOT_FOUND
        )