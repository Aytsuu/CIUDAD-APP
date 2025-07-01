from rest_framework import serializers
from ..models import ReportType

class ReportTypeBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = ReportType
    fields = '__all__'
    