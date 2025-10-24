# Standard library imports
from collections import defaultdict
from datetime import datetime, timedelta
import logging

# Django imports
from django.db.models import (
   OuterRef, Subquery, Q, Prefetch, Count, Subquery
)
from django.db.models.functions import TruncMonth
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

# DRF imports
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

# Local app imports
from ..models import *
from ..serializers import *
from ..utils import *
from apps.patientrecords.models import *
from apps.healthProfiling.models import *
from pagination import *
from apps.inventory.models import * 
from apps.medicalConsultation.utils import apply_patient_type_filter




     
            
class MonthlyNutritionalStatusViewChart(generics.ListAPIView):
    serializer_class = NutritionalStatusSerializerBase
    
    def get_queryset(self):
        """
        Get nutritional status records for a specific month
        Defaults to current month if no parameters provided
        """
        # Get month and year from query parameters
        month = self.request.query_params.get('month', None)
        year = self.request.query_params.get('year', None)
        
        # If no parameters provided, use current month
        if not month or not year:
            current_date = timezone.now()
            month = current_date.month
            year = current_date.year
        
        # Filter by month and year
        queryset = NutritionalStatus.objects.filter(
            created_at__month=month,
            created_at__year=year
        ).order_by('-created_at')
        
        return queryset