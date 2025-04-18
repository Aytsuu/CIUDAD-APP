from rest_framework import serializers
from .models import *
from datetime import date  # Add this import


class PatientRecordSerializer(serializers.ModelSerializer):
    class Meta: 
        model = PatientRecord
        fields = '__all__'

class VaccinationRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaccinationRecord
        fields = '__all__'

class VitalSignsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalSigns
        fields = '__all__'

class VaccinationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VaccinationHistory
        fields = '__all__'

class ServicesRecordsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicesRecords
        fields = '__all__'
    
    

    