from rest_framework import serializers
from .models import *
from datetime import date
from apps.inventory.serializers import VaccineStockSerializer,VacccinationListSerializer
from apps.patientrecords.models import Patient,PatientRecord
from apps.patientrecords.serializers import PatientSerializer,PatientRecordSerializer,FollowUpVisitSerializer
from apps.patientrecords.serializers import VitalSignsSerializer
# serializers.py

class PartialUpdateMixin:
    def to_internal_value(self, data):
        if self.instance:
            for field in self.fields:
                if field not in data:
                    self.fields[field].required = False
        return super().to_internal_value(data)

# class VitalSignsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = VitalSigns
#         fields = '__all__'

class VaccinationHistorySerializer(PartialUpdateMixin,serializers.ModelSerializer):
    vital_signs = VitalSignsSerializer(source='vital', read_only=True)
    vaccine_stock = VaccineStockSerializer(source='vacStck', read_only=True)
    follow_up_visit = FollowUpVisitSerializer(source='followv', read_only=True)

    class Meta:
        model = VaccinationHistory
        fields = '__all__'

class VaccinationRecordSerializer(serializers.ModelSerializer):
    vaccination_histories = VaccinationHistorySerializer(many=True, read_only=True)
    class Meta:
        model = VaccinationRecord
        fields = '__all__'


# VACCCINATION RECORD 
# VACCINATION RECORD 
class PatientVaccinationRecordSerializer(serializers.ModelSerializer):
    vaccination_count = serializers.SerializerMethodField()
    vaccination_records = serializers.SerializerMethodField()
    patient_details = PatientSerializer(source='*', read_only=True)

    class Meta:
        model = Patient
        fields = "__all__"

    def get_vaccination_count(self, obj):
        # Get all vaccination records
        vaccination_records = obj.patient_records.filter(
            patrec_type__iexact='Vaccination'
        )
        
        # Exclude records with forwarded status
        valid_records = vaccination_records.exclude(
            vaccination_records__vaccination_histories__vachist_status__iexact='forwarded'
        )
        
        return valid_records.count()
    def get_vaccination_records(self, obj):
        # Get filtered vaccination records excluding "forwarded" status
        records = obj.patient_records.filter(
            patrec_type__iexact='Vaccination'
        ).exclude(
            vaccination_records__vaccination_histories__vachist_status__iexact='forwarded'
        )
        return PatientRecordSerializer(records, many=True).data