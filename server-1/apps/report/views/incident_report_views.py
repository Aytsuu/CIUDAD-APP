from rest_framework import generics
from ..serializers.incident_report_serializers import *
from ..models import IncidentReport
from apps.pagination import StandardResultsPagination

class IRCreateView(generics.CreateAPIView):
  serializer_class = IRCreateSerializer
  queryset = IncidentReport.objects.all()
  
class IRActiveTableView(generics.ListAPIView):
  serializer_class = IRTableSerializer
  queryset = IncidentReport.objects.filter(ir_is_archive=False)
  pagination_class = StandardResultsPagination
  
class IRArchiveTableView(generics.ListAPIView):
  serializer_class = IRTableSerializer
  queryset = IncidentReport.objects.filter(ir_is_archive=True)
  pagination_class = StandardResultsPagination

