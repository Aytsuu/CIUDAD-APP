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
    
    class Meta:
        model = TBsurveilance
        fields = [
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
            
        # BigAutoField will auto-generate the tb_id, no manual assignment needed
        return super().create(validated_data)

class TBSurveilanceUpdateSerializer(serializers.ModelSerializer):
    staff_id = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = TBsurveilance
        fields = [
            'tb_meds_source',
            'tb_days_taking_meds',
            'tb_status',
            'staff_id'
        ]
    
    def update(self, instance, validated_data):
        from apps.administration.models import Staff
        
        # Extract staff_id for history tracking
        staff_id = validated_data.pop('staff_id', None)
        
        # Set history user if staff_id provided
        if staff_id:
            try:
                staff = Staff.objects.get(staff_id=staff_id)
                instance._history_user = staff
            except Staff.DoesNotExist:
                pass
        
        # Update instance fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

