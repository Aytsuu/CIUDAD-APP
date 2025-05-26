from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import WasteTruck

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

class WastePersonnelView(generics.ListCreateAPIView):
    serializer_class = WastePersonnelSerializer
    queryset = WastePersonnel.objects.all()

class WasteTruckView(APIView):
    def get(self, request):
        trucks = WasteTruck.objects.all()
        serializer = WasteTruckSerializer(trucks, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = WasteTruckSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WasteTruckDetailView(APIView):
    def get_object(self, pk):
        try:
            return WasteTruck.objects.get(pk=pk)
        except WasteTruck.DoesNotExist:
            return None
    
    def get(self, request, pk):
        truck = self.get_object(pk)
        if not truck:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = WasteTruckSerializer(truck)
        return Response(serializer.data)
    
    def put(self, request, pk):
        truck = self.get_object(pk)
        if not truck:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = WasteTruckSerializer(truck, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        truck = self.get_object(pk)
        if not truck:
            return Response(status=status.HTTP_404_NOT_FOUND)
        truck.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)