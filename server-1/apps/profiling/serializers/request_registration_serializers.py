from rest_framework import serializers
from ..models import *
from django.db import transaction
from apps.profiling.serializers.address_serializers import AddressBaseSerializer
from apps.profiling.models import PersonalAddress, Address
from apps.account.models import Account
from utils.supabase_client import supabase

class RequestBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = RequestRegistration
    fields = '__all__'

class RequestFileBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = RequestFile
    fields = "__all__"

class RequestTableSerializer(serializers.ModelSerializer):
  per_lname = serializers.CharField(source="per.per_lname")
  per_fname = serializers.CharField(source="per.per_fname")
  per_mname = serializers.CharField(source="per.per_mname")
  per_suffix = serializers.CharField(source="per.per_suffix")
  per_sex = serializers.CharField(source="per.per_sex")
  per_dob = serializers.CharField(source="per.per_dob")
  per_status = serializers.CharField(source="per.per_status")
  per_contact = serializers.CharField(source="per.per_contact")
  per_edAttainment = serializers.CharField(source="per.per_edAttainment")
  per_religion = serializers.CharField(source="per.per_religion")
  addresses = serializers.SerializerMethodField()
  files = serializers.SerializerMethodField()

  class Meta:
    model = RequestRegistration
    fields = ['req_id', 'req_date', 'per', 'per_lname', 'per_fname', 'per_mname',  
              'per_suffix','per_sex', 'per_dob', 'per_status', 'addresses',
              'per_contact', 'per_edAttainment', 'per_religion', 'files', 'acc']

  def get_addresses(self, obj):
    per_add = PersonalAddress.objects.filter(per=obj.per)
    addresses = []
    for pa in per_add:
      address_data = {
        'province': pa.add.add_province,
        'city': pa.add.add_city,
        'barangay': pa.add.add_barangay,
        'street': pa.add.add_street,
        'external_sitio': pa.add.add_external_sitio,
        'sitio': pa.add.sitio.sitio_name if pa.add.sitio else None
      }
      addresses.append(address_data)
    
    return addresses
  
  def get_files(self, obj):
    files = RequestFile.objects.filter(req=obj)
    return [
      {
        'id': file.rf_id,
        'file': {
          'name': file.rf_name
        },
        'type': file.rf_type,
        'storagePath': file.rf_path,
        'publicUrl': file.rf_url,
        'is_id': file.rf_is_id,
        'id_type': file.rf_id_type
      }
      for file in files
    ]
  
class RequestFileInputSerializer(serializers.Serializer):
  rf_name = serializers.CharField()
  rf_type = serializers.CharField()
  rf_path = serializers.CharField()
  rf_url = serializers.CharField()

class AccountInputSerializer(serializers.Serializer):
  email = serializers.EmailField()
  username = serializers.CharField()
  password = serializers.CharField()


class RequestCreateSerializer(serializers.ModelSerializer):
  files = RequestFileInputSerializer(write_only=True, many=True, required=False)
  acc = AccountInputSerializer(write_only=True, required=False)
  class Meta:
    model = RequestRegistration
    fields = ['per', 'files', 'acc']
  
  @transaction.atomic
  def create(self, validated_data):
    acc = validated_data.pop('acc', None)
    files = validated_data.pop('files', None)
    
    
    supabase_response = supabase.auth.sign_up({
        "email": acc['email'],
        "password": acc['password'],
        "options": {
            "data": {
                "username": acc['username'] or acc['email'].split('@')[0],
            }
        }
    })
                           
    # Create account in local database
    account = Account.objects.create(
        email=acc['email'],
        username=acc['username'] or acc['email'].split('@')[0],
        supabase_id=supabase_response.user.id,  # Store Supabase ID
    )

    if account:
      validated_data['acc'] = account

    request = RequestRegistration(**validated_data)
    request.save()

    if files:
      RequestFile.objects.bulk_create([
        RequestFile(req=request,**item) 
        for item in files
      ])
    
    return request

