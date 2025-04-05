from rest_framework import serializers
from .models import *
from datetime import date

class Prenatal_Form_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Prenatal_Form
        fields = '__all__'

class Obstretical_History_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Obstretical_History
        fields = '__all__'

# illness serializer

class Previous_Hospitalization_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Previous_Hospitalization
        fields = '__all__'

class Previous_Pregnancy_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Previous_Pregnancy
        fields = '__all__'

class TT_Status_Serializer(serializers.ModelSerializer):
    class Meta:
        model = TT_Status
        fields = '__all__'

class Lab_Result_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Lab_Result
        fields = '__all__'