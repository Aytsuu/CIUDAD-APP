from rest_framework import serializers
from ..models import *


class BusinessBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Business
    fields = '__all__'

class BusinessFileBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = BusinessFile
    fields = '__all__'

class BusinessTableSerializer(serializers.ModelSerializer):
  sitio = serializers.CharField(source="add.sitio.sitio_name")
  bus_street = serializers.CharField(source='add.add_street')
  bus_registered_by = serializers.SerializerMethodField()
  files = serializers.SerializerMethodField()

  class Meta:
    model = Business
    fields = ['bus_id', 'bus_name', 'bus_gross_sales', 'sitio', 'bus_street', 
              'bus_date_registered', 'bus_registered_by', 'files']

  def get_bus_registered_by(self, obj):
    info = obj.staff.rp.per
    return f'{info.per_lname}, {info.per_fname} ' \
          f'{info.per_mname[0]}' if info.per_mname else None 

  def get_files(self, obj):
    files = BusinessFile.objects.filter(bus=obj)
    return [
      {
        'id': file.bf_id,
        'file': {
          'name': file.bf_name
        },
        'type': file.bf_type,
        'storagePath': file.bf_path,
        'publicUrl': file.bf_url
      }
      for file in files
    ]

  
class BusinessFileInputSerializer(serializers.Serializer):
  bf_name = serializers.CharField()
  bf_type = serializers.CharField()
  bf_path = serializers.CharField()
  bf_url = serializers.CharField()

class RespondentInputSerializer(serializers.Serializer):
  br_lname = serializers.CharField()
  br_fname = serializers.CharField()
  br_mname = serializers.CharField()
  br_sex = serializers.CharField() 
  br_dob = serializers.DateField()
  br_contact = serializers.CharField()
  br_address = serializers.CharField()
  
class BusinessCreateUpdateSerializer(serializers.ModelSerializer):
  bus_street = serializers.CharField(write_only=True, required=False)
  sitio = serializers.SlugRelatedField(
    queryset=Sitio.objects.all(),
    slug_field='sitio_id',
    write_only=True, 
    required=False)
  files = BusinessFileInputSerializer(write_only=True, many=True, required=False)
  respondent = RespondentInputSerializer(write_only=True, required=False)
  rp = serializers.CharField(write_only=True, required=False)

  class Meta:
    model = Business
    fields = ['bus_name', 'rp', 'respondent', 'bus_gross_sales', 
              'sitio', 'bus_street', 'staff', 'files', ]

  def create(self, validated_data):
    sitio = validated_data.pop('sitio', None)
    street = validated_data.pop('bus_street', None)
    files = validated_data.pop('files', None)
    respondent = validated_data.pop('respondent', None)
    rp = validated_data.pop('rp', None)

    address, _ = Address.objects.get_or_create(
        sitio=sitio,
        add_street=street,
        defaults={
            'add_province': 'Cebu',
            'add_city': 'Cebu City',
            'add_barangay': 'San Roque',
        }
    )

    if respondent:
      respondent_instance = BusinessRespondent.objects.create(**respondent)
      if respondent_instance:
        business_instance = Business.objects.create(
          br=respondent_instance, 
          add=address, 
          **validated_data
        )
    else:
      business_instance = Business.objects.create(
        rp=ResidentProfile.objects.get(rp_id=rp), 
        add=address, 
        **validated_data
      )

    BusinessFile.objects.bulk_create([
      BusinessFile(bus=business_instance, **file)
      for file in files
    ])

    return business_instance
  
  def update(self, instance, validated_data):
    files = validated_data.pop('files', [])
    sitio = validated_data.pop('sitio')
    street = validated_data.pop('bus_street')
    BusinessFile.objects.filter(bus=instance).delete()

    address, _ = Address.objects.get_or_create(
        sitio=sitio,
        add_street=street,
        defaults={
            'add_province': 'Cebu',
            'add_city': 'Cebu City',
            'add_barangay': 'San Roque',
        }
    )

    validated_data['add'] = address
  
    for attr, value in validated_data.items():
      setattr(instance, attr, value)

    instance.save()

    if files:
      BusinessFile.objects.bulk_create([
        BusinessFile(bus=instance, **file) 
        for file in files
      ])
    return instance

    