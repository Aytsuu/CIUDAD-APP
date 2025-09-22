from rest_framework import serializers
from django.utils import timezone
from ..models import *
from django.db.models import Count
from ..double_queries import PostQueries

class HouseholdBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Household
    fields = '__all__'

class HouseholdListSerialzer(serializers.ModelSerializer):
  head = serializers.SerializerMethodField()
  sitio = serializers.CharField(source='add.sitio.sitio_name')
  street = serializers.CharField(source='add.add_street')
  registered_by = serializers.SerializerMethodField()

  class Meta:
    model = Household
    fields = ['hh_id', 'head', "hh_nhts", "sitio",
              "street", "hh_date_registered", "registered_by"]

  def get_head(self, obj):
    id = obj.rp.rp_id
    fam = FamilyComposition.objects.filter(rp=id).first()
    fam_id = fam.fam.fam_id if fam else ""
    personal = obj.rp.per
    name = f"{personal.per_lname}, {personal.per_fname}" + \
          (f" {personal.per_mname[0]}." if personal.per_mname else "")
    
    return f'{id}-{name}-{fam_id}'
    
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

class HouseholdTableSerializer(serializers.ModelSerializer):
  total_families = serializers.SerializerMethodField()
  sitio = serializers.CharField(source='add.sitio.sitio_name')
  street = serializers.CharField(source='add.add_street')
  nhts = serializers.CharField(source='hh_nhts')
  head = serializers.SerializerMethodField()
  head_id = serializers.CharField(source='rp.rp_id')
  date_registered = serializers.DateField(source='hh_date_registered')

  class Meta:
    model = Household
    fields = ['hh_id', 'sitio', 'total_families', 'street', 'nhts', 'head', 'head_id',
              'date_registered']
    
  def get_total_families(self, obj):
    return Family.objects.annotate(members=Count("family_compositions")).filter(hh=obj, members__gt=0).count()
  
  def get_head(self, obj):
    info = obj.rp.per
    return f"{info.per_lname}, {info.per_fname}" + \
        (f" {info.per_mname[0]}." if info.per_mname else "")

  
class HouseholdCreateSerializer(serializers.ModelSerializer):
  class Meta:
    model = Household
    fields = '__all__'
    read_only_fields = ['hh_id', 'hh_date_registered']

  def create(self, validated_data):
    household = Household.objects.create(
      hh_id = self.generate_hh_no(),
      hh_nhts = validated_data['hh_nhts'],
      hh_date_registered = timezone.now().date(),
      add = validated_data['add'],
      rp = validated_data['rp'],
      staff = validated_data['staff']
    )

    # Perform double query
    double_queries = PostQueries()
    response = double_queries.household(validated_data)
    if not response.ok:
      try:
          error_detail = response.json()
      except ValueError:
          error_detail = response.text
      raise serializers.ValidationError({"error": error_detail})

    return household

  def generate_hh_no(self):
    next_val = Household.objects.count() + 1
    house_no = f"HH-{next_val:05d}"
    return house_no
  