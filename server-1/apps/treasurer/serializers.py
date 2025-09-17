from rest_framework import serializers
from .models import *
from apps.profiling.models import *
from apps.clerk.models import ClerkCertificate
from utils.supabase_client import upload_to_storage
from django.utils import timezone
from django.db import transaction

class FileInputSerializer(serializers.Serializer):
  name = serializers.CharField()
  type = serializers.CharField()
  file = serializers.CharField()

class Budget_Plan_DetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget_Plan_Detail
        fields = '__all__'
        extra_kwargs = {
            'plan': {'required': False},
            'dtl_budget_item': {'required': False},
            'dtl_budget_category': {'required': False},
        }

class BudgetPlanSerializer(serializers.ModelSerializer):
    details = serializers.SerializerMethodField()
    staff_name = serializers.SerializerMethodField(read_only = True)

    class Meta:
        model = Budget_Plan
        fields = '__all__'

    def get_details(self, obj):
        return Budget_Plan_DetailSerializer(obj.budget_detail.all(), many=True).data

    def get_staff_name(self, obj):
        if obj.staff_id and obj.staff_id.rp and obj.staff_id.rp.per:
            per = obj.staff_id.rp.per

            full_name = f"{per.per_lname}, {per.per_fname}"

            if per.per_mname:
                full_name += f" {per.per_mname}"
            
            if per.per_suffix:
                full_name += f" {per.per_suffix}"
            
            return full_name

class BudgetPlanFileCreateSerializer(serializers.ModelSerializer):
    files = FileInputSerializer(write_only=True, required=False, many=True)

    class Meta:
        model = BudgetPlan_File
        fields = '__all__'
        extra_kwargs={
            'bpf_upload_date': {'read_only': True},
            'bpf_url': {'read_only': True}
        }

    @transaction.atomic
    def create(self, validated_data):   
        files_data = validated_data.pop('files', [])
        if not files_data:
            raise serializers.ValidationError({"files": "At least one file must be provided"})
            
        bpf_description = validated_data.pop('bpf_description', '')
        plan_id = validated_data.pop('plan_id')
        created_files = self._upload_files(bpf_description, files_data, plan_id)

        if not created_files:
            raise serializers.ValidationError("Failed to upload files")

        return created_files[0]

    def _upload_files(self, bpf_description, files_data, plan_id):
        bpf_files = []
        for file_data in files_data:
            bpf_file = BudgetPlan_File(
                bpf_name = file_data['name'],
                bpf_type = file_data['type'],
                bpf_path = file_data['name'],
                bpf_description =bpf_description,
                bpf_upload_date =timezone.now(),
                plan_id= plan_id
            )

            url = upload_to_storage(file_data, 'budgetplan-bucket', '')
            bpf_file.bpf_url = url
            bpf_files.append(bpf_file)

        if bpf_files:
            return BudgetPlan_File.objects.bulk_create(bpf_files)
        return []
    

class BudgetPlanFileViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetPlan_File
        fields='__all__'

class BudgetPlanHistorySerializer(serializers.ModelSerializer):
    class Meta: 
        model = Budget_Plan_History
        fields = '__all__'


# =========================== INCOME & DISBURSEMENT ==========================

class Income_Folder_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Income_File_Folder
        fields = ['inf_num', 'inf_year', 'inf_name', 'inf_is_archive','inf_desc', 'staff']
        read_only_fields = ['inf_is_archive']

class Income_ImageSerializers(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.full_name', read_only=True, allow_null=True)
    inf_year = serializers.CharField(source='inf_num.inf_year', read_only=True)
    inf_name = serializers.CharField(source='inf_num.inf_name', read_only=True)
    inf_desc = serializers.CharField(source='inf_num.inf_desc', read_only=True)
    class Meta:
        model = Income_Image
        fields = ['infi_num', 'infi_upload_date', 'infi_is_archive', 'infi_type', 'infi_name', 'infi_path', 'infi_url', 'inf_num', 'staff_name', 'inf_year', 'inf_name','inf_desc']
        extra_kwargs = {
            'inf_num': {'required': True},
            'infi_name': {'required': True},
            'infi_type': {'required': True},
            'infi_url': {'read_only': True},
            'infi_path': {'read_only': True},
        }
    
    def _upload_files(self, files, inf_num_id=None):
        """Upload multiple files for an income folder"""
        if not inf_num_id:
            raise serializers.ValidationError({"error": "inf_num is required"})

        try:
            folder = Income_File_Folder.objects.get(pk=inf_num_id)
        except Income_File_Folder.DoesNotExist:
            raise serializers.ValidationError(f"Income folder with id {inf_num_id} does not exist")

        income_images = []
        for file_data in files:
            if not file_data.get('file') or not isinstance(file_data['file'], str) or not file_data['file'].startswith('data:'):
                continue

            income_image = Income_Image(
                infi_name=file_data['name'],
                infi_type=file_data['type'],
                infi_path=f"Uploads/income/{file_data['name']}",
                inf_num=folder,
                staff=self.context['request'].user.staff if hasattr(self.context['request'].user, 'staff') else None
            )
            
            income_image.infi_url = upload_to_storage(file_data, 'income-disbursement-bucket', 'income_images')
            income_images.append(income_image)

        if income_images:
            Income_Image.objects.bulk_create(income_images)
        
        return income_images

class Disbursement_ImageSerializers(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.full_name', read_only=True, allow_null=True)
    dis_year = serializers.CharField(source='dis_num.dis_year', read_only=True)
    dis_name = serializers.CharField(source='dis_num.dis_name', read_only=True)
    dis_desc = serializers.CharField(source='dis_num.dis_desc', read_only=True)
    class Meta:
        model = Disbursement_Image
        fields = ['disf_num', 'disf_upload_date', 'disf_is_archive', 'disf_type', 'disf_name', 'disf_path', 'disf_url', 'dis_num', 'staff_name', 'dis_year', 'dis_name','dis_desc']
        extra_kwargs = {
            'dis_num': {'required': True},
            'disf_name': {'required': True},
            'disf_type': {'required': True},
            'disf_url': {'read_only': True},
            'disf_path': {'read_only': True},
        }
    
    def _upload_files(self, files, dis_num_id=None):
        """Upload multiple files for a disbursement folder"""
        if not dis_num_id:
            raise serializers.ValidationError({"error": "dis_num is required"})

        try:
            folder = Disbursement_File_Folder.objects.get(pk=dis_num_id)
        except Disbursement_File_Folder.DoesNotExist:
            raise serializers.ValidationError(f"Disbursement folder with id {dis_num_id} does not exist")

        disbursement_images = []
        for file_data in files:
            if not file_data.get('file') or not isinstance(file_data['file'], str) or not file_data['file'].startswith('data:'):
                continue

            disbursement_image = Disbursement_Image(
                disf_name=file_data['name'],
                disf_type=file_data['type'],
                disf_path=f"Uploads/disbursement/{file_data['name']}",
                dis_num=folder,
                staff=self.context['request'].user.staff if hasattr(self.context['request'].user, 'staff') else None
            )
            
            # Upload to your storage system
            disbursement_image.disf_url = upload_to_storage(file_data, 'income-disbursement-bucket', 'disbursement_images')
            disbursement_images.append(disbursement_image)

        if disbursement_images:
            Disbursement_Image.objects.bulk_create(disbursement_images)
        
        return disbursement_images

        
class Disbursement_Folder_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Disbursement_File_Folder
        fields = ['dis_num', 'dis_year', 'dis_name', 'dis_desc', 'dis_is_archive', 'staff']
        read_only_fields = ['dis_is_archive']


# =========================== INCOME & EXPENSE ==========================


# ------- INCOME_EXPENSE FILE

class Expense_ParticularSerializers(serializers.ModelSerializer):
    class Meta:
        model = Expense_Particular
        fields = '__all__'
        extra_kwargs = {
            'plan': {'required': False},
            'exp_budget_item': {'required': False},
            'exp_budget_category': {'required': False},
        }

class Income_Expense_FileSerializers(serializers.ModelSerializer):
    
    class Meta:
        model = Income_Expense_File
        fields = '__all__'
    
    def _upload_files(self, files, iet_num=None):

        if not iet_num:
            return
        
        try:
            tracking_instance = Income_Expense_Tracking.objects.get(pk=iet_num)
        except Income_Expense_Tracking.DoesNotExist:
            
            raise ValueError(f"Income_Expense_Tracking with id {iet_num} does not exist")       
        
        ief_files = []
        for file_data in files:
            ief_file = Income_Expense_File(
                ief_name=file_data['name'],
                ief_type=file_data['type'],
                ief_path=file_data['name'],
                iet_num=tracking_instance  # THIS SETS THE FOREIGN KEY
            )

            url = upload_to_storage(file_data, 'fbudget-tracker-bucket', '')
            ief_file.ief_url = url
            ief_files.append(ief_file)

        if ief_files:
            Income_Expense_File.objects.bulk_create(ief_files)



class Income_Expense_FileSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income_Expense_File
        fields = ('ief_id', 'ief_url', 'ief_name') 


# --------- INCOME_EXPENSE

# class Income_Expense_TrackingSerializers(serializers.ModelSerializer):
#     dtl_budget_item = serializers.CharField(source='dtl_id.dtl_budget_item', read_only=True)
    
#     class Meta:
#         model = Income_Expense_Tracking
#         fields = '__all__'

class Income_Expense_TrackingSerializers(serializers.ModelSerializer):
    exp_budget_item = serializers.CharField(source='exp_id.exp_budget_item', read_only=True)
    files = Income_Expense_FileSimpleSerializer(many=True, read_only=True)  # Add this line
    staff_name = serializers.SerializerMethodField()   

    class Meta:
        model = Income_Expense_Tracking
        fields = '__all__'
    
    def get_staff_name(self, obj):
        if obj.staff_id and obj.staff_id.rp and obj.staff_id.rp.per:
            per = obj.staff_id.rp.per

            full_name = f"{per.per_lname}, {per.per_fname}"

            if per.per_mname:
                full_name += f" {per.per_mname}"
            
            if per.per_suffix:
                full_name += f" {per.per_suffix}"
            
            return full_name
        return None


class Expense_LogSerializers(serializers.ModelSerializer):
    el_particular = serializers.CharField(source='iet_num.exp_id.exp_budget_item', read_only=True)
    el_is_archive = serializers.BooleanField(source='iet_num.iet_is_archive', read_only=True)
    staff_name = serializers.SerializerMethodField()   

    class Meta:
        model = Expense_Log
        fields = '__all__'
    
    def get_staff_name(self, obj):
        if obj.iet_num and obj.iet_num.staff_id and obj.iet_num.staff_id.rp and obj.iet_num.staff_id.rp.per:
            per = obj.iet_num.staff_id.rp.per

            # Build full name
            full_name = f"{per.per_lname}, {per.per_fname}"

            if per.per_mname:
                full_name += f" {per.per_mname}"

            if per.per_suffix:
                full_name += f" {per.per_suffix}"

            return full_name
        return None


# -------- INCOME 

class Income_ParticularSerializers(serializers.ModelSerializer):
    class Meta:
        model = Income_Particular
        fields = '__all__'
        

class Income_TrackingSerializers(serializers.ModelSerializer):
    incp_item = serializers.CharField(source='incp_id.incp_item', read_only=True)
    staff_name = serializers.SerializerMethodField()   

    class Meta:
        model = Income_Tracking
        fields = '__all__'

    def get_staff_name(self, obj):
        if obj.staff_id and obj.staff_id.rp and obj.staff_id.rp.per:
            per = obj.staff_id.rp.per

            full_name = f"{per.per_lname}, {per.per_fname}"

            if per.per_mname:
                full_name += f" {per.per_mname}"
            
            if per.per_suffix:
                full_name += f" {per.per_suffix}"
            
            return full_name
        return None      


class Income_Expense_MainSerializers(serializers.ModelSerializer):
    class Meta:
        model = Income_Expense_Main
        fields = '__all__'


# ==================== ANNUAL GROSS SALES & PURPOSE AND RATES ================

class Annual_Gross_SalesSerializers(serializers.ModelSerializer):
    staff_name = serializers.SerializerMethodField(read_only = True)

    class Meta:
        model= Annual_Gross_Sales
        fields= '__all__'

    def get_staff_name(self, obj):
        if obj.staff_id and obj.staff_id.rp and obj.staff_id.rp.per:
            per = obj.staff_id.rp.per

            full_name = f"{per.per_lname}, {per.per_fname}"

            if per.per_mname:
                full_name += f" {per.per_mname}"
            
            if per.per_suffix:
                full_name += f" {per.per_suffix}"
            
            return full_name
        return None      

class Purpose_And_RatesSerializers(serializers.ModelSerializer):
    staff_name = serializers.SerializerMethodField(read_only = True)

    class Meta:
        model = Purpose_And_Rates
        fields= '__all__'

    def get_staff_name(self, obj):
        if obj.staff_id and obj.staff_id.rp and obj.staff_id.rp.per:
            per = obj.staff_id.rp.per

            full_name = f"{per.per_lname}, {per.per_fname}"

            if per.per_mname:
                full_name += f" {per.per_mname}"
            
            if per.per_suffix:
                full_name += f" {per.per_suffix}"
            
            return full_name
        return None      


# class InvoiceSerializers(serializers.ModelSerializer):
#     class Meta:
#         model = Invoice
#         fields= '__all__'



# class InvoiceSerializers(serializers.ModelSerializer):
#     inv_payor = serializers.SerializerMethodField()  # Changed field name
    
#     class Meta:
#         model = Invoice
#         fields = '__all__'
    
#     def get_inv_payor(self, obj):  # Renamed method
#         return f"{obj.cr_id.rp_id.per.per_lname}, {obj.cr_id.rp_id.per.per_fname}"


# invoice
class InvoiceSerializers(serializers.ModelSerializer):
    inv_payor = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = ['inv_num', 'inv_serial_num', 'inv_date', 'inv_amount', 
                 'inv_nat_of_collection', 'nrc_id', 'bpr_id', 'cr_id', 
                  'spay_id','inv_payor', 'inv_change', 'inv_discount_reason']
        extra_kwargs = {
            'nrc_id': {'allow_null': True, 'required': False},
            'bpr_id': {'allow_null': True, 'required': False},
            'cr_id': {'allow_null': True, 'required': False},
            'spay_id': {'allow_null': True, 'required': False},
        }
    
    def get_inv_payor(self, obj):
        # If the invoice is linked to a resident certificate
        if obj.bpr_id is not None:
            try:
                return f"{obj.bpr_id.rp_id.per.per_lname}, {obj.bpr_id.rp_id.per.per_fname}"
            except AttributeError:
                return "Unknown Business Owner"

        # If the invoice is linked to a resident (ClerkCertificate)
        if obj.cr_id is not None:
            # Try common relationship shapes
            try:
                return f"{obj.cr_id.rp_id.per.per_lname}, {obj.cr_id.rp_id.per.per_fname}"
            except Exception:
                try:
                    return f"{obj.cr_id.rp_id.per.per_lname}, {obj.cr_id.rp_id.per.per_fname}"
                except Exception:
                    return "Unknown Resident"
                

        # If the invoice is linked to a complaint
        if obj.spay_id is not None:
            try:
                complaint = obj.spay_id.sr_id.comp_id
                complainants = complaint.complainant.all()
                
                if complainants.exists():
                    # Join all complainant names with commas
                    return ", ".join([c.cpnt_name for c in complainants])
                else:
                    return "Unknown Complainant"
                    
            except Exception:
                return "Unknown Complainant"
                         

        # If the invoice is linked to a non-resident certificate
        elif obj.nrc_id is not None:
            try:
                return obj.nrc_id.nrc_requester
            except AttributeError:
                return "Unknown Non-Resident"

        #  If neither cr_id nor nrc_id exists
        return "Unknown"
    

    def validate(self, attrs):
        # Coerce empty strings from the client into None so DRF doesn't try bad lookups
        for key in ['bpr_id', 'nrc_id', 'cr_id']:
            if key in attrs and (attrs[key] == '' or attrs[key] == 0):
                attrs[key] = None

        link_keys = [
            attrs.get('bpr_id'),
            attrs.get('nrc_id'),
            attrs.get('cr_id'),
        ]
        provided = sum(1 for v in link_keys if v)
        if provided == 0:
            raise serializers.ValidationError("You must provide one of bpr_id, nrc_id, or cr_id")
        if provided > 1:
            raise serializers.ValidationError("Provide only one of bpr_id, nrc_id, or cr_id")
        return attrs

    def create(self, validated_data):
        # Create the invoice
        invoice = Invoice.objects.create(**validated_data)
        
        try:
            # Check if it's a business permit request and calculate change
            if invoice.bpr_id and hasattr(invoice.bpr_id, 'pr_id') and invoice.bpr_id.pr_id:
                required_amount = float(invoice.bpr_id.pr_id.pr_rate or 0)
                paid_amount = float(invoice.inv_amount or 0)
                
                change_amount = paid_amount - required_amount
                invoice.inv_change = change_amount if change_amount > 0 else 0
                invoice.save()
                
                # Update payment status
                business_permit = invoice.bpr_id
                business_permit.req_payment_status = "Paid"
                business_permit.save()
                
                invoice.inv_status = "Paid"
                invoice.save()
                
                # Log activity
                try:
                    from apps.act_log.utils import create_activity_log
                    from apps.administration.models import Staff
                    
                    staff_id = getattr(business_permit.staff_id, 'staff_id', '00003250722') if business_permit.staff_id else '00003250722'
                    staff = Staff.objects.filter(staff_id=staff_id).first()
                    
                    if staff:
                        create_activity_log(
                            act_type="Receipt Created",
                            act_description=f"Receipt {invoice.inv_serial_num} created for business permit {business_permit.bpr_id}. Payment status updated to Paid.",
                            staff=staff,
                            record_id=invoice.inv_serial_num,
                            feat_name="Receipt Management"
                        )
                except Exception as e:
                    print(f"Failed to log activity: {e}")
            
            # Check if it's a resident certificate request
            elif invoice.cr_id and hasattr(invoice.cr_id, 'pr_id') and invoice.cr_id.pr_id:
                required_amount = float(invoice.cr_id.pr_id.pr_rate or 0)
                paid_amount = float(invoice.inv_amount or 0)

                change_amount = paid_amount - required_amount
                invoice.inv_change = change_amount if change_amount > 0 else 0
                invoice.inv_status = "Paid"
                invoice.save()

                cert = invoice.cr_id
                # Update payment status on certificate (support different field names)
                try:
                    if hasattr(cert, 'cr_req_payment_status'):
                        cert.cr_req_payment_status = "Paid"
                    elif hasattr(cert, 'req_payment_status'):
                        cert.req_payment_status = "Paid"
                    cert.save()
                except Exception as e:
                    print(f"Failed to update certificate payment status: {e}")

            # Check if it's a non-resident certificate request
            elif invoice.nrc_id:
                # Add similar logic for non-resident certificates if needed
                invoice.inv_status = "Paid"
                invoice.save()
                
                # Update non-resident certificate payment status
                non_resident_cert = invoice.nrc_id
                try:
                    non_resident_cert.nrc_req_payment_status = "Paid"
                except Exception:
                    try:
                        non_resident_cert.req_payment_status = "Paid"
                    except Exception:
                        pass
                non_resident_cert.save()
                
        except Exception as e:
            print(f"Failed to process invoice: {e}")
            invoice.inv_change = 0
            invoice.save()
        
        return invoice


# Clearance Request Serializers
class ClearanceRequestSerializer(serializers.ModelSerializer):
    resident_details = serializers.SerializerMethodField()
    invoice = serializers.SerializerMethodField()
    payment_details = serializers.SerializerMethodField()
    req_amount = serializers.SerializerMethodField()
    req_purpose = serializers.SerializerMethodField()

    class Meta:
        model = ClerkCertificate
        fields = [
            'cr_id', 'resident_details', 'req_pay_method', 'req_request_date',
            'req_type', 'req_status', 'req_payment_status',
            'req_transac_id', 'req_amount', 'req_purpose', 'invoice', 'payment_details', 'pr_id'
        ]

    def get_resident_details(self, obj):
        return {
            'per_fname': obj.rp.per_fname,
            'per_lname': obj.rp.per_lname,
            'per_contact': obj.rp.per_contact,
            'per_email': obj.rp.per_email
        }

    def get_invoice(self, obj):
        try:
            invoice = obj.treasurer_invoices.first()
            if invoice:
                return {
                    'inv_num': invoice.inv_num,
                    'inv_serial_num': invoice.inv_serial_num,
                    'inv_date': invoice.inv_date.strftime('%Y-%m-%d') if invoice.inv_date else None,
                    'inv_amount': str(invoice.inv_amount),
                    'inv_nat_of_collection': invoice.inv_nat_of_collection,
                    'inv_status': invoice.inv_status
                }
        except:
            pass
        return None

    def get_payment_details(self, obj):
        # This would need to be implemented based on your payment model
        return None

    def get_req_amount(self, obj):
        try:
            invoice = obj.treasurer_invoices.first()
            return str(invoice.inv_amount) if invoice else "0"
        except:
            return "0"

    def get_req_purpose(self, obj):
        return obj.req_type


class ClearanceRequestDetailSerializer(serializers.ModelSerializer):
    resident_details = serializers.SerializerMethodField()
    invoice = serializers.SerializerMethodField()
    payment_details = serializers.SerializerMethodField()
    req_amount = serializers.SerializerMethodField()
    req_purpose = serializers.SerializerMethodField()

    class Meta:
        model = ClerkCertificate
        fields = [
            'cr_id', 'resident_details', 'req_pay_method', 'req_request_date',
            'req_type', 'req_status', 'req_payment_status',
            'req_transac_id', 'req_amount', 'req_purpose', 'invoice', 'payment_details', 'pr_id'
        ]

    def get_resident_details(self, obj):
        try:
            return {
                'per_fname': obj.rp.per.per_fname if hasattr(obj.rp, 'per') and obj.rp.per else '',
                'per_lname': obj.rp.per.per_lname if hasattr(obj.rp, 'per') and obj.rp.per else '',
                'per_contact': obj.rp.per.per_contact if hasattr(obj.rp, 'per') and obj.rp.per else '',
                'per_email': ''  # Personal model doesn't have email field
            }
        except:
            return {
                'per_fname': '',
                'per_lname': '',
                'per_contact': '',
                'per_email': ''
            }

    def get_invoice(self, obj):
        try:
            invoice = obj.treasurer_invoices.first()
            if invoice:
                return {
                    'inv_num': invoice.inv_num,
                    'inv_serial_num': invoice.inv_serial_num,
                    'inv_date': invoice.inv_date.strftime('%Y-%m-%d') if invoice.inv_date else None,
                    'inv_amount': str(invoice.inv_amount),
                    'inv_nat_of_collection': invoice.inv_nat_of_collection,
                    'inv_status': invoice.inv_status
                }
        except:
            pass
        return None

    def get_payment_details(self, obj):
        # This would need to be implemented based on your payment model
        return None

    def get_req_amount(self, obj):
        try:
            invoice = obj.treasurer_invoices.first()
            return str(invoice.inv_amount) if invoice else "0"
        except:
            return "0"

    def get_req_purpose(self, obj):
        return obj.req_type


class PaymentStatusUpdateSerializer(serializers.ModelSerializer):
    payment_status = serializers.ChoiceField(choices=[
        ('Paid', 'Paid'),
        ('Unpaid', 'Unpaid'),
        ('Partial', 'Partial'),
        ('Overdue', 'Overdue')
    ])

    class Meta:
        model = ClerkCertificate
        fields = ['payment_status']

class ResidentNameSerializer(serializers.ModelSerializer):
    per_id = serializers.IntegerField(source='per.per_id')
    first_name = serializers.CharField(source='per.per_fname')
    last_name = serializers.CharField(source='per.per_lname')
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = ResidentProfile
        fields = ['rp_id', 'per_id', 'first_name', 'last_name', 'full_name']
    
    def get_full_name(self, obj):
        name_parts = [obj.per.per_lname, obj.per.per_fname]
        if obj.per.per_mname:
            name_parts.append(obj.per.per_mname)
        if obj.per.per_suffix:
            name_parts.append(obj.per.per_suffix)
        return ', '.join(name_parts)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not instance.rp_id: 
            return None
        return data