from rest_framework import serializers
from .models import *

class Budget_PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget_Plan
        fields = '__all__'

class Current_Expenditures_PersonalSerializers(serializers.ModelSerializer):
    class Meta:
        model = Current_Expenditures_Personal
        fields = '__all__'

class Current_Expenditures_MaintenanceSerializers(serializers.ModelSerializer):
    class Meta: 
        model = Current_Expenditures_Maintenance
        fields = '__all__'

class Other_Maint_And_Operating_ExpenseSerializers(serializers.ModelSerializer):
    class Meta: 
        model = Other_Maint_And_Operating_Expense
        fields = '__all__'

class Capital_Outlays_And_Non_OfficeSerializers(serializers.ModelSerializer):
    class Meta:
        model = Capital_Outlays_And_Non_Office
        fields = '__all__'

# class Income_FileSerializers(serializers.ModelSerializer):
#     class Meta:
#         model = Income_File
#         fields = '__all__'

# class Disbursement_FileSerializers(serializers.ModelSerializer):
#     class Meta:
#         model = Disbursement_File
#         fields = '__all__'

class Income_Expense_TrackingSerializers(serializers.ModelSerializer):
    class Meta:
        model = Income_Expense_Tracking
        fields = '__all__'