from rest_framework import serializers
from ..models import *
from datetime import date
from apps.healthProfiling.serializers.minimal import *
from .patients_serializers import PatientSerializer

class PartialUpdateMixin:  
    def to_internal_value(self, data):
        if self.instance:
            for field in self.fields:
                if field not in data:
                    self.fields[field].required = False
        return super().to_internal_value(data)
    

class FollowUpVisitSerializer(PartialUpdateMixin,serializers.ModelSerializer):
    class Meta:
        model = FollowUpVisit
        fields = '__all__'

class FollowUpVisitWithPatientSerializer(serializers.ModelSerializer):
    """
    Serializer for FollowUpVisit that includes complete patient information
    """
    patient_details = serializers.SerializerMethodField()
    
    class Meta:
        model = FollowUpVisit
        fields = [
            'followv_id',
            'followv_date', 
            'followv_description',
            'followv_status',
            'patrec_id',
            'created_at',
            'updated_at',
            'patient_details'  # This will contain all patient info
        ]
    
    def get_patient_details(self, obj):
        """
        Get complete patient details from the related patient record
        """
        try:
            if obj.patrec_id and obj.patrec_id.pat_id:
                patient = obj.patrec_id.pat_id
                # Use your existing PatientSerializer to get all patient data
                patient_serializer = PatientSerializer(patient, context=self.context)
                return patient_serializer.data
            return None
        except Exception as e:
            print(f"Error getting patient details: {str(e)}")
            return None

