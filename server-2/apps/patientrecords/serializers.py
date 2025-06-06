from rest_framework import serializers
from .models import *
from datetime import date
from apps.healthProfiling.serializers.base import PersonalSerializer
from apps.healthProfiling.serializers.minimal import ResidentProfileMinimalSerializer,HouseholdMinimalSerializer
from apps.healthProfiling.models import FamilyComposition,Household
# from apps.healthProfiling.serializers.minimal import FCWithProfileDataSerializer
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
    resident_profile = ResidentProfileMinimalSerializer(source='rp_id', read_only=True)
    family_compositions = serializers.SerializerMethodField()
    households = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = '__all__'

    def get_personal_info(self, obj):
        personal = obj.rp_id.per  # ✅ Get the full Personal instance
        return PersonalSerializer(personal, context=self.context).data

    def get_family_compositions(self, obj):
        resident_profiles = obj.rp_id.per.personal_information.all()
        compositions = FamilyComposition.objects.filter(rp__in=resident_profiles)
        return FCWithProfileDataSerializer(compositions, many=True, context=self.context).data

    def get_households(self, obj):
        resident_profiles = obj.rp_id.per.personal_information.all()
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


class ObstetricalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Obstetrical_History
        fields = '__all__'


class FollowUpVisitSerializer(PartialUpdateMixin,serializers.ModelSerializer):
    class Meta:
        model = FollowUpVisit
        fields = '__all__'
        
        
class BodyMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyMeasurement
        fields = '__all__'

class IllnessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Illness
class FindingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Finding
        fields = '__all__'
        
class PhysicalExaminationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhysicalExamination
        fields = '__all__'

class PhysicalExamListSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhysicalExamList
        fields = '__all__'
        
class DiagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = '__all__'

