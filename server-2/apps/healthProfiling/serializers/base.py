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


class SanitaryFacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = SanitaryFacility
        fields = '__all__'


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

