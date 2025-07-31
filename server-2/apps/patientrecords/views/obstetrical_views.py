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
from ..models import Obstetrical_History
from ..serializers.obstetrical_serializers import ObstetricalHistorySerializer
 
# # **Obstetrical History**
class ObstetricalHistoryView(generics.ListCreateAPIView):
    serializer_class = ObstetricalHistorySerializer
    queryset = Obstetrical_History.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

