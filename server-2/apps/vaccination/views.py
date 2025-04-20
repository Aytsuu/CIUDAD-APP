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

        # Use Subquery to get the latest created_at from VaccinationHistory for each VaccinationRecord
        return VaccinationRecord.objects.filter(
            patrec_id__pat_id=pat_id
        ).annotate(
            latest_history_updated_at=Subquery(
                VaccinationHistory.objects.filter(
                    vacrec_id=OuterRef('patrec_id')  # Referencing the current VaccinationRecord's id
                ).order_by('-updated_at').values('updated_at')[:1]  # Get the most recent created_at
            )
        ).order_by('-latest_history_updated_at')  # Order by the latest `created_at` of the related histories
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