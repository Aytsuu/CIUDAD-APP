from rest_framework import serializers
from .models import Complaint, Complainant, Accused, ComplaintAccused, Complaint_File
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
    cpnt = ComplainantSerializer(read_only=True)
    accused_persons = serializers.SerializerMethodField()
    complaint_files = ComplaintFileSerializer(source='complaint_file', many=True, read_only=True)
    
    class Meta:
        model = Complaint
        fields = [
            'comp_id', 
            'comp_incident_type', 
            'comp_datetime', 
            'comp_allegation', 
            'comp_created_at',
            'comp_is_archive',
            'comp_category',
            'cpnt', 
            'accused_persons',
            'complaint_files'
        ]
    
    def get_accused_persons(self, obj):
        """Get all accused persons for this complaint"""
        complaint_accused = ComplaintAccused.objects.filter(comp=obj).select_related('acsd__add')
        return AccusedSerializer([ca.acsd for ca in complaint_accused], many=True).data