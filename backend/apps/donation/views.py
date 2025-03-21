from django.shortcuts import render
from rest_framework import generics
from .serializers import *

# Create your views here.
#KANI 3RD

class DonationView(generics.ListCreateAPIView):
    serializer_class = DonationSerializer
    queryset = Donation.objects.all()