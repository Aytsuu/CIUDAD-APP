from django.shortcuts import render
from rest_framework import generics
from .models import *
from .serializers import *

# Create your views here.
class MonthlyRCPReportView(generics.ListCreateAPIView):
    serializer_class = MonthlyRCPReportSerializer
    queryset = MonthlyRecipientListReport.objects.all()

class UpdateMonthlyRCPReportDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = MonthlyRCPReportSerializer
    queryset = MonthlyRecipientListReport.objects.all()
    lookup_field = 'monthlyrcplist_id'
    
class HeaderRCPReportView(generics.RetrieveUpdateAPIView):
    serializer_class = HeaderRCPReportSerializer
    queryset = HeaderRecipientListReporTemplate.objects.all()
    lookup_field = 'type'
    
class HeaderRCPReportListView(generics.ListAPIView):
    serializer_class = HeaderRCPReportSerializer
    queryset = HeaderRecipientListReporTemplate.objects.all()
    

