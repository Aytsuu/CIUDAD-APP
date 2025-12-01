from rest_framework import serializers
from ..models import *
from datetime import date


class LaboratorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Laboratory
        fields = '__all__'
    

class FindingSerializer(serializers.ModelSerializer):
    pe_results = serializers.SerializerMethodField()
    lab_details = LaboratorySerializer(source="lab", read_only = True)
    
    def get_pe_results(self, obj):
        from apps.patientrecords.serializers.physicalexam_serializers import PEResultSerializer
        return PEResultSerializer(obj.pe_result.all(), many=True).data 
    
    class Meta:
        model = Finding
        fields = '__all__' 