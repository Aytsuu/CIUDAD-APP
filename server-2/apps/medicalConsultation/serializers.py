from rest_framework import serializers
from .models import *
from datetime import date
from apps.patientrecords.serializers.patients_serializers import PatientSerializer, PatientRecordSerializer
from apps.patientrecords.serializers.vitalsigns_serializers import VitalSignsSerializer
from apps.patientrecords.serializers.bodymesurement_serializers import BodyMeasurementBaseSerializer
from apps.patientrecords.serializers.findings_serializers import FindingSerializer
from apps.patientrecords.models import *
from apps.administration.serializers.staff_serializers import *  
from apps.childhealthservices.serializers import NutritionalStatusSerializerBase
from apps.administration.models import *
from apps.maternal.serializers.serializer import *
class PatientMedConsultationRecordSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='*', read_only=True)
    medicalrec_count = serializers.IntegerField(read_only=True)
    latest_consultation_date = serializers.SerializerMethodField()
 
    class Meta:
        model = Patient
        fields = "__all__"
      
    def get_latest_consultation_date(self, obj):
        # Get the most recent medical consultation date for this patient
        latest_consultation = MedicalConsultation_Record.objects.filter(
            patrec__pat_id=obj.pat_id
        ).order_by('-created_at').first()
        
        if latest_consultation and latest_consultation.created_at:
            return latest_consultation.created_at
        return None
      
      
class PhilHealthLaboratorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PhilHealthLaboratory
        fields = '__all__'

class PhilhealthDetailsSerializer(serializers.ModelSerializer):
    # Nested serializers for foreign keys
    tts_details = serializers.SerializerMethodField()
    obs_details = serializers.SerializerMethodField()
    lab_details = PhilHealthLaboratorySerializer(source='lab', read_only=True)
    
    class Meta:
        model = PhilhealthDetails
        fields = '__all__'
    
    def get_tts_details(self, obj):
        if obj.tts:
            return TTStatusCreateSerializer(obj.tts).data
        return None
    
    def get_obs_details(self, obj):
        if obj.obs:
            return ObstetricalHistoryCreateSerializer(obj.obs).data
        return None

class MedicalConsultationRecordSerializer(serializers.ModelSerializer):
    # Core nested serializers
    vital_signs = VitalSignsSerializer(source='vital', read_only=True)
    bmi_details = BodyMeasurementBaseSerializer(source='bm', read_only=True)
    find_details = FindingSerializer(source='find', read_only=True)
    patrec_details = PatientMedConsultationRecordSerializer(source='patrec.pat_id', read_only=True)
    staff_details = StaffMinimalSerializer(source='staff', read_only=True)
    assigned_to_details = StaffMinimalSerializer(source='assigned_to', read_only=True)
    
    # PhilHealth nested serializers
    philhealth_details = PhilhealthDetailsSerializer(read_only=True)
    
    # Add formatted date for easier searching
    formatted_date = serializers.SerializerMethodField()
    
    class Meta:
        model = MedicalConsultation_Record
        fields = [
            'medrec_id',
            'medrec_status',
            'medrec_chief_complaint',
            'created_at',
            'updated_at',
            'patrec',
            'vital',
            'bm',
            'find',
            'medreq',
            'staff',
            'assigned_to',
            'is_phrecord',
            
            # Nested fields
            'vital_signs',
            'bmi_details',
            'find_details',
            'patrec_details',
            'staff_details',
            'assigned_to_details',
            'philhealth_details',
            'formatted_date',
        ]
    
    def get_formatted_date(self, obj):
        return obj.created_at.strftime('%Y-%m-%d') if obj.created_at else None

    def to_representation(self, instance):
        """Custom representation to handle PhilHealth details"""
        data = super().to_representation(instance)
        
        # If it's not a PhilHealth record, remove philhealth_details
        if not instance.is_phrecord:
            data.pop('philhealth_details', None)
        
        return data
    
class MedicalConsultationCreateSerializer(serializers.Serializer):
    pat_id = serializers.IntegerField()
    vital_bp_systolic = serializers.CharField(required=False, allow_blank=True)
    vital_bp_diastolic = serializers.CharField(required=False, allow_blank=True)
    vital_temp = serializers.CharField(required=False, allow_blank=True)
    vital_RR = serializers.CharField(required=False, allow_blank=True)
    vital_pulse = serializers.CharField(required=False, allow_blank=True)
    height = serializers.FloatField()
    weight = serializers.FloatField()
    medrec_chief_complaint = serializers.CharField()

    def validate_height(self, value):
        return value or 0

    def validate_weight(self, value):
        return value or 0

class MedConsultAppointmentSerializer(serializers.ModelSerializer):
    personal_info = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    
    class Meta:
        model = MedConsultAppointment
        fields = '__all__'
        
    def get_personal_info(self, obj):
        """Get personal information from rp"""
        try:
            # Use the same pattern as MedicineRequestSerializer
            if obj.rp and hasattr(obj.rp, 'per'):
                personal = obj.rp.per
                return {
                    'per_fname': personal.per_fname,
                    'per_lname': personal.per_lname,
                    'per_mname': personal.per_mname,
                    'per_suffix': personal.per_suffix,
                    'per_dob': personal.per_dob,
                    'per_sex': personal.per_sex,
                    'per_status': personal.per_status,
                    'per_edAttainment': personal.per_edAttainment,
                    'per_religion': personal.per_religion,
                    'per_contact': personal.per_contact,
                }
                
        except Exception as e:
            print(f"Error getting personal info: {str(e)}")
        return None

    def get_address(self, obj):
        """Get address using the same pattern as MedicineRequestSerializer"""
        try:
            # Use the same pattern - handle through rp directly
            if obj.rp:
                return self._get_resident_address(obj.rp)
                
        except Exception as e:
            print(f"Error getting address: {str(e)}")
        return None

    def _get_resident_address(self, rp):
        """Get address for resident with proper formatting - same method as MedicineRequestSerializer"""
        try:
            # Check PersonalAddress first
            personal_address = PersonalAddress.objects.select_related('add', 'add__sitio').filter(per=rp.per).first()
            if personal_address and personal_address.add:
                address = personal_address.add
                sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                # Construct full address dynamically based on available fields
                address_parts = [
                    f"Sitio {sitio}" if sitio else None,
                    address.add_barangay if address.add_barangay else None,
                    address.add_city if address.add_city else None,
                    address.add_province if address.add_province else None,
                    address.add_street if address.add_street else None,
                ]
                # Filter out None values and join with ", "
                full_address = ", ".join(filter(None, address_parts))
                return {
                    'add_street': address.add_street,
                    'add_barangay': address.add_barangay,
                    'add_city': address.add_city,
                    'add_province': address.add_province,
                    'add_sitio': sitio,
                    'full_address': full_address
                }

            # Fallback to Household address
            household = Household.objects.select_related('add', 'add__sitio').filter(rp=rp).first()
            if household and household.add:
                address = household.add
                sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                # Construct full address dynamically based on available fields
                address_parts = [
                    f"Sitio {sitio}" if sitio else None,
                    address.add_barangay if address.add_barangay else None,
                    address.add_city if address.add_city else None,
                    address.add_province if address.add_province else None,
                    address.add_street if address.add_street else None,
                ]
                # Filter out None values and join with ", "
                full_address = ", ".join(filter(None, address_parts))
                return {
                    'add_street': address.add_street,
                    'add_barangay': address.add_barangay,
                    'add_city': address.add_city,
                    'add_province': address.add_province,
                    'add_sitio': sitio,
                    'full_address': full_address
                }
                
        except Exception as e:
            print(f"Error getting resident address: {str(e)}")
        return None