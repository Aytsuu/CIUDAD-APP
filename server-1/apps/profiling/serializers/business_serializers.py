from rest_framework import serializers
from ..models import *
from django.db import transaction
from apps.profiling.serializers.resident_profile_serializers import ResidentPersonalInfoSerializer
from apps.profiling.serializers.address_serializers import AddressBaseSerializer
from utils.supabase_client import supabase, upload_to_storage, remove_from_storage
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class BusinessBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Business
    fields = '__all__'

class BusinessFileBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = BusinessFile
    fields = '__all__'

class BusinessRespondentBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = BusinessRespondent
    fields = '__all__'

class BusinessModificationBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = BusinessModification
    fields = '__all__'

class BusinessTableSerializer(serializers.ModelSerializer):
  sitio = serializers.CharField(source="add.sitio.sitio_name")
  bus_street = serializers.CharField(source='add.add_street')
  respondent = serializers.SerializerMethodField()

  class Meta:
    model = Business
    fields = ['bus_id', 'bus_name', 'bus_gross_sales', 'sitio', 'bus_street',
              'bus_date_of_registration', 'bus_date_verified', 'respondent', 
              'rp']
    
  def get_respondent(self, obj):
    if obj.br:
      return f"{obj.br.per.per_lname}, {obj.br.per.per_fname} " \
             f"{obj.br.per.per_mname}" if obj.br.per.per_mname else None
    
    if obj.rp:
      return f"{obj.rp.per.per_lname}, {obj.rp.per.per_fname} " \
             f"{obj.rp.per.per_mname}" if obj.rp.per.per_mname else None
    
    return None

class BusinessRespondentTableSerializer(serializers.ModelSerializer):
  lname = serializers.CharField(source='per.per_lname')
  fname = serializers.CharField(source='per.per_fname')
  mname = serializers.CharField(source='per.per_mname')
  suffix = serializers.CharField(source='per.per_suffix')
  sex = serializers.CharField(source='per.per_sex')
  businesses = serializers.SerializerMethodField()

  class Meta:
    model = BusinessRespondent
    fields = ['br_id', 'lname', 'fname', 'mname', 'br_date_registered',
               'suffix', 'sex', 'businesses']

  def get_businesses(self, obj):
    return BusinessBaseSerializer(
      Business.objects.filter(br=obj), many=True
    ).data
  
class BusinessRespondentInfoSerializer(serializers.ModelSerializer):
  per_id = serializers.IntegerField(source='per.per_id')
  per_lname = serializers.CharField(source='per.per_lname')
  per_fname = serializers.CharField(source='per.per_fname')
  per_mname = serializers.CharField(source='per.per_mname')
  per_suffix = serializers.CharField(source='per.per_suffix')
  per_sex = serializers.CharField(source="per.per_sex")
  per_dob = serializers.DateField(source="per.per_dob")
  per_status = serializers.CharField(source="per.per_status")
  per_edAttainment = serializers.CharField(source="per.per_edAttainment")
  per_religion = serializers.CharField(source="per.per_religion")
  per_contact = serializers.CharField(source="per.per_contact")
  per_addresses = serializers.SerializerMethodField()
  per_age = serializers.SerializerMethodField()

  class Meta:
    model = BusinessRespondent
    fields = ['br_id', 'br_date_registered', 'per_id', 'per_lname', 
              'per_fname', 'per_mname', 'per_suffix', 'per_sex',
              'per_dob', 'per_status', 'per_edAttainment', 'per_religion',
              'per_contact', 'per_age', 'per_addresses']
    
  def get_per_addresses(self, obj):
    addresses = [
      AddressBaseSerializer(address.add).data
      for address in PersonalAddress.objects.filter(per=obj.per).select_related('add')
    ]
  
    return addresses

  def get_per_age(self, obj):
    dob = obj.per.per_dob
    today = datetime.today().date()

    age = today.year - dob.year - (
        (today.month, today.day) < (dob.month, dob.day)
    )
    return age
  

class BusinessInfoSerializer(serializers.ModelSerializer):
  sitio = serializers.CharField(source="add.sitio.sitio_name")
  bus_street = serializers.CharField(source='add.add_street')
  bus_registered_by = serializers.SerializerMethodField()
  br = BusinessRespondentInfoSerializer()
  rp = ResidentPersonalInfoSerializer()
  files = serializers.SerializerMethodField()

  class Meta:
    model = Business
    fields = ['bus_id', 'br', 'rp', 'bus_name', 'bus_gross_sales', 'sitio', 
              'bus_street', 'bus_date_of_registration', 'bus_date_verified',
              'bus_registered_by', 'files']
    
  def get_files(self, obj):
    files = [
      {
        'name': file.bf_name,
        'type': file.bf_type,
        'url': file.bf_url
      }
      for file in BusinessFile.objects.filter(bus=obj.bus_id)]
    
    return files
  
  def get_bus_registered_by(self, obj):
    if not obj.staff:
      return None

    info = obj.staff.rp.per
    return f'{info.per_lname}, {info.per_fname} ' \
          f'{info.per_mname}' if info.per_mname else None 
  
class FileInputSerializer(serializers.Serializer):
  name = serializers.CharField()
  type = serializers.CharField()
  file = serializers.CharField()

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
  files = FileInputSerializer(write_only=True, many=True, required=False)
  respondent = RespondentInputSerializer(write_only=True, required=False)
  rp = serializers.CharField(write_only=True, required=False)
  br = serializers.CharField(write_only=True, required=False)
  add = serializers.CharField(write_only=True, required=False)

  class Meta:
    model = Business
    fields = ['bus_name', 'rp', 'br', 'respondent', 'bus_gross_sales', 
              'bus_status', 'bus_date_verified','sitio', 'bus_street', 
              'staff', 'files', 'add']

  @transaction.atomic
  def create(self, validated_data):
    try:
        sitio = validated_data.pop('sitio', None)
        street = validated_data.pop('bus_street', '')
        files = validated_data.pop('files', [])
        rp = validated_data.pop('rp', None)
        br = validated_data.pop('br', None)

        # Validate address components
        if not sitio or not street:
            raise serializers.ValidationError("Both sitio and street are required")

        address, _ = Address.objects.get_or_create(
            sitio=sitio,
            add_street=street,
            defaults={
                'add_province': 'Cebu',
                'add_city': 'Cebu City',
                'add_barangay': 'San Roque',
            }
        )

        # Handle respondent/rp/br logic
        business_instance = self._create_business_instance(
            validated_data, address, rp, br
        )

        # Handle file uploads
        if files:
            self._upload_files(business_instance, files)

        return business_instance

    except Exception as e:
        logger.error(f"Business creation failed: {str(e)}")
        raise serializers.ValidationError(str(e))

  def _create_business_instance(self, validated_data, address, rp, br):
      return Business.objects.create(
        rp=ResidentProfile.objects.get(rp_id=rp) if rp else None,
        br=BusinessRespondent.objects.get(br_id=br) if br else None,
        add=address,
        **validated_data
      )
  
  def _upload_files(self, business_instance, files):
      business_files = []
      for file_data in files:
        business_file = BusinessFile(
          bus=business_instance,
          bf_name=file_data['name'],
          bf_type=file_data['type'],
          bf_path=f"uploads/{file_data['name']}",
        )
        
        url = upload_to_storage(file_data, 'business-bucket', 'uploads')
        business_file.bf_url=url
        business_files.append(business_file)

      if business_files:
          BusinessFile.objects.bulk_create(business_files)
  
  @transaction.atomic
  def update(self, instance, validated_data):
    files = validated_data.pop('files', [])
    sitio = validated_data.pop('sitio', None)
    street = validated_data.pop('bus_street', None)
    staff = validated_data.pop('staff', None)
    add = validated_data.pop('add', None)
    
    if add:
      validated_data['add'] = Address.objects.filter(add_id=add).first()
    else:
      if sitio and street:
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

    if not instance.staff:
      instance.staff = staff
    
    instance._history_user = staff
    instance.save()

    if files:
      # Delete the current files attached to the business
      files_to_delete = BusinessFile.objects.filter(bus=instance)
      for file in files_to_delete:
        remove_from_storage('business-bucket', f'uploads/{file.bf_path}')
      files_to_delete.delete()

      # Attach the files from the new update
      for file_data in files:
        file = BusinessFile.objects.filter(bf_name=file_data['name']).first()
        file.bus = instance
        file.save()

    return instance

class ForSpecificOwnerSerializer(serializers.ModelSerializer):
  sitio = serializers.CharField(source="add.sitio.sitio_name")
  bus_street = serializers.CharField(source='add.add_street')
  class Meta:
    model = Business
    fields = ['bus_id', 'bus_name', 'bus_status', 'bus_gross_sales', 'bus_street', 
              'sitio', 'bus_date_verified']

class BusinessModificationCreateSerializer(serializers.ModelSerializer):
  sitio = serializers.SlugRelatedField(
    queryset=Sitio.objects.all(),
    slug_field='sitio_id',
    write_only=True,
    required=False
  )
  street = serializers.CharField(write_only=True, required=False)
  files = FileInputSerializer(write_only=True, many=True, required=False)
  class Meta:
    model = BusinessModification
    fields = ['bm_updated_name', 'bm_updated_gs', 'street', 'sitio',
              'bus', 'files']
    extra_kwargs = {
      'bm_submitted_at': {'read_only': True}
    }
  
  @transaction.atomic
  def create(self, validated_data):
    sitio = validated_data.pop('sitio', None)
    street = validated_data.pop('street', None)
    files = validated_data.pop('files', [])

    if sitio and street:
      address, _ = Address.objects.get_or_create(
        sitio=sitio,
        add_street=street,
        defaults={
          'add_province': 'Cebu',
          'add_city': 'Cebu City',
          'add_barangay': 'San Roque'
        }
      )

      validated_data['add'] = address
    
    instance = BusinessModification(**validated_data)
    instance.save()

    if files:
      business_files = []
      for file_data in files:
        business_file = BusinessFile(
          bm=instance,
          bf_name=file_data['name'],
          bf_type=file_data['type'],
          bf_path=f"uploads/{file_data['name']}",
        )
        
        url = upload_to_storage(file_data, 'business-bucket', 'uploads')
        business_file.bf_url=url
        business_files.append(business_file)

      if business_files:
          BusinessFile.objects.bulk_create(business_files)


    return instance

class BusinessModificationListSerializer(serializers.ModelSerializer):
  sitio = serializers.CharField(source="add.sitio.sitio_name")
  bus_street = serializers.CharField(source='add.add_street')
  current_details = serializers.SerializerMethodField()
  respondent = serializers.SerializerMethodField()
  files = serializers.SerializerMethodField()

  class Meta:
    model = BusinessModification
    fields = ['bm_id', 'bm_updated_name', 'bm_updated_gs', 'sitio', 'add',
              'bus_street', 'bm_submitted_at', 'current_details', 'respondent' , 'files']
  
  def get_respondent(self, obj):
    if obj.bus.br:
      return f"{obj.bus.br.per.per_lname}, {obj.bus.br.per.per_fname} " \
             f"{obj.bus.br.per.per_mname}" if obj.bus.br.per.per_mname else None
    
    if obj.bus.rp:
      return f"{obj.bus.rp.per.per_lname}, {obj.bus.rp.per.per_fname} " \
             f"{obj.bus.rp.per.per_mname}" if obj.bus.rp.per.per_mname else None
    
    return None
    
  def get_current_details(self, obj):
    return BusinessTableSerializer(obj.bus).data
  
  def get_files(self, obj):
    return [
      {
        'id': file.bf_id,
        'name': file.bf_name,
        'type': file.bf_type,
        'url': file.bf_url
      }
      for file in BusinessFile.objects.filter(bm=obj.bm_id)
    ]