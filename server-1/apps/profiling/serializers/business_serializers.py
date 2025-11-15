from rest_framework import serializers
from ..models import *
from django.db import transaction
from apps.profiling.serializers.resident_profile_serializers import ResidentPersonalInfoSerializer
from apps.profiling.serializers.personal_serializers import PersonalBaseSerializer
from utils.supabase_client import upload_to_storage, remove_from_storage
from datetime import datetime
from ..utils import *
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

class BusinessHistoryBaseSerializer(serializers.ModelSerializer):
  history_user_name = serializers.SerializerMethodField()
  history_date = serializers.DateTimeField(format='%Y-%m-%d %I:%M:%S %p')

  class Meta:
      model = Business.history.model
      fields = '__all__'
  
  def get_history_user_name(self, obj):
      if obj.history_user and hasattr(obj.history_user, 'rp'):
          per = obj.history_user.rp.per
          return f"{per.per_lname}, {per.per_fname}" + \
                  (f" {per.per_mname}" if per.per_mname else "")
      return None

class BusinessTableSerializer(serializers.ModelSerializer):
  registered_by = serializers.SerializerMethodField()

  class Meta:
    model = Business
    fields = ['bus_id', 'bus_name', 'bus_gross_sales', 'bus_location', 'bus_status',
              'bus_date_of_registration', 'bus_date_verified', 'rp', 'br', 'registered_by']
    
  def get_registered_by(self, obj):
    staff = obj.staff
    if staff:
      staff_type = staff.staff_type
      staff_id = staff.staff_id
      fam = FamilyComposition.objects.filter(rp=obj.staff_id).first()
      fam_id = fam.fam.fam_id if fam else ""
      personal = staff.rp.per
      staff_name = f'{personal.per_lname}, {personal.per_fname}{f' {personal.per_mname}' if personal.per_mname else ''}'

    return f"{staff_id}-{staff_name}-{staff_type}-{fam_id}"

class BusinessRespondentTableSerializer(serializers.ModelSerializer):
  businesses = serializers.SerializerMethodField()

  class Meta:
    model = BusinessRespondent
    fields = '__all__'

  def get_businesses(self, obj):
    return BusinessBaseSerializer(
      Business.objects.filter(br=obj), many=True
    ).data
  
class BusinessRespondentInfoSerializer(serializers.ModelSerializer):
  registered_by = serializers.SerializerMethodField()

  class Meta:
    model = BusinessRespondent
    fields = ['br_id', 'br_date_registered', 'br_lname', 
              'br_fname', 'br_mname', 'br_sex', 'br_dob',
              'br_contact', 'registered_by']

  def get_per_age(self, obj):
    dob = obj.br_dob
    today = datetime.today().date()

    age = today.year - dob.year - (
        (today.month, today.day) < (dob.month, dob.day)
    )
    return age
  
  def get_registered_by(self, obj):
    staff = obj.staff
    if staff:
        staff_type = staff.staff_type
        staff_id = staff.staff_id
        fam = FamilyComposition.objects.filter(rp=obj.staff_id).first()
        fam_id = fam.fam.fam_id if fam else ""
        personal = staff.rp.per
        staff_name = f'{personal.per_lname}, {personal.per_fname}{f' {personal.per_mname}' if personal.per_mname else ''}'

    return f"{staff_id}-{staff_name}-{staff_type}-{fam_id}"
  

class BusinessInfoSerializer(serializers.ModelSerializer):
  registered_by = serializers.SerializerMethodField()
  br = BusinessRespondentInfoSerializer()
  rp = ResidentPersonalInfoSerializer()
  files = serializers.SerializerMethodField()

  class Meta:
    model = Business
    fields = ['bus_id', 'br', 'rp', 'bus_name', 'bus_gross_sales', 'bus_status',
              'bus_location', 'bus_date_of_registration', 'bus_date_verified',
              'registered_by', 'files']
    
  def get_files(self, obj):
    files = [
      {
        'id': file.bf_id,
        'name': file.bf_name,
        'type': file.bf_type,
        'url': file.bf_url
      }
      for file in BusinessFile.objects.filter(bus=obj.bus_id)]
    
    return files
  
  def get_registered_by(self, obj):
    staff = obj.staff
    if staff:
        staff_type = staff.staff_type
        staff_id = staff.staff_id
        fam = FamilyComposition.objects.filter(rp=obj.staff_id).first()
        fam_id = fam.fam.fam_id if fam else ""
        personal = staff.rp.per
        staff_name = f'{personal.per_lname}, {personal.per_fname}{f' {personal.per_mname}' if personal.per_mname else ''}'

    return f"{staff_id}-{staff_name}-{staff_type}-{fam_id}"
  
class FileInputSerializer(serializers.Serializer):
  name = serializers.CharField()
  type = serializers.CharField()
  file = serializers.CharField()

class BusinessCreateUpdateSerializer(serializers.ModelSerializer):
  modification_files = FileInputSerializer(write_only=True, many=True, required=False)
  edit_files = FileInputSerializer(write_only=True, many=True, required=False)
  create_files = FileInputSerializer(write_only=True, many=True, required=False)
  rp = serializers.CharField(write_only=True, required=False)
  per = PersonalBaseSerializer(write_only=True, required=False)
  br = serializers.CharField(write_only=True, required=False)

  class Meta:
    model = Business
    fields = ['bus_name', 'rp', 'br', 'per', 'bus_gross_sales', 'bus_status', 'bus_date_verified',
              'bus_location', 'staff', 'modification_files', 'edit_files', 'create_files']

  @transaction.atomic
  def create(self, validated_data):
    try:
        create_files = validated_data.pop('create_files', [])
        rp = validated_data.pop('rp', None)
        per = validated_data.pop('per', None)
        br = validated_data.pop('br', None)

        if per:
          br = BusinessRespondent.objects.create(
            br_id=generate_busrespondent_no(),
            br_lname=per.get("per_lname", None),
            br_fname=per.get("per_fname", None),
            br_mname=per.get("per_mname", None),
            br_sex=per.get("per_sex", None),
            br_dob=per.get("per_dob", None),
            br_contact=per.get("per_contact", None),
            staff = validated_data["staff"]
          )

        # Handle respondent/rp/br logic
        business_instance = self.create_business_instance(
            validated_data, rp, br
        )

        # Handle file uploads
        if create_files:
            self.upload_files(business_instance, create_files)

        return business_instance

    except Exception as e:
        logger.error(f"Business creation failed: {str(e)}")
        raise serializers.ValidationError(str(e))

  def create_business_instance(self, validated_data, rp, br):
    business = Business(
      bus_id=generate_business_no(),
      rp=ResidentProfile.objects.get(rp_id=rp) if rp else None,
      br=BusinessRespondent.objects.get(br_id=br.br_id) if br else None,
      bus_date_verified=date.today(),
      **validated_data
    )

    business._history_user = validated_data.get('staff', None)
    business.save()
    return business
  
  def upload_files(self, business_instance, files):
      business_files = []
      for file_data in files:
        folder = "images" if file_data['type'].split("/")[0] == "image" else "documents"

        business_file = BusinessFile(
          bus=business_instance,
          bf_name=file_data['name'],
          bf_type=file_data['type'],
          bf_path=f"{folder}/{file_data['name']}",
        )
        
        url = upload_to_storage(file_data, 'business-bucket', folder)
        business_file.bf_url=url
        business_files.append(business_file)

      if len(business_files) > 0:
          BusinessFile.objects.bulk_create(business_files)
  
  @transaction.atomic
  def update(self, instance, validated_data):
    modification_request_files = validated_data.pop('modification_files', [])
    edit_files = validated_data.pop('edit_files', [])
    staff = validated_data.pop('staff', None)

    if not staff:
      raise serializers.ValidationError('Staff is required')
  
    for attr, value in validated_data.items():
      setattr(instance, attr, value)

    if not instance.staff:
      instance.staff = staff
    
    instance._history_user = staff
    instance.save()

    if modification_request_files:
      # Delete the current files attached to the business
      files_to_delete = BusinessFile.objects.filter(bus=instance)
      for file in files_to_delete:
        folder = "images" if file['type'].split("/")[0] == "image" else "documents"
        remove_from_storage('business-bucket', f'{folder}/{file.bf_path}')
      files_to_delete.delete()

      # Attach the files from the new update
      for file_data in modification_request_files:
        file = BusinessFile.objects.filter(bf_name=file_data['name']).first()
        file.bus = instance
        file.save()
    
    if edit_files:
      current_files = BusinessFile.objects.filter(bus_id=instance.bus_id)

      business_files = []
      files_to_keep = []

      # Check for files to add and keep
      for file_data in edit_files:
        if 'file' in file_data:
          folder = "images" if file_data['type'].split("/")[0] == "image" else "documents"

          business_file = BusinessFile(
            bus=instance,
            bf_name=file_data['name'],
            bf_type=file_data['type'],
            bf_path=f"{folder}/{file_data['name']}",
          )

          url = upload_to_storage(file_data, 'business-bucket', folder)
          business_file.bf_url=url
          business_files.append(business_file)

        files_to_keep.append(file_data['name'])
      
      # Consider removed files, should be removed in the db
      for file in current_files:
        if file.bf_name not in files_to_keep:
          remove_from_storage('business-bucket', file.bf_path)
          file.delete()

      # Bulk create newly added files
      if len(business_files) > 0:
        BusinessFile.objects.bulk_create(business_files)
        
    return instance

class ForSpecificOwnerSerializer(serializers.ModelSerializer):
  class Meta:
    model = Business
    fields = ['bus_id', 'bus_name', 'bus_status', 'bus_gross_sales', 'bus_location', 
              'bus_date_verified']

class BusinessModificationCreateSerializer(serializers.ModelSerializer):
  files = FileInputSerializer(write_only=True, many=True, required=False)
  class Meta:
    model = BusinessModification
    fields = ['bm_updated_name', 'bm_updated_gs', 'bm_updated_loc', 'bus', 'files']
    extra_kwargs = {
      'bm_submitted_at': {'read_only': True}
    }
  
  @transaction.atomic
  def create(self, validated_data):
    files = validated_data.pop('files', [])
    instance = BusinessModification(**validated_data)
    instance.save()

    if files:
      business_files = []
      for file_data in files:
        folder = "images" if file_data['type'].split("/")[0] == "image" else "documents"

        business_file = BusinessFile(
          bm=instance,
          bf_name=file_data['name'],
          bf_type=file_data['type'],
          bf_path=f"{folder}/{file_data['name']}",
        )
        
        url = upload_to_storage(file_data, 'business-bucket', folder)
        business_file.bf_url=url
        business_files.append(business_file)

      if business_files:
          BusinessFile.objects.bulk_create(business_files)

    return instance

class BusinessModificationListSerializer(serializers.ModelSerializer):
  current_details = serializers.SerializerMethodField()
  respondent = serializers.SerializerMethodField()
  files = serializers.SerializerMethodField()

  class Meta:
    model = BusinessModification
    fields = ['bm_id', 'bm_updated_name', 'bm_updated_gs', 'bm_status', 'bm_updated_loc',
               'bm_submitted_at', 'current_details', 'respondent' , 'files']
  
  def get_respondent(self, obj):
    if obj.bus.br:
      return f"{obj.bus.br.br_lname}, {obj.bus.br.br_fname} " \
             f"{obj.bus.br.br_mname}" if obj.bus.br_mname else None
    
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