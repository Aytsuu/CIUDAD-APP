# from rest_framework import serializers
# from .models import *
# from apps.profiling.models import *
# from apps.complaint.models import *
    
# class AddressDetailsSerializer(serializers.ModelSerializer):
#     formatted_address = serializers.SerializerMethodField()
#     sitio_name = serializers.CharField(source='sitio.sitio_name', allow_null=True)
    
#     class Meta:
#         model = 'profiling.Address'
#         fields = [
#             'add_province',
#             'add_city',
#             'add_barangay',
#             'add_street',
#             'sitio_name',
#             'add_external_sitio',
#             'formatted_address'  # Add this new field
#         ]
    
#     def get_formatted_address(self, obj):
#         sitio = obj.sitio.sitio_name if obj.sitio else obj.add_external_sitio
#         parts = [
#             sitio,
#             obj.add_street,
#             f"Barangay {obj.add_barangay}",
#             obj.add_city,
#             obj.add_province
#         ]
#         return ', '.join(filter(None, parts))
        
        
# class ServiceChargeRequestSerializer(serializers.ModelSerializer):
#     complainant_name = serializers.SerializerMethodField()
#     accused_names = serializers.SerializerMethodField()
#     incident_type = serializers.CharField(source='comp.comp_incident_type', read_only=True)
#     allegation = serializers.CharField(source='comp.comp_allegation', read_only=True)
#     status = serializers.CharField(source='sr_status')
#     decision_date = serializers.DateTimeField(source = 'sr_decision_date')

#     class Meta:
#         model = ServiceChargeRequest
#         fields = [
#                 'sr_id', 
#                 'sr_code',
#                 'complainant_name', 
#                 'accused_names', 
#                 'incident_type', 
#                 'allegation', 
#                 'status',
#                 'decision_date',
#                 ]

#     def get_complainant_name(self, obj):
#         if not obj.comp:
#             return ""

#         complainant_names = obj.comp.complainant.values_list('cpnt_name', flat=True)
#         return ", ".join(complainant_names)
    
#     def get_accused_names(self, obj):
#         if not hasattr(obj, 'comp'):
#             return []
        
#         try:
#             accused_links = obj.comp.complaintaccused_set.all()
#             return [link.acsd.acsd_name for link in accused_links if link.acsd]
#         except AttributeError:
#             return []

# class ServiceChargeRequestFileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ServiceChargeRequestFile
#         fields = '__all__'


# class CaseSuppDocSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CaseSuppDoc
#         fields = '__all__'

# class CaseActivitySerializer(serializers.ModelSerializer):
#     srf = serializers.PrimaryKeyRelatedField(
#         queryset=ServiceChargeRequestFile.objects.all(),
#         write_only=True,
#         required=False,
#         allow_null=True
#     )

#     srf_detail = ServiceChargeRequestFileSerializer(source='srf', read_only=True)

#     supporting_documents = CaseSuppDocSerializer(
#         source='supporting_docs',
#         many=True,
#         read_only=True
#     )

#     srf = serializers.PrimaryKeyRelatedField(
#         queryset=ServiceChargeRequestFile.objects.all(),
#         write_only=True,
#         required=False,
#         allow_null=True
#     )

#     srf_detail = ServiceChargeRequestFileSerializer(source='srf', read_only=True)

#     supporting_documents = CaseSuppDocSerializer(
#         source='supporting_docs',
#         many=True,
#         read_only=True
#     )

#     class Meta:
#         model = CaseActivity
#         fields = '__all__'



# class AccusedDetailsSerializer(serializers.ModelSerializer):
#     address = AddressDetailsSerializer(source='add')
    
#     class Meta:
#         model = Accused
#         fields = ['acsd_id', 'acsd_name', 'address']



# class ComplaintAccusedSerializer(serializers.ModelSerializer):
#     acsd = AccusedDetailsSerializer()
    
#     class Meta:
#         model = ComplaintAccused
#         fields = ['acsd']

# class ComplaintSerializer(serializers.ModelSerializer):
#     accused = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Complaint
#         fields = [
#             'comp_id',
#             'comp_incident_type',
#             'comp_allegation',
#             'comp_datetime',
#             'accused'
#         ]
    
#     def get_accused(self, obj):
#         accused_links = ComplaintAccused.objects.filter(comp=obj)
#         serializer = ComplaintAccusedSerializer(accused_links, many=True)
#         return [item['acsd'] for item in serializer.data]

# class ComplainantSerializer(serializers.ModelSerializer):
#     address = AddressDetailsSerializer(source='add')    
#     class Meta:
#         model = Complainant
#         fields = ['cpnt_id', 'cpnt_name', 'address']

# class ServiceChargeRequestDetailSerializer(serializers.ModelSerializer):
#     complainant = serializers.SerializerMethodField()
#     complaint = serializers.SerializerMethodField()
#     complaint = serializers.SerializerMethodField()
#     case_activities = serializers.SerializerMethodField()
    
#     class Meta:
#         model = ServiceChargeRequest
#         fields = [
#             'sr_id',
#             'sr_code',
#             'sr_code',
#             'sr_status',
#             'sr_decision_date',
#             'complainant',
#             'complaint',
#             'case_activities'
#         ]
    
#     def get_complainant(self, obj):
#         if not obj.comp:
#             print("No Complaint linked to ServiceChargeRequest ID:", obj.sr_id)
#             return []

#         complainants = obj.comp.complainant.all().select_related('add')
#         return [
#             {
#                 'cpnt_id': cpnt.cpnt_id,
#                 'cpnt_name': cpnt.cpnt_name,
#                 'address': AddressDetailsSerializer(cpnt.add).data
#             }
#             for cpnt in complainants
#         ]

    
#     def get_complaint(self, obj):
#         if not obj.comp:
#             return None
            
#         return {
#             'comp_id': obj.comp.comp_id,
#             'comp_incident_type': obj.comp.comp_incident_type,
#             'comp_allegation': obj.comp.comp_allegation,
#             'comp_datetime': obj.comp.comp_datetime,
#             'accused': self._get_accused_details(obj.comp)
#         }
    
#     def _get_accused_details(self, complaint):
#         accused = []
#         for complaint_accused in complaint.complaintaccused_set.all():
#             if complaint_accused.acsd:
#                 accused.append({
#                     'acsd_id': complaint_accused.acsd.acsd_id,
#                     'acsd_name': complaint_accused.acsd.acsd_name,
#                     'address': AddressDetailsSerializer(complaint_accused.acsd.add).data
#                 })
#         return accused

    
#     def get_complaint(self, obj):
#         if not obj.comp:
#             return None
            
#         return {
#             'comp_id': obj.comp.comp_id,
#             'comp_incident_type': obj.comp.comp_incident_type,
#             'comp_allegation': obj.comp.comp_allegation,
#             'comp_datetime': obj.comp.comp_datetime,
#             'accused': self._get_accused_details(obj.comp)
#         }
    
#     def _get_accused_details(self, complaint):
#         accused = []
#         for complaint_accused in complaint.complaintaccused_set.all():
#             if complaint_accused.acsd:
#                 accused.append({
#                     'acsd_id': complaint_accused.acsd.acsd_id,
#                     'acsd_name': complaint_accused.acsd.acsd_name,
#                     'address': AddressDetailsSerializer(complaint_accused.acsd.add).data
#                 })
#         return accused
    
#     def get_case_activities(self, obj):
#         return CaseActivitySerializer(obj.case.all(), many=True).data
    
# class FileActionRequestSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ServiceChargeRequest
#         fields = [
#             'sr_type',
#             'sr_payment_status',
#             'parent_summon',
#             'file_action_file',
#             'comp',
#         ]

from rest_framework import serializers
from .models import *
from apps.profiling.models import *
from apps.complaint.models import *
from datetime import datetime
from apps.profiling.models import *
from apps.complaint.models import *
from datetime import datetime

class AddressDetailsSerializer(serializers.ModelSerializer):
    formatted_address = serializers.SerializerMethodField()
    sitio_name = serializers.CharField(source='sitio.sitio_name', allow_null=True)
    
    class Meta:
        model = 'profiling.Address'
        model = 'profiling.Address'
        fields = [
            'add_province',
            'add_city',
            'add_barangay',
            'add_street',
            'sitio_name',
            'add_external_sitio',
            'formatted_address'
            'formatted_address'
        ]
    
    def get_formatted_address(self, obj):
        sitio = obj.sitio.sitio_name if obj.sitio else obj.add_external_sitio
        parts = [
            sitio,
            obj.add_street,
            f"Barangay {obj.add_barangay}",
            obj.add_city,
            obj.add_province
        ]
        return ', '.join(filter(None, parts))
        
class CaseSuppDocSerializer(serializers.ModelSerializer):
class CaseSuppDocSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseSuppDoc
        fields = '__all__'
        model = CaseSuppDoc
        fields = '__all__'

class ServiceChargeRequestFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceChargeRequestFile
        fields = '__all__'

class CaseActivitySerializer(serializers.ModelSerializer):
    srf_detail = ServiceChargeRequestFileSerializer(source='srf', read_only=True)
    supporting_documents = CaseSuppDocSerializer(
        source='supporting_docs',
        many=True,
        read_only=True
    )
    formatted_hearing_datetime = serializers.SerializerMethodField()
    formatted_hearing_datetime = serializers.SerializerMethodField()

    class Meta:
        model = CaseActivity
        fields = [
            'ca_id',
            'ca_reason',
            'ca_hearing_date',
            'ca_hearing_time',
            'formatted_hearing_datetime',
            'ca_mediation',
            'ca_date_of_issuance',
            'srf_detail',
            'supporting_documents'
        ]
    
    def get_formatted_hearing_datetime(self, obj):
        return datetime.combine(obj.ca_hearing_date, obj.ca_hearing_time).strftime("%B %d, %Y at %I:%M %p")
        fields = [
            'ca_id',
            'ca_reason',
            'ca_hearing_date',
            'ca_hearing_time',
            'formatted_hearing_datetime',
            'ca_mediation',
            'ca_date_of_issuance',
            'srf_detail',
            'supporting_documents'
        ]
    
    def get_formatted_hearing_datetime(self, obj):
        return datetime.combine(obj.ca_hearing_date, obj.ca_hearing_time).strftime("%B %d, %Y at %I:%M %p")

class AccusedDetailsSerializer(serializers.ModelSerializer):
    address = AddressDetailsSerializer(source='add')
    
    class Meta:
        model = Accused
        fields = [
            'acsd_id', 
            'acsd_name',
            'acsd_age',
            'acsd_gender',
            'acsd_description',
            'address'
        ]
        fields = [
            'acsd_id', 
            'acsd_name',
            'acsd_age',
            'acsd_gender',
            'acsd_description',
            'address'
        ]

class ComplaintAccusedSerializer(serializers.ModelSerializer):
    acsd = AccusedDetailsSerializer()
    
    class Meta:
        model = ComplaintAccused
        fields = ['acsd']

class ComplainantDetailsSerializer(serializers.ModelSerializer):
    address = AddressDetailsSerializer(source='add')
    
    class Meta:
        model = Complainant
        fields = [
            'cpnt_id',
            'cpnt_name',
            'cpnt_gender',
            'cpnt_age',
            'cpnt_number',
            'cpnt_relation_to_respondent',
            'address'
        ]

class ComplaintComplainantSerializer(serializers.ModelSerializer):
    cpnt = ComplainantDetailsSerializer()
    
    class Meta:
        model = ComplaintComplainant
        fields = ['cpnt']

class ComplaintFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint_File
        fields = [
            'comp_file_id',
            'comp_file_name',
            'comp_file_type',
            'comp_file_path',
            'file_size'
        ]

class ComplainantDetailsSerializer(serializers.ModelSerializer):
    address = AddressDetailsSerializer(source='add')
    
    class Meta:
        model = Complainant
        fields = [
            'cpnt_id',
            'cpnt_name',
            'cpnt_gender',
            'cpnt_age',
            'cpnt_number',
            'cpnt_relation_to_respondent',
            'address'
        ]

class ComplaintComplainantSerializer(serializers.ModelSerializer):
    cpnt = ComplainantDetailsSerializer()
    
    class Meta:
        model = ComplaintComplainant
        fields = ['cpnt']

class ComplaintFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint_File
        fields = [
            'comp_file_id',
            'comp_file_name',
            'comp_file_type',
            'comp_file_path',
            'file_size'
        ]

class ComplaintSerializer(serializers.ModelSerializer):
    complainants = serializers.SerializerMethodField()
    complainants = serializers.SerializerMethodField()
    accused = serializers.SerializerMethodField()
    files = ComplaintFileSerializer(source='complaint_file', many=True, read_only=True)
    formatted_incident_datetime = serializers.SerializerMethodField()
    files = ComplaintFileSerializer(source='complaint_file', many=True, read_only=True)
    formatted_incident_datetime = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = [
            'comp_id',
            'comp_incident_type',
            'comp_allegation',
            'comp_datetime',
            'formatted_incident_datetime',
            'comp_location',
            'comp_created_at',
            'complainants',
            'accused',
            'files'
            'formatted_incident_datetime',
            'comp_location',
            'comp_created_at',
            'complainants',
            'accused',
            'files'
        ]
    
    def get_complainants(self, obj):
        complainant_links = ComplaintComplainant.objects.filter(comp=obj)
        serializer = ComplaintComplainantSerializer(complainant_links, many=True)
        return [item['cpnt'] for item in serializer.data]
    
    def get_complainants(self, obj):
        complainant_links = ComplaintComplainant.objects.filter(comp=obj)
        serializer = ComplaintComplainantSerializer(complainant_links, many=True)
        return [item['cpnt'] for item in serializer.data]
    
    def get_accused(self, obj):
        accused_links = ComplaintAccused.objects.filter(comp=obj)
        serializer = ComplaintAccusedSerializer(accused_links, many=True)
        return [item['acsd'] for item in serializer.data]
    
    def get_formatted_incident_datetime(self, obj):
        try:
            return datetime.strptime(obj.comp_datetime, "%Y-%m-%d %H:%M:%S").strftime("%B %d, %Y at %I:%M %p")
        except:
            return obj.comp_datetime

class ServiceChargeRequestSerializer(serializers.ModelSerializer):
    complainant_names = serializers.SerializerMethodField()
    accused_names = serializers.SerializerMethodField()
    incident_type = serializers.CharField(source='comp.comp_incident_type', read_only=True)
    allegation = serializers.CharField(source='comp.comp_allegation', read_only=True)
    formatted_decision_date = serializers.SerializerMethodField()
    formatted_request_date = serializers.SerializerMethodField()

    
    def get_formatted_incident_datetime(self, obj):
        try:
            return datetime.strptime(obj.comp_datetime, "%Y-%m-%d %H:%M:%S").strftime("%B %d, %Y at %I:%M %p")
        except:
            return obj.comp_datetime

class ServiceChargeRequestSerializer(serializers.ModelSerializer):
    complainant_names = serializers.SerializerMethodField()
    accused_names = serializers.SerializerMethodField()
    incident_type = serializers.CharField(source='comp.comp_incident_type', read_only=True)
    allegation = serializers.CharField(source='comp.comp_allegation', read_only=True)
    formatted_decision_date = serializers.SerializerMethodField()
    formatted_request_date = serializers.SerializerMethodField()

    class Meta:
        model = ServiceChargeRequest
        fields = [
            'sr_id', 
            'sr_code',
            'complainant_names', 
            'accused_names', 
            'incident_type', 
            'allegation',
            'sr_status',
            'sr_payment_status',
            'sr_type',
            'formatted_decision_date',
            'formatted_request_date'
        ]

    def get_complainant_names(self, obj):
        if not obj.comp:
            return []
        return [c.cpnt_name for c in obj.comp.complainant.all()]
    
    def get_accused_names(self, obj):
        if not obj.comp:
            return []
        return [ca.acsd.acsd_name for ca in obj.comp.complaintaccused_set.all()]
    
    def get_formatted_decision_date(self, obj):
        if obj.sr_decision_date:
            return obj.sr_decision_date.strftime("%B %d, %Y at %I:%M %p")
        return None
    
    def get_formatted_request_date(self, obj):
        return obj.sr_req_date.strftime("%B %d, %Y at %I:%M %p")
        model = ServiceChargeRequest
        fields = [
            'sr_id', 
            'sr_code',
            'complainant_names', 
            'accused_names', 
            'incident_type', 
            'allegation',
            'sr_status',
            'sr_payment_status',
            'sr_type',
            'formatted_decision_date',
            'formatted_request_date'
        ]

    def get_complainant_names(self, obj):
        if not obj.comp:
            return []
        return [c.cpnt_name for c in obj.comp.complainant.all()]
    
    def get_accused_names(self, obj):
        if not obj.comp:
            return []
        return [ca.acsd.acsd_name for ca in obj.comp.complaintaccused_set.all()]
    
    def get_formatted_decision_date(self, obj):
        if obj.sr_decision_date:
            return obj.sr_decision_date.strftime("%B %d, %Y at %I:%M %p")
        return None
    
    def get_formatted_request_date(self, obj):
        return obj.sr_req_date.strftime("%B %d, %Y at %I:%M %p")

class ServiceChargeRequestDetailSerializer(serializers.ModelSerializer):
    complaint = ComplaintSerializer(source='comp', read_only=True)
    case_activities = CaseActivitySerializer(source='case', many=True, read_only=True)
    file_action_file = ServiceChargeRequestFileSerializer(read_only=True)
    parent_summon = ServiceChargeRequestSerializer(read_only=True)
    formatted_request_date = serializers.SerializerMethodField()
    formatted_decision_date = serializers.SerializerMethodField()

    complaint = ComplaintSerializer(source='comp', read_only=True)
    case_activities = CaseActivitySerializer(source='case', many=True, read_only=True)
    file_action_file = ServiceChargeRequestFileSerializer(read_only=True)
    parent_summon = ServiceChargeRequestSerializer(read_only=True)
    formatted_request_date = serializers.SerializerMethodField()
    formatted_decision_date = serializers.SerializerMethodField()

    class Meta:
        model = ServiceChargeRequest
        fields = [
            'sr_id',
            'sr_code',
            'sr_status',
            'sr_payment_status',
            'sr_type',
            'formatted_request_date',
            'formatted_decision_date',
            'sr_payment_status',
            'sr_type',
            'formatted_request_date',
            'formatted_decision_date',
            'sr_decision_date',
            'complaint',
            'case_activities',
            'file_action_file',
            'parent_summon'
        ]
    
    def get_formatted_request_date(self, obj):
        return obj.sr_req_date.strftime("%B %d, %Y at %I:%M %p")
    
    def get_formatted_decision_date(self, obj):
        if obj.sr_decision_date:
            return obj.sr_decision_date.strftime("%B %d, %Y at %I:%M %p")
        return None

            'case_activities',
            'file_action_file',
            'parent_summon'
        ]
    
    def get_formatted_request_date(self, obj):
        return obj.sr_req_date.strftime("%B %d, %Y at %I:%M %p")
    
    def get_formatted_decision_date(self, obj):
        if obj.sr_decision_date:
            return obj.sr_decision_date.strftime("%B %d, %Y at %I:%M %p")
        return None

class FileActionRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceChargeRequest
        fields = [
            'sr_id',
            'sr_code',
            'sr_id',
            'sr_code',
            'sr_type',
            'sr_payment_status',
            'parent_summon',
            'file_action_file',
            'comp'
            'comp'
        ]
