from rest_framework import serializers
from ..models import *

class FamilyCompositionBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = FamilyComposition
    fields = '__all__'

class FamilyCompositionExtendedSerializer(serializers.ModelSerializer):
  rp_id = serializers.CharField(source='rp.rp_id')
  lname = serializers.CharField(source='rp.per.per_lname')
  fname = serializers.CharField(source='rp.per.per_fname')
  mname = serializers.CharField(source='rp.per.per_mname')
  sex = serializers.CharField(source='rp.per.per_sex')
  dob = serializers.DateField(source='rp.per.per_dob')
  status = serializers.CharField(source='rp.per.per_status')

  class Meta: 
    model = FamilyComposition
    fields = ['rp_id', 'fc_role', 'lname', 'fname', 'mname',
               'sex', 'dob', 'status']
    
class FamilyCompositionBulkCreateSerializer(serializers.ModelSerializer):
  class Meta:
    model = FamilyComposition
    fields = '__all__'
    read_only_fields = ['fc_id']