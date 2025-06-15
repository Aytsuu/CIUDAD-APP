from django.shortcuts import render
from rest_framework import generics
from django.db.models import Q
from .serializers import *

class PatientMedicineRecordsView(generics.ListAPIView):
    serializer_class = PatientMedicineRecordSerializer
    
    def get_queryset(self):
        return Patient.objects.filter(
        Q(patient_records__patrec_type__iexact='Medicine Request') ,
        ).distinct()

class IndividualMedicineRecordView(generics.ListCreateAPIView):
    serializer_class = MedicineRecordSerialzer
    def get_queryset(self):
        pat_id = self.kwargs['pat_id']
        return MedicineRecord.objects.filter(
            patrec_id__pat_id=pat_id,
            status='Recorded',
            is_archived=False
        ).order_by('-fulfilled_at')  # Optional: latest first
