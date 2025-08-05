from rest_framework import serializers
from .models import *
from apps.clerk.models import ClerkCertificate, Invoice
from apps.profiling.models import ResidentProfile

class Budget_Plan_DetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget_Plan_Detail
        fields = '__all__'

class BudgetPlanSerializer(serializers.ModelSerializer):
    details = serializers.SerializerMethodField()

    class Meta:
        model = Budget_Plan
        fields = '__all__'

    def get_details(self, obj):
        return Budget_Plan_DetailSerializer(obj.budget_detail.all(), many=True).data
    

class BudgetPlanFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetPlan_File
        fields = '__all__'

class BudgetPlanHistorySerializer(serializers.ModelSerializer):
    class Meta: 
        model = Budget_Plan_History
        fields = '__all__'

class Income_Folder_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Income_File_Folder
        fields = ['inf_num', 'inf_year', 'inf_name', 'inf_is_archive','inf_desc', 'staff']
        read_only_fields = ['inf_is_archive']

class Income_ImageSerializers(serializers.ModelSerializer):
    file_url = serializers.CharField(source='file.file_url', read_only=True)
    staff_name = serializers.CharField(source='staff.full_name', read_only=True, allow_null=True)
    inf_year = serializers.CharField(source='inf_num.inf_year', read_only=True)
    inf_name = serializers.CharField(source='inf_num.inf_name', read_only=True)
    inf_desc = serializers.CharField(source='inf_num.inf_desc', read_only=True)
    class Meta:
        model = Income_Image
        fields = ['infi_num', 'infi_upload_date', 'infi_is_archive', 'file_url', 'inf_num', 'staff_name', 'inf_year', 'inf_name']

class Disbursement_ImageSerializers(serializers.ModelSerializer):
    file_url = serializers.CharField(source='file.file_url', read_only=True)
    staff_name = serializers.CharField(source='staff.full_name', read_only=True, allow_null=True)
    dis_year = serializers.CharField(source='dis_num.dis_year', read_only=True)
    dis_name = serializers.CharField(source='dis_num.dis_name', read_only=True)
    dis_desc = serializers.CharField(source='dis_num.dis_desc', read_only=True)
    class Meta:
        model = Disbursement_Image
        fields = ['disf_num', 'disf_upload_date', 'disf_is_archive', 'file_url', 'dis_num', 'staff_name', 'dis_year', 'dis_name']
        
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


class Income_Expense_FileSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income_Expense_File
        fields = ('ief_id', 'ief_url', 'ief_name') 


# --------- INCOME_EXPENSE

class Income_Expense_TrackingSerializers(serializers.ModelSerializer):
    exp_budget_item = serializers.CharField(source='exp_id.exp_budget_item', read_only=True)
    files = Income_Expense_FileSimpleSerializer(many=True, read_only=True)  # Add this line
    
    class Meta:
        model = Income_Expense_Tracking
        fields = '__all__'


# -------- INCOME 

class Income_ParticularSerializers(serializers.ModelSerializer):
    class Meta:
        model = Income_Particular
        fields = '__all__'
        

class Income_TrackingSerializers(serializers.ModelSerializer):
    incp_item = serializers.CharField(source='incp_id.incp_item', read_only=True)

    class Meta:
        model = Income_Tracking
        fields = '__all__'


class Income_Expense_MainSerializers(serializers.ModelSerializer):
    class Meta:
        model = Income_Expense_Main
        fields = '__all__'


# ===========================================================================

class Annual_Gross_SalesSerializers(serializers.ModelSerializer):
    class Meta:
        model= Annual_Gross_Sales
        fields= '__all__'


class Purpose_And_RatesSerializers(serializers.ModelSerializer):
    class Meta:
        model = Purpose_And_Rates
        fields= '__all__'


#=============================================================================
class InvoiceSerializers(serializers.ModelSerializer):
    inv_payor = serializers.SerializerMethodField()
    inv_pay_method = serializers.CharField(source='cr_id.req_pay_method') 
    
    class Meta:
        model = Invoice
        fields = ['inv_num', 'inv_serial_num', 'inv_date', 'inv_amount', 
                 'inv_nat_of_collection', 'cr_id', 'inv_payor', 'inv_pay_method']
    
    def get_inv_payor(self, obj):
        try:
            return f"{obj.cr_id.rp_id.per.per_lname}, {obj.cr_id.rp_id.per.per_fname}"
        except:
            return "Unknown"


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
            'req_claim_date', 'req_type', 'req_status', 'req_payment_status',
            'req_transac_id', 'req_amount', 'req_purpose', 'invoice', 'payment_details'
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
            invoice = obj.clerk_invoices.first()
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
            invoice = obj.clerk_invoices.first()
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
            'req_claim_date', 'req_type', 'req_status', 'req_payment_status',
            'req_transac_id', 'req_amount', 'req_purpose', 'invoice', 'payment_details'
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
            invoice = obj.clerk_invoices.first()
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
            invoice = obj.clerk_invoices.first()
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