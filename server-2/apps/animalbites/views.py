from django.shortcuts import render
from rest_framework import generics,status
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import *

# class AnimalbiteRecordsView(generics.ListCreateAPIView):
#     serializer_class = AnimalBiteRecordSerializer
#     queryset = AnimalBite_Record.objects.all()
    
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
    
class AnimalbiteReferralView(generics.ListCreateAPIView):
    serializer_class = AnimalBiteReferralSerializer
    queryset = AnimalBite_Referral.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class AnimalbiteDetailsView(generics.ListCreateAPIView):
    serializer_class = AnimalBiteDetailsSerializer
    queryset = AnimalBite_Details.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
