from .base import *
from apps.profiling.models import ResidentProfile

class AssignmentSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)  
    feat = FeatureSerializer(read_only=True)

    class Meta:
        model = Assignment
        fields = '__all__'

class StaffMinimalSerializer(serializers.ModelSerializer):
    rp = serializers.SerializerMethodField()
    rp_id = serializers.PrimaryKeyRelatedField(queryset=ResidentProfile.objects.all(), write_only=True, source="rp")

    class Meta:
        model = Staff
        fields = '__all__'

    def get_rp(self, obj):
        from apps.profiling.serializers.minimal import ResidentProfileMinimalSerializer  # Lazy import inside the method
        return ResidentProfileMinimalSerializer(obj.rp).data