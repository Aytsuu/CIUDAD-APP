from apps.administration.models import Staff
from ..models import *
from .base import *
from .minimal import *
# from apps.account.serializers import UserAccountSerializer

class ResidentProfileFullSerializer(serializers.ModelSerializer):
    per = PersonalSerializer(read_only=True)
    family_compositions = FCWithFamilyDataSerializer(many=True, read_only=True)
    per_id = serializers.PrimaryKeyRelatedField(
        queryset=Personal.objects.all(), 
        write_only=True, 
        source='per'
    )
    # account = UserAccountSerializer(read_only=True)
    staff = serializers.SerializerMethodField()
    staff_id = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all(), write_only=True, source="staff", allow_null=True)

    class Meta:
        model = ResidentProfile
        fields = '__all__'
    
    def get_staff(self, obj):
        from apps.administration.staff_serializers import StaffFullSerializer
        return StaffFullSerializer(obj.staff).data

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
        from apps.administration.serializers.minimal import StaffMinimalSerializer
        return StaffMinimalSerializer(obj.staff, context=self.context).data
    
    def get_family(self, obj):
        return FamilyFullSerializer(obj.family_set.all(), many=True).data
    
class FamilyFullSerializer(serializers.ModelSerializer):
    hh = HouseholdMinimalSerializer(read_only=True)
    staff = serializers.SerializerMethodField()
    family_compositions = FCWithProfileDataSerializer(many=True, read_only=True)

    hh_id = serializers.PrimaryKeyRelatedField(queryset=Household.objects.all(), write_only=True, source="hh")
    staff_id = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all(), write_only=True, source="staff")    

    class Meta:
        model = Family
        fields = '__all__'
    
    def get_staff(self, obj):
        from apps.administration.serializers.minimal import StaffMinimalSerializer
        return StaffMinimalSerializer(obj.staff).data

class FamilyCompositionFullSerializer(serializers.ModelSerializer):
    fam = FamilyFullSerializer(read_only=True)
    rp = ResidentProfileMinimalSerializer(read_only=True)
    fam_id = serializers.PrimaryKeyRelatedField(queryset=Family.objects.all(), write_only=True, source="fam")
    rp_id = serializers.PrimaryKeyRelatedField(queryset=ResidentProfile.objects.all(), write_only=True, source="rp")
    class Meta:
        model = FamilyComposition
        fields = '__all__'