from rest_framework import serializers
from ..models import WeeklyAcknowledgementReport, WeeklyARComposition

class WARBaseSerializer(serializers.ModelSerializer):
  class Meta: 
    model = WeeklyAcknowledgementReport
    fields = '__all__'

class WARCompBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = WeeklyARComposition
    fields = '__all__'
