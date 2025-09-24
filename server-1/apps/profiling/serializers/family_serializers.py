from rest_framework import serializers
from ..models import *
from django.db import transaction
from django.utils import timezone
from datetime import datetime
from ..double_queries import PostQueries

class FamilyBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Family
    fields = '__all__'
  
class FamilyTableSerializer(serializers.ModelSerializer):
  members = serializers.SerializerMethodField()
  household_no = serializers.CharField(source='hh.hh_id')
  sitio = serializers.CharField(source='hh.add.sitio.sitio_name')
  street = serializers.CharField(source='hh.add.add_street')
  father = serializers.SerializerMethodField()
  mother = serializers.SerializerMethodField()
  guardian = serializers.SerializerMethodField()
  registered_by = serializers.SerializerMethodField()
  class Meta: 
    model = Family
    fields = ['fam_id', 'household_no', 'sitio', 'street', 'fam_building', 'fam_indigenous', 'mother', 
              'father', 'guardian', 'fam_date_registered', 'members', 'registered_by']
    
  def get_members(self, obj):
    return FamilyComposition.objects.filter(fam=obj).count()

  def get_father(self, obj):
    father = FamilyComposition.objects.filter(fam=obj, fc_role='Father').first()
    if father: 
      info = father.rp.per
      return f"{info.per_fname}"
    
    return ""
  
  def get_mother(self, obj):
    mother = FamilyComposition.objects.filter(fam=obj, fc_role='Mother').first()
    if mother: 
      info = mother.rp.per
      return f"{info.per_fname}"
    
    return ""
  
  def get_guardian(self, obj):
    guardian = FamilyComposition.objects.filter(fam=obj, fc_role='Guardian').first()
    if guardian: 
      info = guardian.rp.per
      return f"{info.per_fname}"
    
    return ""

  def get_registered_by(self, obj):
    staff = obj.staff
    staff_type = staff.staff_type
    staff_id = staff.staff_id
    fam = FamilyComposition.objects.filter(rp=obj.staff_id).first()
    fam_id = fam.fam.fam_id if fam else ""
    personal = staff.rp.per
    staff_name = f'{personal.per_lname}, {personal.per_fname}' \
                  f' {personal.per_mname[0]}.' if personal.per_mname else ''

    return f"{staff_id}-{staff_name}-{staff_type}-{fam_id}"
  
class FamilyCreateSerializer(serializers.ModelSerializer):
  class Meta: 
    model = Family
    fields = '__all__'
    read_only_fields = ['fam_id', 'fam_date_registered']

  @transaction.atomic
  def create(self, validated_data):
    family = Family.objects.create(
      fam_id = self.generate_fam_no(validated_data['fam_building']),
      fam_indigenous = validated_data['fam_indigenous'],
      fam_building = validated_data['fam_building'],
      fam_date_registered = timezone.now().date(),
      hh = validated_data['hh'],
      staff = validated_data['staff']
    )

    # Perform double query
    double_queries = PostQueries()
    response = double_queries.family(validated_data)
    if not response.ok:
      try:
          error_detail = response.json()
      except ValueError:
          error_detail = response.text
      raise serializers.ValidationError({"error": error_detail})
    return family
  
  def generate_fam_no(self, building_type):

    type = {'Owner' : 'O', 'Renter' : 'R', 'Sharer' : 'S'}

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

  class Meta:
    model = Family
    fields = ['fam_id', 'fam_building', 'total_members', 'fam_indigenous', 'fam_date_registered']
  
  def get_total_members(self, obj):
    return FamilyComposition.objects.filter(fam=obj).count()





  
  