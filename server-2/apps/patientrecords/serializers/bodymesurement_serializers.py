from rest_framework import serializers
from ..models import *
from ..serializers.patients_serializers import PatientSerializer


class BodyMeasurementSerializer(serializers.ModelSerializer):
    pat_details = PatientSerializer(source='pat', read_only=True)
    class Meta:
        model = BodyMeasurement
        fields = '__all__'



