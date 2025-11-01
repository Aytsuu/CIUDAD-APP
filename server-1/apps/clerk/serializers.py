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
    cr_id = serializers.SerializerMethodField()
    dateIssued = serializers.DateField(source='ic_date_of_issuance', format="%Y-%m-%d")

    def get_requester(self, obj):
        try:
            # Handle resident certificates
            if obj.certificate and obj.certificate.rp_id and getattr(obj.certificate.rp_id, "per", None):
                person = obj.certificate.rp_id.per
                # Format as "Last Name First Name Middle Name"
                name_parts = [
                    person.per_lname,
                    person.per_fname,
                    person.per_mname
                ]
                return " ".join(filter(None, name_parts)) or "Unknown"
            
            # Handle non-resident certificates
            elif obj.nonresidentcert:
                # Use individual name fields: lname fname mname
                name_parts = [
                    obj.nonresidentcert.nrc_lname,
                    obj.nonresidentcert.nrc_fname,
                    obj.nonresidentcert.nrc_mname
                ]
                return " ".join(filter(None, name_parts)) or "Unknown"
            
            return "Unknown"
        except Exception as e:
            logger.error(f"Error getting requester: {str(e)}")
            return "Unknown"

    def get_purpose(self, obj):
        try:
            # Handle resident certificates
            if obj.certificate and obj.certificate.pr_id:
                return obj.certificate.pr_id.pr_purpose
            
            # Handle non-resident certificates
            elif obj.nonresidentcert and obj.nonresidentcert.pr_id:
                return obj.nonresidentcert.pr_id.pr_purpose
            
            return "Not specified"
        except Exception as e:
            logger.error(f"Error getting purpose: {str(e)}")
            return "Not specified"
    
    def get_cr_id(self, obj):
        try:
            # Get cr_id from resident certificate or nrc_id from non-resident certificate
            if obj.certificate:
                return obj.certificate.cr_id
            elif obj.nonresidentcert:
                return obj.nonresidentcert.nrc_id
            return ""
        except Exception as e:
            logger.error(f"Error getting cr_id: {str(e)}")
            return ""

    class Meta:
        model = IssuedCertificate
        fields = ['ic_id', 'cr_id', 'dateIssued', 'requester', 'purpose']


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
    nrc_id = serializers.SerializerMethodField()  # Override nrc_id to return formatted version
    staff_id = serializers.CharField(required=False, allow_null=True, write_only=True)
    nrc_mname = serializers.CharField(max_length=500, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = NonResidentCertificateRequest
        fields = [
            "nrc_id",
            "nrc_req_date",
            "nrc_req_status",
            "nrc_req_payment_status",
            "nrc_pay_date",
            "nrc_lname",
            "nrc_fname",
            "nrc_mname",
            "nrc_address",
            "nrc_birthdate",
            "pr_id",    
            "purpose",   
            "amount",
            "nrc_discount_reason",
            "staff_id",   
        ]
        extra_kwargs = {
            'nrc_id': {'read_only': True}
        }

    def get_purpose(self, obj):
        if obj.pr_id:
            return {
                "pr_purpose": obj.pr_id.pr_purpose,
                "pr_rate": str(obj.pr_id.pr_rate)
            }
        return None
    
    def get_nrc_id(self, obj):
        """Generate formatted ID like NRC001-25 from the actual nrc_id"""
        if obj.nrc_id:
            from django.utils import timezone
            year_suffix = timezone.now().year % 100
            # Assuming obj.nrc_id is the numeric ID from the DB before it's overridden
            # If the DB column is already VARCHAR, this will be the formatted ID
            # This method is called for existing instances. For new instances, the create method handles it.
            if isinstance(obj.nrc_id, int): # Check if it's still the auto-incremented number
                return f"NRC{obj.nrc_id:03d}-{year_suffix:02d}"
            return obj.nrc_id # If it's already a string, return as is
        return None

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

    def create(self, validated_data):
        """Create non-resident certificate request with formatted ID like NRC001-25"""
        from django.utils import timezone
        
        # Set empty string or None for middle name if not provided
        if 'nrc_mname' not in validated_data or not validated_data.get('nrc_mname'):
            validated_data['nrc_mname'] = ''
        
        if 'nrc_id' not in validated_data or not validated_data['nrc_id']:
            year_suffix = timezone.now().year % 100
            try:
                existing_count = NonResidentCertificateRequest.objects.filter(nrc_id__endswith=f"-{year_suffix:02d}").count()
            except Exception:
                existing_count = NonResidentCertificateRequest.objects.count()
            seq = existing_count + 1
            validated_data['nrc_id'] = f"NRC{seq:03d}-{year_suffix:02d}"
        return super().create(validated_data)
    
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
    
    # Add field mapping for frontend compatibility
    payment_status = serializers.CharField(source='cr_req_payment_status', required=False, allow_null=True)

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
                
                # Calculate eligibility for free service
                # Check voter status
                is_voter = obj.rp_id.voter is not None
                
                # Check PWD status
                pwd_value = getattr(obj.rp_id.per, 'per_disability', None)
                is_pwd = pwd_value and str(pwd_value).strip() != ''
                
                # Check senior status (age 60+)
                is_senior = False
                if dob_value:
                    try:
                        from datetime import date
                        dob = obj.rp_id.per.per_dob
                        today = date.today()
                        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
                        is_senior = age >= 60
                    except Exception:
                        pass
                
                return {
                    'per_fname': obj.rp_id.per.per_fname,
                    'per_mname': getattr(obj.rp_id.per, 'per_mname', None),
                    'per_lname': obj.rp_id.per.per_lname,
                    'per_dob': dob_value,
                    'per_address': address_str,
                    'per_is_deceased': getattr(obj.rp_id.per, 'per_is_deceased', False),
                    'voter_id': getattr(obj.rp_id, 'voter_id', None),
                    # Eligibility fields for instant frontend rendering
                    'is_voter': is_voter,
                    'is_pwd': is_pwd,
                    'is_senior': is_senior,
                    'is_free_eligible': is_voter or is_pwd or is_senior
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
            resident = ResidentProfile.objects.select_related('per').get(rp_id=rp_id_str)
            
            # Check if the resident is deceased
            if hasattr(resident, 'per') and resident.per and getattr(resident.per, 'per_is_deceased', False):
                raise serializers.ValidationError("Deceased residents cannot request certificates")
            
            return resident
        except ResidentProfile.DoesNotExist:
            raise serializers.ValidationError(f"Resident profile with ID {rp_id_str} does not exist")
        except ResidentProfile.MultipleObjectsReturned:
            # This shouldn't happen with primary key, but handle it
            resident = ResidentProfile.objects.select_related('per').filter(rp_id=rp_id_str).first()
            if resident and hasattr(resident, 'per') and resident.per and getattr(resident.per, 'per_is_deceased', False):
                raise serializers.ValidationError("Deceased residents cannot request certificates")
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
            'payment_status',  # Add frontend-compatible field
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
            'bus_clearance_gross_sales',
            'requestor',
            'purpose',
            'amount_to_pay',
            'req_amount',
            'bus_reason',
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
    
            if hasattr(obj, 'req_amount') and obj.req_amount:
                return float(obj.req_amount)
            
            if obj.ags_id:
               
                return float(obj.ags_id.ags_rate) if obj.ags_id.ags_rate else 0.0
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
            'bus_clearance_gross_sales',
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
            'bus_clearance_gross_sales': {'required': False, 'allow_null': True},
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
    bpr_id = serializers.SerializerMethodField()
    dateIssued = serializers.DateField(source='ibp_date_of_issuance', format="%Y-%m-%d")
    purpose = serializers.SerializerMethodField()
    original_permit = serializers.SerializerMethodField()

    def get_business_name(self, obj):
        try:
            # Prefer explicit permit name if provided on the request (new businesses)
            if obj.bpr_id and getattr(obj.bpr_id, 'bus_permit_name', None):
                return obj.bpr_id.bus_permit_name
            # Fallback to linked Business record name (existing businesses)
            if obj.bpr_id and getattr(obj.bpr_id, 'bus_id', None) and getattr(obj.bpr_id.bus_id, 'bus_name', None):
                return obj.bpr_id.bus_id.bus_name
            return "Unknown"
        except Exception as e:
            logger.error(f"Error getting business name: {str(e)}")
            return "Unknown"
    
    def get_bpr_id(self, obj):
        try:
            if obj.bpr_id:
                return obj.bpr_id.bpr_id
            return ""
        except Exception as e:
            logger.error(f"Error getting bpr_id: {str(e)}")
            return ""

    def get_purpose(self, obj):
        try:
            if obj.bpr_id and getattr(obj.bpr_id, 'pr_id', None):
                return obj.bpr_id.pr_id.pr_purpose
            return None
        except Exception as e:
            logger.error(f"Error getting business permit purpose: {str(e)}")
            return None

    def get_original_permit(self, obj):
        try:
            pr = obj.bpr_id
            if not pr:
                return None
            return {
                'bpr_id': getattr(pr, 'bpr_id', None),
                'req_request_date': getattr(pr, 'req_request_date', None),
                'req_pay_method': getattr(pr, 'req_pay_method', None),
                'business_name': getattr(pr, 'bus_permit_name', None) or (getattr(getattr(pr, 'bus_id', None), 'bus_name', None)),
                'business_address': getattr(pr, 'bus_permit_address', None) or (getattr(getattr(pr, 'bus_id', None), 'bus_location', None)),
                'purpose': getattr(getattr(pr, 'pr_id', None), 'pr_purpose', None),
            }
        except Exception as e:
            logger.error(f"Error building original_permit: {str(e)}")
            return None

    class Meta:
        model = IssuedBusinessPermit
        fields = ['ibp_id', 'bpr_id', 'dateIssued', 'business_name', 'purpose', 'original_permit']

# ================== SERVICE CHARGE SERIALIZERS =========================
    
class ServiceChargePaymentRequestSerializer(serializers.ModelSerializer):
    # Make pay_id not required so it can be auto-generated
    pay_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    pay_reason = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = ServiceChargePaymentRequest
        fields = '__all__'
    
    def create(self, validated_data):
        # Auto-generate pay_id without SR- prefix
        if 'pay_id' not in validated_data or not validated_data.get('pay_id'):
            from django.utils import timezone
            from .models import ServiceChargePaymentRequest
            
            year_suffix = timezone.now().year % 100
            
            # Get the last ServiceChargePaymentRequest to determine next sequential number
            last_record = ServiceChargePaymentRequest.objects.filter(
                pay_id__endswith=f"-{year_suffix:02d}"
            ).order_by('-pay_id').first()
            
            if last_record:
                # Extract the number from the last pay_id (e.g., "SP001-25" -> 1)
                try:
                    # Handle both old format with SR- and new format
                    pay_id_str = last_record.pay_id.replace('SR-', '')
                    last_num = int(pay_id_str.split('-')[0].replace('SP', ''))
                    seq = last_num + 1
                except (ValueError, IndexError):
                    seq = 1
            else:
                seq = 1
            
            # Generate the new pay_id without SR- prefix (e.g., "SP001-25")
            validated_data['pay_id'] = f"SP{seq:03d}-{year_suffix:02d}"
        
        return super().create(validated_data)

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
            'sr_code',  # This will now read from database
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
                # Try to get complainant through the complaint relationship
                complainant = obj.comp_id.complaintcomplainant_set.select_related('cpnt').first()
                if complainant and complainant.cpnt:
                    return complainant.cpnt.cpnt_name
                else:
                    
                    return "N/A"
            else:
                return "N/A"
        except Exception as e:
            return "Error Loading Complainant"

    def get_complainant_names(self, obj):
        try:
            if obj.comp_id:
                complainants = obj.comp_id.complaintcomplainant_set.select_related('cpnt').all()
                names = [cc.cpnt.cpnt_name for cc in complainants if getattr(cc, 'cpnt', None)]
                if not names:
                    # If no complainants found, return N/A
                    return ["N/A"]
                return names
        except Exception:
            pass
        return ["No Complainant Data"]

    def get_complainant_addresses(self, obj):
        try:
            if obj.comp_id:
                complainants = obj.comp_id.complaintcomplainant_set.select_related('cpnt').all()
                addresses = [getattr(cc.cpnt, 'cpnt_address', None) or "N/A" for cc in complainants if getattr(cc, 'cpnt', None)]
                if not addresses:
                    # If no complainants found, return a default address
                    return ["N/A"]
                return addresses
        except Exception:
            pass
        return ["N/A"]

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
        # pay_id is already stored as SR code in the database (e.g., "SR051-25")
        return obj.pay_id
    
    def get_sr_type(self, obj):
        # Use the payment request type
        return obj.pay_sr_type
    
    def get_sr_req_date(self, obj):
        # Use payment request date
        return obj.pay_date_req
    
    def get_sr_req_status(self, obj):
        # Use pay_req_status for request status
        return obj.pay_req_status
    
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
        

# # SUMMON CASE SERIALIZER FOR COMPLAINANT TRACKING MOBILE
# class CaseTrackingSerializer(serializers.ModelSerializer):
#     decision = serializers.SerializerMethodField()
#     payment = serializers.SerializerMethodField()
#     schedule = serializers.SerializerMethodField()
#     current_step = serializers.SerializerMethodField()
#     progress_percentage = serializers.SerializerMethodField()
    
#     class Meta:
#         model = ServiceChargeRequest
#         fields = [
#             'sr_id', 'sr_code', 'sr_type', 'sr_req_date', 
#             'sr_req_status', 'sr_case_status', 'sr_date_marked',
#             'decision', 'payment', 'schedule', 'current_step', 'progress_percentage'
#         ]
    
#     def get_decision(self, obj):
#         try:
#             decision = ServiceChargeDecision.objects.get(sr_id=obj)
#             return {
#                 'scd_decision_date': decision.scd_decision_date,
#                 'scd_reason': decision.scd_reason
#             }
#         except ServiceChargeDecision.DoesNotExist:
#             return None
    
#     def get_payment(self, obj):
#         try:
#             payment = ServiceChargePaymentRequest.objects.get(sr_id=obj)
#             payment_data = {
#                 'spay_id': payment.spay_id,
#                 'spay_status': payment.spay_status,
#                 'spay_due_date': payment.spay_due_date,
#                 'spay_date_paid': payment.spay_date_paid,
#             }
            
#             # Add amount and purpose from the related pr_id
#             if payment.pr_id:
#                 payment_data['amount'] = payment.pr_id.pr_rate
#                 payment_data['purpose'] = payment.pr_id.pr_purpose
            
#             return payment_data
#         except ServiceChargePaymentRequest.DoesNotExist:
#             return None
    
#     def get_schedule(self, obj):
#         try:
#             schedule = SummonSchedule.objects.get(sr_id=obj)
#             schedule_data = {
#                 'ss_id': schedule.ss_id,
#                 'ss_mediation_level': schedule.ss_mediation_level,
#                 'ss_is_rescheduled': schedule.ss_is_rescheduled,
#                 'ss_reason': schedule.ss_reason,
#             }
            
#             # Add date and time from related objects
#             if schedule.sd_id:
#                 schedule_data['date'] = schedule.sd_id.sd_date
#             if schedule.st_id:
#                 schedule_data['time'] = schedule.st_id.st_start_time
            
#             return schedule_data
#         except SummonSchedule.DoesNotExist:
#             return None
    
#     def get_current_step(self, obj):
#         """Determine the current step based on the case status"""
#         steps = [
#             {
#                 'id': 1,
#                 'title': 'Summon Request',
#                 'description': self._get_step1_description(obj),
#                 'status': self._get_step1_status(obj),
#                 'details': self._get_step1_details(obj),
#                 'display_status': self._get_step1_display_status(obj),
#             },
#             {
#                 'id': 2,
#                 'title': 'Payment',
#                 'description': 'Process payment for mediation services',
#                 'status': self._get_step2_status(obj),
#                 'details': self._get_step2_details(obj),
#                 'display_status': self._get_step2_display_status(obj),
#             },
#             {
#                 'id': 3,
#                 'title': 'Schedule Mediation',
#                 'description': 'Book your mediation session with available mediators',
#                 'status': self._get_step3_status(obj),
#                 'details': self._get_step3_details(obj),
#                 'display_status': self._get_step3_display_status(obj),
#             },
#             {
#                 'id': 4,
#                 'title': 'Case Completion',
#                 'description': 'Receive final documentation and case resolution',
#                 'status': self._get_step4_status(obj),
#                 'details': 'Final documents will be available after mediation completion.',
#                 'display_status': self._get_step4_display_status(obj),
#             }
#         ]
#         return steps
    
#     def get_progress_percentage(self, obj):
#         """Calculate progress percentage based on completed steps"""
#         steps = self.get_current_step(obj)
#         completed_steps = sum(1 for step in steps if step['status'] == 'accepted')
#         return (completed_steps / len(steps)) * 100 if steps else 0
    
#     # Step 1: Summon Request
#     def _get_step1_status(self, obj):
#         if not obj.sr_req_status:
#             return 'pending'
#         status_lower = obj.sr_req_status.lower()
#         if status_lower == 'accepted':
#             return 'accepted'
#         elif status_lower == 'rejected':
#             return 'rejected'
#         return 'pending'
    
#     def _get_step1_display_status(self, obj):
#         status = self._get_step1_status(obj)
#         return status.capitalize()  # Pending, Accepted, Rejected
    
#     def _get_step1_description(self, obj):
#         status = self._get_step1_status(obj)
#         if status == 'pending':
#             return 'Waiting for approval.'
#         elif status == 'accepted':
#             return 'Your summon request has been approved.'
#         else:
#             return 'Your summon request has been rejected.'
    
#     def _get_step1_details(self, obj):
#         decision = self.get_decision(obj)
#         status = self._get_step1_status(obj)
        
#         details = f"Requested on {obj.sr_req_date.strftime('%B %d, %Y') if obj.sr_req_date else 'N/A'}."
        
#         if status == 'accepted' and decision and decision.get('scd_decision_date'):
#             details += f" Accepted on {decision['scd_decision_date'].strftime('%B %d, %Y')}."
#         elif status == 'rejected' and decision:
#             decision_date = decision.get('scd_decision_date')
#             reason = decision.get('scd_reason', 'No reason provided')
#             if decision_date:
#                 details += f" Rejected on {decision_date.strftime('%B %d, %Y')}. Reason: {reason}."
#             else:
#                 details += f" Rejected. Reason: {reason}."
        
#         return details
    
#     # Step 2: Payment
#     def _get_step2_status(self, obj):
#         payment = self.get_payment(obj)
#         if not payment:
#             return 'pending'
        
#         status = payment.get('spay_status', '').lower()
        
#         if status == 'paid':
#             return 'accepted'
#         elif status == 'unpaid':
#             spay_due_date = payment.get('spay_due_date')
#             if spay_due_date and timezone.now().date() > spay_due_date:
#                 return 'rejected'  # Overdue unpaid payment
#             return 'pending'  # Not yet due
#         return 'pending'
    
#     def _get_step2_display_status(self, obj):
#         payment = self.get_payment(obj)
#         if not payment:
#             return 'Unpaid'
        
#         status = payment.get('spay_status', '').lower()
#         if status == 'paid':
#             return 'Paid'
#         elif status == 'unpaid':
#             return 'Unpaid'
#         return 'Unpaid'
    
#     def _get_step2_details(self, obj):
#         payment = self.get_payment(obj)
#         status = self._get_step2_status(obj)
        
#         if status == 'pending' and payment:
#             amount = payment.get('amount', 'N/A')
#             purpose = payment.get('purpose', 'mediation services')
#             spay_due_date = payment.get('spay_due_date')
            
#             if spay_due_date:
#                 return f"Payment of {amount} for {purpose} is due on {spay_due_date.strftime('%B %d, %Y')}."
#             else:
#                 return f"Payment of {amount} for {purpose} will be enabled once your summon request is approved."
        
#         elif status == 'accepted' and payment:
#             amount = payment.get('amount', 'N/A')
#             spay_date_paid = payment.get('spay_date_paid')
#             if spay_date_paid:
#                 return f"Payment of {amount} paid on {spay_date_paid.strftime('%B %d, %Y')}."
#             else:
#                 return f"Payment of {amount} completed."
        
#         elif status == 'rejected' and payment:
#             spay_due_date = payment.get('spay_due_date')
#             if spay_due_date:
#                 return f"Payment overdue. Due date was {spay_due_date.strftime('%B %d, %Y')}."
#             else:
#                 return "Payment overdue."
        
#         return "Payment details not available."
    
#     # Step 3: Schedule Mediation
#     def _get_step3_status(self, obj):
#         schedule = self.get_schedule(obj)
#         if not schedule:
#             return 'pending'
        
#         if schedule.get('ss_is_rescheduled'):
#             return 'rejected'
#         return 'accepted'
    
#     def _get_step3_display_status(self, obj):
#         schedule = self.get_schedule(obj)
#         if not schedule:
#             return 'Not Scheduled'
        
#         if schedule.get('ss_is_rescheduled'):
#             return 'Rescheduled'
#         return 'Scheduled'
    
#     def _get_step3_details(self, obj):
#         schedule = self.get_schedule(obj)
#         status = self._get_step3_status(obj)
        
#         if status == 'pending':
#             return "Schedule mediation after payment is completed."
#         elif status == 'accepted' and schedule and schedule.get('date') and schedule.get('time'):
#             return f"Scheduled for {schedule['date']} at {schedule['time']}."
#         elif status == 'rejected' and schedule:
#             reason = schedule.get('ss_reason', 'No reason provided')
#             return f"Previous slot rejected. Reason: {reason}. Please select a new time."
#         return ""
    
#     # Step 4: Case Completion
#     def _get_step4_status(self, obj):
#         if not obj.sr_case_status:
#             return 'pending'
        
#         status_lower = obj.sr_case_status.lower()
#         if status_lower == 'resolved':
#             return 'accepted'
#         elif status_lower == 'escalated':
#             return 'rejected'
#         return 'pending'
    
#     def _get_step4_display_status(self, obj):
#         if not obj.sr_case_status:
#             return 'In Progress'
        
#         status_lower = obj.sr_case_status.lower()
#         if status_lower == 'resolved':
#             return 'Resolved'
#         elif status_lower == 'escalated':
#             return 'Escalated'
#         return 'In Progress'

#