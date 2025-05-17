from rest_framework import serializers
from ..models import *

class AddressBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Address
    fields = ['add_province', 'add_city', 'add_barangay', 'add_street']

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