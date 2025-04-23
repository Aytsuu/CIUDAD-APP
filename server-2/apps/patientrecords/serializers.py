from rest_framework import serializers
from .models import *
from datetime import date
from apps.healthProfiling.serializers.base import PersonalSerializer
from apps.healthProfiling.serializers.minimal import ResidentProfileMinimalSerializer,HouseholdMinimalSerializer
from apps.healthProfiling.models import FamilyComposition,Household
# from apps.healthProfiling.serializers.minimal import FCWithProfileDataSerializer
# serializers.py


class PartialUpdateMixin:
    def to_internal_value(self, data):
        if self.instance:
            for field in self.fields:
                if field not in data:
                    self.fields[field].required = False
        return super().to_internal_value(data)
class PatientSerializer(serializers.ModelSerializer):
    personal_info = PersonalSerializer(source='per_id', read_only=True)
    resident_profile = ResidentProfileMinimalSerializer(source='per_id.personal_information', many=True, read_only=True)
    family_compositions = serializers.SerializerMethodField()
    households = serializers.SerializerMethodField()  # 🔥 Add this line


    class Meta:
        model = Patient
        fields = '__all__'

    def get_family_compositions(self, obj):
        from apps.healthProfiling.serializers.minimal import FCWithProfileDataSerializer
        resident_profiles = obj.per_id.personal_information.all()
        compositions = FamilyComposition.objects.filter(rp__in=resident_profiles)
        return FCWithProfileDataSerializer(compositions, many=True, context=self.context).data
    def get_households(self, obj):
        # 🔎 Find all ResidentProfiles related to this personal info
        resident_profiles = obj.per_id.personal_information.all()
        # 🏠 Get all households connected to those ResidentProfiles
        households = Household.objects.filter(rp__in=resident_profiles)
        return HouseholdMinimalSerializer(households, many=True, context=self.context).data


class PatientRecordSerializer(serializers.ModelSerializer):
    pat_details = PatientSerializer(source='pat_id', read_only=True)

    class Meta:
        model = PatientRecord
        fields = '__all__'
  
  
    
class VitalSignsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalSigns
        fields = '__all__'
        
        
class FollowUpVisitSerializer(PartialUpdateMixin,serializers.ModelSerializer):
    class Meta:
        model = FollowUpVisit
        fields = '__all__'
