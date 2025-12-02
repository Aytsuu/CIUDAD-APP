# Standard library imports
from collections import defaultdict
from datetime import datetime, timedelta
import logging

# Django imports
from django.db.models import (
   OuterRef, Subquery, Q, Prefetch, Count, Subquery, Window, F
)
from django.db.models.functions import TruncMonth, Rank
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
from pagination import StandardResultsPagination



class IndivChildHealthHistoryView(generics.ListAPIView):
    
    serializer_class = ChildHealthHistoryFullSerializer  # Use serializer for a single history
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        chrec_id = self.kwargs['chrec_id']
        return (
            ChildHealth_History.objects
            .filter(
                chrec_id=chrec_id,
                status__in=["recorded", "immunization", "check-up"]
            )
            .annotate(
                index=Window(
                    expression=Rank(),
                    order_by=F('created_at').asc()
                )
            )
            .select_related('chrec')
            .prefetch_related(
                'child_health_notes',
                'child_health_notes__followv',
                'child_health_notes__staff',
                'child_health_vital_signs',
                'child_health_vital_signs__vital',
                'child_health_vital_signs__bm',
                'child_health_vital_signs__find',
                'child_health_supplements', 
                'child_health_supplements__medreq',
                'exclusive_bf_checks',
                'immunization_tracking',
                'immunization_tracking__vachist',
                'supplements_statuses',
            )
            .order_by('-created_at')
        )
    
        
class IndivChildHealthHistoryCurrentAndPreviousView(generics.ListAPIView):
    serializer_class = ChildHealthrecordSerializerFull
    pagination_class = StandardResultsPagination  # Enable page/page_size

    def get_queryset(self):
        chrec_id = self.kwargs['chrec_id']
        chhist_id = self.kwargs['chhist_id']

        # Prefetch deep relations
        child_health_history_qs = (
            ChildHealth_History.objects
            .filter(status__in=["recorded", "immunization", "check-up"])
            .select_related('chrec')
            .prefetch_related(
                'child_health_notes',
                'child_health_notes__followv',
                'child_health_notes__staff',
                'child_health_vital_signs',
                'child_health_vital_signs__vital',
                'child_health_vital_signs__bm',
                'child_health_vital_signs__find',
                'child_health_supplements',
                'child_health_supplements__medreq',
                'exclusive_bf_checks',
                'immunization_tracking',
                'immunization_tracking__vachist',
                'supplements_statuses',
            )
        )

        # Get current history
        try:
            current_history = ChildHealth_History.objects.get(pk=chhist_id, chrec_id=chrec_id)
        except ChildHealth_History.DoesNotExist:
            current_history = None

        # Get all previous histories (before current's created_at)
        previous_histories = (
            ChildHealth_History.objects
            .filter(
                chrec_id=chrec_id,
                status__in=["recorded", "immunization", "check-up"],
                created_at__lt=current_history.created_at if current_history else None
            )
            .order_by('-created_at')
        )

        # Combine current history with all previous histories
        histories_to_include = list(previous_histories.values_list('pk', flat=True))
        if current_history:
            histories_to_include.append(current_history.pk)

        filtered_history_qs = child_health_history_qs.filter(pk__in=histories_to_include)

        # Return ChildHealthrecord queryset with filtered histories
        return (
            ChildHealthrecord.objects
            .filter(chrec_id=chrec_id)
            .select_related('patrec', 'staff')
            .prefetch_related(
                Prefetch(
                    'child_health_histories',
                    queryset=filtered_history_qs
                ),
                Prefetch('patrec__patient_disabilities')
            )
        )