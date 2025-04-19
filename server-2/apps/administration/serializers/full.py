from ..models import *
from .base import *
from .minimal import *
from apps.healthProfiling.models import ResidentProfile

class StaffFullSerializer(serializers.ModelSerializer):
    pos = PositionSerializer(read_only=True)
    rp = serializers.SerializerMethodField()
    rp_id = serializers.PrimaryKeyRelatedField(queryset=ResidentProfile.objects.all(), write_only=True, source="rp")
    pos_id = serializers.PrimaryKeyRelatedField(queryset=Position.objects.all(), write_only=True, source="pos")
    assignments = AssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = Staff
        fields = '__all__'

    def get_rp(self, obj):
        from apps.healthProfiling.serializers.minimal import ResidentProfileMinimalSerializer  # Lazy import inside the method
        return ResidentProfileMinimalSerializer(obj.rp).data