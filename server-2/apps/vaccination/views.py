from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import *
from datetime import datetime
from django.db.models import Count
 
 
class PatientRecordView(generics.ListCreateAPIView):
    serializer_class = PatientRecordSerializer
    queryset  =PatientRecordSample.objects.all()
   
class VaccineRecordView(generics.ListCreateAPIView):
    serializer_class = VaccinationRecordSerializer
    queryset  =VaccinationRecord.objects.all()
   
   
class VitalSignsView(generics.ListCreateAPIView):
    serializer_class = VitalSignsSerializer
    queryset  =VitalSigns.objects.all()
   
   
class VaccinationHistoryView(generics.ListCreateAPIView):
    serializer_class = VaccinationHistorySerializer
    queryset  =VaccinationHistory.objects.all()
   
   
class ServicesRecordsView(generics.CreateAPIView):
    serializer_class = ServicesRecordsSerializer
    queryset  =ServicesRecords.objects.all()
   


class PatientRecordView(generics.ListCreateAPIView):
    queryset = PatientRecordSample.objects.all()
    serializer_class = PatientRecordSerializer
   
   
   
# View ALl RECORDS
# class PatientVaccinationRecordsView(generics.ListAPIView):
#     serializer_class = ServicesRecordsSerializer
#     queryset = ServicesRecords.objects.all()
   
#     def get_queryset(self):
#         return ServicesRecords.objects.filter(
#     serv_name__iexact='Vaccination'
#     ).order_by('pat_id').distinct('pat_id')





class PatientVaccinationRecordsView(generics.ListAPIView):
    serializer_class = PatientWithVaccinationSerializer

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