from rest_framework import generics
from .models import BlotterReport, Complainant, Accused
from .serializers import BlotterReportSerializer, complainantSerializer, AccusedSerializer


    #   Blotter Report Views
class BlotterReportListCreate(generics.ListCreateAPIView):
    queryset = BlotterReport.objects.all()
    serializer_class = BlotterReportSerializer
    
class BlotterReportDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = BlotterReport.objects.all()
    serializer_class = BlotterReportSerializer
    
    #   Complainant Views
class ComplainantListCreate(generics.ListCreateAPIView):
    queryset = Complainant.objects.all()
    serializer_class = complainantSerializer
    
    #  Accused Views
class AccusedListCreate(generics.ListCreateAPIView):
    queryset = Accused.objects.all()
    serializer_class = AccusedSerializer