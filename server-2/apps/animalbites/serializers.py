# import datetime
# from rest_framework import serializers
# from .models import *
# # Import Patient, PatientRecord, Transient, TransientAddress from patientrecords app
# from apps.patientrecords.models import PatientRecord, Patient, Transient, TransientAddress 
# # Import ResidentProfile, Personal, PersonalAddress, Household, Address from healthProfiling app
# from apps.healthProfiling.models import ResidentProfile, Personal, PersonalAddress, Household, Address 
# from datetime import date 
# from django.db.models import *

# class AnimalBiteReferralSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AnimalBite_Referral
#         fields = '__all__'

# class AnimalBiteDetailsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AnimalBite_Details
#         fields = '__all__'

# class AnimalBiteCreateSerializer(serializers.Serializer):
#     pat_id = serializers.CharField(max_length=255, help_text="Patient ID (e.g., P2023R0001)")
    
#     receiver = serializers.CharField(max_length=100)
#     sender = serializers.CharField(max_length=100)
#     date = serializers.DateField()

#     exposure_type = serializers.CharField(max_length=50)
#     exposure_site = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     biting_animal = serializers.CharField(max_length=255, required=False, allow_blank=True)
#     actions_taken = serializers.CharField(required=False, allow_blank=True)
#     referredby = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
#     exposure_site_name = serializers.CharField(max_length=255, required=False, allow_blank=True, write_only=True)
#     biting_animal_name = serializers.CharField(max_length=255, required=False, allow_blank=True, write_only=True)


# class AnimalBitePatientDetailsSerializer(serializers.ModelSerializer):
#     patient_fname = serializers.SerializerMethodField()
#     patient_lname = serializers.SerializerMethodField()
#     patient_mname = serializers.SerializerMethodField()
#     patient_sex = serializers.SerializerMethodField()
#     patient_dob = serializers.SerializerMethodField()
#     patient_address = serializers.SerializerMethodField()
#     patient_id = serializers.SerializerMethodField()
#     patient_type = serializers.SerializerMethodField() 
#     patient_age = serializers.SerializerMethodField()

#     # Referral information
#     referral_id = serializers.IntegerField(source='referral.referral_id', read_only=True)
#     referral_date = serializers.DateField(source='referral.date', read_only=True)
#     referral_transient = serializers.SerializerMethodField() 
#     referral_receiver = serializers.CharField(source='referral.receiver', read_only=True)
#     referral_sender = serializers.CharField(source='referral.sender', read_only=True)

#     record_created_at = serializers.DateTimeField(source='created_at', read_only=True) 
#     patrec_id = serializers.IntegerField(source='referral.patrec.patrec_id', read_only=True)

#     def _get_patient_instance(self, obj):
#         try:
#             return obj.referral.patrec.pat_id
#         except AttributeError:
#             print(f"DEBUG: Could not get patient instance for bite_id {obj.bite_id}. Missing referral, patrec, or pat_id.")
#             return None

#     def _get_personal_field(self, patient_instance, field_name, default_value="Unknown"): 
#         if not patient_instance:
#             return default_value

#         if patient_instance.pat_type == 'Resident':
#             # Ensure rp_id and then per (Personal) exist
#             if hasattr(patient_instance, 'rp_id') and patient_instance.rp_id and hasattr(patient_instance.rp_id, 'per') and patient_instance.rp_id.per:
#                 personal = patient_instance.rp_id.per
#                 # Map field_name (e.g., 'patient_fname') to Personal attribute (e.g., 'per_fname')
#                 personal_attr = field_name.replace('patient_', 'per_') 
#                 return getattr(personal, personal_attr, default_value)
#             else:
#                 # Log if Resident patient doesn't have expected ResidentProfile or Personal info
#                 print(f"DEBUG: Resident patient {patient_instance.pat_id} missing rp_id or personal info.")
#                 return default_value
        
#         elif patient_instance.pat_type == 'Transient':
#             # Ensure trans_id (Transient) exists
#             if hasattr(patient_instance, 'trans_id') and patient_instance.trans_id:
#                 transient = patient_instance.trans_id
#                 # Map field_name (e.g., 'patient_fname') to Transient attribute (e.g., 'tran_fname')
#                 transient_attr = field_name.replace('patient_', 'tran_') 
#                 return getattr(transient, transient_attr, default_value)
#             else:
#                 # Log if Transient patient doesn't have expected Transient info
#                 print(f"DEBUG: Transient patient {patient_instance.pat_id} missing transient info.")
#                 return default_value
        
#         return default_value # Default for unhandled patient types or missing data

#     def get_patient_fname(self, obj):
#         patient = self._get_patient_instance(obj)
#         return self._get_personal_field(patient, 'patient_fname')
    
#     def get_patient_lname(self, obj):
#         patient = self._get_patient_instance(obj)
#         return self._get_personal_field(patient, 'patient_lname')
    
#     def get_patient_mname(self, obj):
#         patient = self._get_patient_instance(obj)
#         return self._get_personal_field(patient, 'patient_mname', None) # Middle name can be None
    
#     def get_patient_sex(self, obj):
#         patient = self._get_patient_instance(obj)
#         return self._get_personal_field(patient, 'patient_sex')
    
#     def get_patient_dob(self, obj):
#         patient = self._get_patient_instance(obj)
#         return self._get_personal_field(patient, 'patient_dob', None) # DOB can be None
    
#     def get_patient_type(self, obj):
#         patient = self._get_patient_instance(obj)
#         return patient.pat_type if patient else "Unknown"
    
#     def get_patient_age(self, obj):
#         patient = self._get_patient_instance(obj)
#         dob = None
#         if patient:
#             if patient.pat_type == 'Resident':
#                 if hasattr(patient.rp_id, 'per') and patient.rp_id.per:
#                     dob = patient.rp_id.per.per_dob
#             elif patient.pat_type == 'Transient':
#                 if hasattr(patient, 'trans_id') and patient.trans_id:
#                     dob = patient.trans_id.tran_dob
        
#         if dob and isinstance(dob, date): # Ensure dob is a date object
#             today = date.today()
#             age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
#             return age
#         return "N/A" # Return "N/A" if DOB is not available or invalid

#     def get_patient_address(self, obj):
#         """
#         Retrieves the patient's full address based on patient type, concatenating address parts.
#         """
#         patient = self._get_patient_instance(obj)
#         if not patient:
#             return "Address Not Available"

#         address_parts = []
#         if patient.pat_type == 'Resident' and patient.rp_id:
#             resident_profile = patient.rp_id
#             # First, try to get address via PersonalAddress linked to the Personal instance
#             if hasattr(resident_profile, 'per') and resident_profile.per:
#                 personal_address = PersonalAddress.objects.select_related('add', 'add__sitio').filter(per=resident_profile.per).first()
#                 if personal_address and personal_address.add:
#                     address = personal_address.add
#                     sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio or ""
#                     # Ensure all parts exist before appending
#                     if sitio: address_parts.append(sitio)
#                     if address.add_street: address_parts.append(address.add_street)
#                     if address.add_barangay: address_parts.append(address.add_barangay)
#                     if address.add_city: address_parts.append(address.add_city)
#                     if address.add_province: address_parts.append(address.add_province)
                    
#                     if address_parts:
#                         return ", ".join(filter(None, address_parts))
            
#             # Fallback for Resident: Try to fetch from Household if PersonalAddress not found
#             household = Household.objects.select_related('add', 'add__sitio').filter(rp=resident_profile).first()
#             if household and household.add:
#                 address = household.add
#                 sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio or ""
#                 if sitio: address_parts.append(sitio)
#                 if address.add_street: address_parts.append(address.add_street)
#                 if address.add_barangay: address_parts.append(address.add_barangay)
#                 if address.add_city: address_parts.append(address.add_city)
#                 if address.add_province: address_parts.append(address.add_province)
                
#                 if address_parts:
#                     return ", ".join(filter(None, address_parts))

#         elif patient.pat_type == 'Transient' and patient.trans_id and patient.trans_id.tradd_id:
#             transient_address = patient.trans_id.tradd_id
#             if transient_address.tradd_sitio: address_parts.append(transient_address.tradd_sitio)
#             if transient_address.tradd_street: address_parts.append(transient_address.tradd_street)
#             if transient_address.tradd_barangay: address_parts.append(transient_address.tradd_barangay)
#             if transient_address.tradd_city: address_parts.append(transient_address.tradd_city)
#             if transient_address.tradd_province: address_parts.append(transient_address.tradd_province)
            
#             if address_parts:
#                 return ", ".join(filter(None, address_parts))
#             elif hasattr(transient_address, '__str__'):
#                 return str(transient_address) # Fallback to __str__ if it exists
        
#         return "Address Not Available" # Default if no address found
    
#     def get_patient_id(self, obj):
#         patient = self._get_patient_instance(obj)
#         return patient.pat_id if patient else "Unknown"

#     def get_referral_transient(self, obj):
#         """
#         Determines if the referral is for a transient patient based on Patient.pat_type.
#         """
#         patient = self._get_patient_instance(obj)
#         return patient.pat_type == 'Transient' if patient else False

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
#             'patient_type',  # New field
#             'patient_age',   # New field
#             'referral_id',
#             'referral_date',
#             'referral_transient', # Now derived from patient_type
#             'referral_receiver',
#             'referral_sender',
#             'record_created_at',
#             'patrec_id'
#         ]

# class AnimalBitePatientRecordCountSerializer(serializers.Serializer):
#     pat_id = serializers.CharField(max_length=255)
#     pat_type = serializers.CharField(max_length=50)
#     patient_fname = serializers.CharField(max_length=255)
#     patient_lname = serializers.CharField(max_length=255)
#     patient_gender = serializers.CharField(max_length=10)
#     patient_age = serializers.IntegerField()
#     record_count = serializers.IntegerField()
#     latest_record_date = serializers.DateField()

#     @classmethod
#     def get_patient_record_counts(cls):
#         from .models import AnimalBite_Details # Make sure this import is within the method if needed, or at the top

#         aggregated_data = AnimalBite_Details.objects.annotate(
#             pat_id=F('referral__patrec__pat_id'), # Assuming pat_id is directly on PatientRecord or Patient, and accessible via patrec
#             pat_type=Case(
#                 When(referral__patrec__rp__isnull=False, then=Value('Resident')), # Changed 'rp_id' to 'rp'
#                 When(referral__patrec__transient__isnull=False, then=Value('Transient')), # Changed 'trans_id' to 'transient'
#                 default=Value('Unknown'),
#                 output_field=CharField()
#             ),
#             patient_fname=Case(
#                 When(referral__patrec__rp__isnull=False, then=F('referral__patrec__rp__per__per_fname')), # Changed 'rp_id' to 'rp'
#                 When(referral__patrec__transient__isnull=False, then=F('referral__patrec__transient__tran_fname')), # Changed 'trans_id' to 'transient'
#                 default=Value('N/A'),
#                 output_field=CharField()
#             ),
#             patient_lname=Case(
#                 When(referral__patrec__rp__isnull=False, then=F('referral__patrec__rp__per__per_lname')), # Changed 'rp_id' to 'rp'
#                 When(referral__patrec__transient__isnull=False, then=F('referral__patrec__transient__tran_lname')), # Changed 'trans_id' to 'transient'
#                 default=Value('N/A'),
#                 output_field=CharField()
#             ),
#             patient_gender=Case(
#                 When(referral__patrec__rp__isnull=False, then=F('referral__patrec__rp__per__per_gender')), # Changed 'rp_id' to 'rp'
#                 When(referral__patrec__transient__isnull=False, then=F('referral__patrec__transient__tran_gender')), # Changed 'trans_id' to 'transient'
#                 default=Value('N/A'),
#                 output_field=CharField()
#             ),
#             patient_age=Case(
#                 When(Q(referral__patrec__rp__isnull=False) & Q(referral__patrec__rp__per__per_bdate__isnull=False),
#                      then=Max(datetime.date.today().year - F('referral__patrec__rp__per__per_bdate__year'))), # Use datetime.date.today()
#                 When(Q(referral__patrec__transient__isnull=False) & Q(referral__patrec__transient__tran_bdate__isnull=False),
#                      then=Max(datetime.date.today().year - F('referral__patrec__transient__tran_bdate__year'))), # Use datetime.date.today()
#                 default=Value(0),
#                 output_field=IntegerField() # Corrected output_field type for age calculation
#             ),
#         ).values(
#             'pat_id',
#             'pat_type',
#             'patient_fname',
#             'patient_lname',
#             'patient_gender',
#             'patient_age'
#         ).annotate(
#             record_count=Count('bite_id'),
#             latest_record_date=Max('referral__date')
#         ).order_by('pat_id')

#         return list(aggregated_data)

# class AnimalBitePatientRecordCountSerializer(serializers.Serializer):
#     patient_id = serializers.CharField(source='pat_id')
#     patient_fname = serializers.SerializerMethodField()
#     patient_lname = serializers.SerializerMethodField()
#     patient_type = serializers.CharField(source='pat_type')
#     record_count = serializers.IntegerField()
#     latest_record_date = serializers.DateField()

#     def get_patient_fname(self, obj):
#         if obj.pat_type == 'Resident' and hasattr(obj, 'rp_id') and hasattr(obj.rp_id, 'per'):
#             return obj.rp_id.per.per_fname
#         elif obj.pat_type == 'Transient' and hasattr(obj, 'trans_id'):
#             return obj.trans_id.tran_fname
#         return 'N/A'

#     def get_firstaid_record_count(pat_id):
#         return AnimalBite_Referral.objects.filter(patrec_id__pat_id=pat_id).count()

#     def get_patient_lname(self, obj):
#         if obj.pat_type == 'Resident' and hasattr(obj, 'rp_id') and hasattr(obj.rp_id, 'per'):
#             return obj.rp_id.per.per_lname
#         elif obj.pat_type == 'Transient' and hasattr(obj, 'trans_id'):
#             return obj.trans_id.tran_lname
#         return 'N/A'

#     @classmethod
#     def get_aggregated_data(cls):
#         from .models import AnimalBite_Details
#         from django.db.models import Count, Max, F
        
#         # This query gets the count of records and latest date for each patient
#         aggregated_data = AnimalBite_Details.objects.values(
#             'referral__patrec__pat_id',
#             'referral__patrec__pat_id__pat_type',
#         ).annotate(
#             record_count=Count('id'),
#             latest_record_date=Max('referral__date')
#         ).order_by('-latest_record_date')
        
#         return aggregated_data


import datetime
from rest_framework import serializers
from .models import *
# Import Patient, PatientRecord, Transient, TransientAddress from patientrecords app
from apps.patientrecords.models import PatientRecord, Patient, Transient, TransientAddress 
# Import ResidentProfile, Personal, PersonalAddress, Household, Address from healthProfiling app
from apps.healthProfiling.models import ResidentProfile, Personal, PersonalAddress, Household, Address 
from datetime import date 
from django.db.models import *

class AnimalBiteReferralSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalBite_Referral
        fields = '__all__'

class AnimalBiteDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalBite_Details
        fields = '__all__'

class AnimalBiteCreateSerializer(serializers.Serializer):
    pat_id = serializers.CharField(max_length=255, help_text="Patient ID (e.g., P2023R0001)")
    
    receiver = serializers.CharField(max_length=100)
    sender = serializers.CharField(max_length=100)
    date = serializers.DateField()

    exposure_type = serializers.CharField(max_length=50)
    exposure_site = serializers.CharField(max_length=255, required=False, allow_blank=True)
    biting_animal = serializers.CharField(max_length=255, required=False, allow_blank=True)
    actions_taken = serializers.CharField(required=False, allow_blank=True)
    referredby = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    exposure_site_name = serializers.CharField(max_length=255, required=False, allow_blank=True, write_only=True)
    biting_animal_name = serializers.CharField(max_length=255, required=False, allow_blank=True, write_only=True)

class AnimalBitePatientDetailsSerializer(serializers.ModelSerializer):
    patient_fname = serializers.SerializerMethodField()
    patient_lname = serializers.SerializerMethodField()
    patient_mname = serializers.SerializerMethodField()
    patient_sex = serializers.SerializerMethodField()
    patient_dob = serializers.SerializerMethodField()
    patient_address = serializers.SerializerMethodField()
    patient_id = serializers.SerializerMethodField()
    patient_type = serializers.SerializerMethodField() 
    patient_age = serializers.SerializerMethodField()

    # Referral information
    referral_id = serializers.IntegerField(source='referral.referral_id', read_only=True)
    referral_date = serializers.DateField(source='referral.date', read_only=True)
    referral_transient = serializers.SerializerMethodField() 
    referral_receiver = serializers.CharField(source='referral.receiver', read_only=True)
    referral_sender = serializers.CharField(source='referral.sender', read_only=True)

    record_created_at = serializers.DateTimeField(source='created_at', read_only=True) 
    patrec_id = serializers.IntegerField(source='referral.patrec.patrec_id', read_only=True)

    def _get_patient_instance(self, obj):
        try:
            return obj.referral.patrec.pat_id
        except AttributeError:
            print(f"DEBUG: Could not get patient instance for bite_id {obj.bite_id}. Missing referral, patrec, or pat_id.")
            return None

    def _get_personal_field(self, patient_instance, field_name, default_value="Unknown"): 
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

# NEW: Serializer for unique patient summary (for overall view)
class AnimalBitePatientSummarySerializer(serializers.Serializer):
    patient_id = serializers.CharField()
    patient_fname = serializers.CharField()
    patient_lname = serializers.CharField()
    patient_mname = serializers.CharField(allow_null=True)
    patient_sex = serializers.CharField()
    patient_age = serializers.IntegerField()
    patient_type = serializers.CharField()
    patient_address = serializers.CharField()
    record_count = serializers.IntegerField()
    latest_record_date = serializers.DateField()
    first_record_date = serializers.DateField()

class AnimalBitePatientRecordCountSerializer(serializers.Serializer):
    patient_id = serializers.CharField(source='pat_id')
    patient_fname = serializers.SerializerMethodField()
    patient_lname = serializers.SerializerMethodField()
    patient_type = serializers.CharField(source='pat_type')
    record_count = serializers.IntegerField()
    latest_record_date = serializers.DateField()

    def get_patient_fname(self, obj):
        if obj.pat_type == 'Resident' and hasattr(obj, 'rp_id') and hasattr(obj.rp_id, 'per'):
            return obj.rp_id.per.per_fname
        elif obj.pat_type == 'Transient' and hasattr(obj, 'trans_id'):
            return obj.trans_id.tran_fname
        return 'N/A'

    def get_firstaid_record_count(pat_id):
        return AnimalBite_Referral.objects.filter(patrec_id__pat_id=pat_id).count()

    def get_patient_lname(self, obj):
        if obj.pat_type == 'Resident' and hasattr(obj, 'rp_id') and hasattr(obj.rp_id, 'per'):
            return obj.rp_id.per.per_lname
        elif obj.pat_type == 'Transient' and hasattr(obj, 'trans_id'):
            return obj.trans_id.tran_lname
        return 'N/A'

    @classmethod
    def get_aggregated_data(cls):
        from .models import AnimalBite_Details
        from django.db.models import Count, Max, F
        
        # This query gets the count of records and latest date for each patient
        aggregated_data = AnimalBite_Details.objects.values(
            'referral__patrec__pat_id',
            'referral__patrec__pat_id__pat_type',
        ).annotate(
            record_count=Count('id'),
            latest_record_date=Max('referral__date')
        ).order_by('-latest_record_date')
        
        return aggregated_data
