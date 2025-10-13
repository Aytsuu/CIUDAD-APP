from rest_framework import serializers
from .models import *
from .models import NonResidentCertificateRequest
from apps.complaint.models import Complaint, ComplaintComplainant, ComplaintAccused, Complaint_File, Complainant, Accused
from apps.complaint.serializers import ComplaintSerializer
from apps.profiling.models import ResidentProfile, FamilyComposition, Address
from apps.administration.models import Staff
from apps.treasurer.models import Invoice, Purpose_And_Rates
from datetime import datetime
import logging
import traceback
from apps.profiling.serializers.business_serializers import FileInputSerializer
from utils.supabase_client import upload_to_storage
from django.db import transaction

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
# class AddressDetailsSerializer(serializers.ModelSerializer):
#     formatted_address = serializers.SerializerMethodField()
#     sitio_name = serializers.CharField(source='sitio.sitio_name', allow_null=True)
    
    # class Meta:
    #     model = Address
    #     fields = [
    #         'add_province',
    #         'add_city',
    #         'add_barangay',
    #         'add_street',
    #         'sitio_name',
    #         'add_external_sitio',
    #         'formatted_address'
    #     ]
    
    # def get_formatted_address(self, obj):
    #     sitio = obj.sitio.sitio_name if obj.sitio else obj.add_external_sitio
    #     parts = [
    #         sitio,
    #         obj.add_street,
    #         f"Barangay {obj.add_barangay}",
    #         obj.add_city,
    #         obj.add_province
    #     ]
    #     return ', '.join(filter(None, parts))

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

    pr_id = serializers.PrimaryKeyRelatedField(
        queryset=Purpose_And_Rates.objects.all(),
        required=False,
        allow_null=True
    )
    staff_id = serializers.CharField(required=False, allow_null=True, write_only=True)
    rp_id = serializers.PrimaryKeyRelatedField(
        queryset=ResidentProfile.objects.all()
    )

    resident_details = serializers.SerializerMethodField()
    invoice = serializers.SerializerMethodField()
    purpose = serializers.SerializerMethodField()
    
    def get_resident_details(self, obj):
        try:
            if obj.rp_id and getattr(obj.rp_id, "per", None):
                # Get the primary address for this person
                address_str = None
                try:
                    personal_address = obj.rp_id.per.personal_addresses.first()
                    if personal_address and personal_address.add:
                        addr = personal_address.add
                        address_parts = [
                            addr.add_street,
                            addr.add_external_sitio,
                            addr.add_barangay,
                            addr.add_city,
                            addr.add_province
                        ]
                        address_str = ", ".join(filter(None, address_parts))
                except Exception as addr_e:
                    logger.error(f"Error getting address: {str(addr_e)}")
                
                # Format DOB properly if it exists
                dob_value = obj.rp_id.per.per_dob
                if dob_value:
                    # Convert to string if it's a date object
                    if hasattr(dob_value, 'strftime'):
                        dob_value = dob_value.strftime('%Y-%m-%d')
                    else:
                        dob_value = str(dob_value)
                
                return {
                    'per_fname': obj.rp_id.per.per_fname,
                    'per_lname': obj.rp_id.per.per_lname,
                    'per_dob': dob_value,
                    'per_address': address_str,
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
            return {
                "pr_purpose": "Unknown Purpose",
                "pr_rate": 0.0
            }
        except Exception as e:
            logger.error(f"Error getting purpose and rate: {str(e)}")
            return {
                "pr_purpose": "Unknown Purpose",
                "pr_rate": 0.0
            }

    def validate_staff_id(self, value):
        """Validate and format staff_id properly"""
        if not value:
            return None
        
        # Convert to string and strip whitespace
        staff_id_str = str(value).strip()
        
        # Pad with leading zeros if less than 11 digits
        if len(staff_id_str) < 11:
            staff_id_str = staff_id_str.zfill(11)
        
        # Verify the staff exists
        from apps.administration.models import Staff
        try:
            staff = Staff.objects.get(staff_id=staff_id_str)
            return staff
        except Staff.DoesNotExist:
            raise serializers.ValidationError(f"Staff with ID {staff_id_str} does not exist")
        except Staff.MultipleObjectsReturned:
            # This shouldn't happen with primary key, but handle it
            staff = Staff.objects.filter(staff_id=staff_id_str).first()
            return staff

    def validate_pr_id(self, value):
        if not value:
            raise serializers.ValidationError("Purpose request ID (pr_id) is required")

        # Debug logging
        logger.info(f"validate_pr_id received value: {value} (type: {type(value)})")

        # Handle case where a Purpose_And_Rates object is passed instead of ID
        if hasattr(value, 'pr_id'):
            logger.info(f"Object already provided, returning as-is: {value}")
            return value  # Return the object as-is

        # If we have an ID, get the object
        from apps.treasurer.models import Purpose_And_Rates
        try:
            purpose_obj = Purpose_And_Rates.objects.get(pk=value)
            logger.info(f"Found Purpose_And_Rates object: {purpose_obj}")
            return purpose_obj
        except Purpose_And_Rates.DoesNotExist:
            raise serializers.ValidationError(f"Purpose request with ID {value} does not exist")

    def validate_rp_id(self, value):
        """Validate and format rp_id properly"""
        if not value:
            raise serializers.ValidationError("Resident profile ID (rp_id) is required")
        
        rp_id_str = str(value).strip()
        
        if "(ID:" in rp_id_str and ")" in rp_id_str:
            try:
                
                start_idx = rp_id_str.find("(ID:") + 4
                end_idx = rp_id_str.find(")", start_idx)
                if start_idx > 3 and end_idx > start_idx:
                    rp_id_str = rp_id_str[start_idx:end_idx].strip()
                    print(f"Extracted rp_id from display string: {rp_id_str}")
            except Exception as e:
                print(f"Error extracting ID from display string: {e}")
                raise serializers.ValidationError("Invalid resident profile format")
        
        # Pad with leading zeros if less than 11 digits
        if len(rp_id_str) < 11:
            rp_id_str = rp_id_str.zfill(11)
        
        # Verify the resident profile exists
        from apps.profiling.models import ResidentProfile
        try:
            resident = ResidentProfile.objects.get(rp_id=rp_id_str)
            return resident
        except ResidentProfile.DoesNotExist:
            raise serializers.ValidationError(f"Resident profile with ID {rp_id_str} does not exist")
        except ResidentProfile.MultipleObjectsReturned:
            # This shouldn't happen with primary key, but handle it
            resident = ResidentProfile.objects.filter(rp_id=rp_id_str).first()
            return resident

    def create(self, validated_data):
        if 'cr_id' not in validated_data or not validated_data['cr_id']:
            from .models import ClerkCertificate
            year_suffix = timezone.now().year % 100
            try:
                existing_count = ClerkCertificate.objects.filter(cr_id__endswith=f"-{year_suffix:02d}").count()
            except Exception:
                existing_count = ClerkCertificate.objects.count()
            seq = existing_count + 1
            validated_data['cr_id'] = f"CR{seq:03d}-{year_suffix:02d}"
        return super().create(validated_data)

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
            'staff_id',
        ]
        extra_kwargs = {
            'cr_id': {'read_only': True}
        }


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
            'req_amount',  
        ]

    def get_business_name(self, obj):
        try:
            
            if obj.bus_permit_name:
                return obj.bus_permit_name
            
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
            # Prefer Business.bus_location from the linked Business record
            if obj.bus_id and hasattr(obj.bus_id, 'bus_location') and obj.bus_id.bus_location:
                return obj.bus_id.bus_location
            # Fallback to explicitly provided permit address
            if getattr(obj, 'bus_permit_address', None):
                return obj.bus_permit_address
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
            'bpr_id': {'required': False, 'read_only': True},
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
        # Generate bpr_id if not provided (format: BPR001-25)
        if 'bpr_id' not in validated_data or not validated_data['bpr_id']:
            year_suffix = timezone.now().year % 100
            try:
                # Count existing business permits with the current year suffix
                existing_count = BusinessPermitRequest.objects.filter(bpr_id__endswith=f"-{year_suffix:02d}").count()
            except Exception:
                # Fallback to total count if filtering fails
                existing_count = BusinessPermitRequest.objects.count()
            seq = existing_count + 1
            validated_data['bpr_id'] = f"BPR{seq:03d}-{year_suffix:02d}"
        
        # Handle business name and address logic
        bus_id = validated_data.get('bus_id')
        
        if bus_id:
            # Existing business - set to null, data will be fetched via bus_id in datatable
            validated_data['bus_permit_name'] = None
            validated_data['bus_permit_address'] = None
        else:
            # New business - use the provided bus_permit_name and bus_permit_address
            # These should already be in validated_data from the request
            pass
        
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
    
class ServiceChargeDecisionSerializer(serializers.ModelSerializer):
    class Meta: 
        model = ServiceChargeDecision
        fields = '__all__'

class ServiceChargePaymentRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceChargePaymentRequest
        fields = '__all__'

class SummonScheduleDetailSerializer(serializers.ModelSerializer):
    hearing_date = serializers.DateField(source='sd_id.sd_date', read_only=True)
    hearing_time = serializers.TimeField(source='st_id.st_start_time', read_only=True)
    
    class Meta:
        model = SummonSchedule
        fields = [
            'ss_id', 
            'ss_mediation_level', 
            'ss_is_rescheduled', 
            'ss_reason',
            'hearing_date',
            'hearing_time'
        ]


# class ServiceChargeRequestDetailSerializer(serializers.ModelSerializer):
#     complaint = serializers.SerializerMethodField()
#     schedules = serializers.SerializerMethodField()

#     class Meta:
#         model = ServiceChargeRequest
#         fields = [
#             'sr_id',
#             'sr_code',
#             'sr_type',
#             'sr_req_date',
#             'sr_req_status',
#             'sr_case_status',
#             'sr_date_marked',
#             'comp_id',
#             'complaint',       
#             'schedules',      
#         ]

#     def get_complaint(self, obj):
#         if not obj.comp_id:
#             return None
#         return ComplaintSerializer(obj.comp_id, context=self.context).data

#     def get_schedules(self, obj):
#         schedules = SummonSchedule.objects.filter(sr_id=obj)
#         result = []
#         for schedule in schedules:
#             schedule_data = SummonScheduleDetailSerializer(schedule).data
#             supp_docs = SummonSuppDoc.objects.filter(ss_id=schedule)
#             schedule_data['supporting_docs'] = SummonSuppDocViewSieralizer(
#                 supp_docs, many=True
#             ).data
#             result.append(schedule_data)
#         return result

# ================== TREASURER: SERVICE CHARGE LIST =========================
class ServiceChargeTreasurerListSerializer(serializers.ModelSerializer):
    complainant_name = serializers.SerializerMethodField()
    payment_request = serializers.SerializerMethodField()
    complainant_names = serializers.SerializerMethodField()
    complainant_addresses = serializers.SerializerMethodField()
    accused_names = serializers.SerializerMethodField()
    accused_addresses = serializers.SerializerMethodField()
    sr_id = serializers.SerializerMethodField()
    sr_code = serializers.SerializerMethodField()
    sr_type = serializers.SerializerMethodField()
    sr_req_date = serializers.SerializerMethodField()
    sr_req_status = serializers.SerializerMethodField()
    sr_case_status = serializers.SerializerMethodField()
    staff_id = serializers.SerializerMethodField()
    
    class Meta:
        from .models import ServiceChargePaymentRequest
        model = ServiceChargePaymentRequest
        fields = [
            'pay_id',
            'pay_sr_type',
            'pay_status',
            'pay_date_req',
            'pay_due_date',
            'pay_date_paid',
            'comp_id',
            'pr_id',
            'sr_id',
            'sr_code', 
            'sr_type',
            'sr_req_date',
            'sr_req_status',
            'sr_case_status',
            'staff_id',
            'complainant_name',
            'complainant_names',
            'complainant_addresses',
            'accused_names',
            'accused_addresses',
            'payment_request'
        ]
    
    def get_complainant_name(self, obj):
        try:
            if obj.comp_id:
                complainant = obj.comp_id.complaintcomplainant_set.select_related('cpnt').first()
                return complainant.cpnt.cpnt_name if complainant and complainant.cpnt else None
        except Exception:
            pass
        return None

    def get_complainant_names(self, obj):
        try:
            if obj.comp_id:
                complainants = obj.comp_id.complaintcomplainant_set.select_related('cpnt').all()
                return [cc.cpnt.cpnt_name for cc in complainants if getattr(cc, 'cpnt', None)]
        except Exception:
            pass
        return []

    def get_complainant_addresses(self, obj):
        try:
            if obj.comp_id:
                complainants = obj.comp_id.complaintcomplainant_set.select_related('cpnt').all()
                return [getattr(cc.cpnt, 'cpnt_address', None) or "N/A" for cc in complainants if getattr(cc, 'cpnt', None)]
        except Exception:
            pass
        return []

    def get_accused_names(self, obj):
        try:
            if obj.comp_id:
                accused_list = obj.comp_id.complaintaccused_set.select_related('acsd').all()
                return [ca.acsd.acsd_name for ca in accused_list if getattr(ca, 'acsd', None)]
        except Exception:
            pass
        return []

    def get_accused_addresses(self, obj):
        try:
            if obj.comp_id:
                accused_list = obj.comp_id.complaintaccused_set.select_related('acsd').all()
                return [getattr(ca.acsd, 'acsd_address', None) or "N/A" for ca in accused_list if getattr(ca, 'acsd', None)]
        except Exception:
            pass
        return []
    
    def get_sr_id(self, obj):
        # Generate a service request ID based on payment ID
        return f"SR-{obj.pay_id}"
    
    def get_sr_code(self, obj):
        # Return None for now, will be generated when payment is made
        return None
    
    def get_sr_type(self, obj):
        # Use the payment request type
        return obj.pay_sr_type
    
    def get_sr_req_date(self, obj):
        # Use payment request date
        return obj.pay_date_req
    
    def get_sr_req_status(self, obj):
        # Map payment status to service request status
        if obj.pay_status == "Unpaid":
            return "Pending"
        return obj.pay_status
    
    def get_sr_case_status(self, obj):
        # Default case status
        return "Pending"
    
    def get_staff_id(self, obj):
        # Return None for now
        return None

    def get_payment_request(self, obj):
        try:
            # Calculate due date (7 days from request date)
            from datetime import timedelta
            due_date = obj.pay_date_req + timedelta(days=7) if obj.pay_date_req else None
            
            # Check if overdue
            from django.utils import timezone
            is_overdue = False
            if due_date and obj.pay_status == 'Unpaid':
                is_overdue = timezone.now() > due_date
            
            # Return payment request data directly
            return {
                'spay_id': obj.pay_id,
                'spay_status': obj.pay_status,
                'spay_due_date': obj.pay_due_date,
                'spay_date_paid': obj.pay_date_paid,
                'pr_id': obj.pr_id.pr_id if obj.pr_id else None,
                'calculated_due_date': due_date,
                'is_overdue': is_overdue
            }
        except Exception:
            return None
        

# SUMMON CASE SERIALIZER FOR COMPLAINANT TRACKING MOBILE
class CaseTrackingSerializer(serializers.ModelSerializer):
    decision = serializers.SerializerMethodField()
    payment = serializers.SerializerMethodField()
    schedule = serializers.SerializerMethodField()
    current_step = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceChargeRequest
        fields = [
            'sr_id', 'sr_code', 'sr_type', 'sr_req_date', 
            'sr_req_status', 'sr_case_status', 'sr_date_marked',
            'decision', 'payment', 'schedule', 'current_step', 'progress_percentage'
        ]
    
    def get_decision(self, obj):
        try:
            decision = ServiceChargeDecision.objects.get(sr_id=obj)
            return {
                'scd_decision_date': decision.scd_decision_date,
                'scd_reason': decision.scd_reason
            }
        except ServiceChargeDecision.DoesNotExist:
            return None
    
    def get_payment(self, obj):
        try:
            payment = ServiceChargePaymentRequest.objects.get(sr_id=obj)
            payment_data = {
                'spay_id': payment.spay_id,
                'spay_status': payment.spay_status,
                'spay_due_date': payment.spay_due_date,
                'spay_date_paid': payment.spay_date_paid,
            }
            
            # Add amount and purpose from the related pr_id
            if payment.pr_id:
                payment_data['amount'] = payment.pr_id.pr_rate
                payment_data['purpose'] = payment.pr_id.pr_purpose
            
            return payment_data
        except ServiceChargePaymentRequest.DoesNotExist:
            return None
    
    def get_schedule(self, obj):
        try:
            schedule = SummonSchedule.objects.get(sr_id=obj)
            schedule_data = {
                'ss_id': schedule.ss_id,
                'ss_mediation_level': schedule.ss_mediation_level,
                'ss_is_rescheduled': schedule.ss_is_rescheduled,
                'ss_reason': schedule.ss_reason,
            }
            
            # Add date and time from related objects
            if schedule.sd_id:
                schedule_data['date'] = schedule.sd_id.sd_date
            if schedule.st_id:
                schedule_data['time'] = schedule.st_id.st_start_time
            
            return schedule_data
        except SummonSchedule.DoesNotExist:
            return None
    
    def get_current_step(self, obj):
        """Determine the current step based on the case status"""
        steps = [
            {
                'id': 1,
                'title': 'Summon Request',
                'description': self._get_step1_description(obj),
                'status': self._get_step1_status(obj),
                'details': self._get_step1_details(obj),
                'display_status': self._get_step1_display_status(obj),
            },
            {
                'id': 2,
                'title': 'Payment',
                'description': 'Process payment for mediation services',
                'status': self._get_step2_status(obj),
                'details': self._get_step2_details(obj),
                'display_status': self._get_step2_display_status(obj),
            },
            {
                'id': 3,
                'title': 'Schedule Mediation',
                'description': 'Book your mediation session with available mediators',
                'status': self._get_step3_status(obj),
                'details': self._get_step3_details(obj),
                'display_status': self._get_step3_display_status(obj),
            },
            {
                'id': 4,
                'title': 'Case Completion',
                'description': 'Receive final documentation and case resolution',
                'status': self._get_step4_status(obj),
                'details': 'Final documents will be available after mediation completion.',
                'display_status': self._get_step4_display_status(obj),
            }
        ]
        return steps
    
    def get_progress_percentage(self, obj):
        """Calculate progress percentage based on completed steps"""
        steps = self.get_current_step(obj)
        completed_steps = sum(1 for step in steps if step['status'] == 'accepted')
        return (completed_steps / len(steps)) * 100 if steps else 0
    
    # Step 1: Summon Request
    def _get_step1_status(self, obj):
        if not obj.sr_req_status:
            return 'pending'
        status_lower = obj.sr_req_status.lower()
        if status_lower == 'accepted':
            return 'accepted'
        elif status_lower == 'rejected':
            return 'rejected'
        return 'pending'
    
    def _get_step1_display_status(self, obj):
        status = self._get_step1_status(obj)
        return status.capitalize()  # Pending, Accepted, Rejected
    
    def _get_step1_description(self, obj):
        status = self._get_step1_status(obj)
        if status == 'pending':
            return 'Waiting for approval.'
        elif status == 'accepted':
            return 'Your summon request has been approved.'
        else:
            return 'Your summon request has been rejected.'
    
    def _get_step1_details(self, obj):
        decision = self.get_decision(obj)
        status = self._get_step1_status(obj)
        
        details = f"Requested on {obj.sr_req_date.strftime('%B %d, %Y') if obj.sr_req_date else 'N/A'}."
        
        if status == 'accepted' and decision and decision.get('scd_decision_date'):
            details += f" Accepted on {decision['scd_decision_date'].strftime('%B %d, %Y')}."
        elif status == 'rejected' and decision:
            decision_date = decision.get('scd_decision_date')
            reason = decision.get('scd_reason', 'No reason provided')
            if decision_date:
                details += f" Rejected on {decision_date.strftime('%B %d, %Y')}. Reason: {reason}."
            else:
                details += f" Rejected. Reason: {reason}."
        
        return details
    
    # Step 2: Payment
    def _get_step2_status(self, obj):
        payment = self.get_payment(obj)
        if not payment:
            return 'pending'
        
        status = payment.get('spay_status', '').lower()
        
        if status == 'paid':
            return 'accepted'
        elif status == 'unpaid':
            spay_due_date = payment.get('spay_due_date')
            if spay_due_date and timezone.now().date() > spay_due_date:
                return 'rejected'  # Overdue unpaid payment
            return 'pending'  # Not yet due
        return 'pending'
    
    def _get_step2_display_status(self, obj):
        payment = self.get_payment(obj)
        if not payment:
            return 'Unpaid'
        
        status = payment.get('spay_status', '').lower()
        if status == 'paid':
            return 'Paid'
        elif status == 'unpaid':
            return 'Unpaid'
        return 'Unpaid'
    
    def _get_step2_details(self, obj):
        payment = self.get_payment(obj)
        status = self._get_step2_status(obj)
        
        if status == 'pending' and payment:
            amount = payment.get('amount', 'N/A')
            purpose = payment.get('purpose', 'mediation services')
            spay_due_date = payment.get('spay_due_date')
            
            if spay_due_date:
                return f"Payment of {amount} for {purpose} is due on {spay_due_date.strftime('%B %d, %Y')}."
            else:
                return f"Payment of {amount} for {purpose} will be enabled once your summon request is approved."
        
        elif status == 'accepted' and payment:
            amount = payment.get('amount', 'N/A')
            spay_date_paid = payment.get('spay_date_paid')
            if spay_date_paid:
                return f"Payment of {amount} paid on {spay_date_paid.strftime('%B %d, %Y')}."
            else:
                return f"Payment of {amount} completed."
        
        elif status == 'rejected' and payment:
            spay_due_date = payment.get('spay_due_date')
            if spay_due_date:
                return f"Payment overdue. Due date was {spay_due_date.strftime('%B %d, %Y')}."
            else:
                return "Payment overdue."
        
        return "Payment details not available."
    
    # Step 3: Schedule Mediation
    def _get_step3_status(self, obj):
        schedule = self.get_schedule(obj)
        if not schedule:
            return 'pending'
        
        if schedule.get('ss_is_rescheduled'):
            return 'rejected'
        return 'accepted'
    
    def _get_step3_display_status(self, obj):
        schedule = self.get_schedule(obj)
        if not schedule:
            return 'Not Scheduled'
        
        if schedule.get('ss_is_rescheduled'):
            return 'Rescheduled'
        return 'Scheduled'
    
    def _get_step3_details(self, obj):
        schedule = self.get_schedule(obj)
        status = self._get_step3_status(obj)
        
        if status == 'pending':
            return "Schedule mediation after payment is completed."
        elif status == 'accepted' and schedule and schedule.get('date') and schedule.get('time'):
            return f"Scheduled for {schedule['date']} at {schedule['time']}."
        elif status == 'rejected' and schedule:
            reason = schedule.get('ss_reason', 'No reason provided')
            return f"Previous slot rejected. Reason: {reason}. Please select a new time."
        return ""
    
    # Step 4: Case Completion
    def _get_step4_status(self, obj):
        if not obj.sr_case_status:
            return 'pending'
        
        status_lower = obj.sr_case_status.lower()
        if status_lower == 'resolved':
            return 'accepted'
        elif status_lower == 'escalated':
            return 'rejected'
        return 'pending'
    
    def _get_step4_display_status(self, obj):
        if not obj.sr_case_status:
            return 'In Progress'
        
        status_lower = obj.sr_case_status.lower()
        if status_lower == 'resolved':
            return 'Resolved'
        elif status_lower == 'escalated':
            return 'Escalated'
        return 'In Progress'

# New: Flat serializer exposing top-level payment fields for easy Paid-list consumption
class ServiceChargePaidListSerializer(serializers.ModelSerializer):
    complainant_name = serializers.SerializerMethodField()
    spay_status = serializers.SerializerMethodField()
    spay_date_paid = serializers.SerializerMethodField()
    pr_id = serializers.SerializerMethodField()

    class Meta:
        model = ServiceChargeRequest
        fields = [
            'sr_id',
            'sr_code',
            'sr_type',
            'sr_req_date',
            'sr_req_status',
            'sr_case_status',
            'comp_id',
            'staff_id',
            'complainant_name',
            'spay_status',
            'spay_date_paid',
            'pr_id',
        ]

    def get_complainant_name(self, obj):
        if obj.comp_id:
            try:
                complainant = obj.comp_id.complaintcomplainant_set.select_related('cpnt').first()
                return complainant.cpnt.cpnt_name if complainant and complainant.cpnt else None
            except Exception:
                return None
        return None

    def get_spay_status(self, obj):
        try:
            return getattr(obj.servicechargepaymentrequest, 'spay_status', None)
        except Exception:
            return None

    def get_spay_date_paid(self, obj):
        try:
            return getattr(obj.servicechargepaymentrequest, 'spay_date_paid', None)
        except Exception:
            return None

    def get_pr_id(self, obj):
        try:
            pr = getattr(obj.servicechargepaymentrequest, 'pr_id', None)
            return pr.pr_id if pr else None
        except Exception:
            return None
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

