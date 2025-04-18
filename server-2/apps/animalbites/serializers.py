from .models import *
from rest_framework import serializers


class PatientsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'
        
class ReferralSerializer(serializers.ModelSerializer):
    class Meta:
        model = Referral
        fields = '__all__'
        
class BiteDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BiteDetails
        fields = '__all__'