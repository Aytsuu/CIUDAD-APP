from rest_framework import serializers
from ..models import Staff

class StaffBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Staff
    fields = '__all__'

class StaffTableSerializer(serializers.ModelSerializer):
  lname = serializers.CharField(source='rp.per.per_lname')
  fname = serializers.CharField(source='rp.per.per_fname')
  mname = serializers.CharField(source='rp.per.per_mname')
  dob = serializers.CharField(source='rp.per.per_dob')
  contact = serializers.CharField(source='rp.per.per_contact')

  class Meta:
    model = Staff
    fields = ['staff_id', 'lname', 'fname', 'mname', 'dob', 
              'contact', 'position', 'staff_assign_date']
    