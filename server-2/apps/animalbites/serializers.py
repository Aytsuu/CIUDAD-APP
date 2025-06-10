# from rest_framework import serializers
# from .models import *
# from apps.patientrecords.models import Patient, Personal

# # Personal Serializer
# class PersonalSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Personal
#         fields = '__all__'
        
# class PatientSerializer(serializers.ModelSerializer):
#     per_id = PersonalSerializer()

#     class Meta:
#         model = Patient
#         fields = '__all__'

# class AnimalBiteRecordSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PatientRecord
#         fields = '__all__'

# class AnimalBiteReferralSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AnimalBite_Referral
#         fields = '__all__'

# # Updated serializer to include related field names
# class AnimalBiteDetailsSerializer(serializers.ModelSerializer):
#     referral = serializers.PrimaryKeyRelatedField(queryset=AnimalBite_Referral.objects.all())
#     class Meta:
#         model = AnimalBite_Details
#         fields = '__all__'

# class AnimalBitePatientDetailsSerializer(serializers.ModelSerializer):
#     # Patient information
#     patient_fname = serializers.CharField(source='referral.patrec.pat_details.personal_info.per_fname', read_only=True)
#     patient_lname = serializers.CharField(source='referral.patrec.pat_details.personal_info.per_lname', read_only=True)
#     patient_sex = serializers.CharField(source='referral.patrec.pat_details.personal_info.per_sex', read_only=True)
#     patient_dob = serializers.DateField(source='referral.patrec.pat_details.personal_info.per_dob', read_only=True)
#     patient_id = serializers.IntegerField(source='referral.patrec.pat_details.personal_info.pat_id', read_only=True)
    
#     # Referral information
#     referral_date = serializers.DateField(source='referral.date', read_only=True)
#     referral_transient = serializers.BooleanField(source='referral.transient', read_only=True)
#     referral_receiver = serializers.CharField(source='referral.receiver', read_only=True)
#     referral_sender = serializers.CharField(source='referral.sender', read_only=True)
    
#     # Bite details with names instead of IDs
#     biting_animal_name = serializers.CharField(source='bite_details.animal_name', read_only=True)
#     exposure_site_name = serializers.CharField(source='bite_details.exposure_site', read_only=True)

#     # Record creation date
#     record_created_at = serializers.DateTimeField(source='referral.patrec.created_at', read_only=True)
    
#     class Meta:
#         model = AnimalBite_Details
#         fields = [
#             'bite_id',
#             'exposure_type', 
#             'actions_taken',
#             'referredby',
#             'patient_fname',
#             'patient_lname', 
#             'patient_sex',
#             'patient_dob',
#             'patient_id',
#             'referral_date',
#             'referral_transient',
#             'referral_receiver',
#             'referral_sender',
#             'biting_animal_name',
#             'exposure_site_name',
#             'record_created_at'
#         ]

from rest_framework import serializers
from .models import *
from apps.patientrecords.models import PatientRecord

class AnimalBiteReferralSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalBite_Referral
        fields = '__all__'

class AnimalBiteDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalBite_Details
        fields = '__all__'

class AnimalBiteCreateSerializer(serializers.Serializer):
    # Patient ID - handle as string since it seems to be varchar in DB
    pat_id = serializers.IntegerField()
    
    # Referral fields
    receiver = serializers.CharField(max_length=100)
    sender = serializers.CharField(max_length=100)
    date = serializers.DateField()
    transient = serializers.BooleanField(default=False)
    
    # Bite Details fields - these will be the actual string values, not IDs
    exposure_type = serializers.CharField(max_length=50)
    exposure_site = serializers.CharField(max_length=255, required=False, allow_blank=True)
    biting_animal = serializers.CharField(max_length=255, required=False, allow_blank=True)
    p_actions = serializers.CharField(required=False, allow_blank=True)
    p_referred = serializers.CharField(max_length=100, required=False, allow_blank=True)

class AnimalBitePatientDetailsSerializer(serializers.ModelSerializer):
    # Patient information
    patient_fname = serializers.CharField(source='referral.patrec.pat_details.personal_info.per_fname', read_only=True)
    patient_lname = serializers.CharField(source='referral.patrec.pat_details.personal_info.per_lname', read_only=True)
    patient_mname = serializers.CharField(source='referral.patrec.pat_details.personal_info.per_mname', read_only=True)
    patient_sex = serializers.CharField(source='referral.patrec.pat_details.personal_info.per_sex', read_only=True)
    patient_dob = serializers.DateField(source='referral.patrec.pat_details.personal_info.per_dob', read_only=True)
    patient_address = serializers.CharField(source='referral.patrec.pat_details.personal_info.per_address', read_only=True)
    patient_id = serializers.CharField(source='referral.patrec.pat_details.personal_info.pat_id', read_only=True)
    
    # Referral information
    referral_id = serializers.IntegerField(source='referral.referral_id', read_only=True)
    referral_date = serializers.DateField(source='referral.date', read_only=True)
    referral_transient = serializers.BooleanField(source='referral.transient', read_only=True)
    referral_receiver = serializers.CharField(source='referral.receiver', read_only=True)
    referral_sender = serializers.CharField(source='referral.sender', read_only=True)

    # Record creation date
    record_created_at = serializers.DateTimeField(source='referral.patrec.created_at', read_only=True)
    patrec_id = serializers.IntegerField(source='referral.patrec.patrec_id', read_only=True)
    
    class Meta:
        model = AnimalBite_Details
        fields = [
            'bite_id',
            'exposure_type', 
            'actions_taken',
            'referredby',
            'biting_animal',
            'exposure_site',
            'patient_fname',
            'patient_lname',
            'patient_mname', 
            'patient_sex',
            'patient_dob',
            'patient_address',
            'patient_id',
            'referral_id',
            'referral_date',
            'referral_transient',
            'referral_receiver',
            'referral_sender',
            'record_created_at',
            'patrec_id'
        ]
