from django.shortcuts import render
from rest_framework import generics,status
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import *

# Create your views here.
class PatientsView(generics.ListCreateAPIView):
    serializer_class = PatientsSerializer 
    queryset = Patient.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class ReferralView(generics.ListCreateAPIView):
    serializer_class = ReferralSerializer 
    queryset = Referral.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class BiteDetailsView(generics.ListCreateAPIView):
    serializer_class = BiteDetailsSerializer 
    queryset = BiteDetails.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
