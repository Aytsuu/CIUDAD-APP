from rest_framework import serializers
from .models import *
from datetime import date
from apps.healthProfiling.serializers.base import PersonalSerializer
from apps.healthProfiling.serializers.minimal import ResidentProfileMinimalSerializer
from apps.healthProfiling.models import FamilyComposition
# from apps.healthProfiling.serializers.minimal import FCWithProfileDataSerializer
# serializers.py
class PatientSerializer(serializers.ModelSerializer):
    personal_info = PersonalSerializer(source='per_id', read_only=True)

    # resident_profile = ResidentProfileMinimalSerializer(source='per_id.personal_information', many=True, read_only=True)
    family_compositions = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = '__all__'

    def get_family_compositions(self, obj):
        from apps.healthProfiling.serializers.minimal import FCWithProfileDataSerializer
        resident_profiles = obj.per_id.personal_information.all()
        compositions = FamilyComposition.objects.filter(rp__in=resident_profiles)
        return FCWithProfileDataSerializer(compositions, many=True, context=self.context).data


class PatientRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientRecord
        fields = '__all__'
  