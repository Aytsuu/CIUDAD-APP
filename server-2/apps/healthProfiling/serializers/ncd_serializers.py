from rest_framework import serializers
from ..models import NonCommunicableDisease, ResidentProfile

class NonCommunicableDiseaseSerializer(serializers.ModelSerializer):
    rp_id = serializers.CharField(source='rp.rp_id', read_only=True)
    resident_name = serializers.SerializerMethodField()
    
    class Meta:
        model = NonCommunicableDisease
        fields = [
            'ncd_id',
            'ncd_riskclass_age',
            'ncd_comorbidities', 
            'ncd_lifestyle_risk',
            'ncd_maintenance_status',
            'rp',
            'rp_id',
            'resident_name'
        ]
        
    def get_resident_name(self, obj):
        if obj.rp and obj.rp.per:
            per = obj.rp.per
            return f"{per.per_fname} {per.per_lname}"
        return ""

class NonCommunicableDiseaseCreateSerializer(serializers.ModelSerializer):
    rp_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = NonCommunicableDisease
        fields = [
            'ncd_riskclass_age',
            'ncd_comorbidities',
            'ncd_lifestyle_risk', 
            'ncd_maintenance_status',
            'rp_id'
        ]
        
    def create(self, validated_data):
        rp_id = validated_data.pop('rp_id')
        
        try:
            rp = ResidentProfile.objects.get(rp_id=rp_id)
            validated_data['rp'] = rp
        except ResidentProfile.DoesNotExist:
            raise serializers.ValidationError(f"ResidentProfile with id {rp_id} does not exist")
            
        # BigAutoField will auto-generate the ncd_id, no manual assignment needed
        return super().create(validated_data)

class NonCommunicableDiseaseUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NonCommunicableDisease
        fields = [
            'ncd_riskclass_age',
            'ncd_comorbidities',
            'ncd_lifestyle_risk',
            'ncd_maintenance_status'
        ]
