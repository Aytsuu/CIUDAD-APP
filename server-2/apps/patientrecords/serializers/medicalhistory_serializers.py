from rest_framework import serializers
from ..models import *
from apps.patientrecords.serializers.patients_serializers import PatientRecordSerializer
  
class MedicalHistorySerializer(serializers.ModelSerializer):
    patrec_details = PatientRecordSerializer(source='patrec', read_only=True)

    class Meta:
        model =MedicalHistory
        fields = '__all__'
      
       

