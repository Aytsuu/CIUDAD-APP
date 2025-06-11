from rest_framework import generics
from ..models import AcknowledgementReport
from ..serializers.ar_serializers import *
from apps.pagination import StandardResultsPagination

class ARCreateView(generics.CreateAPIView):
  serializer_class = ARCreateSerializer
  queryset = AcknowledgementReport.objects.all()

class ARTableView(generics.ListAPIView):
  serializer_class = ARTableSerializer
  queryset = AcknowledgementReport.objects.all()
  pagination_class = StandardResultsPagination