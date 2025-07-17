from rest_framework import serializers
from .models import *
from datetime import date
from apps.inventory.serializers import VaccineStockSerializer,VacccinationListSerializer
from apps.patientrecords.models import Patient,PatientRecord
from apps.patientrecords.serializers.patients_serializers import PatientSerializer,PatientRecordSerializer
from apps.patientrecords.serializers.vitalsigns_serializers import VitalSignsSerializer
from apps.patientrecords.serializers.followvisits_serializers import FollowUpVisitSerializer
# serializers. py

class PartialUpdateMixin:
    def to_internal_value(self, data):
        if self.instance:
            for field in self.fields:
                if field not in data:
                    self.fields[field].required = False
        return super().to_internal_value(data)


class BaseVaccinationRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaccinationRecord
        fields = '__all__'


class VaccinationHistorySerializerBase(PartialUpdateMixin,serializers.ModelSerializer):
    vital_signs = VitalSignsSerializer(source='vital', read_only=True)
    vaccine_stock = VaccineStockSerializer(source='vacStck_id', read_only=True)
    follow_up_visit = FollowUpVisitSerializer(source='followv', read_only=True)
    vacrec_details = BaseVaccinationRecordSerializer(source='vacrec', read_only=True)
  
    class Meta:
        model = VaccinationHistory
        fields = '__all__'
        
    
class VaccinationHistorySerializer(PartialUpdateMixin,serializers.ModelSerializer):
    vital_signs = VitalSignsSerializer(source='vital', read_only=True)
    vaccine_stock = VaccineStockSerializer(source='vacStck_id', read_only=True)
    follow_up_visit = FollowUpVisitSerializer(source='followv', read_only=True)
    vacrec_details = BaseVaccinationRecordSerializer(source='vacrec', read_only=True)
    patient = serializers.SerializerMethodField()
  
    class Meta:
        model = VaccinationHistory
        fields = '__all__'
        
    def get_patient(self, obj):
        try:
            return PatientSerializer(obj.vacrec.patrec_id.pat_id).data
        except Exception:
            return None
        
        


class VaccinationRecordSerializer(PartialUpdateMixin,serializers.ModelSerializer):
    vaccination_histories = VaccinationHistorySerializer(many=True, read_only=True)
    patient_record = PatientRecordSerializer(source='patrec_id', read_only=True)

    class Meta:
        model = VaccinationRecord
        fields = '__all__'
        
        
class VaccinationRecordSerializerBase(PartialUpdateMixin,serializers.ModelSerializer):
    vaccination_histories = VaccinationHistorySerializerBase(many=True, read_only=True)
    class Meta:
        model = VaccinationRecord
        fields = '__all__'

# ALL  VACCINATION RECORD 
class PatientVaccinationRecordSerializer(serializers.ModelSerializer):
    vaccination_count = serializers.SerializerMethodField()
    patient_details = PatientSerializer(source='*', read_only=True)
    
    class Meta:
        model = Patient
        fields = "__all__"

    def get_vaccination_count(self, obj):
        count = VaccinationHistory.objects.filter(
            vacrec__patrec_id__pat_id=obj.pat_id,
            vachist_status__in=['completed', 'partially vaccinated']
        ).count()
        print(f"Completed vaccination history count for patient {obj.pat_id}: {count}")
        return count

    # def get_vaccination_records(self, obj):
    #     records = obj.patient_records.filter(
    #         patrec_type__iexact='Vaccination',
    #         vaccination_records__vacrec_status__iexact='complete'
    #     ).distinct()
    #     return PatientRecordSerializer(records, many=True).data
