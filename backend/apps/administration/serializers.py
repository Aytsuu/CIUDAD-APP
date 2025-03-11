from rest_framework import serializers
from .models import *

class PositionSerializer(serializers.ModelSerializer):  
    class Meta: 
        model = Position
        fields = ['pos_id', 'pos_title']

class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ['feat_id', 'feat_name', 'feat_category']

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['perm_id', 'view', 'create', 'update', 'delete', 'assi']

class AssignmentSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Assignment
        fields = ['assi_id', 'assi_date', 'feat', 'pos', 'permissions']
