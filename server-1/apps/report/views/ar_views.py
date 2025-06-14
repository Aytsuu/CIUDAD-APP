from rest_framework import generics, status
from rest_framework.response import Response
from django.db import transaction
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

class ARFileCreateView(generics.CreateAPIView):
  serializer_class = ARFileBaseSerializer
  queryset = ARFile.objects.all()

  @transaction.atomic
  def create(self, request, *args, **kwargs):
      serializer = self.get_serializer(data=request.data, many=True)
      serializer.is_valid(raise_exception=True)

      # Prepare model instances
      instances = [
          ARFile(**item)
          for item in serializer.validated_data
      ]

      created_instances = ARFile.objects.bulk_create(instances)

      if len(created_instances) > 0 and created_instances[0].pk is not None:
          response_serializer = self.get_serializer(created_instances, many=True)
          return Response(response_serializer.data, status=status.HTTP_201_CREATED)
      
      return Response({"detail": "Bulk create successful", "count": len(instances)},
          status=status.HTTP_201_CREATED
      )
