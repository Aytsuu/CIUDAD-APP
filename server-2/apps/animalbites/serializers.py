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
# Import Patient, PatientRecord, Transient, TransientAddress from patientrecords app
from apps.patientrecords.models import PatientRecord, Patient, Transient, TransientAddress 
# Import ResidentProfile, Personal, PersonalAddress, Household, Address from healthProfiling app
from apps.healthProfiling.models import ResidentProfile, Personal, PersonalAddress, Household, Address 
from datetime import date 

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
    
    # Referral fields (removed 'transient' from here as well, as it's determined by Patient.pat_type)
    receiver = serializers.CharField(max_length=100)
    sender = serializers.CharField(max_length=100)
    date = serializers.DateField() # This date now comes from auto_now_add in models

    # Bite Details fields - these will receive the actual string values, not IDs
    exposure_type = serializers.CharField(max_length=50)
    exposure_site = serializers.CharField(max_length=255, required=False, allow_blank=True)
    biting_animal = serializers.CharField(max_length=255, required=False, allow_blank=True)
    actions_taken = serializers.CharField(required=False, allow_blank=True)
    referredby = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    # These fields are used by the frontend to send the *name* of custom options.
    exposure_site_name = serializers.CharField(max_length=255, required=False, allow_blank=True, write_only=True)
    biting_animal_name = serializers.CharField(max_length=255, required=False, allow_blank=True, write_only=True)


class AnimalBitePatientDetailsSerializer(serializers.ModelSerializer):
    """
    Serializer to display comprehensive animal bite records, including
    patient personal information by traversing relationships.
    """
    patient_fname = serializers.SerializerMethodField()
    patient_lname = serializers.SerializerMethodField()
    patient_mname = serializers.SerializerMethodField()
    patient_sex = serializers.SerializerMethodField()
    patient_dob = serializers.SerializerMethodField()
    patient_address = serializers.SerializerMethodField()
    patient_id = serializers.SerializerMethodField() # The pat_id from the Patient model
    patient_type = serializers.SerializerMethodField() # New: to get 'Resident' or 'Transient'
    patient_age = serializers.SerializerMethodField() # New: for calculated age

    # Referral information
    referral_id = serializers.IntegerField(source='referral.referral_id', read_only=True)
    referral_date = serializers.DateField(source='referral.date', read_only=True)
    # referral_transient is now a SerializerMethodField, derived from Patient.pat_type
    referral_transient = serializers.SerializerMethodField() 
    referral_receiver = serializers.CharField(source='referral.receiver', read_only=True)
    referral_sender = serializers.CharField(source='referral.sender', read_only=True)

    # Record creation date from AnimalBite_Details itself for more precise time
    record_created_at = serializers.DateTimeField(source='created_at', read_only=True) # Changed source to AnimalBite_Details.created_at
    patrec_id = serializers.IntegerField(source='referral.patrec.patrec_id', read_only=True)

    def _get_patient_instance(self, obj):
        """Helper to safely get the Patient instance from AnimalBite_Details object."""
        try:
            return obj.referral.patrec.pat_id
        except AttributeError:
            # This indicates referral, patrec, or pat_id is None
            # Log this for debugging if it happens often in production
            print(f"DEBUG: Could not get patient instance for bite_id {obj.bite_id}. Missing referral, patrec, or pat_id.")
            return None

    def _get_personal_field(self, patient_instance, field_name, default_value="Unknown"):
        """
        Helper to safely get a personal field (fname, lname, sex, dob)
        from either Personal (for Resident) or Transient model.
        """
        if not patient_instance:
            return default_value

        if patient_instance.pat_type == 'Resident':
            # Ensure rp_id and then per (Personal) exist
            if hasattr(patient_instance, 'rp_id') and patient_instance.rp_id and hasattr(patient_instance.rp_id, 'per') and patient_instance.rp_id.per:
                personal = patient_instance.rp_id.per
                # Map field_name (e.g., 'patient_fname') to Personal attribute (e.g., 'per_fname')
                personal_attr = field_name.replace('patient_', 'per_') 
                return getattr(personal, personal_attr, default_value)
            else:
                # Log if Resident patient doesn't have expected ResidentProfile or Personal info
                print(f"DEBUG: Resident patient {patient_instance.pat_id} missing rp_id or personal info.")
                return default_value
        
        elif patient_instance.pat_type == 'Transient':
            # Ensure trans_id (Transient) exists
            if hasattr(patient_instance, 'trans_id') and patient_instance.trans_id:
                transient = patient_instance.trans_id
                # Map field_name (e.g., 'patient_fname') to Transient attribute (e.g., 'tran_fname')
                transient_attr = field_name.replace('patient_', 'tran_') 
                return getattr(transient, transient_attr, default_value)
            else:
                # Log if Transient patient doesn't have expected Transient info
                print(f"DEBUG: Transient patient {patient_instance.pat_id} missing transient info.")
                return default_value
        
        return default_value # Default for unhandled patient types or missing data

    def get_patient_fname(self, obj):
        patient = self._get_patient_instance(obj)
        return self._get_personal_field(patient, 'patient_fname')
    
    def get_patient_lname(self, obj):
        patient = self._get_patient_instance(obj)
        return self._get_personal_field(patient, 'patient_lname')
    
    def get_patient_mname(self, obj):
        patient = self._get_patient_instance(obj)
        return self._get_personal_field(patient, 'patient_mname', None) # Middle name can be None
    
    def get_patient_sex(self, obj):
        patient = self._get_patient_instance(obj)
        return self._get_personal_field(patient, 'patient_sex')
    
    def get_patient_dob(self, obj):
        patient = self._get_patient_instance(obj)
        return self._get_personal_field(patient, 'patient_dob', None) # DOB can be None
    
    def get_patient_type(self, obj):
        patient = self._get_patient_instance(obj)
        return patient.pat_type if patient else "Unknown"
    
    def get_patient_age(self, obj):
        patient = self._get_patient_instance(obj)
        dob = None
        if patient:
            if patient.pat_type == 'Resident':
                if hasattr(patient.rp_id, 'per') and patient.rp_id.per:
                    dob = patient.rp_id.per.per_dob
            elif patient.pat_type == 'Transient':
                if hasattr(patient, 'trans_id') and patient.trans_id:
                    dob = patient.trans_id.tran_dob
        
        if dob and isinstance(dob, date): # Ensure dob is a date object
            today = date.today()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            return age
        return "N/A" # Return "N/A" if DOB is not available or invalid

    def get_patient_address(self, obj):
        """
        Retrieves the patient's full address based on patient type, concatenating address parts.
        """
        patient = self._get_patient_instance(obj)
        if not patient:
            return "Address Not Available"

        address_parts = []
        if patient.pat_type == 'Resident' and patient.rp_id:
            resident_profile = patient.rp_id
            # First, try to get address via PersonalAddress linked to the Personal instance
            if hasattr(resident_profile, 'per') and resident_profile.per:
                personal_address = PersonalAddress.objects.select_related('add', 'add__sitio').filter(per=resident_profile.per).first()
                if personal_address and personal_address.add:
                    address = personal_address.add
                    sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio or ""
                    # Ensure all parts exist before appending
                    if sitio: address_parts.append(sitio)
                    if address.add_street: address_parts.append(address.add_street)
                    if address.add_barangay: address_parts.append(address.add_barangay)
                    if address.add_city: address_parts.append(address.add_city)
                    if address.add_province: address_parts.append(address.add_province)
                    
                    if address_parts:
                        return ", ".join(filter(None, address_parts))
            
            # Fallback for Resident: Try to fetch from Household if PersonalAddress not found
            household = Household.objects.select_related('add', 'add__sitio').filter(rp=resident_profile).first()
            if household and household.add:
                address = household.add
                sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio or ""
                if sitio: address_parts.append(sitio)
                if address.add_street: address_parts.append(address.add_street)
                if address.add_barangay: address_parts.append(address.add_barangay)
                if address.add_city: address_parts.append(address.add_city)
                if address.add_province: address_parts.append(address.add_province)
                
                if address_parts:
                    return ", ".join(filter(None, address_parts))

        elif patient.pat_type == 'Transient' and patient.trans_id and patient.trans_id.tradd_id:
            transient_address = patient.trans_id.tradd_id
            if transient_address.tradd_sitio: address_parts.append(transient_address.tradd_sitio)
            if transient_address.tradd_street: address_parts.append(transient_address.tradd_street)
            if transient_address.tradd_barangay: address_parts.append(transient_address.tradd_barangay)
            if transient_address.tradd_city: address_parts.append(transient_address.tradd_city)
            if transient_address.tradd_province: address_parts.append(transient_address.tradd_province)
            
            if address_parts:
                return ", ".join(filter(None, address_parts))
            elif hasattr(transient_address, '__str__'):
                return str(transient_address) # Fallback to __str__ if it exists
        
        return "Address Not Available" # Default if no address found
    
    def get_patient_id(self, obj):
        patient = self._get_patient_instance(obj)
        return patient.pat_id if patient else "Unknown"

    def get_referral_transient(self, obj):
        """
        Determines if the referral is for a transient patient based on Patient.pat_type.
        """
        patient = self._get_patient_instance(obj)
        return patient.pat_type == 'Transient' if patient else False

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
            'patient_type',  # New field
            'patient_age',   # New field
            'referral_id',
            'referral_date',
            'referral_transient', # Now derived from patient_type
            'referral_receiver',
            'referral_sender',
            'record_created_at',
            'patrec_id'
        ]
