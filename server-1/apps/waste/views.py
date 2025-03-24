from django.shortcuts import render
from rest_framework import generics
from .serializers import *

# Create your views here.
#KANI 3RD

class WasteEventView(generics.ListCreateAPIView):
    serializer_class = WasteEventSerializer
    queryset = WasteEvent.objects.all()

class WasteCollectionStaffView(generics.ListCreateAPIView):
    serializer_class = WasteCollectionStaffSerializer
    queryset = WasteCollectionStaff.objects.all()

class WasteCollectionAssignmentView(generics.ListCreateAPIView):
    serializer_class = WasteCollectionAssignmentSerializer
    queryset = WasteCollectionAssignment.objects.all()

class WasteCollectionSchedView(generics.ListCreateAPIView):
    serializer_class = WasteCollectionSchedSerializer
    queryset = WasteCollectionSched.objects.all()

class WasteHotspotView(generics.ListCreateAPIView):
    serializer_class = WasteHotspotSerializer
    queryset = WasteHotspot.objects.all()

class WasteReportView(generics.ListCreateAPIView):
    serializer_class = WasteReportSerializer
    queryset = WasteReport.objects.all()