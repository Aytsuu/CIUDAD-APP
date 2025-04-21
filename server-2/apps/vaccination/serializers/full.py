from rest_framework import serializers
from ..models import *
from datetime import date
from .base import *
from apps.inventory.serializers import VaccineStockSerializer

#ALL RECORDS
class VaccinationRecordsSerializer(serializers.ModelSerializer):
    service_records = serializers.SerializerMethodField()
    patient_detail = PatientRecordSerializer(many=True,read_only=True)
    vaccination_history = serializers.SerializerMethodField()
    vaccination_count = serializers.SerializerMethodField()
    all_vital_signs = serializers.SerializerMethodField()
    vaccine_details = VaccineStockSerializer(many=True,read_only=True)
    
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
    
    def get_all_vital_signs(self, obj):
        """Get all vital signs for this vaccination record"""
        vital_signs = obj.vaccination_histories.first().vital_id
        if vital_signs:
            return VitalSignsSerializer(vital_signs).data
        return None
        
        
        
    