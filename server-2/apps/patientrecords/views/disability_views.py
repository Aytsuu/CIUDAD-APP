from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from datetime import datetime
from django.db.models import Count, Prefetch
from django.http import Http404
from ..models import ListOfDisabilities, PatientDisablity
from ..serializers.disability_serializers import  PatientDisabilitySerializer, ListDisabilitySerializer



class ListDisabilityView(generics.ListCreateAPIView):
    serializer_class = ListDisabilitySerializer
    queryset = ListOfDisabilities.objects.all()
    

class PatientDisabilityView(generics.ListCreateAPIView):
    serializer_class = PatientDisabilitySerializer
    queryset = PatientDisablity.objects.all()



