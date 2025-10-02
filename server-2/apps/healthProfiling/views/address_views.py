from rest_framework import generics, status
from rest_framework.response import Response
from django.db import transaction
from rest_framework.permissions import AllowAny
from django.utils import timezone
from ..serializers.address_serializers import *
from apps.administration.models import Staff

class AddressBulkCreateView(generics.CreateAPIView):
  permission_classes = [AllowAny]
  @transaction.atomic
  def post(self, request):
    addresses_req = request.data

    addresses = []
    for request in addresses_req:
      added, created = Address.objects.get_or_create(
        add_province=request['add_province'],
        add_city=request['add_city'],
        add_barangay=request['add_barangay'],
        add_external_sitio=request['add_external_sitio'],
        sitio=Sitio.objects.filter(sitio_name=request['sitio']).first(),
        add_street=request['add_street'],
      )

      addresses.append(added) if added else addresses.append(created)
    
    if len(addresses) > 0:
      return Response(data=AddressBaseSerializer(addresses, many=True).data, status=status.HTTP_200_OK)
    return Response(status=status.HTTP_400_BAD_REQUEST)
    
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