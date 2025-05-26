from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from django.shortcuts import get_object_or_404

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

class UpdateWasteReportView(generics.RetrieveUpdateAPIView):
    serializer_class = WasteReportSerializer
    queryset = WasteReport.objects.all()
    lookup_field = 'rep_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteWasteReportView(generics.DestroyAPIView):
    serializer_class = WasteReportSerializer    
    queryset = WasteReport.objects.all()

    def get_object(self):
        rep_id = self.kwargs.get('rep_id')
        return get_object_or_404(WasteReport, rep_id=rep_id) 