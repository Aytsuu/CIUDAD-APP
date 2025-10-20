from rest_framework import serializers
from ..models import IncidentReport, ReportType, IncidentReportFile
from apps.profiling.models import Address, ResidentProfile
from apps.profiling.serializers.address_serializers import AddressBaseSerializer
from apps.profiling.serializers.business_serializers import FileInputSerializer
from utils.supabase_client import upload_to_storage
import datetime

class IRBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = IncidentReport
    fields = '__all__'

class IRTableSerializer(serializers.ModelSerializer):
  ir_reported_by = serializers.SerializerMethodField()
  ir_time = serializers.SerializerMethodField()
  ir_type = serializers.SerializerMethodField()
  files = serializers.SerializerMethodField()

  class Meta: 
    model = IncidentReport
    fields = ['ir_id', 'ir_area', 'ir_involved', 'ir_add_details', 'ir_type',
             'ir_time', 'ir_date', 'ir_severity', 'ir_created_at', 'ir_reported_by',
             'files', 'ir_track_rep_id', 'ir_track_lat', 'ir_track_lng', 'ir_track_user_lat',
             'ir_track_user_lng', 'ir_track_user_contact']
  
  def get_ir_type(self, obj):
    if obj.rt:
      return obj.rt.rt_label

  def get_ir_time(self, obj):
    if obj.ir_time:
        return obj.ir_time.strftime("%I:%M %p")
    return None
  
  def get_ir_reported_by(self, obj):
    if obj.rp:
      info = obj.rp.per
      return f"{info.per_lname}, {info.per_fname}" + \
        (f" {info.per_mname[0]}." if info.per_mname else "")

class IRCreateSerializer(serializers.ModelSerializer):
  ir_type = serializers.CharField(write_only=True, required=False)
  ir_other_type = serializers.CharField(write_only=True, required=False)
  rp = serializers.PrimaryKeyRelatedField(queryset=ResidentProfile.objects.all(), required=True)
  files = FileInputSerializer(write_only=True, many=True, required=False)
   
  class Meta:
    model = IncidentReport
    fields = ['ir_add_details','ir_type', 'ir_date', 'ir_time', 'ir_involved', 
              'ir_other_type', 'ir_severity', 'ir_area', 'rp', 'files']

  def create(self, validated_data):
    report_type = validated_data.pop('ir_type', None)
    other_report_type = validated_data.pop('ir_other_type', None)
    files = validated_data.pop('files', [])
      
    if other_report_type:
      existing_rep_type = ReportType.objects.filter(rt_label=other_report_type).first()

      if existing_rep_type:
        validated_data['rt'] = existing_rep_type
      else: 
        data = {
          'rt_label': other_report_type,
          'rt_category': 'Incident'
        }

        new_rep_type = ReportType(**data)
        new_rep_type.save()
        validated_data['rt'] = new_rep_type
    else: 
      existing_rep_type = ReportType.objects.filter(rt_label__iexact=report_type).first()
      print(existing_rep_type)
      validated_data['rt'] = existing_rep_type

    incident_report = IncidentReport(**validated_data)
    incident_report.save()

    if files:
      report_files = []
      for file_data in files:
        report_file = IncidentReportFile(
          ir=incident_report,
          irf_name=file_data['name'],
          irf_type=file_data['type'],
          irf_path = f"ir/{file_data['name']}"
        )

        url = upload_to_storage(file_data, "report-bucket", 'ir')
        report_file.irf_url=url
        report_files.append(report_file)

      IncidentReportFile.objects.bulk_create(report_files)
      
    return incident_report
    
