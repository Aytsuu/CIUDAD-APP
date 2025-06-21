# from django.shortcuts import render
# from rest_framework import generics
# from .serializers import *
# from .models import *

# # Create your views here.
# class ServiceChargeRequestView(generics.ListCreateAPIView):
#     serializer_class = ServiceChargeRequestSerializer

#     def get_queryset(self):
#         return ServiceChargeRequest.objects.filter(sr_payment_status="Paid")


from rest_framework import generics
from rest_framework.exceptions import NotFound
from .models import ServiceChargeRequest
from .serializers import *

class ServiceChargeRequestView(generics.ListCreateAPIView):
    serializer_class = ServiceChargeRequestSerializer

    def get_queryset(self):
        return ServiceChargeRequest.objects.filter(sr_payment_status="Paid")

class ServiceChargeRequestDetailView(generics.RetrieveAPIView):
    serializer_class = ServiceChargeRequestDetailSerializer
    lookup_field = 'sr_id'
    
    def get_queryset(self):
        return ServiceChargeRequest.objects.filter(
            sr_payment_status="Paid"
        ).select_related('comp__cpnt')
    
    def get_object(self):
        try:
            return super().get_object()
        except ServiceChargeRequest.DoesNotExist:
            raise NotFound("Service charge request not found")