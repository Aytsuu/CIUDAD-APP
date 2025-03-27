from rest_framework import serializers
from .models import *
from apps.profiling.models import ResidentProfile

class PositionSerializer(serializers.ModelSerializer):  
    class Meta: 
        model = Position
        fields = '__all__'

class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = '__all__'

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)  
    
    class Meta:
        model = Assignment
        fields = '__all__'

class StaffSerializer(serializers.ModelSerializer):
    pos = PositionSerializer(read_only=True)
    rp = serializers.SerializerMethodField()
    rp_id = serializers.PrimaryKeyRelatedField(queryset=ResidentProfile.objects.all(), write_only=True, source="rp")
    pos_id = serializers.PrimaryKeyRelatedField(queryset=Position.objects.all(), write_only=True, source="pos")

    class Meta:
        model = Staff
        fields = '__all__'

    def get_rp(self, obj):
        from apps.profiling.serializers import ResidentProfileSerializer  # Lazy import inside the method
        return ResidentProfileSerializer(obj.rp).data


