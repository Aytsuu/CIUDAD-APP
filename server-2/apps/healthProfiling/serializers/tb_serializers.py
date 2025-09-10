from rest_framework import serializers
from ..models import TBsurveilance, ResidentProfile

class TBSurveilanceSerializer(serializers.ModelSerializer):
    rp_id = serializers.CharField(source='rp.rp_id', read_only=True)
    resident_name = serializers.SerializerMethodField()
    
    class Meta:
        model = TBsurveilance
        fields = [
            'tb_id',
            'tb_meds_source',
            'tb_days_taking_meds',
            'tb_status',
            'rp',
            'rp_id',
            'resident_name'
        ]
        
    def get_resident_name(self, obj):
        if obj.rp and obj.rp.per:
            per = obj.rp.per
            return f"{per.per_fname} {per.per_lname}"
        return ""

class TBSurveilanceCreateSerializer(serializers.ModelSerializer):
    rp_id = serializers.CharField(write_only=True)
    tb_id = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = TBsurveilance
        fields = [
            'tb_id',
            'tb_meds_source',
            'tb_days_taking_meds',
            'tb_status',
            'rp_id'
        ]
        
    def create(self, validated_data):
        rp_id = validated_data.pop('rp_id')
        
        try:
            rp = ResidentProfile.objects.get(rp_id=rp_id)
            validated_data['rp'] = rp
        except ResidentProfile.DoesNotExist:
            raise serializers.ValidationError(f"ResidentProfile with id {rp_id} does not exist")
            
        # Auto-generate tb_id if not provided
        if not validated_data.get('tb_id'):
            # Generate based on resident ID and count
            existing_count = TBsurveilance.objects.filter(rp=rp).count()
            validated_data['tb_id'] = f"TB-{rp_id}-{existing_count + 1:03d}"
            
        return super().create(validated_data)

class TBSurveilanceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TBsurveilance
        fields = [
            'tb_meds_source',
            'tb_days_taking_meds',
            'tb_status'
        ]
