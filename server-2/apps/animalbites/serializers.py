from rest_framework import serializers
from .models import *

# class AnimalBiteRecordSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AnimalBite_Record
#         fields = '__all__'

class AnimalBiteReferralSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalBite_Referral
        fields = '__all__'

class AnimalBiteDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalBite_Details
        fields = '__all__'
