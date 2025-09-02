from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import transaction
from django.utils import timezone
from ..serializers.address_serializers import *
from apps.administration.models import Staff

class AddressBulkCreateView(generics.CreateAPIView):
  permission_classes = [AllowAny]
  serializer_class = AddressBulkCreateSerializer
  queryset = Address.objects.all()

  @transaction.atomic
  def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data, many=True)
    serializer.is_valid(raise_exception=True)
fhistory
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
  permission_classes = [AllowAny]
  serializer_class = PerAddressBulkSerializer
  queryset = PersonalAddress.objects.all()

  @transaction.atomic
  def create(self, request, *args, **kwargs):
    staff_id = request.data.get('staff_id', None)
    history_id = request.data.get('history_id', None)
    per_add = request.data.get('per_add')

    per_id = per_add[0].get('per') if per_add else None
    if per_id:
      personal = Personal.objects.filter(per_id=per_id).first()

    if not history_id:
      staff = Staff.objects.filter(staff_id=staff_id).first()
      personal._history_user = staff
      personal.save()

      try:
        latest_history = personal.history.latest()
        history_id = latest_history.history_id
      except personal.history.model.DoesNotExist:
        history_id = None  

    for item in per_add:
      address = Address.objects.filter(add_id=item['add']).first()
      item['per'] = personal
      item['add'] = address

      if not 'initial' in item:
        instance = PersonalAddress(**item)
        instance.save()
      else:
        item.pop('initial', None)

      history = PersonalAddressHistory(**item)
      history.history_id = history_id
      history.save()

    response_data = {
        "detail": "Bulk create successful",
    }
    return Response(response_data, status=status.HTTP_201_CREATED)
  
class PerAddressListView(generics.ListAPIView):
  permission_classes = [AllowAny]
  serializer_class = PerAddressListSerializer
  queryset = PersonalAddress.objects.all()