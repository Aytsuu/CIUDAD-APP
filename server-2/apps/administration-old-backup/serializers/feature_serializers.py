from rest_framework import serializers
from ..models import Feature

class FeatureBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Feature
    fields = '__all__'