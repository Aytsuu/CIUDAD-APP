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
from .models import ClerkCertificate, IssuedCertificate, BusinessPermitRequest, IssuedBusinessPermit, Business, Invoice
from apps.profiling.models import ResidentProfile
from apps.file.models import File
import logging

logger = logging.getLogger(__name__)

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['file_id', 'file_name', 'file_type', 'file_path', 'file_url']

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = [
            'inv_num',
            'inv_serial_num',
            'inv_date',
            'inv_amount',
            'inv_nat_of_collection'
        ]

class BusinessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = [
            'bus_id',
            'bus_gross_sales',
            'bus_respondentMname',
            'bus_respondentSex',
            'bus_respondentDob',
            'bus_date_registered',
            'staff_id',
            'add_id',
            'bus_respondentAddress',
            'bus_respondentContact',
        ]

class IssuedCertificateSerializer(serializers.ModelSerializer):
    file_details = FileSerializer(source='file', read_only=True)
    requester = serializers.SerializerMethodField()
    purpose = serializers.SerializerMethodField()
    fileUrl = serializers.SerializerMethodField()
    dateIssued = serializers.DateField(source='ic_date_of_issuance', format="%Y-%m-%d")

    def get_requester(self, obj):
        try:
            if obj.certificate and obj.certificate.rp and obj.certificate.rp.per:
                person = obj.certificate.rp.per
                return f"{person.per_fname} {person.per_lname}"
            return "Unknown"
        except Exception as e:
            logger.error(f"Error getting requester: {str(e)}")
            return "Unknown"

    def get_purpose(self, obj):
        try:
            if obj.certificate and obj.certificate.req_type:
                return obj.certificate.req_type
            return "Not specified"
        except Exception as e:
            logger.error(f"Error getting purpose: {str(e)}")
            return "Not specified"

    def get_fileUrl(self, obj):
        try:
            if obj.file:
                return obj.file.file_url
            return None
        except Exception as e:
            logger.error(f"Error getting file URL: {str(e)}")
            return None

    class Meta:
        model = IssuedCertificate
        fields = ['ic_id', 'dateIssued', 'requester', 'purpose', 'fileUrl', 'file_details']

class ClerkCertificateSerializer(serializers.ModelSerializer):
    resident_details = serializers.SerializerMethodField()
    invoice = serializers.SerializerMethodField()

    def get_resident_details(self, obj):
        try:
            if obj.rp and obj.rp.per:
                return {
                    'per_fname': obj.rp.per.per_fname,
                    'per_lname': obj.rp.per.per_lname
                }
            return None
        except Exception as e:
            logger.error(f"Error getting resident details: {str(e)}")
            return None

    def get_invoice(self, obj):
        try:
            invoice = obj.clerk_invoices.first()
            if invoice:
                return InvoiceSerializer(invoice).data
            return None
        except Exception as e:
            logger.error(f"Error getting invoice: {str(e)}")
            return None

    class Meta:
        model = ClerkCertificate
        fields = [
            'cr_id',
            'resident_details',
            'req_type',
            'req_request_date',
            'req_claim_date',
            'req_payment_status',
            'req_pay_method',
            'req_transac_id',
            'invoice'
        ]

class BusinessPermitSerializer(serializers.ModelSerializer):
    permit_req_no = serializers.CharField(source='bpr_id')
    business_details = BusinessSerializer(source='business', read_only=True)
    issued_permit = serializers.SerializerMethodField()

    def get_issued_permit(self, obj):
        try:
            issued_permit = IssuedBusinessPermit.objects.get(permit_request=obj)
            return IssuedBusinessPermitSerializer(issued_permit).data
        except IssuedBusinessPermit.DoesNotExist:
            return None

    class Meta:
        model = BusinessPermitRequest
        fields = [
            'permit_req_no',
            'business_details',
            'req_sales_proof',
            'req_pay_method',
            'req_request_date',
            'req_claim_date',
            'req_status',
            'req_payment_status',
            'req_transac_id',
            'issued_permit'
        ]

class IssuedBusinessPermitSerializer(serializers.ModelSerializer):
    file_details = FileSerializer(source='file', read_only=True)
    business_name = serializers.SerializerMethodField()
    fileUrl = serializers.SerializerMethodField()
    dateIssued = serializers.DateField(source='ibp_date_of_issuance', format="%Y-%m-%d")

    def get_business_name(self, obj):
        try:
            if obj.permit_request and obj.permit_request.business:
                return obj.permit_request.business.bus_name
            return "Unknown"
        except Exception as e:
            logger.error(f"Error getting business name: {str(e)}")
            return "Unknown"

    def get_fileUrl(self, obj):
        try:
            if obj.file:
                return obj.file.file_url
            return None
        except Exception as e:
            logger.error(f"Error getting file URL: {str(e)}")
            return None

    class Meta:
        model = IssuedBusinessPermit
        fields = ['ibp_id', 'dateIssued', 'business_name', 'fileUrl', 'file_details']
