from rest_framework import serializers
from ..models import *
from .base import *

class ResidentProfileMinimalSerializer(serializers.ModelSerializer):
    per = PersonalSerializer(read_only=True)

    class Meta:
        model = ResidentProfile
        fields = '__all__'

class DependentSerializer(serializers.ModelSerializer):
    rp = ResidentProfileMinimalSerializer(read_only=True)
    rp_id = serializers.PrimaryKeyRelatedField(queryset=ResidentProfile.objects.all(), write_only=True, source='rp')

    class Meta:
        model = Dependent
        fields = '__all__'

class HouseholdMinimalSerializer(serializers.ModelSerializer):
    sitio = SitioSerializer(read_only=True)
    rp = ResidentProfileMinimalSerializer(read_only=True)
    staff = serializers.SerializerMethodField()

    class Meta:
        model = Household
        fields = '__all__'
    
    def get_staff(self, obj):
        from apps.administration.serializers import StaffSerializer
        return StaffSerializer(obj.staff, context=self.context).data
    
class RequestSerializer(serializers.ModelSerializer):
    per = PersonalSerializer(read_only=True)
    per_id = serializers.PrimaryKeyRelatedField(queryset=Personal.objects.all(), write_only=True, source='per')

    class Meta:
        model = Request
        fields = '__all__'

class MotherSerializer(serializers.ModelSerializer):
    rp = ResidentProfileMinimalSerializer(read_only=True)
    rp_id = serializers.PrimaryKeyRelatedField(queryset=ResidentProfile.objects.all(), write_only=True, source='rp')

    class Meta:
        model = Mother
        fields = '__all__'

class FatherSerializer(serializers.ModelSerializer):
    rp = ResidentProfileMinimalSerializer(read_only=True)
    rp_id = serializers.PrimaryKeyRelatedField(queryset=ResidentProfile.objects.all(), write_only=True, source='rp')

    class Meta:
        model = Father
        fields = '__all__'

class GuardianSerializer(serializers.ModelSerializer):
    rp = ResidentProfileMinimalSerializer(read_only=True)
    rp_id = serializers.PrimaryKeyRelatedField(queryset=ResidentProfile.objects.all(), write_only=True, source='rp')

    class Meta:
        model = Guardian
        fields = '__all__'