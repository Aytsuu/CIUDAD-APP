from rest_framework import serializers
from apps.profiling.serializers.resident_profile_serializers import ResidentProfileBaseSerializer
from apps.administration.serializers.staff_serializers import StaffMinimalSerializer
from .models import *
import json

class AccusedSerializer(serializers.ModelSerializer):
    res_profile = ResidentProfileBaseSerializer(source='rp_id', read_only=True)  
    
    class Meta:
        model = Accused
        fields = '__all__'

    def get_res_profile(self, obj):
        if obj.rp_id:
            return ResidentProfileBaseSerializer(obj.rp_id).data
        return None
    
class ComplainantSerializer(serializers.ModelSerializer):
    res_profile = ResidentProfileBaseSerializer(source='rp_id', read_only=True) 
    class Meta:
        model = Complainant
        fields = '__all__'
    def get_res_profile(self, obj):
        if obj.rp_id:
            return ResidentProfileBaseSerializer(obj.rp_id).data
        return None
    
class ComplaintFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint_File
        fields = '__all__'

class ComplaintSerializer(serializers.ModelSerializer):
    complainant = serializers.SerializerMethodField()
    accused = serializers.SerializerMethodField()
    complaint_files = ComplaintFileSerializer(source='complaint_file', many=True, read_only=True)
    staff = serializers.SerializerMethodField()
        
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
            'accused',      
            'complaint_files',
            'comp_status',
            'staff',
        ]
        read_only_fields = ['comp_id', 'comp_created_at', 'complainant', 'accused_persons', 'complaint_files', 'staff']
    
    def get_complainant(self, obj):
        """Get all complainants for this complaint"""
        complainants = obj.complaintcomplainant_set.all()
        result = []
        for cc in complainants:
            complainant_data = ComplainantSerializer(cc.cpnt).data
            result.append(complainant_data)
        return result
    
    def get_accused(self, obj):
        """Get all accused persons for this complaint"""
        accused = obj.complaintaccused_set.all()
        result = []
        for ca in accused:
            accused_data = AccusedSerializer(ca.acsd).data
            result.append(accused_data)
        return result
    
    def get_staff(self, obj):
        """Get staff information if available"""
        if obj.staff:
            return StaffMinimalSerializer(obj.staff).data
        return None
        