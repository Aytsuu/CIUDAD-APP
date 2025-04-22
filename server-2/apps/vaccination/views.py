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
        return PatientRecordSample.objects.all()

# class PatientVaccinationRecordsView(generics.ListAPIView):
#     serializer_class = PatientRecordSerializer


#     def get_queryset(self):
#         return PatientRecord.objects.filter(
#             services__serv_name__iexact='Vaccination'
#         ).distinct()
       
# View ALl RECORDS
class InvPatientVaccinationRecordsView(generics.ListAPIView):
    serializer_class = PatientRecordSerializer
    lookup_field = 'pat_id'


    def get_queryset(self):
        # Using filter to return all records for the given pat_id and vaccination service
        return PatientRecordSample.objects.filter(
            services__serv_name__iexact='Vaccination',  # Filter by service name
            pat_id=self.kwargs['pat_id']  # Filter by patient ID
        )

