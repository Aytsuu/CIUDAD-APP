from rest_framework import serializers
from .models import *
from apps.complaint.models import Complaint, ComplaintComplainant, ComplaintAccused, Complaint_File, Complainant, Accused
from apps.complaint.serializers import ComplaintSerializer
from apps.profiling.models import ResidentProfile, FamilyComposition
from apps.file.models import File
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# File and Invoice Serializers
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

# Business Serializers
class BusinessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = [
            'bus_id',
            'bus_name',
            'bus_gross_sales',
            'bus_respondentLname', 
            'bus_respondentFname',  
            'bus_respondentMname',
            'bus_respondentSex',
            'bus_respondentDob',
            'bus_date_registered',
            'staff_id',
            'add_id',
            'bus_respondentAddress',
            'bus_respondentContact',
        ]

# Address Serializers
class AddressDetailsSerializer(serializers.ModelSerializer):
    formatted_address = serializers.SerializerMethodField()
    sitio_name = serializers.CharField(source='sitio.sitio_name', allow_null=True)
    
    class Meta:
        model = Address
        fields = [
            'add_province',
            'add_city',
            'add_barangay',
            'add_street',
            'sitio_name',
            'add_external_sitio',
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

# Certificate Serializers
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
            'rp',
            'resident_details',
            'req_type',
            'req_request_date',
            'req_claim_date',
            'req_payment_status',
            'req_pay_method',
            'req_transac_id',
            'pr_id',
            'ra_id',
            'staff_id',
            'req_status',
            'invoice'
        ]

# Business Permit Serializers
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

# Complaint-related Serializers
class CaseSuppDocSerializer(serializers.ModelSerializer):
    class Meta:
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



# Service Charge Request Serializers
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

class ServiceChargeRequestDetailSerializer(serializers.ModelSerializer):
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

class FileActionRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceChargeRequest
        fields = [
            'sr_id',
            'sr_code',
            'sr_type',
            'sr_payment_status',
            'parent_summon',
            'file_action_file',
            'comp'
        ]


class SummonDateAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = SummonDateAvailability
        fields = '__all__'


class SummonTimeAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = SummonTimeAvailability
        fields = '__all__'