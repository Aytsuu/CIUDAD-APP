from rest_framework import generics
from ..serializers.report_type_serializers import *
from ..models import ReportType

class ReportTypeCreateView(generics.ListCreateAPIView):
  serializer_class = ReportTypeBaseSerializer
  queryset = ReportType.objects.all()