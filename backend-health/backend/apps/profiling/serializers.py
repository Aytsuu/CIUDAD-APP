from rest_framework import serializers
from .models import *
from apps.administration.models import Staff
from apps.administration.serializers import StaffSerializer

class SitioSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Sitio
        fields = '__all__'

class MotherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mother
        fields = '__all__'

class FatherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Father
        fields = '__all__'

class DependentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dependent
        fields = '__all__'

class FamilyCompositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyComposition
        fields = '__all__'

class FamilySerializer(serializers.ModelSerializer):
    building = serializers.SerializerMethodField()
    dependents = DependentSerializer(many=True, read_only=True)

    class Meta:
        model = Family
        fields = '__all__'
    
    def get_building(self, obj):
        # Fetch the related Building for the Family
        building = Building.objects.filter(fam=obj).first()
        if building:
            return {
                'build_id': building.build_id,
                'build_type': building.build_type,
                'hh_id': building.hh.hh_id if building.hh else None,
            }
        return None

class PersonalSerializer(serializers.ModelSerializer):

    class Meta:
        model = Personal
        fields = '__all__'
    
class ResidentProfileSerializer(serializers.ModelSerializer):
    per = PersonalSerializer(read_only=True)
    per_id = serializers.PrimaryKeyRelatedField(queryset=Personal.objects.all(), write_only=True, source='per')
    compositions = FamilyCompositionSerializer(many=True, read_only=True)
    family = serializers.SerializerMethodField()

    class Meta:
        model = ResidentProfile
        fields = '__all__'
    
    def get_family(self, obj):
        # Fetch all families associated with the Personal record through FamilyComposition
        family = Family.objects.filter(compositions__rp=obj).distinct()
        return FamilySerializer(family, many=True).data

class HouseholdSerializer(serializers.ModelSerializer):
    sitio = SitioSerializer(read_only=True)  # Read-only for display
    rp = ResidentProfileSerializer(read_only=True)  # Read-only for display
    staff = serializers.SerializerMethodField()
    
    sitio_id = serializers.PrimaryKeyRelatedField(queryset=Sitio.objects.all(), write_only=True, source='sitio') 
    rp_id = serializers.PrimaryKeyRelatedField(queryset=ResidentProfile.objects.all(), write_only=True, source='rp')
    staff_id = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all(), write_only=True, source='staff')
    
    class Meta:
        model = Household
        fields = '__all__'

    def get_staff(self, obj):
        from apps.administration.serializers import StaffSerializer  # Lazy import inside the method
        return StaffSerializer(obj.staff).data

class BuildingSerializer(serializers.ModelSerializer):
    hh = HouseholdSerializer(read_only=True)
    hh_id = serializers.PrimaryKeyRelatedField(queryset=Household.objects.all(), write_only=True, source='hh')
    
    class Meta:
        model = Building
        fields = '__all__'

    