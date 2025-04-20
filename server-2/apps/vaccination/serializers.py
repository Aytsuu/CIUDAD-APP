from rest_framework import serializers
from .models import *
from datetime import date
from apps.inventory.serializers import VaccineStockSerializer,VacccinationListSerializer
from apps.patientrecords.models import Patient,PatientRecord
from apps.patientrecords.serializers import PatientSerializer,PatientRecordSerializer
# serializers.py


class VitalSignsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalSigns
        fields = '__all__'

class VaccinationHistorySerializer(serializers.ModelSerializer):
    vital_signs = VitalSignsSerializer(source='vital_id', read_only=True)
    vaccine_stock = VaccineStockSerializer(source='vacStck_id', read_only=True)

    class Meta:
        model = VaccinationHistory
        fields = '__all__'

class VaccinationRecordSerializer(serializers.ModelSerializer):
    vaccination_histories = VaccinationHistorySerializer(many=True, read_only=True)
    class Meta:
        model = VaccinationRecord
        fields = '__all__'


# VACCCINATION RECORD 
class PatientVaccinationRecordSerializer(serializers.ModelSerializer):
    # vaccination_services = serializers.SerializerMethodField()
    vaccination_count = serializers.SerializerMethodField()
    patient_details = PatientSerializer(source='*', read_only=True)

    class Meta:
        model = Patient  # This model should be Patient
        fields = '__all__'

    # def get_vaccination_services(self, obj):
    #     # Access the related Patient object and filter PatientRecords based on "Vaccination"
    #     records = obj.patient_records.filter(patrec_type__iexact='Vaccination')
    #     return PatientRecordSerializer(records, many=True).data

    def get_vaccination_count(self, obj):
        # Count the related PatientRecords based on "Vaccination"
        return obj.patient_records.filter(patrec_type__iexact='Vaccination').count()


