from rest_framework import generics
from ..serializers.incident_report_serializers import *
from ..models import IncidentReport

class IRCreateView(generics.CreateAPIView):
  serializer_class = IRCreateSerializer
  queryset = IncidentReport.objects.all()