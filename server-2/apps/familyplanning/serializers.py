# from rest_framework import serializers
# from .models import *

# class PersonalInfoSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Personal
#         fields = '__all__'

# class PatientRecordSerializer(serializers.ModelSerializer):
#     personal_info = PersonalInfoSerializer()

#     class Meta:
#         model = PatientRecord
#         fields = '__all__'
        
# class FPRecordSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_Record
#         fields = '__all__'

# class FPTypeSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_type
#         fields = '__all__'

# class FPMedicalHistorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_Medical_History
#         fields = '__all__'

# class FPRiskStiSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_RiskSti
#         fields = '__all__'

# class FPRiskVawSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_RiskVaw
#         fields = '__all__'

# class FPPhysicalExamSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_Physical_Exam
#         fields = '__all__'

# class FPPelvicExamSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_Pelvic_Exam
#         fields = '__all__'

# class FPAcknowledgementSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_Acknowledgement
#         fields = '__all__'

# class FPObstetricalHistorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_Obstetrical_History
#         fields = '__all__'

# class FPPregnancyCheckSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_pregnancy_check
#         fields = '__all__'

# class FPAssessmentkSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FP_Assessment_Record
#         fields = '__all__'


from rest_framework import serializers
from .models import *
from apps.patientrecords.models import Patient, Personal, PatientRecord # Ensure all necessary models are imported

# Personal Serializer for nested personal information
class PersonalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personal
        fields = '__all__'

# Patient Serializer: This serializer should be used for your 'patientrecords/patient/' endpoint
# It correctly nests 'personal_info' as per your desired JSON structure.
class PatientSerializer(serializers.ModelSerializer):
    personal_info = PersonalInfoSerializer() # This is the crucial line for nesting personal details

    class Meta:
        model = Patient # Ensure this is your Patient model
        fields = '__all__'

# PatientRecord Serializer: If you also have an endpoint for PatientRecord, this is correct for it.
class PatientRecordSerializer(serializers.ModelSerializer):
    # If PatientRecord has a direct 'personal_info' foreign key to Personal
    # personal_info = PersonalInfoSerializer() 

    # If PatientRecord has a foreign key to Patient, and you want to expose Patient's personal_info
    # You would need to define it explicitly, e.g.:
    # pat_details = PatientSerializer() # Assuming PatientRecord has a 'pat_details' field linking to Patient

    class Meta:
        model = PatientRecord # Ensure this is your PatientRecord model
        fields = '__all__'

# Other serializers (keeping them as they were in your provided file)

class FPRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_Record
        fields = '__all__'

class FPTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_type
        fields = '__all__'

class FPMedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_Medical_History
        fields = '__all__'

class FPRiskStiSerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_RiskSti
        fields = '__all__'

class FPRiskVawSerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_RiskVaw
        fields = '__all__'

class FPPhysicalExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_Physical_Exam
        fields = '__all__'

class FPPelvicExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_Pelvic_Exam
        fields = '__all__'

class FPAcknowledgementSerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_Acknowledgement
        fields = '__all__'

class FPObstetricalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_Obstetrical_History
        fields = '__all__'

class FPPregnancyCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_pregnancy_check
        fields = '__all__'

class FPAssessmentkSerializer(serializers.ModelSerializer):
    class Meta:
        model = FP_Assessment_Record
        fields = '__all__'