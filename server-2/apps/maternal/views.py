from django.shortcuts import render
from rest_framework import generics, status
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializer import *
from datetime import datetime

# Create your views here.

# **Prenatal View List**
class PrenatalFormView(generics.ListCreateAPIView):
    serializer_class = PrenatalFormSerializer
    queryset = Prenatal_Form.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
