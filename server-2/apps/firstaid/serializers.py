from .models import *
from rest_framework import serializers
from apps.inventory.serializers.firstaid_serializers import *
from apps.patientrecords.serializers.patients_serializers import PatientSerializer, PatientRecordSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from django.db.models.functions import TruncMonth
from .models import *



class PatientFirstaidRecordSerializer(serializers.ModelSerializer):
    firstaid_count = serializers.SerializerMethodField()
    patient_details = PatientSerializer(source='*', read_only=True)
    class Meta:
        model = Patient
        fields = "__all__"
    def get_firstaid_count(self, obj):
        count = FirstAidRecord.objects.filter(
            patrec_id__pat_id=obj.pat_id
        ).count()
        print(f"firstaid count for patient {obj.pat_id} with status RECORDED: {count}")
        return count
    
class FirstaidRecordSerializer(serializers.ModelSerializer):
    finv_details = FirstAidInventorySerializer(source='finv', read_only=True)
    patrec_details = PatientRecordSerializer(source='patrec', read_only=True)
    
    class Meta:
        model = FirstAidRecord
        fields = '__all__'
        