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
    queryset  =PatientRecord.objects.all()
    
    def create(self , request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class VaccineRecordView(generics.ListCreateAPIView):
    serializer_class = VaccinationRecordSerializer
    queryset  =VaccinationRecord.objects.all()
    
    def create(self , request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class VitalSignsView(generics.ListCreateAPIView):
    serializer_class = VitalSignsSerializer
    queryset  =VitalSigns.objects.all()
    
    def create(self , request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class VaccinationHistoryView(generics.ListCreateAPIView):
    serializer_class = VaccinationHistorySerializer
    queryset  =VaccinationHistory.objects.all()
    
    def create(self , request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class ServicesRecordsView(generics.CreateAPIView):
    serializer_class = ServicesRecordsSerializer
    queryset  =ServicesRecords.objects.all()
    
    def create(self , request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class PatientRecordsView(generics.ListAPIView):
    serializer_class = PatientRecordSerializer
    queryset = PatientRecord.objects.all()
    
        
# View ALl RECORDS
class VaccinationRecordsView(generics.ListAPIView):
    serializer_class = VaccinationRecordsSerializer
    # queryset = VaccinationRecord.objects.all()
    def get_queryset(self):
        return VaccinationRecord.objects.filter(
            serv_id__serv_name='Vaccination'
        ).order_by('serv_id__pat_id').distinct('serv_id__pat_id')
    
   