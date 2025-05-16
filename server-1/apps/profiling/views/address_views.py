from rest_framework import generics, status
from rest_framework.response import Response
from django.db import transaction
from ..serializers.address_serializers import *

class AddressBulkCreateView(generics.CreateAPIView):
  serializer_class = AddressBulkCreateSerializer
  queryset = Address.objects.all()

  @transaction.atomic
  def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data, many=True)
    serializer.is_valid(raise_exception=True)

    #prepare model instances
    instances = [
      Address(**item)
      for item in serializer.validated_data
    ]
    
    created_instances = Address.objects.bulk_create(instances)

    if len(created_instances) > 0 and created_instances[0].pk is not None:
      response_serializer = self.get_serializer(created_instances, many=True)
      return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response({"detail": "Bulk create successful", "count": len(instances)},
      status=status.HTTP_201_CREATED
    )

class PerAddressBulkCreateView(generics.CreateAPIView):
  serializer_class = PerAddressBulkSerializer
  queryset = PersonalAddress.objects.all()

  @transaction.atomic
  def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data, many=True)
    serializer.is_valid(raise_exception=True)

    #prepare model instances
    instances = [
      Address(**item)
      for item in serializer.validated_data
    ]
    
    created_instances = PersonalAddress.objects.bulk_create(instances)

    if len(created_instances) > 0 and created_instances[0].pk is not None:
      response_serializer = self.get_serializer(created_instances, many=True)
      return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response({"detail": "Bulk create successful", "count": len(instances)},
      status=status.HTTP_201_CREATED
    )