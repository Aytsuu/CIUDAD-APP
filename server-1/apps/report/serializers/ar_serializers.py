from rest_framework import serializers
from django.db import transaction
from ..models import *
from apps.profiling.models import Address
from apps.profiling.serializers.address_serializers import AddressBaseSerializer
from ..serializers.incident_report_serializers import IRBaseSerializer
import datetime

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
  ar_sitio = serializers.SerializerMethodField()
  ar_street = serializers.SerializerMethodField()
  date = serializers.DateField(source='ar_created_at')
  ar_files = serializers.SerializerMethodField()
  ar_time_started = serializers.SerializerMethodField()
  ar_time_completed = serializers.SerializerMethodField()

  class Meta:
    model = AcknowledgementReport
    fields = ['id', 'ar_title', 'ar_action_taken', 'ar_date_started', 'ar_time_started', 'ar_date_completed',
              'ar_time_completed', 'ar_sitio', 'ar_street', 'date', 'status', 'ar_files', 'ar_result']
  
  def get_ar_time_started(self, obj):
    if obj.ar_time_started:
      return obj.ar_time_started.strftime("%I:%M %p")
    return None
  
  def get_ar_time_completed(self, obj):
    if obj.ar_time_completed:
      return obj.ar_time_completed.strftime("%I:%M %p")
    return None

  def get_ar_sitio(self, obj):
    return obj.add.sitio.sitio_name
  
  def get_ar_street(self, obj):
    return obj.add.add_street

  def get_ar_files(self, obj):
    files = ARFile.objects.filter(ar=obj)
    return ARFileBaseSerializer(files, many=True).data

class ARCreateSerializer(serializers.ModelSerializer):
  rt = serializers.CharField()
  ir_sitio = serializers.CharField(write_only=True, required=False)
  ir_street = serializers.CharField(write_only=True, required=False)
  ir = serializers.PrimaryKeyRelatedField(queryset=IncidentReport.objects.all(), write_only=True, required=False)
  rt = serializers.PrimaryKeyRelatedField(queryset=ReportType.objects.all(), write_only=True, required=False)

  class Meta:
    model = AcknowledgementReport
    fields = ['ar_id', 'ar_title', 'ar_date_started', 'ar_time_started', 'ar_date_completed', 
              'ar_time_completed', 'ar_action_taken', 'ir_sitio', 'ir_street', 'ir', 'rt', 'staff'] 
    extra_kwargs = {
      'ar_id' : {'read_only': True}
    }
    
  def create(self, validated_data):
    report_type = validated_data.pop('rt', None)
    sitio = validated_data.pop('ir_sitio', None)
    street = validated_data.pop('ir_street', None)
    incident_report = validated_data.get('ir', None)

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
          'sitio': sitio,
          'add_street': street
        }

        new_add = AddressBaseSerializer(data=data)
        if new_add.is_valid():
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
    return instance