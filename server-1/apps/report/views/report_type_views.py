from rest_framework import generics
from ..serializers.report_type_serializers import *
from ..models import ReportType

class ReportTypeCreateView(generics.CreateAPIView):
  serializer_class = ReportTypeBaseSerializer
  queryset = ReportType.objects.all()

class ReportTypeListView(generics.ListAPIView):
  serializer_class = ReportTypeBaseSerializer
  queryset = ReportType.objects.all()
  lookup_field = 'rt_category'