from rest_framework import serializers
from ..models import *

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
              'per_contact', 'per_edAttainment', 'per_religion', 'files']

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
