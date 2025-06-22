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

    # Prepare unique addresses only (skip if already exists)
    seen = set()
    existing_keys = set()
    existing_addresses = []
    instances = []
    for item in serializer.validated_data:
        key = (
          item['add_province'],
          item['add_city'],
          item['add_barangay'],
          item['add_external_sitio'],
          item['sitio'],
          item['add_street'],
        )
        if key in seen:
           continue
        seen.add(key)
        exists = Address.objects.filter(
            add_province=item['add_province'],
            add_city=item['add_city'],
            add_barangay=item['add_barangay'],
            add_external_sitio=item['add_external_sitio'],
            sitio=item['sitio'],
            add_street=item['add_street'],
        ).first()
        if exists:
          if key not in existing_keys:
            existing_addresses.append({  
              "add_id": exists.add_id,
              "sitio": exists.sitio.sitio_name if exists.sitio else None,
              "add_external_sitio": exists.add_external_sitio if exists.add_external_sitio else None,
              "add_street": exists.add_street
            })
            existing_keys.add(key)
        else:
          instances.append(Address(**item))
    
    created_instances = Address.objects.bulk_create(instances)

    created_serializer = self.get_serializer(created_instances, many=True).data if created_instances else []

    response_data = created_serializer + existing_addresses
    
    return Response(response_data, status=status.HTTP_201_CREATED)
    
class PerAddressBulkCreateView(generics.CreateAPIView):
  serializer_class = PerAddressBulkSerializer
  queryset = PersonalAddress.objects.all()

  @transaction.atomic
  def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data, many=True)
    serializer.is_valid(raise_exception=True)

    #prepare model instances
    instances = [
      PersonalAddress(**item)
      for item in serializer.validated_data
    ]
    
    created_instances = PersonalAddress.objects.bulk_create(instances)

    if len(created_instances) > 0 and created_instances[0].pk is not None:
      response_serializer = self.get_serializer(created_instances, many=True)
      return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response({"detail": "Bulk create successful", "count": len(instances)},
      status=status.HTTP_201_CREATED
    )
  
class PerAddressListView(generics.ListAPIView):
  serializer_class = PerAddressListSerializer
  queryset = PersonalAddress.objects.all()


