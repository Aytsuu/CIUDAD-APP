from rest_framework import serializers
from ..models import *
from ..serializers.feature_serializers import FeatureBaseSerializer

class AssignmentBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Assignment
    fields = '__all__'

class AssignmentMinimalSerializer(serializers.ModelSerializer):
  feat = FeatureBaseSerializer(read_only=True)
  feat_id = serializers.PrimaryKeyRelatedField(queryset=Feature.objects.all(), write_only=True, source="feat")
  pos = PositionBaseSerializer(read_only=True)

  class Meta:
    model = Assignment
    fields = '__all__'