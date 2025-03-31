from rest_framework import serializers
from .models import *
from apps.administration.models import Staff

class SitioSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Sitio
        fields = '__all__'

class FamilyCompositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyComposition
        fields = '__all__'

class PersonalSerializer(serializers.ModelSerializer):

    class Meta:
        model = Personal
        fields = '__all__'

class ResidentProfileMinimalSerializer(serializers.ModelSerializer):
    per = PersonalSerializer(read_only=True)

    class Meta:
        model = ResidentProfile
        fields = '__all__'
    
class ResidentProfileFullSerializer(serializers.ModelSerializer):
    per = PersonalSerializer(read_only=True)
    compositions = FamilyCompositionSerializer(many=True, read_only=True)
    family = serializers.SerializerMethodField()

    per_id = serializers.PrimaryKeyRelatedField(queryset=Personal.objects.all(), write_only=True, source='per')

    class Meta:
        model = ResidentProfile
        fields = '__all__'
    
    def get_family(self, obj):
        # Fetch all families associated with the Personal record through FamilyComposition
        family = Family.objects.filter(compositions__rp=obj).distinct()
        return FamilySerializer(family, many=True).data

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
       

class DependentSerializer(serializers.ModelSerializer):
    rp = ResidentProfileMinimalSerializer(read_only=True)
    rp_id = serializers.PrimaryKeyRelatedField(queryset=ResidentProfile.objects.all(), write_only=True, source='rp')

    class Meta:
        model = Dependent
        fields = '__all__'

class FamilySerializer(serializers.ModelSerializer):
    dependents = DependentSerializer(many=True, read_only=True)
    mother = MotherSerializer(read_only=True)
    father = FatherSerializer(read_only=True)

    mother_id = serializers.PrimaryKeyRelatedField(
        queryset=Mother.objects.all(), 
        write_only=True, 
        source="mother",
        allow_null=True, 
    )
    father_id = serializers.PrimaryKeyRelatedField(
        queryset=Father.objects.all(), 
        write_only=True, 
        source="father",
        allow_null=True, 
    )

    class Meta:
        model = Family
        fields = '__all__'

class HouseholdSerializer(serializers.ModelSerializer):
    sitio = SitioSerializer(read_only=True)  # Read-only for display
    rp = ResidentProfileMinimalSerializer(read_only=True)  # Read-only for display
    family = serializers.SerializerMethodField()
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
    
    def get_family(self,obj):
        family = Family.objects.filter(hh=obj)
        return FamilySerializer(family, many=True).data

class RequestSerializer(serializers.ModelSerializer):
    per = PersonalSerializer(read_only=True)
    per_id = serializers.PrimaryKeyRelatedField(queryset=Personal.objects.all(), write_only=True, source='per')

    class Meta:
        model = Request
        fields = '__all__'

class BusinessSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Business
        fields = '__all__'