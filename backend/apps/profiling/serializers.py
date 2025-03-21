from rest_framework import serializers
from .models import *

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

class RegisteredSerializer(serializers.ModelSerializer):

    class Meta:
        model = Registered
        fields = '__all__'

class PersonalSerializer(serializers.ModelSerializer):
    registered = RegisteredSerializer(many=True, read_only=True)
    compositions = FamilyCompositionSerializer(many=True, read_only=True)
    family = serializers.SerializerMethodField()

    class Meta:
        model = Personal
        fields = '__all__'

    def get_family(self, obj):
        # Fetch all families associated with the Personal record through FamilyComposition
        family = Family.objects.filter(compositions__per=obj).distinct()
        return FamilySerializer(family, many=True).data

class HouseholdSerializer(serializers.ModelSerializer):
    sitio = SitioSerializer(read_only=True)  # Read-only for display
    per = PersonalSerializer(read_only=True)  # Read-only for display
    
    sitio_id = serializers.PrimaryKeyRelatedField(queryset=Sitio.objects.all(), write_only=True, source='sitio') 
    per_id = serializers.PrimaryKeyRelatedField(queryset=Personal.objects.all(), write_only=True, source='per')
    
    class Meta:
        model = Household
        fields = '__all__'
    

class BuildingSerializer(serializers.ModelSerializer):
    hh = HouseholdSerializer(read_only=True)
    hh_id = serializers.PrimaryKeyRelatedField(queryset=Household.objects.all(), write_only=True, source='hh')
    
    class Meta:
        model = Building
        fields = '__all__'

    