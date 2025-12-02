from rest_framework import serializers
from ..models import *
from ..serializers.patients_serializers import PatientSerializer
from ..utils import *


class BodyMeasurementBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyMeasurement
        fields = '__all__'



class BodyMeasurementSerializer(serializers.ModelSerializer):
    pat_details = PatientSerializer(source='pat', read_only=True)
    class Meta:
        model = BodyMeasurement
        fields = '__all__'

class ChildrenBodyMeasurementBaseSerializer(serializers.ModelSerializer):
    personal_info = serializers.SerializerMethodField()

    def get_personal_info(self, obj):
        return extract_personal_info(obj.pat)

    class Meta:
        model = BodyMeasurement
        fields = '__all__'


