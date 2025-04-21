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
        extra_kwargs = {
            'per_mname': {'required': False},
            'per_suffix': {'required': False},
            'per_edAttainment': {'required': False}
        }

class BusinessFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessFile
        fields = '__all__'

class RequestFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestFile
        fields = '__all__'