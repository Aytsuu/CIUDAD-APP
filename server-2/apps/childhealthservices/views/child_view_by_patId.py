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





        
class ChildHealthRecordByPatIDView(APIView):
    pagination_class = StandardResultsPagination
    
    def get(self, request, pat_id):
        try:
            chrec = ChildHealthrecord.objects.get(
                patrec__pat_id=pat_id,
                patrec__patrec_type="Child Health Record"
            )
        except ChildHealthrecord.DoesNotExist:
            return Response({"detail": "Child health record not found."})

        # Check if pagination parameters are present
        if any(param in request.query_params for param in ['page', 'page_size']):
            # Paginate health histories
            health_histories = chrec.child_health_histories.all().order_by('-created_at')
            paginator = self.pagination_class()
            paginated_histories = paginator.paginate_queryset(health_histories, request)
            
            if paginated_histories is not None:
                # Get the main serialized data
                serializer = ChildHealthrecordSerializerFull(chrec)
                data = serializer.data
                
                # Serialize paginated health histories
                history_serializer = ChildHealthHistorySerializer(paginated_histories, many=True)
                data['child_health_histories'] = history_serializer.data
                
                # Add pagination metadata
                data['health_histories_pagination'] = {
                    'count': paginator.page.paginator.count,
                    'next': paginator.get_next_link(),
                    'previous': paginator.get_previous_link(),
                    'page_size': paginator.page_size,
                    'total_pages': paginator.page.paginator.num_pages,
                    'current_page': paginator.page.number,
                }
                
                return Response(data)

        # Return original response if no pagination requested
        serializer = ChildHealthrecordSerializerFull(chrec)
        return Response(serializer.data)



