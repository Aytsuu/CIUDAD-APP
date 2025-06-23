from rest_framework import serializers
from ..models import *

class ARSerializer(serializers.ModelSerializer):
  class Meta:
    model = AcknowledgementReport
    fields = '__all__'

class ARFSerializer(serializers.ModelSerializer):
  class Meta:
    model = AcknowledgementReportFile
    fields = '__all__'