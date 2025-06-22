from .models import *
from rest_framework import serializers
from apps.inventory.serializers import *
from apps.patientrecords.serializers import *



class FirstaidRecordSerializer(serializers.ModelSerializer):
    finv_details = FirstAidInventorySerializer(source='finv', read_only=True)
    class Meta:
        model = FirstAidRecord
        fields = '__all__'
        
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

