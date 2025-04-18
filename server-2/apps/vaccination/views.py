from django.shortcuts import render
from rest_framework import generics, status
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import * 
from datetime import datetime
 
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

class ServicesRecordsView(generics.ListCreateAPIView):
    serializer_class = ServicesRecordsSerializer
    queryset  =ServicesRecords.objects.all()
    
    def create(self , request, *args, **kwargs):
        return super().create(request, *args, **kwargs)