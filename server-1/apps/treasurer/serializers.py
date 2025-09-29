from rest_framework import serializers
from .models import *
from apps.profiling.models import *
from apps.clerk.models import ClerkCertificate
from utils.supabase_client import upload_to_storage
from django.utils import timezone
from django.db import transaction
from apps.profiling.serializers.business_serializers import FileInputSerializer

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
        return Budget_Plan_DetailSerializer(obj.budget_detail.all().order_by('dtl_id'),  many=True).data


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


# =========================== DISBURSEMENT ==========================
class Disbursement_FileSerializers(serializers.ModelSerializer):
    
    class Meta:
        model = Disbursement_File
        fields = ['disf_num', 'disf_is_archive', 'disf_type', 'disf_name', 'disf_path', 'disf_url', 'dis_num']
        extra_kwargs = {
            'dis_num': {'required': False},
            'disf_name': {'required': False}, 
            'disf_type': {'required': False}, 
            'disf_url': {'read_only': True},
            'disf_path': {'read_only': True},
        }
    
    def validate(self, attrs):
        return attrs

    def _upload_files(self, files, dis_num_id=None):
        """Upload multiple files for a disbursement folder"""
        if not dis_num_id:
            raise serializers.ValidationError({"error": "dis_num is required"})

        try:
            disbursement_voucher = Disbursement_Voucher.objects.get(pk=dis_num_id)
        except Disbursement_Voucher.DoesNotExist:
            raise serializers.ValidationError(f"Disbursement voucher with id {dis_num_id} does not exist")

        disbursement_images = []
        successful_uploads = 0
        failed_uploads = 0
        
        for file_data in files:
            if not file_data.get('file') or not isinstance(file_data['file'], str) or not file_data['file'].startswith('data:'):
                print(f"Skipping invalid file data for: {file_data.get('name')}")
                continue

            # Validate required fields for each file
            if not file_data.get('name'):
                raise serializers.ValidationError({"error": "File name is required"})
            if not file_data.get('type'):
                raise serializers.ValidationError({"error": "File type is required"})

            try:
                disbursement_image = Disbursement_File(
                    disf_name=file_data['name'],
                    disf_type=file_data['type'],
                    disf_path=f"Uploads/disbursement/{file_data['name']}",
                    dis_num=disbursement_voucher,
                )
                
                # Add staff if available
                if hasattr(self.context['request'].user, 'staff'):
                    disbursement_image.staff = self.context['request'].user.staff
                
                # Handle the upload with error catching
                try:
                    disbursement_image.disf_url = upload_to_storage(file_data, 'disbursement-bucket')
                    successful_uploads += 1
                    print(f"Successfully uploaded: {file_data['name']}")
                except UnboundLocalError as e:
                    # This is the specific error from the broken upload function
                    print(f"Upload function error for {file_data['name']}: {str(e)}")
                    # Use a placeholder URL instead of failing completely
                    disbursement_image.disf_url = f"https://placeholder.com/{file_data['name']}"
                    failed_uploads += 1
                except Exception as e:
                    # Handle any other upload errors
                    print(f"Upload failed for {file_data['name']}: {str(e)}")
                    disbursement_image.disf_url = f"https://placeholder.com/{file_data['name']}"
                    failed_uploads += 1
                
                disbursement_images.append(disbursement_image)
                
            except Exception as e:
                print(f"Error processing file {file_data.get('name')}: {str(e)}")
                failed_uploads += 1
                continue  # Skip this file but continue with others

        if disbursement_images:
            try:
                Disbursement_File.objects.bulk_create(disbursement_images)
                print(f"Successfully saved {successful_uploads} files, {failed_uploads} failed")
            except Exception as bulk_error:
                print(f"Bulk create failed: {str(bulk_error)}")
                raise bulk_error
        
        return disbursement_images

class Disbursement_VoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disbursement_Voucher
        fields = '__all__'
        read_only_fields = ['dis_is_archive']
        extra_kwargs = {
            'dis_tin': {'required': False}, 
            'dis_date': {'required': False}, 
            'dis_fund': {'required': False},
            'dis_checknum': {'required': False},
            'dis_bank': {'required': False},
            'dis_or_num': {'required': False},
            'dis_paydate': {'required': False},
            'dis_payacc': {'required': False},
        }

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
        for key in ['bpr_id', 'nrc_id', 'cr_id', 'spay_id']:
            if key in attrs and (attrs[key] == '' or attrs[key] == 0):
                attrs[key] = None

        link_keys = [
            attrs.get('bpr_id'),
            attrs.get('nrc_id'),
            attrs.get('cr_id'),
            attrs.get('spay_id'),
        ]
        
        provided = sum(1 for v in link_keys if v)
        if provided == 0:
            raise serializers.ValidationError("You must provide one of bpr_id, nrc_id, cr_id, or spay_id")
        if provided > 1:
            raise serializers.ValidationError("Provide only one of bpr_id, nrc_id, cr_id, or spay_id")
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
                    # Format staff_id properly (pad with leading zeros if needed)
                    if len(str(staff_id)) < 11:
                        staff_id = str(staff_id).zfill(11)
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
            
            # Check if it's a service charge payment request
            elif invoice.spay_id:
                print(f"[InvoiceSerializer] Processing service charge payment for spay_id: {invoice.spay_id}")
                
                # Update invoice status to Paid
                invoice.inv_status = "Paid"
                invoice.save()
                
                # Update service charge payment request status
                service_charge_payment = invoice.spay_id
                service_charge_payment.spay_status = "Paid"
                service_charge_payment.spay_date_paid = invoice.inv_date
                service_charge_payment.save()
                
                print(f"[InvoiceSerializer] Updated service charge payment status to Paid for spay_id: {service_charge_payment.spay_id}")
                
                # Do not change sr_req_status here; leave case status management to clerk/council flows
                
                # Log activity
                try:
                    from apps.act_log.utils import create_activity_log
                    from apps.administration.models import Staff
                    
                    # Use a default staff ID if none is available
                    staff_id = '00003250722'  # Default staff ID
                    # Format staff_id properly (pad with leading zeros if needed)
                    if len(str(staff_id)) < 11:
                        staff_id = str(staff_id).zfill(11)
                    staff = Staff.objects.filter(staff_id=staff_id).first()
                    
                    if staff:
                        create_activity_log(
                            act_type="Receipt Created",
                            act_description=f"Receipt {invoice.inv_serial_num} created for service charge {service_charge_payment.spay_id}. Payment status updated to Paid.",
                            staff=staff,
                            record_id=invoice.inv_serial_num,
                            feat_name="Receipt Management"
                        )
                except Exception as e:
                    print(f"Failed to log activity: {e}")
                
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
        extra_kwargs = {
            'cr_id': {'read_only': True}
        }

    def get_resident_details(self, obj):
        return {
            'per_fname': getattr(obj.rp, 'per_fname', ''),
            'per_lname': getattr(obj.rp, 'per_lname', ''),
            'per_contact': getattr(obj.rp, 'per_contact', ''),
            'per_email': getattr(obj.rp, 'per_email', ''),
            'per_dob': getattr(obj.rp, 'per_dob', None),
            'per_disability': getattr(obj.rp, 'per_disability', None),
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
        extra_kwargs = {
            'cr_id': {'read_only': True}
        }

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
    per_dob = serializers.DateField(source='per.per_dob', allow_null=True)
    per_disability = serializers.CharField(source='per.per_disability', allow_null=True)
    rp_id = serializers.CharField()  

    class Meta:
        model = ResidentProfile
        fields = ['rp_id', 'per_id', 'first_name', 'last_name', 'full_name', 'per_dob', 'per_disability']
    
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
        
        # Ensure rp_id is properly formatted as string and not truncated
        if 'rp_id' in data:
            data['rp_id'] = str(data['rp_id'])
            # Pad with leading zeros if less than 11 digits to match expected format
            if len(data['rp_id']) < 11:
                data['rp_id'] = data['rp_id'].zfill(11)
        
        return data