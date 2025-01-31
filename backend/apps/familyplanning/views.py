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