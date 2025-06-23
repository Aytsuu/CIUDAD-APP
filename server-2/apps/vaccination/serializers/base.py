# from rest_framework import serializers
# from ..models import *
# from datetime import date
# from apps.inventory.serializers import VaccineStockSerializer

# class VaccineStockSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = VaccineStock
#         fields = '__all__'

# class VitalSignsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = VitalSigns
#         fields = '__all__'

# class VaccinationHistorySerializer(serializers.ModelSerializer):
#     # vital_signs = VitalSignsSerializer(source='vital_id', read_only=True)
#     # vaccine_details = VaccineStockSerializer(source='vacStck_id', read_only=True)
#     class Meta:
#         model = VaccinationHistory
#         fields = '__all__'

# class VaccinationRecordSerializer(serializers.ModelSerializer):
#     vaccination_history = VaccinationHistorySerializer(many=True, read_only=True)
#     class Meta:
#         model = VaccinationRecord
#         fields = '__all__'


# class PatientRecordSerializer(serializers.ModelSerializer):    
#     class Meta:
#         model = PatientRecord
#         fields = '__all__'
    
  
# class ServicesRecordsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ServicesRecords
#         fields = '__all__'
      
# #ALL RECORDS