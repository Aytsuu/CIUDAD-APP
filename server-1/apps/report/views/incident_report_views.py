from rest_framework import generics
from ..serializers.incident_report_serializers import *
from ..models import IncidentReport
from apps.pagination import StandardResultsPagination

class IRCreateView(generics.CreateAPIView):
  serializer_class = IRCreateSerializer
  queryset = IncidentReport.objects.all()
  
class IRTableView(generics.ListAPIView):
  serializer_class = IRTableSerializer
  queryset = IncidentReport.objects.all()
  pagination_class = StandardResultsPagination
  
