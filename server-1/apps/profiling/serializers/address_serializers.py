from rest_framework import serializers
from ..models import *

class AddressBulkCreateSerializer(serializers.ModelSerializer):
  class Meta:
    models = Address
    fields = "__all__"
    read_only_fields = ['add_id']

class PerAddressBulkSerializer(serializers.ModelSerializer):
  class Meta:
    models = PersonalAddress
    fields = "__all__"
    read_only_fields = ['pa_id']