from rest_framework import serializers
from .models import *
from datetime import date
from apps.patientrecords.serializers.patients_serializers import PatientSerializer, PatientRecordSerializer
from apps.patientrecords.serializers.vitalsigns_serializers import VitalSignsSerializer
from apps.patientrecords.serializers.bodymesurement_serializers import BodyMeasurementSerializer
from apps.patientrecords.serializers.findings_serializers import FindingSerializer
from apps.patientrecords.models import *
from apps.administration.serializers.staff_serializers import *  
from apps.childhealthservices.serializers import NutritionalStatusSerializerBase
class PatientMedConsultationRecordSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='*', read_only=True)
    medicalrec_count = serializers.IntegerField(read_only=True)  # ✅ Add this line
 
    class Meta:
        model = Patient
        fields = "__all__"
        

 
    
class MedicalConsultationRecordSerializer(serializers.ModelSerializer):
    vital_signs = VitalSignsSerializer(source='vital', read_only=True)
    bmi_details = BodyMeasurementSerializer(source='bm', read_only=True)
    find_details = FindingSerializer(source='find', read_only=True)
    patrec_details = PatientMedConsultationRecordSerializer(source='patrec.pat_id', read_only=True)

    staff_details = StaffMinimalSerializer(source='staff', read_only=True)
    
    class Meta:
        model = MedicalConsultation_Record
        fields = '__all__'
    
    
# serializers.py
# serializers.py

class MedicalConsultationCreateSerializer(serializers.Serializer):
    pat_id = serializers.IntegerField()
    vital_bp_systolic = serializers.CharField(required=False, allow_blank=True)
    vital_bp_diastolic = serializers.CharField(required=False, allow_blank=True)
    vital_temp = serializers.CharField(required=False, allow_blank=True)
    vital_RR = serializers.CharField(required=False, allow_blank=True)
    vital_pulse = serializers.CharField(required=False, allow_blank=True)
    height = serializers.FloatField()
    weight = serializers.FloatField()
    medrec_chief_complaint = serializers.CharField()

    def validate_height(self, value):
        return value or 0

    def validate_weight(self, value):
        return value or 0
