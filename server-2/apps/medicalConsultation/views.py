from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from datetime import datetime
from django.db.models import Count, Max, Subquery, OuterRef, Q, F
from apps.patientrecords.models import Patient,PatientRecord
from apps.patientrecords.serializers.patients_serializers import PatientSerializer,PatientRecordSerializer
from apps.patientrecords.models import *
from .utils import get_medcon_record_count
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
class UpdateMedicalConsultationRecordView(generics.UpdateAPIView):
    serializer_class = MedicalConsultationRecordSerializer
    queryset = MedicalConsultation_Record.objects.all()
    lookup_field = 'medrec_id'

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
        
        
class GetMedConCountView(APIView):
    
    def get(self, request, pat_id):
        try:
            count = get_medcon_record_count(pat_id)
            return Response({'pat_id': pat_id, 'medcon_count': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class PendingMedConCountView(APIView):
    def get(self, request, *args, **kwargs):
        count = (
            MedicalConsultation_Record.objects
            .filter(medrec_status="pending")
            .count()
        )
        return Response({"count": count})