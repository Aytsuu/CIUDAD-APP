from rest_framework import serializers
from ..models import *


class PersonalBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personal
        fields = '__all__'
        extra_kwargs = {
            'per_mname': {'required': False, 'allow_null': True},
            'per_suffix': {'required': False, 'allow_null': True},
            'per_edAttainment': {'required': False, 'allow_null': True},
        }