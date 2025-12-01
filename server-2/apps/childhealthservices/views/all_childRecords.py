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





class ChildHealthRecordsView(generics.ListAPIView):
    serializer_class = ChildHealthrecordSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        # Subquery to get the latest child health history date for each record
        latest_history_subquery = ChildHealth_History.objects.filter(
            chrec=OuterRef('pk')
        ).order_by('-created_at').values('created_at')[:1]

        # Base queryset with annotations for health history count and latest date
        queryset = ChildHealthrecord.objects.annotate(
            health_checkup_count=Count(
                'child_health_histories',
                distinct=True
            ),
            latest_child_history_date=Subquery(latest_history_subquery)
        ).select_related(
            'patrec__pat_id',
            'patrec__pat_id__rp_id',
            'patrec__pat_id__rp_id__per',
            'patrec__pat_id__trans_id'
        ).prefetch_related(
            'patrec__pat_id__rp_id__per__personal_addresses',
            'patrec__pat_id__rp_id__per__personal_addresses__add',
            'child_health_histories'
        )

        # Order by latest child health history date (most recent first) then by created_at
        queryset = queryset.order_by('-latest_child_history_date', '-created_at')
        
        # Track if any filter is applied
        filters_applied = False
        original_count = queryset.count()
        
        # Combined search (patient name, patient ID, household number, and sitio)
        search_query = self.request.query_params.get('search', '').strip()
        sitio_search = self.request.query_params.get('sitio', '').strip()
        
        # Combine search and sitio parameters
        combined_search_terms = []
        if search_query and len(search_query) >= 2:  # Allow shorter search terms
            combined_search_terms.append(search_query)
        if sitio_search:
            combined_search_terms.append(sitio_search)
        
        if combined_search_terms:
            filters_applied = True
            combined_search = ','.join(combined_search_terms)
            queryset = self._apply_child_search_filter(queryset, combined_search)
            if queryset.count() == 0 and original_count > 0:
                return ChildHealthrecord.objects.none()
        
        # Patient type filter - FIXED: Use correct relationship path
        patient_type_search = self.request.query_params.get('patient_type', '').strip()
        if patient_type_search:
            filters_applied = True
            # Use the correct path: patrec__pat_id__pat_type instead of just pat_type
            if patient_type_search.lower() == 'resident':
                queryset = queryset.filter(patrec__pat_id__pat_type='Resident')
            elif patient_type_search.lower() == 'transient':
                queryset = queryset.filter(patrec__pat_id__pat_type='Transient')
            
            if queryset.count() == 0 and original_count > 0:
                return ChildHealthrecord.objects.none()
        
        return queryset 
    
    def _apply_child_search_filter(self, queryset, search_query):
        """Reusable search filter for child health records with multiple term support"""
        search_terms = [term.strip() for term in search_query.split(',') if term.strip()]
        if not search_terms:
            return queryset
        
        combined_query = Q()
        
        for term in search_terms:
            term_query = Q()
            
            # Search by child/patient name (both resident and transient)
            term_query |= (
                Q(patrec__pat_id__rp_id__per__per_fname__icontains=term) |
                Q(patrec__pat_id__rp_id__per__per_mname__icontains=term) |
                Q(patrec__pat_id__rp_id__per__per_lname__icontains=term) |
                Q(patrec__pat_id__trans_id__tran_fname__icontains=term) |
                Q(patrec__pat_id__trans_id__tran_mname__icontains=term) |
                Q(patrec__pat_id__trans_id__tran_lname__icontains=term)
            )
            
            # Search by patient ID, resident profile ID, and transient ID
            term_query |= (
                Q(patrec__pat_id__pat_id__icontains=term) |
                Q(patrec__pat_id__rp_id__rp_id__icontains=term) |
                Q(patrec__pat_id__trans_id__trans_id__icontains=term)
            )
            
            # Search by family number and UFC number
            term_query |= (
                Q(family_no__icontains=term) |
                Q(ufc_no__icontains=term)
            )
            
            # Search by address for residents
            term_query |= (
                Q(patrec__pat_id__rp_id__per__personal_addresses__add__add_external_sitio__icontains=term) |
                Q(patrec__pat_id__rp_id__per__personal_addresses__add__add_province__icontains=term) |
                Q(patrec__pat_id__rp_id__per__personal_addresses__add__add_city__icontains=term) |
                Q(patrec__pat_id__rp_id__per__personal_addresses__add__add_street__icontains=term) |
                Q(patrec__pat_id__rp_id__per__personal_addresses__add__add_barangay__icontains=term) |
                Q(patrec__pat_id__rp_id__per__personal_addresses__add__sitio__sitio_name__icontains=term)
            )
            
            # Search by address for transients
            term_query |= (
                Q(patrec__pat_id__trans_id__tradd_id__tradd_sitio__icontains=term) |
                Q(patrec__pat_id__trans_id__tradd_id__tradd_street__icontains=term) |
                Q(patrec__pat_id__trans_id__tradd_id__tradd_barangay__icontains=term) |
                Q(patrec__pat_id__trans_id__tradd_id__tradd_province__icontains=term) |
                Q(patrec__pat_id__trans_id__tradd_id__tradd_city__icontains=term)
            )
            
            # Add this term's query to the combined OR query
            combined_query |= term_query
        
        return queryset.filter(combined_query).distinct()
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    