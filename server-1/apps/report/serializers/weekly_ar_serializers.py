from rest_framework import serializers
from ..models import *
from ..serializers.ar_serializers import ARTableSerializer
from apps.profiling.serializers.business_serializers import FileInputSerializer

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
  id = serializers.IntegerField(source="war_id")
  war_files = serializers.SerializerMethodField()
  status = serializers.CharField(source='war_status')
  created_at = serializers.DateField(source="war_created_at")
  created_for = serializers.DateField(source="war_created_for")

  class Meta:
    model = WeeklyAccomplishmentReport
    fields = ['id', 'created_at', 'created_for', 'war_composition', 'status',
               'war_files']

  def get_war_composition(self, obj):
    compositions = WeeklyARComposition.objects.filter(war=obj)
    return WARCompListSerializer(compositions, many=True).data
  
  def get_war_files(self, obj):
    files = WARFile.objects.filter(war=obj)
    return WARFileBaseSerializer(files, many=True).data

class WARFileCreateSerializer(serializers.ModelSerializer):
  files = FileInputSerializer(write_only=True, many=True)

  class Meta:
    model = WARFile
    fields = ['war', 'files']