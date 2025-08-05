from rest_framework import serializers
from ..models import *
from ..serializers.position_serializers import PositionBaseSerializer
from ..serializers.assignment_serializers import AssignmentMinimalSerializer
from apps.profiling.models import ResidentProfile, FamilyComposition
from apps.account.models import Account

class StaffBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Staff
    fields = '__all__'

class StaffMinimalSerializer(serializers.ModelSerializer):
    rp = serializers.SerializerMethodField()
    rp_id = serializers.PrimaryKeyRelatedField(queryset=ResidentProfile.objects.all(), write_only=True, source="rp")

    class Meta:
        model = Staff
        fields = '__all__'

    def get_rp(self, obj):
        from apps.profiling.serializers.resident_profile_serializers import ResidentPersonalInfoSerializer 
        return ResidentPersonalInfoSerializer(obj.rp).data

class StaffTableSerializer(serializers.ModelSerializer):
  lname = serializers.CharField(source='rp.per.per_lname')
  fname = serializers.CharField(source='rp.per.per_fname')
  mname = serializers.CharField(source='rp.per.per_mname')
  dob = serializers.CharField(source='rp.per.per_dob')
  contact = serializers.CharField(source='rp.per.per_contact')
  position = serializers.CharField(source='pos.pos_title')
  group = serializers.CharField(source='pos.pos_group')
  fam = serializers.SerializerMethodField()

  class Meta:
    model = Staff
    fields = ['staff_id', 'lname', 'fname', 'mname', 'dob', 
              'contact', 'position', 'group', 'staff_assign_date', 'fam']
  
  def get_fam(self, obj):
    family_comp = FamilyComposition.objects.filter(rp=obj.staff_id).select_related('fam').first()
    if family_comp and family_comp.fam:
      return family_comp.fam.fam_id
    return None
  
class StaffFullSerializer(serializers.ModelSerializer):
  pos = PositionBaseSerializer(read_only=True)
  rp = serializers.SerializerMethodField()
  rp_id = serializers.PrimaryKeyRelatedField(queryset=ResidentProfile.objects.all(), write_only=True, source="rp")
  pos_id = serializers.PrimaryKeyRelatedField(queryset=Position.objects.all(), write_only=True, source="pos")
  assignments = AssignmentMinimalSerializer(many=True, read_only=True)

  class Meta:
      model = Staff
      fields = '__all__'

  def get_rp(self, obj):
      from apps.profiling.serializers.resident_profile_serializers import ResidentPersonalInfoSerializer
      return ResidentPersonalInfoSerializer(obj.rp).data
  

class StaffCreateSerializer(serializers.ModelSerializer):
  class Meta:
    model = Staff
    fields = '__all__'
  
  def create(self, validated_data):
    pos = validated_data.get('pos', None)
    max_holders = pos.pos_max
    holders = Staff.objects.filter(pos=pos)

    if len(holders) < max_holders:
      register = Staff(**validated_data)
      register.save()
      return register

    return None
  
class StaffLandingPageSerializer(serializers.ModelSerializer):
  name = serializers.SerializerMethodField()
  position = serializers.CharField(source='pos.pos_title')
  assignments = AssignmentMinimalSerializer(many=True, read_only=True)
  photo_url = serializers.SerializerMethodField()

  class Meta:
    model = Staff
    fields = ['photo_url', 'name', 'position', 'assignments']

  # def get_name(self, obj):
  #   info = obj.rp.per
  #   return f'{info.per_lname.upper()}, {info.per_fname.upper()}' \
  #           f' {info.per_mname.upper() if info.per_mname else ''}'

  def get_name(self, obj):
    info = obj.rp.per
    return f"{info.per_lname.upper()}, {info.per_fname.upper()} {info.per_mname.upper() if info.per_mname else ''}"


  def get_photo_url(self, obj):
    rp = obj.rp
    account = Account.objects.filter(rp=rp).first()
    return account.profile_image if account and account.profile_image else None