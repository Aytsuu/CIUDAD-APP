from rest_framework import serializers
from ..models import IncidentReport, ReportType
from apps.profiling.models import Address, ResidentProfile
from apps.profiling.serializers.address_serializers import AddressBaseSerializer
import datetime

class IRBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = IncidentReport
    fields = '__all__'

class IRTableSerializer(serializers.ModelSerializer):
  ir_reported_by = serializers.SerializerMethodField()
  ir_sitio = serializers.SerializerMethodField()
  ir_street = serializers.SerializerMethodField()
  ir_time = serializers.SerializerMethodField()
  ir_type = serializers.SerializerMethodField()

  class Meta: 
    model = IncidentReport
    fields = ['ir_id', 'ir_sitio', 'ir_street', 'ir_add_details', 'ir_type',
             'ir_time', 'ir_date', 'ir_reported_by']
  
  def get_ir_type(self, obj):
    return obj.rt.rt_label

  def get_ir_time(self, obj):
    if obj.ir_time:
        return obj.ir_time.strftime("%I:%M %p")
    return None

  def get_ir_sitio(self, obj):
    return obj.add.sitio.sitio_name
  
  def get_ir_street(self, obj):
    return obj.add.add_street
  
  def get_ir_reported_by(self, obj):
    info = obj.rp.per
    return f"{info.per_lname}, {info.per_fname}" + \
        (f" {info.per_mname[0]}." if info.per_mname else "")

class IRCreateSerializer(serializers.ModelSerializer):
  ir_street = serializers.CharField(write_only=True, required=False)
  ir_sitio = serializers.CharField(write_only=True, required=False)
  ir_type = serializers.CharField(write_only=True, required=False)
  ir_other_type = serializers.CharField(write_only=True, required=False)
  rt = serializers.PrimaryKeyRelatedField(queryset=ReportType.objects.all(), required=False, write_only=True)
  add = serializers.PrimaryKeyRelatedField(queryset=Address.objects.all(), required=False, write_only=True)
  rp = serializers.PrimaryKeyRelatedField(queryset=ResidentProfile.objects.all(), required=True)
   
  class Meta:
    model = IncidentReport
    fields = ['ir_add_details', 'ir_street', 'ir_sitio', 
              'ir_type', 'ir_other_type', 'rt', 'rp', 'add']

  def create(self, validated_data):
    sitio = validated_data.pop('ir_sitio', None)
    street = validated_data.pop('ir_street', None)
    report_type = validated_data.pop('ir_type', None)
    other_report_type = validated_data.pop('ir_other_type', None)

    # ir_time = validated_data.get('ir_time')
    # if isinstance(ir_time, str):
    #   parsed_time = datetime.datetime.strptime(ir_time, "%I:%M %p").time()
    #   validated_data['ir_time'] = parsed_time
      
    
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
      existing_rep_type = ReportType.objects.filter(rt_label=report_type).first()
      validated_data['rt'] = existing_rep_type

    if sitio and street:
      existing_add = Address.objects.filter(
          sitio=sitio.lower(), add_street=street
      ).first()

      if existing_add:
        validated_data['add'] = existing_add
      else:
        new_address = {
            'add_province': 'Cebu',
            'add_city': 'Cebu City',
            'add_barangay': 'San Roque',
            'sitio': sitio.lower(),
            'add_street': street
        }
        print(new_address)
        address_serializer = AddressBaseSerializer(data=new_address)
        address_serializer.is_valid(raise_exception=True)
        address = address_serializer.save()
        validated_data['add'] = address

    incident_report = IncidentReport.objects.create(**validated_data)
    return incident_report
    
