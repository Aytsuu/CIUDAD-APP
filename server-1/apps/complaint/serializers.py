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
    accused_persons = serializers.SerializerMethodField()
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
            'accused_persons',      
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
    
    def get_accused_persons(self, obj):
        """Get all accused persons for this complaint"""
        accused = obj.complaintaccused_set.all()
        result = []
        for ca in accused:
            accused_data = AccusedSerializer(ca.acsd).data
            result.append(accused_data)
        return result
    
    def get_staff(self, obj):
        """Get staff information if available"""
        if obj.staff_id:
            return StaffMinimalSerializer(obj.staff_id).data
        return None
        
    def create(self, validated_data):
        
        # Get data from request
        request_data = self.context['request'].data
        
        # Handle JSON strings from FormData
        complainants_data = request_data.get('complainant', [])
        if isinstance(complainants_data, str):
            try:
                complainants_data = json.loads(complainants_data)
            except json.JSONDecodeError:
                complainants_data = []
            
        accused_data = request_data.get('accused_persons', [])
        if isinstance(accused_data, str):
            try:
                accused_data = json.loads(accused_data)
            except json.JSONDecodeError:
                accused_data = []
            
        complaint_files_data = request_data.get('complaint_files', [])
        if isinstance(complaint_files_data, str):
            try:
                complaint_files_data = json.loads(complaint_files_data)
            except json.JSONDecodeError:
                complaint_files_data = []
        
        # Create the complaint first
        complaint = Complaint.objects.create(**validated_data)
        
        # Create complainants and link them
        for cpnt_data in complainants_data:
            # Convert rp_id to proper format if it exists
            if cpnt_data.get('rp_id') and cpnt_data['rp_id'] != 'null':
                try:
                    from apps.profiling.models import ResidentProfile
                    rp_instance = ResidentProfile.objects.get(rp_id=cpnt_data['rp_id'])
                    cpnt_data['rp_id'] = rp_instance.pk
                except ResidentProfile.DoesNotExist:
                    cpnt_data['rp_id'] = None
            else:
                cpnt_data['rp_id'] = None
            
            cpnt_serializer = ComplainantSerializer(data=cpnt_data)
            if cpnt_serializer.is_valid(raise_exception=True):
                cpnt_instance = cpnt_serializer.save()
                ComplaintComplainant.objects.create(comp=complaint, cpnt=cpnt_instance)
        
        # Create accused persons and link them
        for acsd_data in accused_data:
            # Convert rp_id to proper format if it exists
            if acsd_data.get('rp_id') and acsd_data['rp_id'] != 'null':
                try:
                    from apps.profiling.models import ResidentProfile
                    rp_instance = ResidentProfile.objects.get(rp_id=acsd_data['rp_id'])
                    acsd_data['rp_id'] = rp_instance.pk
                except ResidentProfile.DoesNotExist:
                    acsd_data['rp_id'] = None
            else:
                acsd_data['rp_id'] = None
                
            acsd_serializer = AccusedSerializer(data=acsd_data)
            if acsd_serializer.is_valid(raise_exception=True):
                acsd_instance = acsd_serializer.save()
                ComplaintAccused.objects.create(comp=complaint, acsd=acsd_instance)
        
        # Create complaint files if any
        for file_data in complaint_files_data:
            # Ensure the file data has the complaint reference
            file_data['comp_id'] = complaint.comp_id
            file_serializer = ComplaintFileSerializer(data=file_data)
            if file_serializer.is_valid(raise_exception=True):
                file_serializer.save()
        
        return complaint