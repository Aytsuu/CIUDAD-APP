from rest_framework import serializers
from ..models import WeeklyAcknowledgementReport, WeeklyARComposition, AcknowledgementReport
from ..serializers.ar_serializers import ARBaseSerializer

class WARBaseSerializer(serializers.ModelSerializer):
  class Meta: 
    model = WeeklyAcknowledgementReport
    fields = '__all__'

class WARCompBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = WeeklyARComposition
    fields = '__all__'
  
class WARCompListSerializer(serializers.ModelSerializer):
  ar = serializers.SerializerMethodField()
  class Meta:
    model = WeeklyARComposition
    fields = ['warc_id', 'ar']
  
  def get_ar(self, obj):
    return ARBaseSerializer(obj.ar, read_only=True).data

class WARListSerializer(serializers.ModelSerializer):
  war_composition = serializers.SerializerMethodField()

  class Meta:
    model = WeeklyAcknowledgementReport
    fields = ['war_id', 'war_created_at', 'war_status', 'war_composition']

  def get_war_composition(self, obj):
    compositions = WeeklyARComposition.objects.filter(war=obj)
    return WARCompListSerializer(compositions, many=True).data