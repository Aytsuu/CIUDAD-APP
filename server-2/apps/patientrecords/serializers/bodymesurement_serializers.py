from rest_framework import serializers
from ..models import *


class BodyMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyMeasurement
        fields = '__all__'



