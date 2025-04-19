from rest_framework import serializers
from .models import *
from datetime import date
from apps.inventory.serializers import VaccineStockSerializer,VacccinationListSerializer
from apps.healthProfiling.serializers.base import PersonalSerializer
# serializers.py

class PatientRecordSerializer(serializers.ModelSerializer):
    personal_info = PersonalSerializer(source='per_id', read_only=True)
    
    class Meta:
        model = PatientRecord
        fields = '__all__'

