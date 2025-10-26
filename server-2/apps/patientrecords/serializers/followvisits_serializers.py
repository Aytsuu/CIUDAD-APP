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
            'completed_at',
            'patient_details',
        ]
    
    def get_patient_details(self, obj):
        """
        Get complete patient details from the related patient record
        """
        try:
            if obj.patrec_id and obj.patrec.pat_id:
                patient = obj.patrec.pat_id
                patient_serializer = PatientSerializer(patient, context=self.context)

                return patient_serializer.data
            return None
        
        except Exception as e:
            print(f"Error getting patient details: {str(e)}")
            return None

class FollowUpVisitSerializerBase(serializers.ModelSerializer):
    """
    Minimal serializer for FollowUpVisit that includes only essential fields
    """
    class Meta:
        model = FollowUpVisit
        fields = '__all__'
    


class UnifiedPatientSerializer(serializers.Serializer):
    firstName = serializers.CharField(source='per.per_fname', allow_null=True)
    lastName = serializers.CharField(source='per.per_lname', allow_null=True)
    middleName = serializers.CharField(source='per.per_mname', allow_null=True)
    gender = serializers.CharField(source='per.per_sex', allow_null=True)
    age = serializers.SerializerMethodField()
    ageTime = serializers.SerializerMethodField()
    patientId = serializers.CharField(source='pat_id', allow_null=True)

    def get_age(self, obj):
        dob = obj.per.per_dob if hasattr(obj, 'per') and obj.per else None
        if not dob:
            return 0
        today = date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        return age

    def get_ageTime(self, obj):
        age = self.get_age(obj)
        if age < 1:
            return 'months'  # You can refine to calculate months if needed
        return 'years' if age > 1 else 'year'