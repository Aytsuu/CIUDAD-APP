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



class VaccineRecordView(generics.ListCreateAPIView):
    serializer_class = VaccinationRecordSerializer
    queryset  =VaccinationRecord.objects.all()
   
   
class VitalSignsView(generics.ListCreateAPIView):
    serializer_class = VitalSignsSerializer
    queryset  =VitalSigns.objects.all()
   
   
class VaccinationHistoryView(generics.ListCreateAPIView):
    serializer_class = VaccinationHistorySerializer
    queryset  =VaccinationHistory.objects.all()
class PatientVaccinationRecordsView(generics.ListAPIView):
    serializer_class = PatientVaccinationRecordSerializer
    
    def get_queryset(self):
        return Patient.objects.filter(
        Q(patient_records__patrec_type__iexact='Vaccination'),
        Q(patient_records__vaccination_records__vacrec_status__iexact='completed') |
        Q(patient_records__vaccination_records__vacrec_status__iexact='partially vaccinated')
            ).distinct()



class PatientRecordWithVaccinationSerializer(PatientRecordSerializer):
    vaccination_records = VaccinationRecordSerializer(
        source='vaccination_records', 
        many=True, 
        read_only=True
    )
    
    class Meta:
        model = PatientRecord
        fields = '__all__'

# INDIVIDUAL RECORDS VIEW
class VaccinationHistorRecordView(generics.ListAPIView):
    serializer_class = VaccinationHistorySerializer

    def get_queryset(self):
        pat_id = self.kwargs['pat_id']
        return VaccinationHistory.objects.filter(
            vacrec__patrec_id__pat_id=pat_id
        ).exclude(
            vacrec__vacrec_status='forwarded'
        ).order_by('-created_at')  # Optional: latest first
    
    
# class VaccinationRecordByPatientView(generics.ListAPIView):
#     serializer_class = VaccinationRecordSerializer

#     def get_queryset(self):
#         pat_id = self.kwargs['pat_id']

#         # Subquery to get the latest updated_at for each vacrec_id
#         latest_updated_at = VaccinationRecord.objects.filter(
#         patrec_id=OuterRef('patrec_id'),
#         patrec_id__pat_id=pat_id
#         ).order_by('-updated_at').values('updated_at')[:1]


#         # Annotate VaccinationRecord with latest updated_at
#         queryset = VaccinationRecord.objects.filter(
#         patrec_id__pat_id=pat_id
#         ).annotate(
#             latest_updated_at=Subquery(latest_updated_at)
#         ).exclude(
#             updated_at=F('latest_updated_at'),
#             vacrec_status='forwarded'
#         ).order_by('-latest_updated_at')

#         return queryset


    # UPDATE DELETE
class DeleteUpdateVaccinationRecordView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VaccinationRecordSerializer
    queryset = VaccinationRecord.objects.all()
    lookup_field = 'vacrec_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Vaccination record not found."}, status=status.HTTP_404_NOT_FOUND)
    
    
# class  DeleteUpdateVitalSignsView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = VitalSignsSerializer
#     queryset = VitalSigns.objects.all()
#     lookup_field = 'vital_id'
    
#     def get_object(self):
#         try:
#             return super().get_object()
#         except NotFound:
#             return Response({"error": "Vital signs record not found."}, status=status.HTTP_404_NOT_FOUND)


class DeleteUpdateVaccinationHistoryView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VaccinationHistorySerializer
    queryset = VaccinationHistory.objects.all()
    lookup_field = 'vachist_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Vaccination history record not found."}, status=status.HTTP_404_NOT_FOUND)