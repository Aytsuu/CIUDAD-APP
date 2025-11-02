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




class NextUFCNumberAPIView(APIView):
    """
    API to get the next available UFC number by finding the latest number and incrementing it by 1
    Returns only the incremented number as a string
    """
    
    def get(self, request):
        """
        GET method to retrieve the next UFC number
        """
        try:
            # Get the latest UFC number (assuming ufc_no is numeric)
            latest_ufc = ChildHealthrecord.objects.exclude(
                ufc_no__isnull=True
            ).exclude(
                ufc_no=''
            ).order_by('-ufc_no').values_list('ufc_no', flat=True).first()
            
            if latest_ufc:
                try:
                    # Convert to integer and increment by 1
                    next_number = int(latest_ufc) + 1
                except (ValueError, TypeError):
                    # If conversion fails, start from 1
                    next_number = 1
            else:
                # If no UFC numbers exist, start from 1
                next_number = 1
            
            # Return just the incremented number as a string
            return Response(str(next_number), status=status.HTTP_200_OK)
            
        except Exception as e:
            # Fallback: return "1" if anything goes wrong
            return Response("1", status=status.HTTP_200_OK)
    
