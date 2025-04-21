from django.shortcuts import render
from rest_framework import generics, status
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializer import *
from datetime import datetime

# Create your views here.

# **Prenatal Record**
class PrenatalFormView(generics.ListCreateAPIView):
    serializer_class = PrenatalFormSerializer
    queryset = Prenatal_Form.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
# **Obstetrical History**
class ObstetricalHistoryView(generics.ListCreateAPIView):
    serializer_class = ObstetricalHistorySerializer
    queryset = Obstetrical_History.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

# **Previous Hospitalization
class PreviousHospitalizationView(generics.ListCreateAPIView):
    serializer_class = PreviousHospitalizationSerializer
    queryset = Previous_Hospitalization.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
# **Previous Pregnancy**
class PreviousPregnancyView(generics.ListCreateAPIView):
    serializer_class = PreviousPregnancySerializer
    queryset = Previous_Pregnancy.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

# **TT Status**
class TTStatusView(generics.ListCreateAPIView):
    serializer_class = TTStatusSerializer
    queryset = TT_Status.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
# **Lab Result Dates**
class LabResultDatesView(generics.ListCreateAPIView):
    serializer_class = LabResultSerializer
    queryset = Lab_Result_Dates.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)