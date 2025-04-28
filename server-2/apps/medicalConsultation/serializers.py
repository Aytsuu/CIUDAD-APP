from rest_framework import serializers
from .models import *
from datetime import date
from apps.patientrecords.serializers import PatientSerializer, PatientRecordSerializer,VitalSignsSerializer,BodyMeasurementSerializer,FindingSerializer
from apps.patientrecords.models import Patient, PatientRecord

class PatientMedConsultationRecordSerializer(serializers.ModelSerializer):
    medicalrec_count = serializers.SerializerMethodField()
    patient_details = PatientSerializer(source='*', read_only=True)
    patrec_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = "__all__"
        
    def get_medicalrec_count(self, obj):
        return obj.patient_records.filter(
            patrec_type__iexact='Medical Consultation'
        ).count()
        
    def get_patrec_details(self, obj):
        records = obj.patient_records.filter(patrec_type__iexact='Medical Consultation')
        return PatientRecordSerializer(records, many=True).data
    
    
class MedicalConsultationRecordSerializer(serializers.ModelSerializer):
    vital_signs = VitalSignsSerializer(source='vital', read_only=True)
    bmi_details = BodyMeasurementSerializer(source='bm', read_only=True)
    find_details = FindingSerializer(source='find', read_only=True)
    patrec_details = PatientMedConsultationRecordSerializer(source='patrec.pat_id', read_only=True)
    
    class Meta:
        model = MedicalConsultation_Record
        fields = '__all__'
    
    
