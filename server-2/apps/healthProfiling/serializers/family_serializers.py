from rest_framework import serializers
from ..models import *
from django.utils import timezone
from datetime import datetime
from django.db import transaction

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
    father = FamilyComposition.objects.filter(fam=obj, fc_role='FATHER').first()
    if father: 
      info = father.rp.per
      return f"{info.per_fname}"
    
    return ""
  
  def get_mother(self, obj):
    mother = FamilyComposition.objects.filter(fam=obj, fc_role='MOTHER').first()
    if mother: 
      info = mother.rp.per
      return f"{info.per_fname}"
    
    return ""
  
  def get_guardian(self, obj):
    guardian = FamilyComposition.objects.filter(fam=obj, fc_role='GUARDIAN').first()
    if guardian: 
      info = guardian.rp.per
      return f"{info.per_fname}"
    
    return ""

  def get_registered_by(self, obj):
    staff = obj.staff
    if staff:
        staff_type = staff.staff_type
        staff_id = staff.staff_id
        fam = FamilyComposition.objects.filter(rp=obj.staff_id).first()
        fam_id = fam.fam.fam_id if fam else ""
        personal = staff.rp.per
        staff_name = f'{personal.per_lname}, {personal.per_fname}{f' {personal.per_mname}' if personal.per_mname else ''}'

    return f"{staff_id}-{staff_name}-{staff_type}-{fam_id}"
  
class FamilyCreateSerializer(serializers.ModelSerializer):
  class Meta: 
    model = Family
    fields = '__all__'
    read_only_fields = ['fam_id', 'fam_date_registered']

  @transaction.atomic
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




# from rest_framework import serializers
# from ..models import *
# from django.utils import timezone
# from datetime import datetime

# class FamilyBaseSerializer(serializers.ModelSerializer):
#   class Meta:
#     model = Family
#     fields = '__all__'
  
# class FamilyTableSerializer(serializers.ModelSerializer):
#   members = serializers.SerializerMethodField()
#   household_no = serializers.SerializerMethodField()
#   sitio = serializers.SerializerMethodField()
#   father = serializers.SerializerMethodField()
#   mother = serializers.SerializerMethodField()
#   guardian = serializers.SerializerMethodField()
#   registered_by = serializers.SerializerMethodField()
#   class Meta: 
#     model = Family
#     fields = ['fam_id', 'household_no', 'sitio', 'fam_building', 'fam_indigenous', 'mother', 
#               'father', 'guardian', 'fam_date_registered', 'members', 'registered_by']
    
#   def get_household_no(self, obj):
#     """Get household number with null safety"""
#     try:
#       return obj.hh.hh_id if obj.hh else "N/A"
#     except AttributeError:
#       return "N/A"
    
#   def get_sitio(self, obj):
#     """Get sitio name with null safety"""
#     try:
#       if obj.hh and obj.hh.add and obj.hh.add.sitio:
#         return obj.hh.add.sitio.sitio_name
#       elif obj.hh and obj.hh.add and obj.hh.add.add_external_sitio:
#         return obj.hh.add.add_external_sitio
#       else:
#         return "N/A"
#     except AttributeError:
#       return "N/A"
    
#   def get_members(self, obj):
#     return FamilyComposition.objects.filter(fam=obj).count()

#   def get_father(self, obj):
#     """Get father with null safety"""
#     try:
#       father = FamilyComposition.objects.filter(fam=obj, fc_role='Father').first()
#       if father and father.rp and father.rp.per: 
#         info = father.rp.per
#         return f"{info.per_fname}" if info.per_fname else "-"
#     except (AttributeError, TypeError):
#       pass
#     return "-"
  
#   def get_mother(self, obj):
#     """Get mother with null safety"""
#     try:
#       mother = FamilyComposition.objects.filter(fam=obj, fc_role='Mother').first()
#       if mother and mother.rp and mother.rp.per: 
#         info = mother.rp.per
#         return f"{info.per_fname}" if info.per_fname else "-"
#     except (AttributeError, TypeError):
#       pass
#     return "-"
  
#   def get_guardian(self, obj):
#     """Get guardian with null safety"""
#     try:
#       guardian = FamilyComposition.objects.filter(fam=obj, fc_role='Guardian').first()
#       if guardian and guardian.rp and guardian.rp.per: 
#         info = guardian.rp.per
#         return f"{info.per_fname}" if info.per_fname else "-"
#     except (AttributeError, TypeError):
#       pass
#     return "-"

#   def get_registered_by(self, obj):
#     """Get registered by staff with null safety"""
#     try:
#       if not obj.staff:
#         return "N/A"
        
#       staff = obj.staff
#       staff_type = getattr(staff, 'staff_type', None)
#       staff_id = getattr(staff, 'staff_id', None)
      
#       if not staff_type or not staff_id:
#         return "N/A"
      
#       if staff_type == 'Barangay Staff':
#         prefix = 'B-'
#       elif staff_type == 'Health Staff':
#         prefix = 'H-'
#       else:
#         prefix = ''
      
#       return f"{prefix}{staff_id}"
#     except AttributeError:
#       return "N/A"
  
# class FamilyCreateSerializer(serializers.ModelSerializer):
#   class Meta: 
#     model = Family
#     fields = '__all__'
#     read_only_fields = ['fam_id', 'fam_date_registered']

#   def create(self, validated_data):
#     return Family.objects.create(
#       fam_id = self.generate_fam_no(validated_data['fam_building']),
#       fam_indigenous = validated_data['fam_indigenous'],
#       fam_building = validated_data['fam_building'],
#       fam_date_registered = timezone.now().date(),
#       hh = validated_data['hh'],
#       staff = validated_data['staff']
#     )
  
#   def generate_fam_no(self, building_type):

#     type = {'Owner' : 'O', 'Renter' : 'R', 'Other' : 'I'}

#     next_val = Family.objects.count() + 1
#     date = datetime.now()
#     year = str(date.year - 2000)
#     month = str(date.month).zfill(2)
#     day = str(date.day).zfill(2)
    
#     formatted = f"{next_val:04d}"
#     family_id = f"{year}{month}{day}00{formatted}-{type[building_type]}"
    
#     return family_id

# class FamilyListSerializer(serializers.ModelSerializer):
#   total_members = serializers.SerializerMethodField()
#   registered_by = serializers.SerializerMethodField()

#   class Meta:
#     model = Family
#     fields = ['fam_id', 'fam_building', 'total_members', 'fam_indigenous', 'fam_date_registered',
#               'registered_by']
  
#   def get_total_members(self, obj):
#     return FamilyComposition.objects.filter(fam=obj).count()
  
#   def get_registered_by(self, obj):
#     staff = obj.staff
#     staff_type = staff.staff_type
#     staff_id = staff.staff_id
    
#     if staff_type == 'Barangay Staff':
#       prefix = 'B-'
#     elif staff_type == 'Health Staff':
#       prefix = 'H-'
#     else:
#       prefix = ''
    
#     return f"{prefix}{staff_id}"




  
  


  
  