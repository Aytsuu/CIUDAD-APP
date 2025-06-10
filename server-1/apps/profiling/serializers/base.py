from rest_framework import serializers
from ..models import *

class PersonalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personal
        fields = '__all__'
        extra_kwargs = {
            'per_mname': {'required': False, 'allow_null': True},
            'per_suffix': {'required': False, 'allow_null': True},
            'per_edAttainment': {'required': False, 'allow_null': True},
        }

class ResidentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResidentProfile
        fields = '__all__'
        extra_kwargs = {
            'per': {'write_only': True}, 
            'staff': {'write_only': True}
        }

class SitioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sitio
        fields = '__all__'


class FamilyCompositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyComposition
        fields = '__all__'

class BusinessFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessFile
        fields = '__all__'

class RequestFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestFile
        fields = '__all__'