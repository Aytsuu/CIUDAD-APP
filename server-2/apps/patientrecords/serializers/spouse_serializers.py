from rest_framework import serializers
from ..models import *
from datetime import date

from apps.healthProfiling.serializers.minimal import *

class PartialUpdateMixin:  
    def to_internal_value(self, data):
        if self.instance:
            for field in self.fields:
                if field not in data:
                    self.fields[field].required = False
        return super().to_internal_value(data)
    

class SpouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spouse
        fields = '__all__'

class SpouseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spouse
        fields = [ 'spouse_type', 'spouse_lname', 'spouse_fname', 'spouse_mname',
                  'spouse_occupation', 'spouse_dob', 'created_at']
        extra_kwargs = {
            'spouse_mname': { 'required': False, 'allow_blank': True },
            'spouse_dob': { 'required': False, 'allow_blank': True }
        }
    
    def validate(self, data):
        required_fields = ['spouse_lname', 'spouse_fname', 'spouse_occupation', 'spouse_dob', 'pat_id']
        
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError(f"{field} is required.")
            
        return data

