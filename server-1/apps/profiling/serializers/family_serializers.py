from rest_framework import serializers
from ..models import *
from django.utils import timezone
from datetime import datetime

class FamilyBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Family
    fields = '__all__'
  
class FamilyTableSerializer(serializers.ModelSerializer):
  members = serializers.SerializerMethodField()
  registered_by = serializers.SerializerMethodField()
  household_no = serializers.CharField(source='hh.hh_id')
  sitio = serializers.CharField(source='hh.sitio.sitio_name')
  
  class Meta: 
    model = Family
    fields = ['fam_id', 'household_no', 'sitio', 'fam_building', 'fam_indigenous', 
              'fam_date_registered', 'registered_by', 'members']
    
  
  def get_members(self, obj):
    return FamilyComposition.objects.filter(fam=obj).count()
  
  def get_registered_by(self, obj):
    if obj.staff and hasattr(obj.staff, 'rp'):
      staff = obj.staff.rp.per
      return f"{staff.per_lname}, {staff.per_fname}" + \
        (f"{staff.per_mname[0]}." if staff.per_mname else "")
    return "-"
  
class FamilyCreateSerializer(serializers.ModelSerializer):
  class Meta: 
    model = Family
    fields = '__all__'
    read_only_fields = ['fam_id', 'fam_date_registered']

  def create(self, validated_data):
    return Family.objects.create(
      fam_id = self.generate_fam_no(validated_data['fam_building']),
      fam_indigenous = validated_data['fam_indigenous'],
      fam_building = validated_data['fam_building'],
      fam_date_registered = timezone.now().date(),
      hh = validated_data['hh'],
      staff = validated_data['staff']
    )
  
  def generate_fam_no(self, building_type):

    type = {'Owner' : 'O', 'Renter' : 'R', 'Other' : 'I'}

    next_val = Family.objects.count() + 1
    date = datetime.now()
    year = str(date.year - 2000)
    month = str(date.month).zfill(2)
    day = str(date.day).zfill(2)
    
    formatted = f"{next_val:04d}"
    family_id = f"{year}{month}{day}00{formatted}-{type[building_type]}"
    
    return family_id

class FamilyListSerializer(serializers.ModelSerializer):
  total_members = serializers.SerializerMethodField()
  registered_by = serializers.SerializerMethodField()

  class Meta:
    model = Family
    fields = ['fam_id', 'fam_building', 'total_members', 'fam_indigenous', 'fam_date_registered',
              'registered_by']
  
  def get_total_members(self, obj):
    return FamilyComposition.objects.filter(fam=obj).count()
  
  def get_registered_by(self, obj):
    info = obj.staff.rp.per
    return f"{info.per_lname}, {info.per_fname}" + \
          (f" {info.per_mname[0]}." if info.per_mname else "")




  
  