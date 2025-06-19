from rest_framework import serializers
from .models import  *

class AccusedNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintAccused
        fields = ['acsd']
        depth = 1  # To get the name of the accused from the Accused model

class ServiceChargeRequestSerializer(serializers.ModelSerializer):
    complainant_name = serializers.SerializerMethodField()
    accused_names = serializers.SerializerMethodField()
    incident_type = serializers.CharField(source='comp.comp_incident_type', read_only=True)
    allegation = serializers.CharField(source='comp.comp_allegation', read_only=True)
    status = serializers.CharField(source='sr_status', read_only=True)

    class Meta:
        model = ServiceChargeRequest
        fields = [''
                'sr_id', 
                'complainant_name', 
                'accused_names', 
                'incident_type', 
                'allegation', 
                'status'
                ]

    def get_complainant_name(self, obj):
        if obj.comp and obj.comp.cpnt:
            return obj.comp.cpnt.cpnt_name
        return None

    def get_accused_names(self, obj):
        if not obj.comp:
            return []

        accused_links = ComplaintAccused.objects.filter(comp=obj.comp)
        return [accused.acsd.acsd_name for accused in accused_links]
