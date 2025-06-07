from rest_framework import serializers
from .models import *
from datetime import date

class PrenatalFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prenatal_Form
        fields = ['pf_lmp', 'pf_edc', 'patrec_id']

# illness serializer

class PreviousHospitalizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Previous_Hospitalization
        fields = '__all__'

class PreviousPregnancySerializer(serializers.ModelSerializer):
    class Meta:
        model = Previous_Pregnancy
        fields = '__all__'

class TTStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = TT_Status
        fields = '__all__'

# class LabResultDatesSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Lab_Result_Dates
#         fields = '__all__'

class Guide4ANCVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guide4ANCVisit
        fields = '__all__'

class ChecklistSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Checklist
        fields = '__all__'

# class BirthPlanSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = BirthPlan
#         fields = '__all__'
