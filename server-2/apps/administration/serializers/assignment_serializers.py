from rest_framework import serializers
from ..models import *
from ..serializers.feature_serializers import FeatureBaseSerializer
from ..serializers.permission_serializers import PermissionBaseSerializer

class AssignmentBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Assignment
    fields = '__all__'

class AssignmentMinimalSerializer(serializers.ModelSerializer):
  permissions = PermissionBaseSerializer(many=True, read_only=True)  
  feat = FeatureBaseSerializer(read_only=True)
  feat_id = serializers.PrimaryKeyRelatedField(queryset=Feature.objects.all(), write_only=True, source="feat")

  class Meta:
    model = Assignment
    fields = '__all__'