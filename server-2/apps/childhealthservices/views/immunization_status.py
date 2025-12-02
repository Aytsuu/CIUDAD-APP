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




class ChildHealthImmunizationStatusListView(generics.ListAPIView):
    serializer_class = ChildHealthHistoryFullSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        # Get assigned_to from URL parameters
        assigned_to = self.kwargs.get('assigned_to')
        
        queryset = ChildHealth_History.objects.filter(
            status="immunization",
            assigned_to=assigned_to  # Add the assigned_to filter
        ).order_by('-created_at')
        
        # Get query parameters
        search_query = self.request.query_params.get('search', '')
        patient_type = self.request.query_params.get('patient_type', 'all')
        
        # Apply search filter
        if search_query:
            queryset = queryset.filter(
                Q(chrec__ufc_no__icontains=search_query) |
                Q(chrec__family_no__icontains=search_query) |
                Q(tt_status__icontains=search_query) |
                Q(chrec__patrec__pat_id__rp_id__per__per_lname__icontains=search_query) |
                Q(chrec__patrec__pat_id__rp_id__per__per_fname__icontains=search_query) |
                Q(chrec__patrec__pat_id__trans_id__tran_lname__icontains=search_query) |
                Q(chrec__patrec__pat_id__trans_id__tran_fname__icontains=search_query)
            )
        
        # Apply patient type filter
        if patient_type != 'all':
            if patient_type == 'resident':
                queryset = queryset.filter(chrec__patrec__pat_id__pat_type='Resident')
            elif patient_type == 'transient':
                queryset = queryset.filter(chrec__patrec__pat_id__pat_type='Transient')
        
        return queryset