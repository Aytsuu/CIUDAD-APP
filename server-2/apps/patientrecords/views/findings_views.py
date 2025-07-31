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
from ..models import Finding
from ..serializers.findings_serializers import FindingSerializer

class FindingView(generics.ListCreateAPIView):
    serializer_class = FindingSerializer
    queryset = Finding.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class DeleteUpdateFindingView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FindingSerializer
    queryset = Finding.objects.all()
    lookup_field = 'find_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Finding record not found."}, status=status.HTTP_404_NOT_FOUND)
