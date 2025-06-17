from rest_framework import serializers
from ..models import *
from apps.profiling.serializers.address_serializers import AddressBaseSerializer
from apps.profiling.models import PersonalAddress, Address

class RequestBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = RequestRegistration
    fields = '__all__'

class RequestTableSerializer(serializers.ModelSerializer):
  lname = serializers.CharField(source="per.per_lname")
  fname = serializers.CharField(source="per.per_fname")
  mname = serializers.CharField(source="per.per_mname")
  addresses = serializers.SerializerMethodField()

  class Meta:
    model = RequestRegistration
    fields = ['req_id', 'lname', 'fname', 'mname', 'addresses', 'req_date']

  def get_address(self, obj):
    per_add = PersonalAddress.objects.filter(per=obj.per)
    addresses = [
      AddressBaseSerializer(
        Address.objects.filter(add_id=address.add)
      )
      for address in per_add
    ]
    
    return addresses