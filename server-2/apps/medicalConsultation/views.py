from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import *
from datetime import datetime
from django.db.models import Count, Max, Subquery, OuterRef, Q, F
from apps.patientrecords.models import Patient,PatientRecord
from apps.patientrecords.serializers import PatientSerializer,PatientRecordSerializer
from apps.patientrecords.models import *


from django.db.models import Count, Q

class PatientMedConsultationRecordView(generics.ListAPIView):
    serializer_class = PatientMedConsultationRecordSerializer

    def get_queryset(self):
        return Patient.objects.annotate(
            medicalrec_count=Count(
                'patient_records__medical_consultation_record',
                filter=Q(
                    patient_records__medical_consultation_record__medrec_status='completed'
                ),
                distinct=True  # ✅ Prevents overcounting due to join duplicates
            )
        ).filter(
            patient_records__medical_consultation_record__medrec_status='completed'
        ).distinct()


    # USE FOR ADDING MEDICAL RECORD
class MedicalConsultationRecordView(generics.CreateAPIView):
    serializer_class = MedicalConsultationRecordSerializer
    queryset  =MedicalConsultation_Record.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    

class ViewMedicalConsultationRecordView(generics.ListAPIView):
    serializer_class = MedicalConsultationRecordSerializer
    def get_queryset(self):
        pat_id = self.kwargs['pat_id']
        return MedicalConsultation_Record.objects.filter(
            patrec__pat_id=pat_id,
            medrec_status='completed'  # ✅ Filter for completed status
        ).order_by('-created_at')


    
class PendingPatientMedConsultationRecordView(generics.ListAPIView):
    serializer_class = MedicalConsultationRecordSerializer

    def get_queryset(self):
        return MedicalConsultation_Record.objects.filter(
            medrec_status='pending'
        ).order_by('-created_at')


class ViewMedicalWithPendingRecordView(generics.ListAPIView):
    serializer_class = MedicalConsultationRecordSerializer
    def get_queryset(self):
        pat_id = self.kwargs['pat_id']
        return MedicalConsultation_Record.objects.filter(
            patrec__pat_id=pat_id
        ).order_by('-created_at')

