from rest_framework import serializers
from ..models import *
from ..serializers.ar_serializers import ARTableSerializer

class WARBaseSerializer(serializers.ModelSerializer):
  class Meta: 
    model = WeeklyAccomplishmentReport
    fields = '__all__'

class WARCompBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = WeeklyARComposition
    fields = '__all__'

class WARFileBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = WARFile
    fields = '__all__'
  
class WARCompListSerializer(serializers.ModelSerializer):
  ar = serializers.SerializerMethodField()
  class Meta:
    model = WeeklyARComposition
    fields = ['warc_id', 'ar']
  
  def get_ar(self, obj):
    return ARTableSerializer(obj.ar, read_only=True).data

class WARListSerializer(serializers.ModelSerializer):
  war_composition = serializers.SerializerMethodField()
  status = serializers.CharField(source="war_status")
  id = serializers.IntegerField(source="war_id")
  war_files = serializers.SerializerMethodField()
  date = serializers.DateField(source="war_created_at")

  class Meta:
    model = WeeklyAccomplishmentReport
    fields = ['id', 'date', 'status', 'war_composition', 'war_files']

  def get_war_composition(self, obj):
    compositions = WeeklyARComposition.objects.filter(war=obj)
    return WARCompListSerializer(compositions, many=True).data
  
  def get_war_files(self, obj):
    files = WARFile.objects.filter(war=obj)
    return WARFileBaseSerializer(files, many=True).data