from rest_framework import serializers
from ..models import AcknowledgementReport, ReportType
from apps.profiling.models import Address
import datetime

class ARBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = AcknowledgementReport
    fields = '__all__'

class ARTableSerializer(serializers.ModelSerializer):
  ar_sitio = serializers.SerializerMethodField()
  ar_street = serializers.SerializerMethodField()
  ar_date = serializers.DateField(source='ar_created_at')

  class Meta:
    model = AcknowledgementReport
    fields = ['ar_id', 'ar_title', 'ar_sitio', 'ar_street', 'ar_date', 'ar_status']

  def get_ar_sitio(self, obj):
    return obj.add.sitio.sitio_name
  
  def get_ar_street(self, obj):
    return obj.add.add_street

class ARCreateSerializer(serializers.ModelSerializer):
  rt = serializers.CharField()
  ir_sitio = serializers.CharField(write_only=True, required=False)
  ir_street = serializers.CharField(write_only=True, required=False)

  class Meta:
    model = AcknowledgementReport
    fields = ['ar_title', 'ar_date_started', 'ar_time_started', 'ar_date_completed', 
              'ar_time_completed', 'ar_action_taken', 'ir_sitio', 'ir_street', 'ir', 'rt', 'staff'] 
    
  def create(self, validated_data):
    report_type = validated_data.pop('rt', None)
    sitio = validated_data.pop('ir_sitio', None)
    street = validated_data.pop('ir_street', None)

    if report_type:
      validated_data['rt'] = ReportType.objects.filter(rt_label=report_type).first()
    
    if sitio and street:
      print(validated_data)
      validated_data['add'] = Address.objects.filter(add_street=street, sitio=sitio.lower()).first()
    
    instance = AcknowledgementReport(**validated_data)
    instance.save()
    return instance