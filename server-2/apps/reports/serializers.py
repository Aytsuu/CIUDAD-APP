from .models import *
from rest_framework import serializers
from apps.administration.serializers.staff_serializers import *


class MonthlyRCPReportSerializer(serializers.ModelSerializer):
    staff_details = StaffFullSerializer(source='staff', read_only=True)
    class Meta:
        model = MonthlyRecipientListReport
        fields = '__all__'
        

class FileInputSerializer(serializers.Serializer):
  name = serializers.CharField()
  type = serializers.CharField()
  file = serializers.CharField()
