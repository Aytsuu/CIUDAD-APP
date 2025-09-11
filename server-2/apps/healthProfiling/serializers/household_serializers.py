from rest_framework import serializers
from django.utils import timezone
from ..models import *

class HouseholdBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Household
    fields = '__all__'

class HouseholdListSerialzer(serializers.ModelSerializer):
  head_id = serializers.CharField(source='rp.rp_id')
  head = serializers.SerializerMethodField()
  registered_by = serializers.SerializerMethodField()

  class Meta:
    model = Household
    fields = ['hh_id','head_id', 'head', "hh_nhts", "add",
              "hh_date_registered", "registered_by"]

  def get_head(self, obj):
    name = obj.rp.per
    return f"{name.per_lname}, {name.per_fname}" + \
          (f" {name.per_mname[0]}." if name.per_mname else "")
  
  def get_registered_by(self, obj):
    info = obj.staff.rp.per
    return f"{info.per_lname}, {info.per_fname}" + \
        (f" {info.per_mname[0]}." if info.per_mname else "")

class HouseholdTableSerializer(serializers.ModelSerializer):
  total_families = serializers.SerializerMethodField()
  sitio = serializers.CharField(source='add.sitio.sitio_name')
  street = serializers.CharField(source='add.add_street')
  nhts = serializers.CharField(source='hh_nhts')
  head = serializers.SerializerMethodField()
  head_id = serializers.CharField(source='rp.rp_id')
  date_registered = serializers.DateField(source='hh_date_registered')
  registered_by = serializers.SerializerMethodField()


  class Meta:
    model = Household
    fields = ['hh_id', 'sitio', 'total_families', 'street', 'nhts', 'head', 'head_id',
              'date_registered', 'registered_by']
    
  def get_total_families(self, obj):
    return Family.objects.filter(hh=obj).count()
  
  def get_head(self, obj):
    info = obj.rp.per
    return f"{info.per_lname}, {info.per_fname}" + \
        (f" {info.per_mname[0]}." if info.per_mname else "")
  
  def get_registered_by(self, obj):
    info = obj.staff.rp.per
    return f"{info.per_lname}, {info.per_fname}" + \
        (f" {info.per_mname[0]}." if info.per_mname else "")
  
class HouseholdCreateSerializer(serializers.ModelSerializer):
  class Meta:
    model = Household
    fields = '__all__'
    read_only_fields = ['hh_id', 'hh_date_registered']

  def create(self, validated_data):
    return Household.objects.create(
      hh_id = self.generate_hh_no(),
      hh_nhts = validated_data['hh_nhts'],
      hh_date_registered = timezone.now().date(),
      add = validated_data['add'],
      rp = validated_data['rp'],
      staff = validated_data['staff']
    )

  def generate_hh_no(self):
    next_val = Household.objects.count() + 1
    house_no = f"HH-{next_val:05d}"
    return house_no
  