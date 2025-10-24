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


    
class ChildHealthHistoryView(generics.ListCreateAPIView):
    queryset = ChildHealth_History.objects.all()
    serializer_class = ChildHealthHistorySerializer
    
class CheckUPChildHealthHistoryView(generics.ListAPIView):
    serializer_class = ChildHealthHistoryFullSerializer

    def get_queryset(self):
        return

class UpdateChildHealthHistoryView(generics.RetrieveUpdateAPIView):
    queryset = ChildHealth_History.objects.all()
    serializer_class = ChildHealthHistorySerializer
    lookup_field = 'chhist_id'

class PendingMedConChildCountView(APIView):
    def get(self, request, *args, **kwargs):
        count = (
            ChildHealth_History.objects
            .filter(status="check-up")
            .count()
        )
        return Response({"count": count})

class ChildHealthNotesView(generics.ListCreateAPIView):
    queryset = ChildHealthNotes.objects.all()
    serializer_class = ChildHealthNotesSerializer


class ChildHealthNotesUpdateView(generics.RetrieveUpdateAPIView):
    queryset = ChildHealthNotes.objects.all()
    serializer_class = ChildHealthNotesSerializer
 
    def get_object(self):
        chnotes_id = self.kwargs.get("chnotes_id")
        if not chnotes_id:
            raise NotFound(detail="Child health notes ID not provided", code=status.HTTP_400_BAD_REQUEST)
        return get_object_or_404(ChildHealthNotes, chnotes_id=chnotes_id)
        
class DeleteChildHealthNotesView(generics.DestroyAPIView):
    queryset = ChildHealthNotes.objects.all()
    serializer_class = ChildHealthNotesSerializer
    lookup_field = 'chnotes_id'

    
class ChildHealthSupplementsView(generics.ListCreateAPIView):
    queryset = ChildHealthSupplements.objects.all()
    serializer_class = ChildHealthSupplementsSerializer
    
class ChildHealthSupplementStatusView(generics.ListCreateAPIView):
    queryset = ChildHealthSupplementsStatus.objects.all()
    serializer_class = ChildHealthSupplementStatusSerializer

 
class NutritionalStatusView(generics.ListCreateAPIView):
    serializer_class = NutritionalStatusSerializerBase
    
    def get_queryset(self):
        queryset = NutritionalStatus.objects.all()
        pat_id = self.kwargs.get('pat_id')
        
        if pat_id:
            queryset = queryset.filter(pat_id=pat_id)
        
        return queryset
    
class ChildHealthVitalSignsView(generics.ListCreateAPIView):
    queryset = ChildHealthVitalSigns.objects.all()
    serializer_class = ChildHealthVitalSignsSerializer
    
class UpdateChildHealthVitalSignsView(generics.RetrieveUpdateAPIView):
    queryset = ChildHealthVitalSigns.objects.all()
    serializer_class = ChildHealthVitalSignsSerializer
    lookup_field = 'chvital_id'
    
    
class ChildHealthNutrionalStatusListView(APIView):
    def get(self, request, chrec_id):
        vitals = ChildHealthVitalSigns.objects.filter(
            chhist__chrec_id=chrec_id
        ).order_by('-created_at')

        if not vitals.exists():
            return Response(
                {"detail": "No vital signs found for this child."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ChildHealthVitalSignsSerializerFull(vitals, many=True)
        return Response(serializer.data)
    
class ExclusiveBFCheckView(generics.ListCreateAPIView):
    queryset = ExclusiveBFCheck.objects.all()
    serializer_class = ExclusiveBFCheckSerializer

    def create(self, request, *args, **kwargs):
        chhist_id = request.data.get("chhist")
        bf_dates = request.data.get("BFchecks", [])

        if not chhist_id or not isinstance(bf_dates, list):
            return Response({"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)

        instances = []
        for date in bf_dates:
            instances.append(ExclusiveBFCheck(ebf_date=date, chhist_id=chhist_id))

        ExclusiveBFCheck.objects.bulk_create(instances)

        serializer = self.get_serializer(instances, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ChildHealthImmunizationHistoryView(generics.ListCreateAPIView):
    queryset = ChildHealthImmunizationHistory.objects.all()
    serializer_class = ChildHealthImmunizationHistorySerializer

class DeleteChildHealthImmunizationHistoryView(generics.DestroyAPIView):
    queryset = ChildHealthImmunizationHistory.objects.all()
    serializer_class = ChildHealthImmunizationHistorySerializer
    lookup_field = 'imt_id'


        
class GeChildHealthRecordCountView(APIView):
    def get(self, request, pat_id):
        try:
            count = get_childhealth_record_count(pat_id)
            return Response({'pat_id': pat_id, 'childhealthrecord_count': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        