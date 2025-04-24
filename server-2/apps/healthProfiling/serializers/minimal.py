from ..models import *
from .base import *
from apps.administration.models import Staff

class ResidentProfileMinimalSerializer(serializers.ModelSerializer):
    per = PersonalSerializer(read_only=True)

    class Meta:
        model = ResidentProfile
        fields = '__all__'

class HouseholdMinimalSerializer(serializers.ModelSerializer):
    sitio = SitioSerializer(read_only=True)
    rp = ResidentProfileMinimalSerializer(read_only=True)
    staff = serializers.SerializerMethodField()

    class Meta:
        model = Household
        fields = '__all__'
    
    def get_staff(self, obj):
        from apps.administration.serializers.minimal import StaffMinimalSerializer
        return StaffMinimalSerializer(obj.staff, context=self.context).data

class FamilyMinimalSerializer(serializers.ModelSerializer):
    hh = HouseholdMinimalSerializer(read_only=True)

    class Meta:
        model = Family
        fields = '__all__'
    
class RequestRegistrationSerializer(serializers.ModelSerializer):
    per = PersonalSerializer(read_only=True)
    per_id = serializers.PrimaryKeyRelatedField(queryset=Personal.objects.all(), write_only=True, source='per')

    class Meta:
        model = RequestRegistration
        fields = '__all__'

class FCWithProfileDataSerializer(serializers.ModelSerializer):
    rp = ResidentProfileMinimalSerializer(read_only=True)
    rp_id = serializers.PrimaryKeyRelatedField(queryset=ResidentProfile.objects.all(), write_only=True, source="rp")
    class Meta:
        model = FamilyComposition
        fields = ['fc_role', 'rp', 'rp_id']

class FCWithFamilyDataSerializer(serializers.ModelSerializer):
    fam = FamilyMinimalSerializer(read_only=True)

    class Meta: 
        model = FamilyComposition
        fields = ['fc_role', 'fam']
