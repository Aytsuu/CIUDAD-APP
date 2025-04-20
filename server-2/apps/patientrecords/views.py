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
    queryset = PatientRecord.objects.all()

