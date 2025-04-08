from rest_framework import serializers
from apps.administration.models import Staff
from ..models import *
from .base import *
from .minimal import *

class ResidentProfileFullSerializer(serializers.ModelSerializer):
    per = PersonalSerializer(read_only=True)
    compositions = FamilyCompositionSerializer(many=True, read_only=True)
    family = serializers.SerializerMethodField()
    per_id = serializers.PrimaryKeyRelatedField(
        queryset=Personal.objects.all(), 
        write_only=True, 
        source='per'
    )

    class Meta:
        model = ResidentProfile
        fields = '__all__'

    def get_family(self, obj):
        family = Family.objects.filter(compositions__rp=obj).distinct()
        return FamilyFullSerializer(family, many=True, context=self.context).data

class HouseholdFullSerializer(serializers.ModelSerializer):
    sitio = SitioSerializer(read_only=True)
    rp = ResidentProfileMinimalSerializer(read_only=True)
    family = serializers.SerializerMethodField()
    staff = serializers.SerializerMethodField()
    
    sitio_id = serializers.PrimaryKeyRelatedField(queryset=Sitio.objects.all(), write_only=True, source='sitio')
    rp_id = serializers.PrimaryKeyRelatedField(queryset=ResidentProfile.objects.all(), write_only=True, source='rp')
    staff_id = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all(), write_only=True, source='staff', allow_null=True)
    
    class Meta:
        model = Household
        fields = '__all__'

    def get_staff(self, obj):
        from apps.administration.serializers import StaffSerializer
        return StaffSerializer(obj.staff, context=self.context).data
    
    def get_family(self, obj):
        return FamilyFullSerializer(obj.family_set.all(), many=True).data
    
class FamilyFullSerializer(serializers.ModelSerializer):
    dependents = DependentSerializer(many=True, read_only=True)
    mother = MotherSerializer(read_only=True)
    father = FatherSerializer(read_only=True)
    guard = GuardianSerializer(read_only=True)
    hh = HouseholdMinimalSerializer(read_only=True)

    mother_id = serializers.PrimaryKeyRelatedField(queryset=Mother.objects.all(), write_only=True, source="mother", allow_null=True)
    father_id = serializers.PrimaryKeyRelatedField(queryset=Father.objects.all(), write_only=True, source="father", allow_null=True)
    guard_id = serializers.PrimaryKeyRelatedField(queryset=Guardian.objects.all(), write_only=True, source="guard", allow_null=True)
    hh_id = serializers.PrimaryKeyRelatedField(queryset=Household.objects.all(), write_only=True, source="hh", allow_null=True)

    class Meta:
        model = Family
        fields = '__all__'