from rest_framework import serializers
from ..models import *

class SitioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sitio
        fields = '__all__'


class FamilyCompositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyComposition
        fields = '__all__'


class PersonalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personal
        fields = '__all__'


class HealthRelatedDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthRelatedDetails
        fields = '__all__'


class WaterSupplySerializer(serializers.ModelSerializer):
    class Meta:
        model = WaterSupply
        fields = '__all__'


class WaterSupplyUpdateSerializer(serializers.ModelSerializer):
    staff_id = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = WaterSupply
        fields = [
            'water_sup_type',
            'water_conn_type',
            'water_sup_desc',
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


class SanitaryFacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = SanitaryFacility
        fields = '__all__'


class SanitaryFacilityUpdateSerializer(serializers.ModelSerializer):
    staff_id = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = SanitaryFacility
        fields = [
            'sf_type',
            'sf_desc',
            'sf_toilet_type',
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


# class FacilityDetailsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FacilityDetails
#         fields = '__all__'


class NonCommunicableDiseaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = NonCommunicableDisease
        fields = '__all__'


class TBsurveillanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TBsurveilance
        fields = '__all__'


class SolidWasteMgmtSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolidWasteMgmt
        fields = '__all__'


class SolidWasteMgmtUpdateSerializer(serializers.ModelSerializer):
    staff_id = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = SolidWasteMgmt
        fields = [
            'swn_desposal_type',
            'swm_desc',
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


class MotherHealthInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MotherHealthInfo
        fields = '__all__'

