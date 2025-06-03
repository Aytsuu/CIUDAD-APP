from rest_framework import serializers
from ..models import IncidentReport
from apps.profiling.models import Address
from apps.profiling.serializers.address_serializers import AddressBaseSerializer

class IRBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = IncidentReport
    fields = '__all__'

class IRCreateSerializer(serializers.ModelSerializer):
  class Meta:
    model = IncidentReport
    fields = '__all__'
    extra_kwargs = {
      'ir_id' : {'read_only' : True}
    }

  def create(self, validated_data):
    sitio = validated_data.get('sitio', None)
    street = validated_data.get('street', None)

    if sitio and street:
      existing_add = Address.objects.filter(
          sitio=sitio, add_street=street
      ).first()

      if existing_add:
          validated_data['add'] = existing_add
      else:
          new_address = {
              'add_province': 'Cebu',
              'add_city': 'Cebu City',
              'add_barangay': 'San Roque',
              'sitio': sitio,
              'add_street': street
          }
          address_serializer = AddressBaseSerializer(data=new_address)
          address_serializer.is_valid(raise_exception=True)
          address = address_serializer.save()
          validated_data['add'] = address

      incident_report = IncidentReport.objects.create(**validated_data)
      return incident_report
    
