from rest_framework import serializers
from ..models import *

class AddressBaseSerializer(serializers.ModelSerializer):
  sitio = serializers.PrimaryKeyRelatedField(
    queryset=Sitio.objects.all(),
    required=False,
    allow_null=True,
    pk_field=serializers.CharField()
  )
  add_id = serializers.IntegerField(read_only=False, required=False)

  class Meta:
    model = Address
    fields = ['add_id', 'add_province', 'add_city', 'add_barangay', 'add_external_sitio', 'add_street', 'sitio']
    extra_kwargs = {
      'sitio': {'required': False, 'allow_null': True},
      'add_external_sitio': {'required': False, 'allow_null': True},
    }


class AddressBulkCreateSerializer(serializers.ModelSerializer):
  class Meta:
    model = Address
    fields = "__all__"
    read_only_fields = ['add_id']

class PerAddressBulkSerializer(serializers.ModelSerializer):
  class Meta:
    model = PersonalAddress
    fields = "__all__"
    read_only_fields = ['pa_id']

class PerAddressesBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = PersonalAddress
    fields = "__all__"

class PerAddressListSerializer(serializers.ModelSerializer):
  sitio = serializers.SerializerMethodField()
  add_street = serializers.CharField(source="add.add_street")
  add_id = serializers.IntegerField(source='add.add_id')

  class Meta: 
    model = PersonalAddress
    fields = ['per', 'add_id', 'sitio', "add_street"]

  def get_sitio(self, obj):
    if obj.add.sitio:
      return obj.add.sitio.sitio_name
    return ''