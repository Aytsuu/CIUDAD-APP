from rest_framework import serializers
from .models import *
from apps.profiling.serializers.address_serializers import AddressBaseSerializer

class AccusedSerializer(serializers.ModelSerializer):
    add = AddressBaseSerializer(read_only=True)
    
    class Meta:
        model = Accused
        fields = '__all__'

class ComplainantSerializer(serializers.ModelSerializer):
    add = AddressBaseSerializer(read_only=True)
    
    class Meta:
        model = Complainant
        fields = '__all__'

class ComplaintFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint_File
        fields = '__all__'

class ComplaintSerializer(serializers.ModelSerializer):
    complainant = serializers.SerializerMethodField()
    accused_persons = serializers.SerializerMethodField()
    complaint_files = ComplaintFileSerializer(source='complaint_file', many=True, read_only=True)
    
    class Meta:
        model = Complaint
        fields = [
            'comp_id',
            'comp_incident_type',
            'comp_location',
            'comp_datetime',
            'comp_allegation',
            'comp_created_at',
            'comp_is_archive',
            'complainant', 
            'accused_persons',      
            'complaint_files',
            'comp_status',
        ]

    def get_accused_persons(self, obj):
        complaint_accused = ComplaintAccused.objects.filter(comp=obj)
        return AccusedSerializer([ca.acsd for ca in complaint_accused], many=True).data

    def get_complainant(self, obj): 
        complaint_complainant = ComplaintComplainant.objects.filter(comp=obj)
        return ComplainantSerializer([cc.cpnt for cc in complaint_complainant], many=True).data