from rest_framework import serializers
from .models import *
from datetime import date
from apps.inventory.serializers.vaccine_serializers import *
from apps.patientrecords.models import Patient,PatientRecord
from apps.patientrecords.serializers.patients_serializers import *
from apps.patientrecords.serializers.vitalsigns_serializers import VitalSignsSerializer
from apps.patientrecords.serializers.followvisits_serializers import FollowUpVisitSerializer
from apps.administration.serializers.staff_serializers import StaffTableSerializer
# serializers. py

 


class BaseVaccinationRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaccinationRecord
        fields = '__all__'


class VaccinationHistorySerializerBase(serializers.ModelSerializer):
    vital_signs = VitalSignsSerializer(source='vital', read_only=True)
    vaccine_stock = VaccineStockSerializer(source='vacStck_id', read_only=True)
    follow_up_visit = FollowUpVisitSerializer(source='followv', read_only=True)
    vacrec_details = BaseVaccinationRecordSerializer(source='vacrec', read_only=True)
    vac_details = VacccinationListSerializer(source='vac', read_only=True)
    assessed_by = StaffTableSerializer(source='staff', read_only=True)
    administered_by =StaffTableSerializer(source='assigned_to', read_only=True)

    class Meta:
        model = VaccinationHistory
        fields = '__all__'
        
    
class VaccinationHistorySerializer(serializers.ModelSerializer):
    vital_signs = VitalSignsSerializer(source='vital', read_only=True)
    vaccine_stock = VaccineStockSerializer(source='vacStck_id', read_only=True)
    follow_up_visit = FollowUpVisitSerializer(source='followv', read_only=True)
    vacrec_details = BaseVaccinationRecordSerializer(source='vacrec', read_only=True)
    patient = serializers.SerializerMethodField()
    vac_details = VacccinationListSerializer(source='vac', read_only=True)
  
    class Meta:
        model = VaccinationHistory
        fields = '__all__'
        
    def get_patient(self, obj):
        try:
            return PatientMiniMalSerializer(obj.vacrec.patrec_id.pat_id).data
        except Exception:
            return None
        

class VaccinationRecordSerializer(serializers.ModelSerializer):
    vaccination_histories = VaccinationHistorySerializer(many=True, read_only=True)
    patient_record = PatientRecordSerializer(source='patrec_id', read_only=True)

    class Meta:
        model = VaccinationRecord
        fields = '__all__'
        
        
class VaccinationRecordSerializerBase(serializers.ModelSerializer):
    vaccination_histories = VaccinationHistorySerializerBase(many=True, read_only=True)
    class Meta:
        model = VaccinationRecord
        fields = '__all__'

# ALL  VACCINATION RECORD 
class PatientVaccinationRecordSerializer(serializers.ModelSerializer):
    vaccination_count = serializers.SerializerMethodField()
    patient_details = PatientSerializer(source='*', read_only=True)
    latest_vaccination_date = serializers.SerializerMethodField()
    
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
    
    def get_latest_vaccination_date(self, obj):
        # Get the most recent vaccination date for this patient
        latest_vaccination = VaccinationHistory.objects.filter(
            vacrec__patrec_id__pat_id=obj.pat_id,
            vachist_status__in=['completed', 'partially vaccinated']
        ).order_by('-date_administered').first()
        
        if latest_vaccination and latest_vaccination.date_administered:
            return latest_vaccination.date_administered
        return None