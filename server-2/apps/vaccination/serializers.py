from rest_framework import serializers
from .models import *
from datetime import date

class VaccineStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaccineStock
        fields = '__all__'

class VitalSignsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalSigns
        fields = '__all__'

class VaccinationHistorySerializer(serializers.ModelSerializer):
    vital_signs = VitalSignsSerializer(source='vital_id', read_only=True)
    vaccine_details = VaccineStockSerializer(source='vacStck_id', read_only=True)
    class Meta:
        model = VaccinationHistory
        fields = '__all__'

class VaccinationRecordSerializer(serializers.ModelSerializer):
    vaccination_history = VaccinationHistorySerializer(many=True, read_only=True)
    class Meta:
        model = VaccinationRecord
        fields = '__all__'


class PatientRecordSerializer(serializers.ModelSerializer):    
    class Meta:
        model = PatientRecord
        fields = '__all__'
    
  
class ServicesRecordsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicesRecords
        fields = '__all__'
    

#ALL RECORDS
class VaccinationRecordsSerializer(serializers.ModelSerializer):
    service_records = serializers.SerializerMethodField()
    patient_detail = PatientRecordSerializer(source='serv_id.pat_id', read_only=True)
    vaccination_history = serializers.SerializerMethodField()
    vaccination_count = serializers.SerializerMethodField()

    class Meta:
        model = VaccinationRecord
        fields = '__all__'

    def get_service_records(self, obj):
        """Only include if service is Vaccination"""
        if obj.serv_id.serv_name == 'Vaccination':
            return ServicesRecordsSerializer(obj.serv_id).data
        return None

    def get_vaccination_history(self, obj):
        """Only include vaccination histories for Vaccination services"""
        if obj.serv_id.serv_name == 'Vaccination':
            return VaccinationHistorySerializer(
                obj.vaccination_histories.all(),
                many=True
            ).data
        return None

    def get_vaccination_count(self, obj):
        """Count all Vaccination records for this patient"""
        return VaccinationRecord.objects.filter(
            serv_id__pat_id=obj.serv_id.pat_id.pat_id,
            serv_id__serv_name='Vaccination'
        ).count()