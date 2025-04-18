from rest_framework import serializers
from .models import *
from datetime import date
from apps.inventory.serializers import VaccineStockSerializer,VacccinationListSerializer
# serializers.py
from rest_framework import serializers
from .models import *


class PatientRecSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientRecordSample
        fields = '__all__'
        
class VitalSignsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalSigns
        fields = '__all__'

class VaccinationHistorySerializer(serializers.ModelSerializer):
    vital_signs = VitalSignsSerializer(source='vital_id', read_only=True)
    vaccine_stock = VaccineStockSerializer(source='vacStck_id', read_only=True)

    class Meta:
        model = VaccinationHistory
        fields = '__all__'

class VaccinationRecordSerializer(serializers.ModelSerializer):
    vaccination_histories = VaccinationHistorySerializer(many=True, read_only=True)
    class Meta:
        model = VaccinationRecord
        fields = '__all__'


class PatientRecordSerializer(serializers.ModelSerializer):
   
    class Meta:
        model = PatientRecordSample
        fields = '__all__'
        
class ServicesRecordsSerializer(serializers.ModelSerializer):
    vaccination_records = VaccinationRecordSerializer(many=True, read_only=True)
    patient_detail = PatientRecordSerializer(source='pat_id', read_only=True)  # Changed from many=True to source='pat_id'
    vaccination_count = serializers.SerializerMethodField()

    class Meta:
        model = ServicesRecords
        fields = '__all__'
    def get_vaccination_count(self, obj):
        # Count all services related to this patient where the service name is 'Vaccination'
        return ServicesRecords.objects.filter(
            pat_id=obj.pat_id,
            serv_name__iexact='Vaccination'
        ).count()


# ALL

# class PatientWithVaccinationSerializer(serializers.ModelSerializer):
#     vaccination_services = serializers.SerializerMethodField()
#     vaccination_count = serializers.SerializerMethodField()

#     class Meta:
#         model = PatientRecord
#         fields = '__all__'  # or list fields explicitly like ['id', 'fname', ...]
    
#     def get_vaccination_services(self, obj):
#         # Get related ServicesRecords for this patient, filtered to "Vaccination"
#         records = obj.services.filter(serv_name__iexact='Vaccination')
#         return ServicesRecordsSerializer(records, many=True).data

#     def get_vaccination_count(self, obj):
#         return obj.services.filter(serv_name__iexact='Vaccination').count()



class PatientWithVaccinationSerializer(serializers.ModelSerializer):
    vaccination_services = serializers.SerializerMethodField()
    vaccination_count = serializers.SerializerMethodField()

    class Meta:
        model = PatientRecordSample
        fields = '__all__'  # or list fields explicitly like ['id', 'fname', ...]
    
    def get_vaccination_services(self, obj):
        # Get related ServicesRecords for this patient, filtered to "Vaccination"
        records = obj.services.filter(serv_name__iexact='Vaccination')
        return ServicesRecordsSerializer(records, many=True).data

    def get_vaccination_count(self, obj):
        return obj.services.filter(serv_name__iexact='Vaccination').count()
