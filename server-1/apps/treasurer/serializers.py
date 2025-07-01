from rest_framework import serializers
from .models import *

class Budget_Plan_DetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget_Plan_Detail
        fields = '__all__'
        extra_kwargs = {
            'plan': {'required': False}  # Make plan optional for updates
        }

class  Budget_HeaderSerializer(serializers.ModelSerializer):
    details = serializers.SerializerMethodField()


    class Meta:
        model = Budget_Plan
        fields = '__all__'

    def get_details(self, obj):
         return Budget_Plan_DetailSerializer(obj.budget_detail.all(), many=True).data
    
# class Income_FileSerializers(serializers.ModelSerializer):
#     class Meta:
#         model = Income_File
#         fields = '__all__'

# class Disbursement_FileSerializers(serializers.ModelSerializer):
#     class Meta:
#         model = Disbursement_File
#         fields = '__all__'





#INCOME & EXPENSE

class Income_Expense_TrackingSerializers(serializers.ModelSerializer):
    dtl_budget_item = serializers.CharField(source='dtl_id.dtl_budget_item', read_only=True)
    
    class Meta:
        model = Income_Expense_Tracking
        fields = '__all__'


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