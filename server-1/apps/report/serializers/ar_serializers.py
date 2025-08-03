from rest_framework import serializers
from django.db import transaction
from ..models import *
from apps.profiling.models import Address, Sitio
from apps.profiling.serializers.address_serializers import AddressBaseSerializer
from ..serializers.incident_report_serializers import IRBaseSerializer
import datetime
from utils.supabase_client import upload_to_storage
from apps.profiling.serializers.business_serializers import FileInputSerializer

class ARBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = AcknowledgementReport
    fields = '__all__'

class ARFileBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = ARFile
    fields = '__all__'

class ARTableSerializer(serializers.ModelSerializer):
  id = serializers.IntegerField(source='ar_id')
  ar_sitio = serializers.CharField(source="add.sitio.sitio_name")
  ar_street = serializers.CharField(source="add.add_street")
  status = serializers.CharField(source='ar_status')
  date = serializers.DateField(source='ar_created_at')
  ar_files = serializers.SerializerMethodField()
  ar_time_started = serializers.SerializerMethodField()
  ar_time_completed = serializers.SerializerMethodField()

  class Meta:
    model = AcknowledgementReport
    fields = ['id', 'ar_title', 'ar_action_taken', 'ar_date_started', 'ar_time_started', 'ar_date_completed',
              'ar_time_completed', 'ar_sitio', 'ar_street', 'date', 'ar_files', 'status', 'ar_result']
  
  def get_ar_time_started(self, obj):
    if obj.ar_time_started:
      return obj.ar_time_started.strftime("%I:%M %p")
    return None
  
  def get_ar_time_completed(self, obj):
    if obj.ar_time_completed:
      return obj.ar_time_completed.strftime("%I:%M %p")
    return None

  def get_ar_files(self, obj):
    files = ARFile.objects.filter(ar=obj)
    return ARFileBaseSerializer(files, many=True).data

class ARCreateSerializer(serializers.ModelSerializer):
  rt = serializers.CharField()
  ir_sitio = serializers.CharField(write_only=True, required=False)
  ir_street = serializers.CharField(write_only=True, required=False)
  ir = serializers.PrimaryKeyRelatedField(queryset=IncidentReport.objects.all(), write_only=True, required=False)
  rt = serializers.PrimaryKeyRelatedField(queryset=ReportType.objects.all(), write_only=True, required=False)
  files = FileInputSerializer(write_only=True, required=False, many=True)

  class Meta:
    model = AcknowledgementReport
    fields = ['ar_id', 'ar_title', 'ar_date_started', 'ar_time_started', 'ar_date_completed', 'ar_created_at', 
              'ar_time_completed', 'ar_action_taken', 'ir_sitio', 'ir_street', 'ir', 'rt', 'staff', 'files'] 
    extra_kwargs = {
      'ar_id' : {'read_only': True}
    }
  
  @transaction.atomic
  def create(self, validated_data):
    report_type = validated_data.pop('rt', None)
    sitio = validated_data.pop('ir_sitio', None)
    street = validated_data.pop('ir_street', None)
    incident_report = validated_data.get('ir', None)
    files = validated_data.pop('files', [])

    if report_type:
      validated_data['rt'] = ReportType.objects.filter(rt_label=report_type).first()
    
    if sitio and street:
      existing_add = Address.objects.filter(add_street=street, sitio=sitio.lower()).first()

      if existing_add:
        validated_data['add'] = existing_add
      else:
        data = {
          'add_province': 'Cebu',
          'add_city': 'Cebu City',
          'add_barangay': 'San Roque',
          'sitio': Sitio.objects.filter(sitio_id=sitio).first(),
          'add_street': street
        }

        new_add = Address(**data)
        new_add.save()
        validated_data['add'] = new_add

    if incident_report:
      is_archive = {
        'ir_is_archive': True
      }
      archive_ir = IRBaseSerializer(incident_report, data=is_archive, partial=True)
      if archive_ir.is_valid():
        archive_ir.save()
    
    instance = AcknowledgementReport(**validated_data)
    instance.save()
    
    if files:
      self._upload_files(instance, files)
    
    return instance
  
  def _upload_files(self, ar_instance, files):
      ar_files = []
      for file_data in files:
        arf_file = ARFile(
          ar=ar_instance,
          arf_name=file_data['name'],
          arf_type=file_data['type'],
          arf_path=f"uploads/{file_data['name']}",
        )

        url = upload_to_storage(file_data, 'report-bucket', 'ar')
        arf_file.arf_url = url
        ar_files.append(arf_file)

      if ar_files:
          ARFile.objects.bulk_create(ar_files)

class ARFileCreateSerializer(serializers.ModelSerializer):
  files = FileInputSerializer(write_only=True, many=True)

  class Meta:
    model = ARFile
    fields = ['ar', 'files']