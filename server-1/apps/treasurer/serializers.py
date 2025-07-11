from rest_framework import serializers
from .models import *

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

    class Meta:
        model = Budget_Plan
        fields = '__all__'

    def get_details(self, obj):
        return Budget_Plan_DetailSerializer(obj.budget_detail.all(), many=True).data
    

class BudgetPlanFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetPlan_File
        fields = '__all__'
    
# class BudgetPlanDetailHistorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Budget_Plan_Detail_History
#         fields = '__all__'

class BudgetPlanDetailHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget_Plan_Detail_History
        fields = [
            'bpdh_id',
            'bpdh_budget_item',
            'bpdh_proposed_budget',
            'bpdh_budget_category',
            'bpdh_is_changed',
            'bph'
        ]

class BudgetPlanHistorySerializer(serializers.ModelSerializer):
    detail_history = BudgetPlanDetailHistorySerializer(source='history', many=True, read_only = True)

    class Meta:
        model = Budget_Plan_History
        fields = [
            'bph_id',
            'plan',
            'bph_year',
            'bph_change_date',
            'bph_actual_income',
            'bph_rpt_income',
            'bph_balance',
            'bph_tax_share',
            'bph_tax_allotment',
            'bph_cert_fees',
            'bph_other_income',
            'bph_budgetaryObligations',
            'bph_balUnappropriated',
            'bph_personalService_limit',
            'bph_miscExpense_limit',
            'bph_localDev_limit',
            'bph_skFund_limit',
            'bph_calamityFund_limit',
            'detail_history',
        ]

# class BudgetPlanHistorySerializer(serializers.ModelSerializer):
#     detail_history = BudgetPlanDetailHistorySerializer(source='history', many=True)

#     class Meta:
#         model = Budget_Plan_History
#         fields = '__all__'

# class BudgetPlanHistoryWithDetailsSerializer(serializers.ModelSerializer):
#     detail_history = BudgetPlanDetailHistorySerializer(source='history', many=True)

#     class Meta:
#         model = Budget_Plan_History
#         fields = '__all__'

class Income_Folder_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Income_File_Folder
        fields = ['inf_num', 'inf_year', 'inf_name', 'inf_is_archive','inf_desc', 'staff']
        read_only_fields = ['inf_is_archive']

class Income_ImageSerializers(serializers.ModelSerializer):
    # file_url = serializers.CharField(source='file.file_url', read_only=True)
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
            'infi_url': {'required': True},
            'infi_path': {'required': True},
        }

class Disbursement_ImageSerializers(serializers.ModelSerializer):
    # file_url = serializers.CharField(source='file.file_url', read_only=True)
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
            'disf_url': {'required': True},
            'disf_path': {'required': True},
        }
        
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

# class Income_Expense_TrackingSerializers(serializers.ModelSerializer):
#     dtl_budget_item = serializers.CharField(source='dtl_id.dtl_budget_item', read_only=True)
    
#     class Meta:
#         model = Income_Expense_Tracking
#         fields = '__all__'

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