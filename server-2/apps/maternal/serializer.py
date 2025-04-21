from rest_framework import serializers
from .models import *
from datetime import date

class PrenatalFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prenatal_Form
        fields = '__all__'

class ObstetricalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Obstetrical_History
        fields = '__all__'

# illness serializer

class PreviousHospitalizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Previous_Hospitalization
        fields = '__all__'

class PreviousPregnancySerializer(serializers.ModelSerializer):
    class Meta:
        model = Previous_Pregnancy
        fields = '__all__'

class TTStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = TT_Status
        fields = '__all__'

class LabResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lab_Result_Dates
        fields = '__all__'