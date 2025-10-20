from rest_framework import serializers
from ..models import ReportTemplate
from apps.profiling.serializers.business_serializers import FileInputSerializer
from utils.supabase_client import upload_to_storage

class RepTemplateBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = ReportTemplate
    fields = '__all__'
  
class RTEUpdateSerializer(serializers.ModelSerializer):
  logo_right = FileInputSerializer(write_only=True, required=False)
  logo_left = FileInputSerializer(write_only=True, required=False)
  rte_prepared_by = serializers.CharField(write_only=True, required=False)
  rte_recommended_by = serializers.CharField(write_only=True, required=False)
  rte_approved_by = serializers.CharField(write_only=True, required=False)

  class Meta:
    model = ReportTemplate
    fields = ['logo_right', 'logo_left', 'rte_prepared_by', 'rte_recommended_by', 
              'rte_approved_by']
  
  def update(self, instance, validated_data):
    logo_right = validated_data.pop('logo_right', None)
    logo_left = validated_data.pop('logo_left', None)
    logo_top = validated_data.pop('logo_top', None)

    if logo_right:
      url = upload_to_storage(logo_right, 'report-bucket', 'template')
      if url:
        setattr(instance, 'rte_logoRight', url)
    elif logo_left:
      url = upload_to_storage(logo_left, 'report-bucket', 'template')
      if url:
        setattr(instance, 'rte_logoLeft', url)
    else:
      for attr, value in validated_data.items():
        setattr(instance, attr, value)
      
    instance.save()
    return instance