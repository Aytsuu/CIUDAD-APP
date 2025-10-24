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




class IndivChildHealthHistoryView(generics.ListAPIView):
    serializer_class = ChildHealthrecordSerializerFull

    def get_queryset(self):
        chrec_id = self.kwargs['chrec_id']

        # Prefetch ChildHealth_History and its deep relations
        child_health_history_qs = (
            ChildHealth_History.objects
            .filter(status__in=["recorded", "immunization", "check-up"])
            .select_related('chrec')  # already implied, but safe
            .prefetch_related(
                'child_health_notes',
                'child_health_notes__followv',
                'child_health_notes__staff',
                'child_health_vital_signs',
                'child_health_vital_signs__vital',
                'child_health_vital_signs__bm',
                'child_health_vital_signs__find',
                'child_health_supplements',
                'child_health_supplements__medrec',
                'exclusive_bf_checks',
                'immunization_tracking',
                'immunization_tracking__vachist',
                'supplements_statuses',
            )
        )

        return (
            ChildHealthrecord.objects
            .filter(chrec_id=chrec_id)
            .select_related('patrec', 'staff')
            .prefetch_related(
                Prefetch(
                    'child_health_histories',
                    queryset=child_health_history_qs
                ),
                Prefetch('patrec__patient_disabilities')  # For disabilities
            )
        )
        