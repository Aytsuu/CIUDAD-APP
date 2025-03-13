from rest_framework import serializers
from .models import *

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
