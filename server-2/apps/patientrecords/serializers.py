from rest_framework import serializers
from .models import *
from datetime import date
from apps.healthProfiling.serializers.base import PersonalSerializer
from apps.healthProfiling.serializers.minimal import ResidentProfileMinimalSerializer,HouseholdMinimalSerializer
from apps.healthProfiling.models import FamilyComposition,Household, ResidentProfile, Personal, PersonalAddress, Address
from apps.healthProfiling.serializers.minimal import FCWithProfileDataSerializer
# serializers.py
from apps.healthProfiling.serializers.minimal import (
    ResidentProfileMinimalSerializer,
    FCWithProfileDataSerializer,
    HouseholdMinimalSerializer
)

class PartialUpdateMixin:  
    def to_internal_value(self, data):
        if self.instance:
            for field in self.fields:
                if field not in data:
                    self.fields[field].required = False
        return super().to_internal_value(data)
    
class PatientSerializer(serializers.ModelSerializer):
    personal_info = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    resident_profile = ResidentProfileMinimalSerializer(source='rp_id', read_only=True)
    family_compositions = serializers.SerializerMethodField()
    households = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = '__all__'

    def get_personal_info(self, obj):
        personal = obj.rp_id.per  # ✅ Get the full Personal instance
        return PersonalSerializer(personal, context=self.context).data

    def get_personal_info(self, obj):
        personal = obj.rp_id.per  # ✅ Get the full Personal instance
        return PersonalSerializer(personal, context=self.context).data

    def get_family_compositions(self, obj):
        resident_profiles = obj.rp_id.per.personal_information.all()
        resident_profiles = obj.rp_id.per.personal_information.all()
        compositions = FamilyComposition.objects.filter(rp__in=resident_profiles)
        return FCWithProfileDataSerializer(compositions, many=True, context=self.context).data


    def get_households(self, obj):
        resident_profiles = obj.rp_id.per.personal_information.all()
        resident_profiles = obj.rp_id.per.personal_information.all()
        households = Household.objects.filter(rp__in=resident_profiles)
        return HouseholdMinimalSerializer(households, many=True, context=self.context).data
    
    def get_address(self, obj):
        if obj.rp_id and obj.rp_id.per:
            personal_address = PersonalAddress.objects.filter(per=obj.rp_id.per).first()
            if personal_address and personal_address.add:
                address = personal_address.add
                return {
                    'add_street': address.add_street,
                    'add_barangay': address.add_barangay,
                    'add_city': address.add_city,
                    'add_province': address.add_province,
                    'sitio': address.sitio.sitio_name if address.sitio else address.add_external_sitio
                }
        return None
    
    def get_spouse(self, obj):
        return None
    
    


class PatientRecordSerializer(serializers.ModelSerializer):
    pat_details = PatientSerializer(source='pat_id', read_only=True)

    class Meta:
        model = PatientRecord
        fields = '__all__'
  
    
class VitalSignsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalSigns
        fields = '__all__'


class ObstetricalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Obstetrical_History
        fields = '__all__'


class FollowUpVisitSerializer(PartialUpdateMixin,serializers.ModelSerializer):
    class Meta:
        model = FollowUpVisit
        fields = '__all__'


class SpouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spouse
        fields = '__all__'

class SpouseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spouse
        fields = [ 'spouse_type', 'spouse_lname', 'spouse_fname', 'spouse_mname',
                  'spouse_occupation', 'spouse_dob', 'pat_id' ]
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


class SpouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spouse
        fields = '__all__'

class SpouseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spouse
        fields = [ 'spouse_type', 'spouse_lname', 'spouse_fname', 'spouse_mname',
                  'spouse_occupation', 'spouse_dob', 'pat_id' ]
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