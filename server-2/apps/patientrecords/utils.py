from .models import *
from apps.healthProfiling.models import ResidentProfile
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

def create_patient_and_record_for_health_profiling(rp_id, record_type=None, illness_name=None):
    """
    Utility function to automatically create Patient, PatientRecord, and MedicalHistory
    for health profiling records (NCD, TB surveillance, etc.)
    
    Args:
        rp_id (str): Resident Profile ID
        record_type (str): Type of health record ('NCD', 'TB', etc.)
        illness_name (str): Name of the illness/condition
        
    Returns:
        tuple: (patient, patient_record, medical_history) or (None, None, None) if creation fails
    """
    try:
        # Check if resident profile exists
        try:
            resident_profile = ResidentProfile.objects.get(rp_id=rp_id)
        except ResidentProfile.DoesNotExist:
            logger.error(f"Resident profile with rp_id {rp_id} does not exist")
            return None, None, None
        
        # Check if active patient already exists for this resident
        existing_patient = Patient.objects.filter(
            rp_id=resident_profile, 
            pat_status='Active'
        ).first()
        
        if existing_patient:
            logger.info(f"Patient already exists for resident {rp_id}: {existing_patient.pat_id}")
            patient = existing_patient
        else:
            # Create new patient
            patient = Patient.objects.create(
                pat_type='Resident',
                pat_status='Active',
                rp_id=resident_profile
            )
            logger.info(f"Created new patient for resident {rp_id}: {patient.pat_id}")
        
        # Check if health profiling patient record already exists
        existing_record = PatientRecord.objects.filter(
            pat_id=patient,
            patrec_type='Health Profiling'
        ).first()
        
        if existing_record:
            logger.info(f"Health Profiling record already exists for patient {patient.pat_id}: {existing_record.patrec_id}")
            patient_record = existing_record
        else:
            # Create new patient record for health profiling
            patient_record = PatientRecord.objects.create(
                pat_id=patient,
                patrec_type='Health Profiling'
            )
            logger.info(f"Created new Health Profiling record for patient {patient.pat_id}: {patient_record.patrec_id}")
        
        # Create MedicalHistory record if illness information is provided
        medical_history = None
        if record_type and illness_name:
            medical_history = create_medical_history_for_health_record(
                patient_record, record_type, illness_name
            )
        
        return patient, patient_record, medical_history
        
    except Exception as e:
        logger.error(f"Error creating patient and record for resident {rp_id}: {str(e)}")
        return None, None, None

def create_medical_history_for_health_record(patient_record, record_type, illness_name):
    """
    Create or find existing MedicalHistory record for health profiling
    
    Args:
        patient_record (PatientRecord): The patient record
        record_type (str): Type of health record ('NCD', 'TB')
        illness_name (str): Name of the illness/condition
        
    Returns:
        MedicalHistory: The created or existing medical history record
    """
    try:
        # Create or get illness record
        illness, created = Illness.objects.get_or_create(
            illname=illness_name,
            defaults={
                'ill_description': f'{record_type} condition: {illness_name}',
                'ill_code': f'{record_type.upper()}_{illness_name.upper().replace(" ", "_")}'
            }
        )
        
        if created:
            logger.info(f"Created new illness record: {illness.illname}")
        else:
            logger.info(f"Found existing illness record: {illness.illname}")
        
        # Check if medical history already exists for this patient record and illness
        existing_history = MedicalHistory.objects.filter(
            patrec=patient_record,
            ill=illness
        ).first()
        
        if existing_history:
            logger.info(f"Medical history already exists for patient record {patient_record.patrec_id} and illness {illness.illname}")
            return existing_history
        
        # Create new medical history record
        medical_history = MedicalHistory.objects.create(
            patrec=patient_record,
            ill=illness,
            year=str(timezone.now().year)
        )
        
        logger.info(f"Created medical history record {medical_history.medhist_id} for patient record {patient_record.patrec_id}")
        return medical_history
        
    except Exception as e:
        logger.error(f"Error creating medical history: {str(e)}")
        return None

 
# utils/patient_utils.py
def get_completed_followup_visits(pat_id):

    try:
        # Get all patient records for this patient
        patient_records = PatientRecord.objects.filter(pat_id=pat_id)
        
        # Get only completed follow-up visits associated with these patient records
        completed_visits = FollowUpVisit.objects.filter(
            patrec__in=patient_records,
            followv_status__iexact='completed'  # Case-insensitive match
        ).order_by('-followv_date')  # Order by most recent first
        
        return completed_visits
    except Exception as e:
        # Log the error if needed
        print(f"Error fetching completed follow-up visits: {e}")
        return FollowUpVisit.objects.none()  # Return empty queryset on error
    
    

def get_pending_followup_visits(pat_id):
    try:
        # Get all patient records for this patient
        patient_records = PatientRecord.objects.filter(pat_id=pat_id)

        # Get only completed follow-up visits associated with these patient records
        pending_visits = FollowUpVisit.objects.filter(
            patrec__in=patient_records,
            followv_status__iexact='pending'  # Case-insensitive match
        ).order_by('-followv_date')  # Order by most recent first
        
        return pending_visits
    except Exception as e:
        # Log the error if needed
        print(f"Error fetching completed follow-up visits: {e}")
        return FollowUpVisit.objects.none()  # Return empty queryset on error


def get_latest_height_weight(pat_id):
    try:
        latest = BodyMeasurement.objects.filter(
            patrec__pat_id=pat_id
        ).order_by('-created_at').first()

        # Check if a record was found AND if it has valid height/weight
        if latest and latest.height is not None and latest.weight is not None:
            # Optional: Check if values are positive numbers
            try:
                height_val = float(latest.height)
                weight_val = float(latest.weight)
                # If conversion is successful, return the data
                return {
                    'height': height_val,
                    'weight': weight_val,
                    'created_at': latest.created_at
                }
            except (TypeError, ValueError):
                # Handle the case where height/weight are strings that can't be converted (e.g., "")
                print(f"Error: Invalid height or weight value for record ID {latest.id}")
                return None
        else:
            # Return None if no record found, or record has null height/weight
            return None
    except Exception as e:
        print("Error fetching height and weight:", e)
        return None


def get_latest_vital_signs(pat_id):
    try:
        latest = VitalSigns.objects.filter(
            patrec__pat_id=pat_id
        ).order_by('-created_at').first()

        if latest:
            return {
                'pat_id': pat_id,
                'bp_systolic': latest.vital_bp_systolic,
                'bp_diastolic': latest.vital_bp_diastolic,
                'temperature': latest.vital_temp,
                'respiratory_rate': latest.vital_RR,
                'oxygen_saturation': latest.vital_o2,
                'pulse': latest.vital_pulse,
                'created_at': latest.created_at,
                'staff': latest.staff  # Include staff info if needed
            }
        else:
            return None
    except Exception as e:
        print("Error fetching vital signs:", e)
        return None

