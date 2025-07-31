from ..models import PatientDisablity,ListOfDisabilities
from rest_framework import serializers
from apps.patientrecords.serializers.patients_serializers import PatientRecordSerializer

class ListDisabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ListOfDisabilities
        fields = '__all__'
        
class PatientDisablitySerializerBase(serializers.ModelSerializer):
    disability_details = ListDisabilitySerializer(source='disability', read_only=True)
    class Meta:
        model = PatientDisablity
        fields = '__all__'
        
class PatientDisabilitySerializer(serializers.ModelSerializer):
    patrec_details = PatientRecordSerializer(source='patrec', read_only=True)
   
    class Meta:
        model = PatientDisablity
        fields = '__all__'
        