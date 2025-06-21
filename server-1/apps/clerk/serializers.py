from rest_framework import serializers
from .models import *

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

class CaseActivityFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseActivityFile
        fields = ['caf_id', 'caf_name', 'caf_type', 'caf_url']

class CaseActivitySerializer(serializers.ModelSerializer):
    caf = CaseActivityFileSerializer()
    ca_issuance_date = serializers.DateTimeField(source='ca_date_of_issuance', format="%B %d, %Y %I:%M%p")
    ca_hearing_datetime = serializers.SerializerMethodField()
    
    class Meta:
        model = CaseActivity
        fields = [
            'ca_id',
            'ca_reason',
            'ca_hearing_date',
            'ca_hearing_time',
            'ca_issuance_date',
            'caf'
        ]
    
    def get_ca_hearing_datetime(self, obj):
        return f"{obj.ca_hearing_date.strftime('%B %d, %Y')} {obj.ca_hearing_time.strftime('%I:%M%p')}"

class AccusedNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accused
        fields = ['acsd_id', 'acsd_name']

class ComplaintAccusedSerializer(serializers.ModelSerializer):
    acsd = AccusedNameSerializer()
    
    class Meta:
        model = ComplaintAccused
        fields = ['acsd']

class ComplaintSerializer(serializers.ModelSerializer):
    accused = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = [
            'comp_id',
            'comp_incident_type',
            'comp_allegation',
            'comp_datetime',
            'accused'
        ]
    
    def get_accused(self, obj):
        accused_links = ComplaintAccused.objects.filter(comp=obj)
        serializer = ComplaintAccusedSerializer(accused_links, many=True)
        return [item['acsd'] for item in serializer.data]

class ComplainantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complainant
        fields = ['cpnt_id', 'cpnt_name']

class ServiceChargeRequestDetailSerializer(serializers.ModelSerializer):
    complainant = serializers.SerializerMethodField()
    complaint = ComplaintSerializer(source='comp')
    case_activities = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceChargeRequest
        fields = [
            'sr_id',
            'sr_status',
            'complainant',
            'complaint',
            'case_activities'
        ]
    
    def get_complainant(self, obj):
        if obj.comp and obj.comp.cpnt:
            serializer = ComplainantSerializer(obj.comp.cpnt)
            return serializer.data
        return None
    
    def get_case_activities(self, obj):
        case_activities = CaseActivity.objects.filter(sr=obj)
        serializer = CaseActivitySerializer(case_activities, many=True)
        return serializer.data