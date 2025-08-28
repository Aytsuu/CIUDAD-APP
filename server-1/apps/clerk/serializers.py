from rest_framework import serializers
from .models import SummonDateAvailability, SummonTimeAvailability
from .models import *
from apps.complaint.models import Complaint, ComplaintComplainant, ComplaintAccused, Complaint_File, Complainant, Accused
from apps.complaint.serializers import ComplaintSerializer
from apps.profiling.models import ResidentProfile, FamilyComposition
from apps.administration.models import Staff
from apps.treasurer.models import Invoice
from datetime import datetime
import logging

logger = logging.getLogger(__name__)




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
            'staff_id',
            'add_id',
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
    requester = serializers.SerializerMethodField()
    purpose = serializers.SerializerMethodField()
    dateIssued = serializers.DateField(source='ic_date_of_issuance', format="%Y-%m-%d")

    def get_requester(self, obj):
        try:
            if obj.certificate and obj.certificate.rp_id and getattr(obj.certificate.rp_id, "per", None):
                person = obj.certificate.rp_id.per
                return f"{person.per_fname} {person.per_lname}"
            return "Unknown"
        except Exception as e:
            logger.error(f"Error getting requester: {str(e)}")
            return "Unknown"

    def get_purpose(self, obj):
        try:
            if obj.certificate and obj.certificate.pr_id:
                return obj.certificate.pr_id.pr_purpose
            return "Not specified"
        except Exception as e:
            logger.error(f"Error getting purpose: {str(e)}")
            return "Not specified"

    class Meta:
        model = IssuedCertificate
        fields = ['ic_id', 'dateIssued', 'requester', 'purpose']


class CertificateStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClerkCertificate
        fields = ['cr_req_status'] 


class ClerkCertificateSerializer(serializers.ModelSerializer):
    resident_details = serializers.SerializerMethodField()
    invoice = serializers.SerializerMethodField()
    purpose = serializers.SerializerMethodField()
    staff_id = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all(),  required=False, allow_null=True)

    def get_resident_details(self, obj):
        try:
            if obj.rp_id and getattr(obj.rp_id, "per", None):
                return {
                    'per_fname': obj.rp_id.per.per_fname,
                    'per_lname': obj.rp_id.per.per_lname
                }
            return None
        except Exception as e:
            logger.error(f"Error getting resident details: {str(e)}")
            return None

    def get_invoice(self, obj):
        try:
            invoice = getattr(obj, "treasurer_invoices", None)
            if invoice:
                invoice = invoice.first()
                return InvoiceSerializer(invoice).data if invoice else None
            return None
        except Exception as e:
            logger.error(f"Error getting invoice: {str(e)}")
            return None

    def get_purpose(self, obj):
        try:
            if obj.pr_id:
                return {
                    "pr_purpose": obj.pr_id.pr_purpose,
                    "pr_rate": obj.pr_id.pr_rate
                }
            return None
        except Exception as e:
            logger.error(f"Error getting purpose and rate: {str(e)}")
            return None

    class Meta:
        model = ClerkCertificate
        fields = [
            'cr_id',
            'rp_id',
            'resident_details',
            'purpose',
            'cr_req_request_date',
            'cr_req_payment_status',
            'pr_id',
            'cr_req_status',
            'invoice',
            'staff_id'
        ]


# Business Permit Serializers
class BusinessPermitSerializer(serializers.ModelSerializer):
    business_name = serializers.SerializerMethodField()
    business_address = serializers.SerializerMethodField()  # Changed to SerializerMethodField
    business_gross_sales = serializers.SerializerMethodField()
    requestor = serializers.SerializerMethodField()
    purpose = serializers.SerializerMethodField()  # New field to get purpose from pr_id

    class Meta:
        model = BusinessPermitRequest
        fields = [
            'bpr_id',
            'req_pay_method',
            'req_request_date',
            'req_sales_proof',
            'req_status',
            'req_payment_status',
            'ags_id',
            'bus_id',
            'business_name',
            'business_address',
            'business_gross_sales',
            'requestor',
            'purpose',  # New field
            'pr_id',
            'staff_id',
            # 'previous_permit_image',  # New image field
            # 'assessment_image',  # New image field
        ]

    def get_business_name(self, obj):
        return obj.bus_id.bus_name if obj.bus_id else ""

    def get_business_gross_sales(self, obj):
        return obj.bus_id.bus_gross_sales if obj.bus_id else ""

    def get_business_address(self, obj):
        if obj.bus_id:
            address_parts = [obj.bus_id.bus_street, obj.bus_id.sitio]
            return ", ".join([part for part in address_parts if part])
        return ""

    def get_requestor(self, obj):
        return getattr(obj, 'requestor', '')

    def get_purpose(self, obj):
        return obj.pr_id.pr_purpose if obj.pr_id else ""

class BusinessPermitCreateSerializer(serializers.ModelSerializer):
    # Removed business_name, business_address, business_gross_sales since they come from bus_id
    
    class Meta:
        model = BusinessPermitRequest
        fields = [
            'bpr_id',
            'req_request_date',
            'req_sales_proof',
            'req_status',
            'req_payment_status',
            'ags_id',
            'bus_id',
            'pr_id',
            'staff_id',
            'previous_permit_image',  # New image field
            'assessment_image',  # New image field
        ]
        extra_kwargs = {
            'bpr_id': {'required': False},
            'req_status': {'required': False, 'default': 'Pending'},
            'req_payment_status': {'required': False, 'default': 'Unpaid'},
            'ags_id': {'required': False, 'allow_null': True},
            'pr_id': {'required': False, 'allow_null': True},
            'ra_id': {'required': False, 'allow_null': True},
            'staff_id': {'required': False, 'allow_null': True},
            'bus_id': {'required': False, 'allow_null': True},
            'previous_permit_image': {'required': False, 'allow_null': True},
            'assessment_image': {'required': False, 'allow_null': True},
        }

    def create(self, validated_data):
        # Generate bpr_id if not provided
        if 'bpr_id' not in validated_data or not validated_data['bpr_id']:
            import uuid
            validated_data['bpr_id'] = str(uuid.uuid4())[:8].upper()
        
        # Create the BusinessPermitRequest
        permit_request = BusinessPermitRequest.objects.create(**validated_data)
        
        return permit_request

class IssuedBusinessPermitSerializer(serializers.ModelSerializer):
    business_name = serializers.SerializerMethodField()
    dateIssued = serializers.DateField(source='ibp_date_of_issuance', format="%Y-%m-%d")

    def get_business_name(self, obj):
        try:
            if obj.permit_request and obj.permit_request.business:
                return obj.permit_request.business.bus_name
            return "Unknown"
        except Exception as e:
            logger.error(f"Error getting business name: {str(e)}")
            return "Unknown"

    class Meta:
        model = IssuedBusinessPermit
        fields = ['ibp_id', 'dateIssued', 'business_name']

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

class SummonDateAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = SummonDateAvailability
        fields = '__all__'

class SummonTimeAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = SummonTimeAvailability
        fields = '__all__'

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
