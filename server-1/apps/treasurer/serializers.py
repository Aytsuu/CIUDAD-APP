from rest_framework import serializers
from .models import *
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

    class Meta:
        model = Budget_Plan
        fields = '__all__'

    def get_details(self, obj):
        return Budget_Plan_DetailSerializer(obj.budget_detail.all(), many=True).data
    

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