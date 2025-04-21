from django.db import transaction
from apps.administration.models import Staff
from ..models import *
from .base import *
from .minimal import *
from apps.account.serializers import UserAccountSerializer

class ResidentProfileFullSerializer(serializers.ModelSerializer):
    per = PersonalSerializer(read_only=True)
    family_compositions = FCWithFamilyDataSerializer(many=True, read_only=True)
    per_id = serializers.PrimaryKeyRelatedField(
        queryset=Personal.objects.all(), 
        write_only=True, 
        source='per'
    )
    is_staff = serializers.SerializerMethodField()
    account = UserAccountSerializer(read_only=True)
    staff = serializers.SerializerMethodField()
    staff_id = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all(), write_only=True, source="staff", allow_null=True)

    class Meta:
        model = ResidentProfile
        fields = '__all__'

    @transaction.atomic
    def create(self, validated_data):
        per =  validated_data.pop('per', None) 
        staff = validated_data.pop('staff', None)

        resident_profile = ResidentProfile.objects.create(per=per, staff=staff,**validated_data)
        return resident_profile
    
    def get_staff(self, obj):
        from apps.administration.serializers.full import StaffFullSerializer
        return StaffFullSerializer(obj.staff).data

    def get_is_staff(self, obj):
        return hasattr(obj, 'staff_assignments') and bool(obj.staff_assignments.all())    


class HouseholdFullSerializer(serializers.ModelSerializer):
    sitio = SitioSerializer(read_only=True)
    rp = ResidentProfileMinimalSerializer(read_only=True)
    family = serializers.SerializerMethodField()
    staff = serializers.SerializerMethodField()
    
    sitio_id = serializers.PrimaryKeyRelatedField(queryset=Sitio.objects.all(), write_only=True, source='sitio')
    rp_id = serializers.PrimaryKeyRelatedField(queryset=ResidentProfile.objects.all(), write_only=True, source='rp')
    staff_id = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all(), write_only=True, source='staff')
    
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