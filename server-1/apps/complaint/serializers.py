# Imports
# rest_framework
from rest_framework import serializers

# local
from apps.profiling.serializers.resident_profile_serializers import ResidentProfileBaseSerializer
from apps.administration.serializers.staff_serializers import StaffMinimalSerializer
from apps.administration.models import Staff, Position
from apps.profiling.models import ResidentProfile, Personal 
from .models import (Accused, Complainant, Complaint, ComplaintComplainant, ComplaintAccused, Complaint_File, ComplaintRecipient)

# utility
from utils.supabase_client import upload_to_storage

# python
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
            'comp_rejection_reason',
            'comp_cancel_reason',
            'complainant', 
            'accused',      
            'complaint_files',
            'comp_status',
            'staff',
        ]
        read_only_fields = ['comp_id', 'comp_created_at', 'complainant', 'accused_persons', 'complaint_files']
    
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
        """Get staff details with personal information"""
        if not obj.staff:
            return None
        
        try:
            staff = obj.staff
            
            resident_profile = staff.rp
            
            if not resident_profile:
                return {
                    'staff_id': staff.staff_id,
                    'staff_name': "No resident profile found",
                    'staff_position': None,
                }
            
            # Get personal data from ResidentProfile's per field
            personal = resident_profile.per
            
            # Staff Name
            if personal:
                staff_name = f"{personal.per_fname} {personal.per_lname}"
            else:
                staff_name = "Personal data not found"
            
            # Staff Position - get from staff's pos field
            staff_position = staff.pos
            
            return {
                'staff_id': staff.staff_id,
                'staff_name': staff_name or "Name not found",
                'staff_position': staff_position.pos_title if staff_position else None,
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'staff_id': obj.staff.staff_id if obj.staff else None,
            }
    
class ComplaintCreateSerializer(serializers.ModelSerializer):
    complainant = serializers.SerializerMethodField(read_only=True)
    accused = serializers.SerializerMethodField(read_only=True)
    complaint_files = ComplaintFileSerializer(source='files', many=True, read_only=True)
    staff = serializers.PrimaryKeyRelatedField(
        queryset=Staff.objects.all(), 
        required=False, 
        allow_null=True
    )
    
    class Meta:
        model = Complaint
        fields = [
            'comp_id',
            'comp_incident_type',
            'comp_location',
            'comp_datetime',
            'comp_allegation',
            'comp_created_at',
            'comp_rejection_reason',
            'comp_cancel_reason',
            'complainant', 
            'accused',      
            'complaint_files',
            'comp_status',
            'staff',
        ]
        read_only_fields = [
            'comp_id', 
            'comp_created_at', 
            'complainant', 
            'accused',
            'complaint_files',
            'comp_rejection_reason',
            'comp_cancel_reason',
        ]
    
    def get_complainant(self, obj):
        """Get all complainants for this complaint"""
        complainants = obj.complaintcomplainant_set.all()
        result = []
        for cc in complainants:
            complainant_data = {
                'cpnt_id': cc.cpnt.cpnt_id,
                'cpnt_name': cc.cpnt.cpnt_name,
                'cpnt_gender': cc.cpnt.cpnt_gender,
                'cpnt_age': cc.cpnt.cpnt_age,
                'cpnt_number': cc.cpnt.cpnt_number,
                'cpnt_relation_to_respondent': cc.cpnt.cpnt_relation_to_respondent,
                'cpnt_address': cc.cpnt.cpnt_address,
                'rp_id': cc.cpnt.rp_id.rp_id if cc.cpnt.rp_id else None
            }
            result.append(complainant_data)
        return result
    
    def get_accused(self, obj):
        """Get all accused persons for this complaint"""
        accused = obj.complaintaccused_set.all()
        result = []
        for ca in accused:
            accused_data = {
                'acsd_id': ca.acsd.acsd_id,
                'acsd_name': ca.acsd.acsd_name,
                'acsd_age': ca.acsd.acsd_age,
                'acsd_gender': ca.acsd.acsd_gender,
                'acsd_description': ca.acsd.acsd_description,
                'acsd_address': ca.acsd.acsd_address,
                'rp_id': ca.acsd.rp_id.rp_id if ca.acsd.rp_id else None
            }
            result.append(accused_data)
        return result
    
    def create(self, validated_data):
        # Get staff from validated_data
        staff = validated_data.pop('staff', None)
        
        complaint = Complaint.objects.create(**validated_data)
        
        if staff:
            complaint.staff = staff
            complaint.comp_status = "Accepted"
            complaint.save()
        
        return complaint
    
class ComplaintUpdateSerializer(serializers.ModelSerializer):
    staff_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Complaint
        fields = [
            'comp_status',
            'comp_rejection_reason',
            'comp_cancel_reason',
            'staff_id',
        ]
        extra_kwargs = {
            'comp_rejection_reason': {'required': False, 'allow_blank': True},
            'comp_cancel_reason': {'required': False, 'allow_blank': True},
            'staff_id': {'required': False, 'allow_null': True}
        }
    
    def validate(self, data):
        """Validate status transitions and required fields"""
        comp_status = data.get('comp_status')
        comp_rejection_reason = data.get('comp_rejection_reason', '').strip()
        comp_cancel_reason = data.get('comp_cancel_reason', '').strip()
        staff_id = data.get('staff_id')
        
        # Rejection requires a reason
        if comp_status == 'Rejected':
            if not comp_rejection_reason:
                raise serializers.ValidationError({
                    'comp_rejection_reason': 'Rejection reason is required when rejecting a complaint.'
                })
        
        # Cancellation requires a reason
        if comp_status == 'Cancelled':
            if not comp_cancel_reason:
                raise serializers.ValidationError({
                    'comp_cancel_reason': 'Cancellation reason is required when cancelling a complaint.'
                })
        
        # Accepted status requires staff_id
        if comp_status == 'Accepted':
            if not staff_id:
                raise serializers.ValidationError({
                    'staff_id': 'Staff ID is required when accepting a complaint.'
                })
        
        # Raised status requires staff_id
        if comp_status == 'Raised':
            if not staff_id:
                raise serializers.ValidationError({
                    'staff_id': 'Staff ID is required when raising a complaint.'
                })
        
        return data
    
    def update(self, instance, validated_data):
        staff_id = validated_data.pop('staff_id', None)

        # Update main fields
        instance.comp_status = validated_data.get('comp_status', instance.comp_status)
        instance.comp_rejection_reason = validated_data.get('comp_rejection_reason', instance.comp_rejection_reason)
        instance.comp_cancel_reason = validated_data.get('comp_cancel_reason', instance.comp_cancel_reason)

        # ✅ Properly set staff instance if provided
        if staff_id is not None:
            from apps.administration.models import Staff
            try:
                staff_instance = Staff.objects.get(staff_id=staff_id)
                instance.staff = staff_instance
            except Staff.DoesNotExist:
                raise serializers.ValidationError({'staff_id': 'Invalid staff ID'})

        instance.save()
        return instance

class ComplaintCardAnalyticsSerializer(serializers.Serializer):
    pending = serializers.IntegerField(default=0, read_only=True)
    accepted = serializers.IntegerField(default=0, read_only=True)
    rejected = serializers.IntegerField(default=0, read_only=True)
    cancelled = serializers.IntegerField(default=0, read_only=True)
    raised = serializers.IntegerField(default=0, read_only=True)