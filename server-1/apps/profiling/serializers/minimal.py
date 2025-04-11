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
    
class RequestRegistrationSerializer(serializers.ModelSerializer):
    per = PersonalSerializer(read_only=True)
    per_id = serializers.PrimaryKeyRelatedField(queryset=Personal.objects.all(), write_only=True, source='per')

    class Meta:
        model = RequestRegistration
        fields = '__all__'

class BusinessSerializer(serializers.ModelSerializer):
    sitio = SitioSerializer(read_only=True)
    sitio_id = serializers.PrimaryKeyRelatedField(queryset=Sitio.objects.all(), write_only=True, source='sitio')
    staff = serializers.SerializerMethodField()
    staff_id = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all(), write_only=True, source='staff')

    class Meta:
        model = Business
        fields = '__all__'

    def get_staff(self,obj):
        from apps.administration.serializers.minimal import StaffMinimalSerializer
        return StaffMinimalSerializer(obj.staff).data