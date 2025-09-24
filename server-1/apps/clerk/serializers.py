from rest_framework import serializers
from .models import SummonDateAvailability, SummonTimeAvailability
from .models import *
from .models import NonResidentCertificateRequest
from apps.complaint.models import Complaint, ComplaintComplainant, ComplaintAccused, Complaint_File, Complainant, Accused
from apps.complaint.serializers import ComplaintSerializer
from apps.profiling.models import ResidentProfile, FamilyComposition
from apps.administration.models import Staff
from apps.treasurer.models import Invoice
from datetime import datetime
import logging
from apps.profiling.models import Address

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
        fields = ['cr_req_status', 'cr_date_completed', 'cr_req_payment_status', 'cr_reason',
                  'cr_date_rejected'
            ] 

# class NonResidentCertReqSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = NonResidentCertificateRequest
#         fields= '__all__'

class NonResidentCertReqSerializer(serializers.ModelSerializer):
    purpose = serializers.SerializerMethodField()
    amount = serializers.DecimalField(source="pr_id.pr_rate", max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = NonResidentCertificateRequest
        fields = [
            "nrc_id",
            "nrc_req_date",
            "nrc_req_status",
            "nrc_req_payment_status",
            "nrc_pay_date",
            "nrc_requester",
            "nrc_address",
            "nrc_birthdate",
            "pr_id",    
            "purpose",   
            "amount",
            "nrc_discount_reason",   
        ]

    def get_purpose(self, obj):
        if obj.pr_id:
            return {
                "pr_purpose": obj.pr_id.pr_purpose,
                "pr_rate": str(obj.pr_id.pr_rate)  #
            }
        return None
    
class NonResidentCertReqUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NonResidentCertificateRequest
        fields = ["nrc_req_status", "nrc_req_payment_status", "nrc_pay_date", "nrc_date_completed", "nrc_discount_reason"]


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
                    'per_lname': obj.rp_id.per.per_lname,
                    'voter_id': getattr(obj.rp_id, 'voter_id', None)
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
            'cr_date_completed',
            'cr_date_rejected',
            'cr_reason',
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
    amount_to_pay = serializers.SerializerMethodField()  # New field for amount to be paid

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
            'rp_id',
            'staff_id',
            'business_name',
            'business_address',
            'business_gross_sales',
            'requestor',
            'purpose',
            'amount_to_pay',
            'req_amount',  # Add req_amount field
        ]

    def get_business_name(self, obj):
        try:
            # First try to get from the new bus_permit_name field
            if obj.bus_permit_name:
                return obj.bus_permit_name
            # Fallback to bus_id if available
            return obj.bus_id.bus_name if obj.bus_id and hasattr(obj.bus_id, 'bus_name') else ""
        except Exception:
            return ""

    def get_business_gross_sales(self, obj):
        try:
            return obj.bus_id.bus_gross_sales if obj.bus_id and hasattr(obj.bus_id, 'bus_gross_sales') else ""
        except Exception:
            return ""

    def get_business_address(self, obj):
        try:
            # First try to get from the new bus_permit_address field
            if obj.bus_permit_address:
                return obj.bus_permit_address
            # Fallback to bus_id if available
            if obj.bus_id and hasattr(obj.bus_id, 'add_id') and obj.bus_id.add_id:
                # Fetch the actual address using the Address model
                try:
                    address_obj = Address.objects.get(add_id=obj.bus_id.add_id)
                    # Format the address similar to the Address model's __str__ method
                    sitio = address_obj.sitio.sitio_name if address_obj.sitio else address_obj.add_external_sitio
                    if sitio:
                        return f"{sitio}, {address_obj.add_street}, Barangay {address_obj.add_barangay}, {address_obj.add_city}, {address_obj.add_province}"
                    else:
                        return f"{address_obj.add_street}, Barangay {address_obj.add_barangay}, {address_obj.add_city}, {address_obj.add_province}"
                except Address.DoesNotExist:
                    return "Address not found"
            return "No address"
        except Exception as e:
            return f"Address error: {str(e)}"

    def get_requestor(self, obj):
        try:
            if obj.rp_id and getattr(obj.rp_id, 'per', None):
                return f"{obj.rp_id.per.per_fname} {obj.rp_id.per.per_lname}"
            return ''
        except Exception:
            return ''

    def get_purpose(self, obj):
        return obj.pr_id.pr_purpose if obj.pr_id else ""

    def get_amount_to_pay(self, obj):
        try:
            # First check if req_amount is already set (this is the stored amount)
            if hasattr(obj, 'req_amount') and obj.req_amount:
                return float(obj.req_amount)
            
            # If req_amount is not set, fetch from ags_id
            if obj.ags_id:
                # Import Annual_Gross_Sales model to fetch the actual object
                from apps.treasurer.models import Annual_Gross_Sales
                try:
                    ags_obj = Annual_Gross_Sales.objects.get(ags_id=obj.ags_id)
                    return float(ags_obj.ags_rate) if ags_obj.ags_rate else 0.0
                except Annual_Gross_Sales.DoesNotExist:
                    return 0.0
            return 0.0
        except Exception as e:
            print(f"Error getting amount_to_pay: {str(e)}")
            return 0.0

class BusinessPermitCreateSerializer(serializers.ModelSerializer):
    
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
            'rp_id',
            'staff_id',
            'req_amount',  
            'bus_permit_name',  
            'bus_permit_address',  
        ]
        extra_kwargs = {
            'bpr_id': {'required': False},
            'req_status': {'required': False, 'default': 'Pending'},
            'req_payment_status': {'required': False, 'default': 'Unpaid'},
            'ags_id': {'required': False, 'allow_null': True},
            'pr_id': {'required': False, 'allow_null': True},
            'staff_id': {'required': False, 'allow_null': True},
            'bus_id': {'required': False, 'allow_null': True},
            'rp_id': {'required': False, 'allow_null': True},
            'req_amount': {'required': False},  # Make req_amount optional
        }

    def create(self, validated_data):
        # Generate bpr_id if not provided
        if 'bpr_id' not in validated_data or not validated_data['bpr_id']:
            import time
            # Generate a numeric ID using timestamp
            validated_data['bpr_id'] = int(time.time() * 1000) % 100000000  # 8-digit number
        
        # Fetch ags_id from annual gross sales table based on gross_sales
        if 'req_sales_proof' in validated_data and validated_data['req_sales_proof']:
            try:
                from apps.treasurer.models import Annual_Gross_Sales
                gross_sales_range = validated_data['req_sales_proof']
                print(f"Processing gross_sales_range: {gross_sales_range}")
                
                # Parse the range (e.g., "1000.00 - 2000.00")
                if ' - ' in gross_sales_range:
                    min_val, max_val = gross_sales_range.split(' - ')
                    min_val = float(min_val.replace('₱', '').replace(',', ''))
                    max_val = float(max_val.replace('₱', '').replace(',', ''))
                    print(f"Parsed values - min: {min_val}, max: {max_val}")
                    
                    # Find matching annual gross sales record
                    ags_record = Annual_Gross_Sales.objects.filter(
                        ags_minimum=min_val,
                        ags_maximum=max_val,
                        ags_is_archive=False
                    ).first()
                    
                    print(f"Query result: {ags_record}")
                    
                    if ags_record:
                        validated_data['ags_id'] = ags_record  # Assign the instance, not the ID
                        # Store the amount to be paid in req_amount field
                        validated_data['req_amount'] = float(ags_record.ags_rate) if ags_record.ags_rate else 0.0
                        print(f"Found ags_id: {ags_record.ags_id} for range {gross_sales_range}, amount: {validated_data['req_amount']}")
                    else:
                        print(f"No ags_id found for range {gross_sales_range}")
                        # Let's also check what records exist in the table
                        all_records = Annual_Gross_Sales.objects.filter(ags_is_archive=False)[:5]
                        print(f"Sample records in table: {[(r.ags_minimum, r.ags_maximum, r.ags_id) for r in all_records]}")
                else:
                    print(f"Invalid gross sales format: {gross_sales_range}")
            except Exception as e:
                print(f"Error fetching ags_id: {str(e)}")
                import traceback
                print(f"Traceback: {traceback.format_exc()}")
                # Continue without ags_id if there's an error
        
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

# ================== SERVICE CHARGE SERIALIZERS =========================
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

class SummonRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceChargeRequest
        fields = '__all__'


class SummonRequestPendingListSerializer(serializers.ModelSerializer):
    complainant_names = serializers.SerializerMethodField()
    incident_type = serializers.SerializerMethodField()
    accused_names = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceChargeRequest
        fields = [
            'sr_id', 
            'sr_type', 
            'sr_req_date', 
            'sr_req_status', 
            'sr_case_status', 
            'comp_id', 
            'staff_id', 
            'complainant_names', 
            'incident_type', 
            'accused_names'
        ]
    
    def get_complainant_names(self, obj):
        if obj.comp_id:
            try:
                complainants = obj.comp_id.complaintcomplainant_set.select_related('cpnt').all()
                return [cc.cpnt.cpnt_name for cc in complainants]
            except Exception as e:
                print(f"Error getting complainants: {e}")
                return []
        return []
    
    def get_incident_type(self, obj):
        if obj.comp_id:
            return getattr(obj.comp_id, 'comp_incident_type', None)
        return None
    
    def get_accused_names(self, obj):
        if obj.comp_id:
            try:
                accused_list = obj.comp_id.complaintaccused_set.select_related('acsd').all()
                return [ca.acsd.acsd_name for ca in accused_list]
            except Exception as e:
                print(f"Error getting accused: {e}")
                return []
        return []
    

class SummonRequestRejectedListSerializer(serializers.ModelSerializer):
    complainant_names = serializers.SerializerMethodField()
    incident_type = serializers.SerializerMethodField()
    accused_names = serializers.SerializerMethodField()
    rejection_reason = serializers.SerializerMethodField()
    decision_date = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceChargeRequest
        fields = [
            'sr_id', 
            'sr_type', 
            'sr_req_date', 
            'sr_req_status', 
            'sr_case_status', 
            'comp_id', 
            'staff_id', 
            'complainant_names', 
            'incident_type', 
            'accused_names',
            'rejection_reason',
            'decision_date'
        ]
    
    def get_complainant_names(self, obj):
        if obj.comp_id:
            try:
                # Use prefetched data
                complainants = obj.comp_id.complaintcomplainant_set.all()
                return [cc.cpnt.cpnt_name for cc in complainants]
            except Exception as e:
                print(f"Error getting complainants: {e}")
                return []
        return []
    
    def get_incident_type(self, obj):
        if obj.comp_id:
            return getattr(obj.comp_id, 'comp_incident_type', None)
        return None
    
    def get_accused_names(self, obj):
        if obj.comp_id:
            try:
                # Use prefetched data
                accused_list = obj.comp_id.complaintaccused_set.all()
                return [ca.acsd.acsd_name for ca in accused_list]
            except Exception as e:
                print(f"Error getting accused: {e}")
                return []
        return []
    
    def get_rejection_reason(self, obj):
        try:
            # Use the correct reverse relationship name for OneToOneField
            if hasattr(obj, 'servicechargedecision'):
                return obj.servicechargedecision.scd_reason
            return None
        except Exception as e:
            print(f"Error getting rejection reason: {e}")
            return None
    
    def get_decision_date(self, obj):
        try:
            # Use the correct reverse relationship name for OneToOneField
            if hasattr(obj, 'servicechargedecision'):
                return obj.servicechargedecision.scd_decision_date
            return None
        except Exception as e:
            print(f"Error getting decision date: {e}")
            return None
        

class SummonRequestAcceptedListSerializer(serializers.ModelSerializer):
    complainant_names = serializers.SerializerMethodField()
    incident_type = serializers.SerializerMethodField()
    accused_names = serializers.SerializerMethodField()
    decision_date = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceChargeRequest
        fields = [
            'sr_id', 
            'sr_type', 
            'sr_req_date', 
            'sr_req_status', 
            'sr_case_status', 
            'comp_id', 
            'staff_id', 
            'complainant_names', 
            'incident_type', 
            'accused_names',
            'decision_date'
        ]
    
    def get_complainant_names(self, obj):
        if obj.comp_id:
            try:
                # Use prefetched data
                complainants = obj.comp_id.complaintcomplainant_set.all()
                return [cc.cpnt.cpnt_name for cc in complainants]
            except Exception as e:
                print(f"Error getting complainants: {e}")
                return []
        return []
    
    def get_incident_type(self, obj):
        if obj.comp_id:
            return getattr(obj.comp_id, 'comp_incident_type', None)
        return None
    
    def get_accused_names(self, obj):
        if obj.comp_id:
            try:
                # Use prefetched data
                accused_list = obj.comp_id.complaintaccused_set.all()
                return [ca.acsd.acsd_name for ca in accused_list]
            except Exception as e:
                print(f"Error getting accused: {e}")
                return []
        return []
    
    def get_decision_date(self, obj):
        try:
            # Use the correct reverse relationship name for OneToOneField
            if hasattr(obj, 'servicechargedecision'):
                return obj.servicechargedecision.scd_decision_date
            return None
        except Exception as e:
            print(f"Error getting decision date: {e}")
            return None
    
class ServiceChargeDecisionSerializer(serializers.ModelSerializer):
    class Meta: 
        model = ServiceChargeDecision
        fields = '__all__'


class ServiceChargePaymentRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceChargePaymentRequest
        fields = '__all__'


# ================== TREASURER: SERVICE CHARGE LIST =========================
class ServiceChargeTreasurerListSerializer(serializers.ModelSerializer):
    sr_id = serializers.CharField(read_only=True)
    caseNo = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    address1 = serializers.SerializerMethodField()
    respondent = serializers.SerializerMethodField()
    address2 = serializers.SerializerMethodField()
    reason = serializers.SerializerMethodField()
    reqDate = serializers.DateTimeField(source='sr_req_date', format="%Y-%m-%d", read_only=True)

    class Meta:
        model = ServiceChargeRequest
        fields = [
            'sr_id',
            'caseNo',
            'name',
            'address1',
            'respondent',
            'address2',
            'reason',
            'reqDate',
        ]

    def _get_first_complainant(self, obj):
        if obj.comp_id:
            try:
                cc = obj.comp_id.complaintcomplainant_set.select_related('cpnt').first()
                return cc.cpnt if cc else None
            except Exception:
                return None
        return None

    def _get_first_accused(self, obj):
        if obj.comp_id:
            try:
                ca = obj.comp_id.complaintaccused_set.select_related('acsd').first()
                return ca.acsd if ca else None
            except Exception:
                return None
        return None

    def get_caseNo(self, obj):
        return getattr(obj.comp_id, 'comp_id', None)

    def get_name(self, obj):
        cpnt = self._get_first_complainant(obj)
        return getattr(cpnt, 'cpnt_name', None) if cpnt else None

    def get_address1(self, obj):
        cpnt = self._get_first_complainant(obj)
        return getattr(cpnt, 'cpnt_address', None) if cpnt else None

    def get_respondent(self, obj):
        acsd = self._get_first_accused(obj)
        return getattr(acsd, 'acsd_name', None) if acsd else None

    def get_address2(self, obj):
        acsd = self._get_first_accused(obj)
        return getattr(acsd, 'acsd_address', None) if acsd else None

    def get_reason(self, obj):
        return getattr(obj.comp_id, 'comp_allegation', None) if obj.comp_id else None
# ============================ MIGHT DELETE THESE LATER ==============================

# Complaint-related Serializers
# class CaseSuppDocSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CaseSuppDoc
#         fields = '__all__'

# class ServiceChargeRequestFileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ServiceChargeRequestFile
#         fields = '__all__'

# class CaseActivitySerializer(serializers.ModelSerializer):
#     srf_detail = ServiceChargeRequestFileSerializer(source='srf', read_only=True)
#     supporting_documents = CaseSuppDocSerializer(
#         source='supporting_docs',
#         many=True,
#         read_only=True
#     )
#     formatted_hearing_datetime = serializers.SerializerMethodField()

#     class Meta:
#         model = CaseActivity
#         fields = [
#             'ca_id',
#             'ca_reason',
#             'ca_hearing_date',
#             'ca_hearing_time',
#             'formatted_hearing_datetime',
#             'ca_mediation',
#             'ca_date_of_issuance',
#             'srf_detail',
#             'supporting_documents'
#         ]
    
#     def get_formatted_hearing_datetime(self, obj):
#         return datetime.combine(obj.ca_hearing_date, obj.ca_hearing_time).strftime("%B %d, %Y at %I:%M %p")

# Service Charge Request Serializers
# class ServiceChargeRequestSerializer(serializers.ModelSerializer):
#     complainant_names = serializers.SerializerMethodField()
#     accused_names = serializers.SerializerMethodField()
#     incident_type = serializers.CharField(source='comp.comp_incident_type', read_only=True)
#     allegation = serializers.CharField(source='comp.comp_allegation', read_only=True)
#     formatted_decision_date = serializers.SerializerMethodField()
#     formatted_request_date = serializers.SerializerMethodField()

#     class Meta:
#         model = ServiceChargeRequest
#         fields = [
#             'sr_id', 
#             'sr_code',
#             'complainant_names', 
#             'accused_names', 
#             'incident_type', 
#             'allegation',
#             'sr_status',
#             'sr_payment_status',
#             'sr_type',
#             'formatted_decision_date',
#             'formatted_request_date'
#         ]

#     def get_complainant_names(self, obj):
#         if not obj.comp:
#             return []
#         return [c.cpnt_name for c in obj.comp.complainant.all()]
    
#     def get_accused_names(self, obj):
#         if not obj.comp:
#             return []
#         return [ca.acsd.acsd_name for ca in obj.comp.complaintaccused_set.all()]
    
#     def get_formatted_decision_date(self, obj):
#         if obj.sr_decision_date:
#             return obj.sr_decision_date.strftime("%B %d, %Y at %I:%M %p")
#         return None
    
#     def get_formatted_request_date(self, obj):
#         return obj.sr_req_date.strftime("%B %d, %Y at %I:%M %p")

# class ServiceChargeRequestDetailSerializer(serializers.ModelSerializer):
#     complaint = ComplaintSerializer(source='comp', read_only=True)
#     case_activities = CaseActivitySerializer(source='case', many=True, read_only=True)
#     file_action_file = ServiceChargeRequestFileSerializer(read_only=True)
#     parent_summon = ServiceChargeRequestSerializer(read_only=True)
#     formatted_request_date = serializers.SerializerMethodField()
#     formatted_decision_date = serializers.SerializerMethodField()

#     class Meta:
#         model = ServiceChargeRequest
#         fields = [
#             'sr_id',
#             'sr_code',
#             'sr_status',
#             'sr_payment_status',
#             'sr_type',
#             'formatted_request_date',
#             'formatted_decision_date',
#             'sr_decision_date',
#             'complaint',
#             'case_activities',
#             'file_action_file',
#             'parent_summon'
#         ]
    
#     def get_formatted_request_date(self, obj):
#         return obj.sr_req_date.strftime("%B %d, %Y at %I:%M %p")
    
#     def get_formatted_decision_date(self, obj):
#         if obj.sr_decision_date:
#             return obj.sr_decision_date.strftime("%B %d, %Y at %I:%M %p")
#         return None

# class FileActionRequestSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ServiceChargeRequest
#         fields = [
#             'sr_id',
#             'sr_code',
#             'sr_type',
#             'sr_payment_status',
#             'parent_summon',
#             'file_action_file',
#             'comp'
#         ]


