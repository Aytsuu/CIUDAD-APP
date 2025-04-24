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
from apps.patientrecords.models import VitalSigns



class PatientMedConsultationRecordView(generics.ListAPIView):
    serializer_class = PatientMedConsultationRecordSerializer
    
    def get_queryset(self):
        return Patient.objects.filter(
            patient_records__patrec_type__iexact='Medical Consultation'
        ).annotate(
            medicalrec_count=Count('patient_records')
        ).distinct()
        
        
    
class MedicalConsultationRecordView(generics.ListCreateAPIView):
    serializer_class = MedicalConsultationRecordSerializer
    queryset  =MedicalConsultation_Record.objects.all()