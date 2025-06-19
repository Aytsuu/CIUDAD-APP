from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from .models import *

# Create your views here.
class ServiceChargeRequestView(generics.ListCreateAPIView):
    serializer_class = ServiceChargeRequestSerializer

    def get_queryset(self):
        return ServiceChargeRequest.objects.filter(sr_payment_status="Paid")
