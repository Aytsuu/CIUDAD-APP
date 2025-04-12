from django.shortcuts import render
from rest_framework import generics
from .serializers.base import *
from .models import *

class ARView(generics.ListCreateAPIView):
  serializer_class = ARSerializer
  queryset = AcknowledgementReport.objects.all()

class ARFView(generics.ListCreateAPIView):
  serializer_class = ARFSerializer
  queryset = AcknowledgementReportFile.objects.all()