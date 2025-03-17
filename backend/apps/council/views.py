from django.shortcuts import render
from rest_framework import generics
from .serializers import *


class CouncilSchedulingView(generics.ListCreateAPIView):
    serializer_class = CouncilSchedulingSerializer
    queryset = CouncilScheduling.objects.all()

# Create your views here.
