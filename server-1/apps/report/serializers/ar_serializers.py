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
  status = serializers.CharField(source='ar_status')
  date = serializers.DateField(source='ar_created_at')
  ar_files = serializers.SerializerMethodField()
  ar_time_started = serializers.SerializerMethodField()
  ar_time_completed = serializers.SerializerMethodField()

  class Meta:
    model = AcknowledgementReport
    fields = ['id', 'ar_title', 'ar_action_taken', 'ar_date_started', 'ar_time_started', 'ar_date_completed',
              'ar_time_completed', 'ar_area', 'date', 'ar_files', 'status', 'ar_result']
  
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
  ir = serializers.PrimaryKeyRelatedField(queryset=IncidentReport.objects.all(), write_only=True, required=False)
  rt = serializers.PrimaryKeyRelatedField(queryset=ReportType.objects.all(), write_only=True, required=False)
  files = FileInputSerializer(write_only=True, required=False, many=True)

  class Meta:
    model = AcknowledgementReport
    fields = ['ar_id', 'ar_title', 'ar_result', 'ar_date_started', 'ar_time_started', 'ar_date_completed', 'ar_created_at', 
              'ar_time_completed', 'ar_area', 'ar_action_taken', 'ir', 'rt', 'staff', 'files'] 
    extra_kwargs = {
      'ar_id' : {'read_only': True}
    }
  
  @transaction.atomic
  def create(self, validated_data):
    files = validated_data.pop('files', [])

    instance = AcknowledgementReport(**validated_data)
    instance.save()
    
    if files:
      self._upload_files(instance, files)
    
    return instance
  
  def _upload_files(self, ar_instance, files):
      ar_files = []
      for file_data in files:
        folder = "images" if file_data['type'].split("/")[0] == 'image' else "documents"

        arf_file = ARFile(
          ar=ar_instance,
          arf_name=file_data['name'],
          arf_type=file_data['type'],
          arf_path=f"ar/{folder}/{file_data['name']}",
        )

        url = upload_to_storage(file_data, 'report-bucket', f'ar/{folder}')
        arf_file.arf_url = url
        ar_files.append(arf_file)

      if ar_files:
          ARFile.objects.bulk_create(ar_files)

class ARFileCreateSerializer(serializers.ModelSerializer):
  files = FileInputSerializer(write_only=True, many=True)

  class Meta:
    model = ARFile
    fields = ['ar', 'files']