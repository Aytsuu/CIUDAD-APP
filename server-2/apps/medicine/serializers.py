from rest_framework import serializers
from .models import *
from datetime import date
from apps.inventory.serializers import *
from apps.patientrecords.models import *
from apps.patientrecords.serializers import *
from apps.patientrecords.serializers import *
# serializers.py



# ALL  medicine RECORD 
class PatientMedicineRecordSerializer(serializers.ModelSerializer):
    medicine_count = serializers.SerializerMethodField()
    patient_details = PatientSerializer(source='*', read_only=True)
    
    class Meta:
        model = Patient
        fields = "__all__"

    def get_medicine_count(self, obj):
        count = MedicineRecord.objects.filter(
            patrec_id__pat_id=obj.pat_id, status__iexact='RECORDED'
        ).count()
        print(f"medicine count for patient {obj.pat_id} with status RECORDED: {count}")
        return count

class MedicineRecordSerialzer(serializers.ModelSerializer):
    minv_details = MedicineInventorySerializer(source='minv_id', read_only=True)
    patrec_details = PatientRecordSerializer(source='patrec_id', read_only=True)
    class Meta:
        model = MedicineRecord
        fields = '__all__'

