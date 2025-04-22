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
        # Get patients who have at least one vaccination record that's not "forwarded"
        return Patient.objects.filter(
            patient_records__patrec_type__iexact='Vaccination'
        ).exclude(
            patient_records__vaccination_records__vaccination_histories__vachist_status__iexact='forwarded'
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
class VaccinationRecordByPatientView(generics.ListAPIView):
    serializer_class = VaccinationRecordSerializer

    def get_queryset(self):
        pat_id = self.kwargs['pat_id']

        # Subquery to get the latest updated_at for each vacrec_id
        latest_updated_at = VaccinationHistory.objects.filter(
            vacrec_id=OuterRef('pk'),
            vacrec_id__patrec_id__pat_id=pat_id
        ).order_by('-updated_at').values('updated_at')[:1]

        # Annotate VaccinationRecord with latest updated_at
        queryset = VaccinationRecord.objects.filter(
            patrec_id__pat_id=pat_id
        ).annotate(
            latest_updated_at=Subquery(latest_updated_at)
        ).exclude(
            vaccination_histories__updated_at=F('latest_updated_at'),
            vaccination_histories__vachist_status='forwarded'
        ).order_by('-latest_updated_at')

        return queryset


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