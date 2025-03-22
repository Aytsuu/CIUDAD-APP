from rest_framework import serializers
from .models import *

class Budget_PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget_Plan
        fields = '__all__'

class Budget_Plan_DetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget_Plan_Detail
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