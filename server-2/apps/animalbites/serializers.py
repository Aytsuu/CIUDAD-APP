from rest_framework import serializers
from .models import *
from apps.patientrecords.models import Patient,Personal

# Personal Serializer
class PersonalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personal
        fields = '__all__'
        
class PatientSerializer(serializers.ModelSerializer):
    per_id = PersonalSerializer()

    class Meta:
        model = Patient
        fields = '__all__'

class AnimalBiteBitingAnimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = BitingAnimal
        fields = '__all__'
        
class AnimalBiteExposureSiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExposureSite
        fields = '__all__'
        
class AnimalBiteRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientRecord
        fields = '__all__'

class AnimalBiteReferralSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalBite_Referral
        fields = '__all__'

class AnimalBiteDetailsSerializer(serializers.ModelSerializer):
    referral = serializers.PrimaryKeyRelatedField(queryset=AnimalBite_Referral.objects.all())
    class Meta:
        model = AnimalBite_Details
        fields = '__all__'