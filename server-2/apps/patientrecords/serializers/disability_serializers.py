from ..models import PatientDisablity,ListOfDisabilities
from rest_framework import serializers


class ListDisabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ListOfDisabilities
        fields = '__all__'
        
class PatientDisabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientDisablity
        fields = '__all__'
        