# from rest_framework import serializers
# from .models import *
# from apps.patientrecords.models import PatientRecord # Assuming PatientRecord is imported from here

# class AnimalBiteReferralSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AnimalBite_Referral
#         fields = '__all__'

# class AnimalBiteDetailsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AnimalBite_Details
#         fields = '__all__'

# class AnimalBiteCreateSerializer(serializers.Serializer):
#     # Patient ID - handle as string since it's varchar in DB
#     pat_id = serializers.CharField(max_length=255) # Changed from IntegerField to CharField
    
#     # Referral fields
#     receiver = serializers.CharField(max_length=100)
#     sender = serializers.CharField(max_length=100)
#     date = serializers.DateField()
#     transient = serializers.BooleanField(default=False)
    
#     # Bite Details fields - these will be the actual string values, not IDs
#     exposure_type = serializers.CharField(max_length=50)
#     exposure_site = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     biting_animal = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     actions_taken = serializers.CharField(required=False, allow_blank=True) 
#     referredby = serializers.CharField(max_length=100, required=False, allow_blank=True)

# class AnimalBitePatientDetailsSerializer(serializers.ModelSerializer):
#     # Patient information
#     patient_fname = serializers.CharField(source='referral.patrec.pat_details.personal_info.per_fname', read_only=True)
#     patient_lname = serializers.CharField(source='referral.patrec.pat_details.personal_info.per_lname', read_only=True)
#     patient_mname = serializers.CharField(source='referral.patrec.pat_details.personal_info.per_mname', read_only=True)
#     patient_sex = serializers.CharField(source='referral.patrec.pat_details.personal_info.per_sex', read_only=True)
#     patient_dob = serializers.DateField(source='referral.patrec.pat_details.personal_info.per_dob', read_only=True)
#     patient_address = serializers.CharField(source='referral.patrec.pat_details.personal_info.per_address', read_only=True)
#     patient_id = serializers.CharField(source='referral.patrec.pat_details.personal_info.pat_id', read_only=True)
    
#     # Referral information
#     referral_id = serializers.IntegerField(source='referral.referral_id', read_only=True)
#     referral_date = serializers.DateField(source='referral.date', read_only=True)
#     referral_transient = serializers.BooleanField(source='referral.transient', read_only=True)
#     referral_receiver = serializers.CharField(source='referral.receiver', read_only=True)
#     referral_sender = serializers.CharField(source='referral.sender', read_only=True)

#     # Record creation date
#     record_created_at = serializers.DateTimeField(source='referral.patrec.created_at', read_only=True)
#     patrec_id = serializers.IntegerField(source='referral.patrec.patrec_id', read_only=True)
    
#     class Meta:
#         model = AnimalBite_Details
#         fields = [
#             'bite_id',
#             'exposure_type', 
#             'actions_taken',
#             'referredby',
#             'biting_animal',
#             'exposure_site',
#             'patient_fname',
#             'patient_lname',
#             'patient_mname', 
#             'patient_sex',
#             'patient_dob',
#             'patient_address',
#             'patient_id',
#             'referral_id',
#             'referral_date',
#             'referral_transient',
#             'referral_receiver',
#             'referral_sender',
#             'record_created_at',
#             'patrec_id'
#         ]
from rest_framework import serializers
from .models import *
from apps.patientrecords.models import PatientRecord, Patient # Ensure Patient is imported
from apps.healthProfiling.models import ResidentProfile, Personal # Import ResidentProfile and Personal

class AnimalBiteReferralSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalBite_Referral
        fields = '__all__'

class AnimalBiteDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalBite_Details
        fields = '__all__'

class AnimalBiteCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a new Animal Bite record, combining data
    for PatientRecord, AnimalBite_Referral, and AnimalBite_Details.
    """
    pat_id = serializers.CharField(max_length=255, help_text="Patient ID (e.g., P2023R0001)")
    
    # Referral fields
    receiver = serializers.CharField(max_length=100)
    sender = serializers.CharField(max_length=100)
    date = serializers.DateField()
    transient = serializers.BooleanField(default=False)
    
    # Bite Details fields - these will receive the actual string values, not IDs
    exposure_type = serializers.CharField(max_length=50)
    exposure_site = serializers.CharField(max_length=255, required=False, allow_blank=True)
    biting_animal = serializers.CharField(max_length=255, required=False, allow_blank=True)
    actions_taken = serializers.CharField(required=False, allow_blank=True)
    referredby = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    # These fields are used by the frontend to send the *name* of custom options.
    # They are not directly saved to the model but processed in the view.
    exposure_site_name = serializers.CharField(max_length=255, required=False, allow_blank=True, write_only=True)
    biting_animal_name = serializers.CharField(max_length=255, required=False, allow_blank=True, write_only=True)


class AnimalBitePatientDetailsSerializer(serializers.ModelSerializer):
    """
    Serializer to display comprehensive animal bite records, including
    patient personal information by traversing relationships.
    """
    # Patient personal information using SerializerMethodField to handle deep relationships
    patient_fname = serializers.SerializerMethodField()
    patient_lname = serializers.SerializerMethodField()
    patient_mname = serializers.SerializerMethodField()
    patient_sex = serializers.SerializerMethodField()
    patient_dob = serializers.SerializerMethodField()
    patient_address = serializers.SerializerMethodField()
    patient_id = serializers.SerializerMethodField() # The pat_id from the Patient model
    
    # Referral information
    referral_id = serializers.IntegerField(source='referral.referral_id', read_only=True)
    referral_date = serializers.DateField(source='referral.date', read_only=True)
    referral_transient = serializers.BooleanField(source='referral.transient', read_only=True)
    referral_receiver = serializers.CharField(source='referral.receiver', read_only=True)
    referral_sender = serializers.CharField(source='referral.sender', read_only=True)

    # Record creation date from PatientRecord
    record_created_at = serializers.DateTimeField(source='referral.patrec.created_at', read_only=True)
    patrec_id = serializers.IntegerField(source='referral.patrec.patrec_id', read_only=True)
    
    def get_patient_fname(self, obj):
        """
        Retrieves the patient's first name from the related Personal info.
        Path: AnimalBite_Details -> Referral -> PatientRecord -> Patient -> ResidentProfile -> Personal
        """
        try:
            return obj.referral.patrec.pat_id.rp_id.per.per_fname
        except (AttributeError, TypeError):
            return "Unknown"
    
    def get_patient_lname(self, obj):
        """
        Retrieves the patient's last name from the related Personal info.
        """
        try:
            return obj.referral.patrec.pat_id.rp_id.per.per_lname
        except (AttributeError, TypeError):
            return "Unknown"
    
    def get_patient_mname(self, obj):
        """
        Retrieves the patient's middle name from the related Personal info.
        """
        try:
            return obj.referral.patrec.pat_id.rp_id.per.per_mname
        except (AttributeError, TypeError):
            return None # Middle name can be null
    
    def get_patient_sex(self, obj):
        """
        Retrieves the patient's sex from the related Personal info.
        """
        try:
            return obj.referral.patrec.pat_id.rp_id.per.per_sex
        except (AttributeError, TypeError):
            return "Unknown"
    
    def get_patient_dob(self, obj):
        """
        Retrieves the patient's date of birth from the related Personal info.
        """
        try:
            return obj.referral.patrec.pat_id.rp_id.per.per_dob
        except (AttributeError, TypeError):
            return None
    
    def get_patient_address(self, obj):
        """
        Retrieves the patient's full address by traversing ResidentProfile.
        This assumes ResidentProfile has direct address fields (e.g., sitio, add_street, add_barangay, add_city, add_province)
        or a ForeignKey to an Address model with these fields.
        Adjust the field names as per your actual ResidentProfile/Address model structure.
        """
        try:
            resident_profile = obj.referral.patrec.pat_id.rp_id
            address_parts = []

            # Assuming address fields are directly on ResidentProfile or through a 'profile_address' ForeignKey
            # Adjust these field names to match your ResidentProfile model's actual address fields
            # Example: if ResidentProfile has fields like 'sitio', 'street', 'barangay', 'city', 'province'
            if hasattr(resident_profile, 'sitio') and resident_profile.sitio:
                address_parts.append(resident_profile.sitio)
            if hasattr(resident_profile, 'add_street') and resident_profile.add_street: # Assuming add_street exists
                address_parts.append(resident_profile.add_street)
            if hasattr(resident_profile, 'add_barangay') and resident_profile.add_barangay: # Assuming add_barangay exists
                address_parts.append(resident_profile.add_barangay)
            if hasattr(resident_profile, 'add_city') and resident_profile.add_city: # Assuming add_city exists
                address_parts.append(resident_profile.add_city)
            if hasattr(resident_profile, 'add_province') and resident_profile.add_province: # Assuming add_province exists
                address_parts.append(resident_profile.add_province)
            
            # If ResidentProfile links to a separate Address model via 'address' foreign key
            # Example: resident_profile.address.street, resident_profile.address.city
            # if hasattr(resident_profile, 'address') and resident_profile.address:
            #     if hasattr(resident_profile.address, 'street') and resident_profile.address.street:
            #         address_parts.append(resident_profile.address.street)
            #     if hasattr(resident_profile.address, 'barangay') and resident_profile.address.barangay:
            #         address_parts.append(resident_profile.address.barangay)
            #     # ... add other address fields from the linked Address model

            if address_parts:
                return ", ".join(filter(None, address_parts)) # Filter None to avoid empty strings/None values
            else:
                # Fallback if no specific address parts are found
                return str(resident_profile) if hasattr(resident_profile, '__str__') else "Address Not Available"
        except (AttributeError, TypeError) as e:
            print(f"Error getting patient address: {e}")
            return "Address Not Available" 
    
    def get_patient_id(self, obj):
        """
        Retrieves the patient's unique pat_id from the Patient model.
        """
        try:
            return obj.referral.patrec.pat_id.pat_id
        except (AttributeError, TypeError):
            return "Unknown"
    
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

