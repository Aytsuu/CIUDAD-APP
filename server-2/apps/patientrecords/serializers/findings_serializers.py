from rest_framework import serializers
from ..models import *
from datetime import date


class FindingSerializer(serializers.ModelSerializer):
    pe_results = serializers.SerializerMethodField()
    
    def get_pe_results(self, obj):
        from apps.patientrecords.serializers.physicalexam_serializers import PEResultSerializer
        return PEResultSerializer(obj.pe_result.all(), many=True).data 
    
    class Meta:
        model = Finding
        fields = '__all__' 