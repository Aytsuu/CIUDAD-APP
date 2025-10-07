from django.shortcuts import render
from rest_framework import generics
from ..models import *
from ..serializers import *

# Create your views here.
class MonthlyRCPReportView(generics.ListCreateAPIView):
    serializer_class = MonthlyRCPReportSerializer
    queryset = MonthlyRecipientListReport.objects.all()

class UpdateMonthlyRCPReportDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UpdateMonthlyRecipientListReportSerializer
    queryset = MonthlyRecipientListReport.objects.all()
    lookup_field = 'monthlyrcplist_id'
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context