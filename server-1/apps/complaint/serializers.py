from utils.supabase_client import upload_to_storage
from rest_framework import serializers
from apps.profiling.serializers.resident_profile_serializers import ResidentProfileBaseSerializer
from apps.administration.serializers.staff_serializers import StaffMinimalSerializer
from .models import *
import json
from django.utils import timezone

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
        extra_kwargs = {
            'comp': {'required': False, 'default': None},
            'comp_file_url': {'read_only': True},
        }
    
    def _upload_files(self, files, comp_instance=None):
        if not comp_instance:
            raise serializers.ValidationError({"error": "comp_instance is required"})
        
        complaint_files = []
        
        for file_data in files:
            # Validate file data
            if not file_data.get('file') or not isinstance(file_data['file'], str) or not file_data['file'].startswith('data:'):
                print(f"Skipping invalid file data: {file_data.get('name', 'unknown')}")
                continue
            
            try:
                # Upload to storage first and get the URL
                file_url = upload_to_storage(file_data, 'complaint-bucket', 'documents')
                print(f"Successfully uploaded file: {file_data['name']} to {file_url}")
                
                # Create the Complaint_File instance with ForeignKey reference
                complaint_file = Complaint_File(
                    comp_file_name=file_data['name'],
                    comp_file_type=file_data['type'],
                    comp_file_url=file_url,
                    comp=comp_instance,
                )
                
                complaint_files.append(complaint_file)
                
            except Exception as e:
                print(f"Failed to process file {file_data['name']}: {e}")
                continue
        
        # Save all files at once using bulk_create
        if complaint_files:
            try:
                Complaint_File.objects.bulk_create(complaint_files)
                print(f"Successfully created {len(complaint_files)} complaint file records")
            except Exception as bulk_error:
                print(f"Bulk create failed, trying individual saves: {bulk_error}")
                # Fallback: save individually
                saved_files = []
                for complaint_file in complaint_files:
                    try:
                        complaint_file.save()
                        saved_files.append(complaint_file)
                    except Exception as save_error:
                        print(f"Failed to save individual file {complaint_file.comp_file_name}: {save_error}")
                complaint_files = saved_files
                print(f"Successfully saved {len(complaint_files)} files individually")
        else:
            print("No valid files to upload")
        
        return complaint_files

class ComplaintSerializer(serializers.ModelSerializer):
    complainant = serializers.SerializerMethodField()
    accused = serializers.SerializerMethodField()
    complaint_files = ComplaintFileSerializer(source='files', many=True, read_only=True)
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