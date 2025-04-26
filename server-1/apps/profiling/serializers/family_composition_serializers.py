from rest_framework import serializers
from ..models import *

class FamilyCompositionBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = FamilyComposition
    fields = '__all__'

class FamilyCompositionExtendedSerializer(serializers.ModelSerializer):
  rp_id = serializers.CharField(source='rp.rp_id')
  name = serializers.SerializerMethodField()
  sex = serializers.CharField(source='rp.per.per_sex')
  dob = serializers.DateField(source='rp.per.per_dob')
  status = serializers.CharField(source='rp.per.per_status')

  class Meta: 
    model = FamilyComposition
    fields = ['rp_id', 'fc_role', 'name', 'sex', 'dob', 'status']
  
  def get_name(self, obj):
    info = obj.rp.per
    return f"{info.per_lname}, {info.per_fname}" + \
          (f" {info.per_mname[0]}." if info.per_mname else '')

    
class FamilyCompositionBulkCreateSerializer(serializers.ModelSerializer):
  class Meta:
    model = FamilyComposition
    fields = '__all__'
    read_only_fields = ['fc_id']