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



        

logger = logging.getLogger(__name__)

class LatestVitalBMAPIView(APIView):
    """
    API to get the latest body measurement and vital signs data for a specific patient
    pat_id is required in the URL path
    """
    
    def get(self, request, pat_id):
        try:
            # Validate that pat_id is provided
            if not pat_id:
                return Response({
                    'success': False,
                    'message': 'Patient ID is required',
                    'data': None
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Build the base queryset with correct relationship chain
            queryset = ChildHealthVitalSigns.objects.select_related(
                'bm',
                'vital',
                'chhist',
                'chhist__chrec',
                'chhist__chrec__patrec',
                'chhist__chrec__patrec__pat_id',
                'chhist__chrec__patrec__pat_id__rp_id',
                'chhist__chrec__patrec__pat_id__rp_id__per',
                'chhist__chrec__patrec__pat_id__trans_id'
            ).filter(
                bm__isnull=False,
                vital__isnull=False,
                chhist__chrec__patrec__pat_id__pat_id=pat_id  # Filter by patient ID from URL
            ).order_by('-created_at')
            
            # Get the latest record for this patient
            latest_record = queryset.first()
            
            if not latest_record:
                return Response({
                    'success': False,
                    'message': f'No vital signs or body measurements found for patient ID: {pat_id}',
                    'data': None
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Debug logging (remove in production)
            logger.info(f"Found latest record for patient {pat_id}")
            logger.info(f"ChildHealthVitalSigns ID: {latest_record.chvital_id}")
            logger.info(f"Record created at: {latest_record.created_at}")
            
            # Serialize the data
            try:
                serializer = LatestVitalBMSerializer(latest_record)
                serialized_data = serializer.data
                
                # Add patient ID to response for confirmation
                serialized_data['queried_patient_id'] = pat_id
                
            except Exception as serializer_error:
                logger.error(f"Serializer error for patient {pat_id}: {serializer_error}")
                return Response({
                    'success': False,
                    'error': f'Serializer error: {str(serializer_error)}',
                    'message': 'Failed to serialize data'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'success': True,
                'message': f'Latest vital signs and body measurements retrieved successfully for patient {pat_id}',
                'data': serialized_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"API error for patient {pat_id}: {e}")
            return Response({
                'success': False,
                'error': str(e),
                'message': f'Failed to retrieve latest vital signs and body measurements for patient {pat_id}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
