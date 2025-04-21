from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import *
from datetime import datetime
from django.db.models import Count, Max, Subquery, OuterRef
from apps.patientrecords.models import Patient,PatientRecord
from apps.patientrecords.serializers import PatientSerializer,PatientRecordSerializer
 

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
    queryset = Patient.objects.all()
 

class PatientRecordWithVaccinationSerializer(PatientRecordSerializer):
    vaccination_records = VaccinationRecordSerializer(
        source='vaccination_records', 
        many=True, 
        read_only=True
    )
    
    class Meta:
        model = PatientRecord
        fields = '__all__'


class VaccinationRecordByPatientView(generics.ListAPIView):
    # serializer_class = VaccinationRecordSerializer

    # def get_queryset(self):
    #     pat_id = self.kwargs['pat_id']
    #     return VaccinationRecord.objects.filter(
    #         patrec_id__pat_id=pat_id
    # )
    serializer_class = VaccinationRecordSerializer


    def get_queryset(self):
            pat_id = self.kwargs['pat_id']
            # Subquery to get the latest vachist_status from VaccinationHistory
            latest_status_subquery = VaccinationHistory.objects.filter(
                vacrec_id=OuterRef('pk')
            ).order_by('-updated_at').values('vachist_status')[:1]

            # Annotate each record with the latest vachist_status
            queryset = VaccinationRecord.objects.filter(
                patrec_id__pat_id=pat_id
            ).annotate(
                latest_status=Subquery(latest_status_subquery)
            ).exclude(
                latest_status='forwarded'
            )
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
    
    
class  DeleteUpdateVitalSignsView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VitalSignsSerializer
    queryset = VitalSigns.objects.all()
    lookup_field = 'vital_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Vital signs record not found."}, status=status.HTTP_404_NOT_FOUND)