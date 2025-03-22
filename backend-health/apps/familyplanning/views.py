<<<<<<< HEAD
from django.shortcuts import render
from rest_framework import generics,status
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import *


class ObstetricalView(generics.ListCreateAPIView):
    serializer_class = ObstetricalSerializer
    queryset = ObstetricalHistory.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
# class ObstetricalDeliverView(generics.DestroyAPIView):
#     serializer_class = ObstetricalSerializer
#     queryset = ObstetricalHistory.objects.all()
    
#     def delete(self, request, *args, **kwargs):
#         return super().delete(request, *args, **kwargs)

class RiskStiView(generics.ListCreateAPIView):
    serializer_class = RiskStiSerializer
    queryset = RiskSti.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class RiskVawView(generics.ListCreateAPIView):
    serializer_class = RiskVawSerializer
    queryset = RiskVaw.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class PhysicalExamView(generics.ListCreateAPIView):
    serializer_class = PhysicalExamSerializer
    queryset = PhysicalExamination.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class AcknowledgementView(generics.ListCreateAPIView):
    serializer_class = AcknowledgementSerializer
    queryset = Acknowledgement.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
=======
from rest_framework import generics
from .models import Acknowledgement
from .serializers import *

class AcknowledgementView(generics.ListCreateAPIView):
    queryset = Acknowledgement.objects.all()
    serializer_class = AcknowledgementSerializer

class RiskVawView(generics.ListCreateAPIView):
    serializer_class = RiskVawSerializer
    queryset = Risk_vaw.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
>>>>>>> eac5b29bec182701333af109425eb1c2c4d6e7d9
