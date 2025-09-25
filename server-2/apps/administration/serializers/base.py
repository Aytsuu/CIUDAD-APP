from rest_framework import serializers
from ..models import *


class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = '__all__'

class PositionSerializer(serializers.ModelSerializer):  
    class Meta: 
        model = Position
        fields = '__all__'

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = '__all__'