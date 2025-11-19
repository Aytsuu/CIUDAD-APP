from .models import *
from apps.healthProfiling.models import *
from apps.healthProfiling.serializers.base import PersonalSerializer
from apps.maternal.models import *
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
    Create MedicalHistory record for health profiling using EXISTING illness records only.
    Does NOT create new illness records - only fetches from existing illness table data.
    Uses case-insensitive search for illness names.
    
    Args:
        patient_record (PatientRecord): The patient record
        record_type (str): Type of health record ('NCD', 'TB')
        illness_name (str): Name of the illness/condition (must exist in Illness table, case-insensitive)
        
    Returns:
        MedicalHistory: The created or existing medical history record, or None if illness not found
    """
    try:
        # Fetch existing illness record - DO NOT CREATE NEW
        # Use case-insensitive search (iexact) to match regardless of capitalization
        try:
            illness = Illness.objects.get(illname__iexact=illness_name)
            logger.info(f"Found existing illness record: {illness.illname} (ID: {illness.ill_id})")
        except Illness.DoesNotExist:
            logger.error(f"Illness '{illness_name}' does not exist in the Illness table (searched case-insensitively). Medical history not created.")
            return None
        except Illness.MultipleObjectsReturned:
            # If multiple matches found, get the first one and log a warning
            illness = Illness.objects.filter(illname__iexact=illness_name).first()
            logger.warning(f"Multiple illness records found for '{illness_name}'. Using first match: {illness.illname} (ID: {illness.ill_id})")
        
        # Check if medical history already exists for this patient record and illness
        existing_history = MedicalHistory.objects.filter(
            patrec=patient_record,
            ill=illness
        ).first()
        
        if existing_history:
            logger.info(f"Medical history already exists for patient record {patient_record.patrec_id} and illness {illness.illname}")
            return existing_history
        
        # Create new medical history record with ill_date formatted as YYYY-MM-DD
        current_date = timezone.now()
        formatted_date = current_date.strftime('%Y-%m-%d')  # Format: YYYY-MM-DD
        
        medical_history = MedicalHistory.objects.create(
            patrec=patient_record,
            ill=illness,
            ill_date=formatted_date  # Use ill_date instead of year, formatted as YYYY-MM-DD
        )
        
        logger.info(f"Created medical history record {medical_history.medhist_id} for patient record {patient_record.patrec_id} with illness {illness.illname} (ID: {illness.ill_id}) on date {formatted_date}")
        return medical_history
        
    except Exception as e:
        logger.error(f"Error creating medical history: {str(e)}")
        return None

 
# utils/patient_utils.py
def get_completed_followup_visits(pat_id):

    try:
        # Get all patient records for this patient
        patient_records = PatientRecord.objects.filter(pat_id__pat_id=pat_id)
        
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
        # Get all records ordered by most recent first
        all_records = BodyMeasurement.objects.filter(
            pat_id=pat_id
        ).order_by('-created_at')
        
        # Iterate through records to find the first one with valid height/weight
        for record in all_records:
            # Check if this record has valid height/weight
            if record and record.height is not None and record.weight is not None:
                # Try to convert to float to validate they're numbers
                try:
                    height_val = float(record.height)
                    weight_val = float(record.weight)
                    
                    # Optional: Check if values are reasonable (positive numbers)
                    if height_val > 0 and weight_val > 0:
                        return {
                            'height': height_val,
                            'weight': weight_val,
                            'created_at': record.created_at
                        }
                    else:
                        print(f"Warning: Non-positive values for record ID {record.id}")
                        continue  # Continue searching if values are not positive
                        
                except (TypeError, ValueError):
                    # Handle the case where height/weight can't be converted to float
                    print(f"Error: Invalid height or weight value for record ID {record.id}")
                    continue  # Continue searching for valid record
            
        # If no valid record found after checking all
        print(f"No valid height/weight records found for patient {pat_id}")
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
            }
        else:
            return None
    except Exception as e:
        print("Error fetching vital signs:", e)
        return None


def extract_personal_info(obj):
    """Get personal info from rp_id or trans_id"""
    try:
        if hasattr(obj, 'rp_id') and obj.rp_id and hasattr(obj.rp_id, 'per'):
            personal = obj.rp_id.per
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
        elif hasattr(obj, 'trans_id') and obj.trans_id:
            trans = obj.trans_id
            return {
                'per_fname': trans.tran_fname,
                'per_lname': trans.tran_lname,
                'per_mname': trans.tran_mname,
                'per_suffix': trans.tran_suffix,
                'per_dob': trans.tran_dob,
                'per_sex': trans.tran_sex,
                'per_status': trans.tran_status,
                'per_edAttainment': trans.tran_ed_attainment,
                'per_religion': trans.tran_religion,
                'per_contact': trans.tran_contact,
            }
    except Exception as e:
        print(f"Error getting personal info: {str(e)}")
    return None

def extract_address(obj):
    """Get address from rp_id or trans_id"""
    try:
        if hasattr(obj, 'rp_id') and obj.rp_id and hasattr(obj.rp_id, 'per'):
            personal_address = PersonalAddress.objects.select_related('add', 'add__sitio').filter(per=obj.rp_id.per).first()
            if personal_address and personal_address.add:
                address = personal_address.add
                sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                address_parts = [
                    address.add_barangay,
                    address.add_city,
                    address.add_province,
                    address.add_street,
                ]
                full_address = ", ".join(filter(None, address_parts))
                return {
                    'add_street': address.add_street,
                    'add_barangay': address.add_barangay,
                    'add_city': address.add_city,
                    'add_province': address.add_province,
                    'add_sitio': sitio,
                    'full_address': full_address
                }
        elif hasattr(obj, 'trans_id') and obj.trans_id and obj.trans_id.tradd_id:
            trans_addr = obj.trans_id.tradd_id
            sitio = trans_addr.tradd_sitio
            address_parts = [
                trans_addr.tradd_barangay,
                trans_addr.tradd_city,
                trans_addr.tradd_province,
                trans_addr.tradd_street,
            ]
            full_address = ", ".join(filter(None, address_parts))
            return {
                'add_street': trans_addr.tradd_street,
                'add_barangay': trans_addr.tradd_barangay,
                'add_city': trans_addr.tradd_city,
                'add_province': trans_addr.tradd_province,
                'add_sitio': sitio,
                'full_address': full_address
            }
    except Exception as e:
        print(f"Error getting address: {str(e)}")
    return None




def get_personal_info(obj, context=None):
    """
    Get personal information for both resident and transient patients.
    """
    if getattr(obj, 'pat_type', None) == 'Resident' and getattr(obj, 'rp_id', None) and hasattr(obj.rp_id, 'per'):
        return PersonalSerializer(obj.rp_id.per, context=context).data if context else PersonalSerializer(obj.rp_id.per).data

    elif getattr(obj, 'pat_type', None) == 'Transient' and getattr(obj, 'trans_id', None):
        trans = obj.trans_id
        return {
            'per_fname': getattr(trans, 'tran_fname', None),
            'per_lname': getattr(trans, 'tran_lname', None),
            'per_mname': getattr(trans, 'tran_mname', None),
            'per_suffix': getattr(trans, 'tran_suffix', None),
            'per_dob': getattr(trans, 'tran_dob', None),
            'per_sex': getattr(trans, 'tran_sex', None),
            'per_status': getattr(trans, 'tran_status', None),
            'per_edAttainment': getattr(trans, 'tran_ed_attainment', None),
            'per_religion': getattr(trans, 'tran_religion', None),
            'per_contact': getattr(trans, 'tran_contact', None),
            'philhealth_id': getattr(trans, 'philhealth_id', None),
        }
    return None

def get_address(obj):
    """
    Get address information for Resident and Transient patients.
    """
    try:
        if getattr(obj, 'pat_type', None) == 'Resident' and getattr(obj, 'rp_id', None):
            personal_address = PersonalAddress.objects.select_related('add', 'add__sitio').filter(per=obj.rp_id.per).first()
            if personal_address and personal_address.add:
                address = personal_address.add
                sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                address_parts = [
                    address.add_barangay,
                    address.add_city,
                    address.add_province,
                    address.add_street,
                ]
                full_address = ", ".join(filter(None, address_parts))
                return {
                    'add_street': address.add_street,
                    'add_barangay': address.add_barangay,
                    'add_city': address.add_city,
                    'add_province': address.add_province,
                    'add_sitio': sitio,
                    'full_address': full_address
                }

            household = Household.objects.select_related('add', 'add__sitio').filter(rp=obj.rp_id).first()
            if household and household.add:
                address = household.add
                sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                address_parts = [
                    address.add_barangay,
                    address.add_city,
                    address.add_province,
                    address.add_street,
                ]
                full_address = ", ".join(filter(None, address_parts))
                return {
                    'add_street': address.add_street,
                    'add_barangay': address.add_barangay,
                    'add_city': address.add_city,
                    'add_province': address.add_province,
                    'add_sitio': sitio,
                    'full_address': full_address
                }
            return None

        elif getattr(obj, 'pat_type', None) == 'Transient' and getattr(obj, 'trans_id', None) and getattr(obj.trans_id, 'tradd_id', None):
            trans_addr = obj.trans_id.tradd_id
            sitio = trans_addr.tradd_sitio
            address_parts = [
                trans_addr.tradd_barangay,
                trans_addr.tradd_city,
                trans_addr.tradd_province,
                trans_addr.tradd_street,
            ]
            full_address = ", ".join(filter(None, address_parts))
            return {
                'add_street': trans_addr.tradd_street,
                'add_barangay': trans_addr.tradd_barangay,
                'add_city': trans_addr.tradd_city,
                'add_province': trans_addr.tradd_province,
                'add_sitio': sitio,
                'full_address': full_address
            }
        return None
    except Exception as e:
        print(f"Error retrieving address: {str(e)}")
        return None
    
def get_family_head_info(obj, context=None):
    """Reusable function to get family head info for Resident or Transient patients."""
    family_heads = {}
    if getattr(obj, 'pat_type', None) == 'Resident' and getattr(obj, 'rp_id', None):
        try:
            current_composition = FamilyComposition.objects.filter(rp=obj.rp_id).order_by('-fam_id__fam_date_registered', '-fc_id').first()
            if not current_composition:
                return None

            fam_id = current_composition.fam_id

            family_compositions = FamilyComposition.objects.filter(
                fam_id=fam_id
            ).select_related('rp', 'rp__per')

            for composition in family_compositions:
                role = composition.fc_role.lower()
                if role in ['mother', 'father'] and composition.rp and hasattr(composition.rp, 'per'):
                    personal = composition.rp.per
                    patient = Patient.objects.filter(rp_id=composition.rp).first()
                    family_planning_method = None
                    if patient:
                        latest_fp_record = patient.fp_records.order_by('-created_at').first()
                        if latest_fp_record:
                            fp_type = latest_fp_record.fp_type_set.first()
                            family_planning_method = fp_type.fpt_method_used if fp_type else None

                    # Get address information for this family head
                    address_info = None
                    if hasattr(obj, '_get_family_head_address'):
                        address_info = obj._get_family_head_address(composition.rp)
                    # If not, you can implement a utility for address as well

                    family_heads[role] = {
                        'rp_id': composition.rp.rp_id,
                        'role': composition.fc_role,
                        'personal_info': PersonalSerializer(personal, context=context).data if context else {},
                        'composition_id': composition.fc_id,
                        'family_planning_method': family_planning_method,
                        'address': address_info
                    }
            
            return {
                'fam_id': fam_id,
                'family_heads': family_heads,
                'has_mother': 'mother' in family_heads,
                'has_father': 'father' in family_heads,
                'total_heads': len(family_heads)
            }
        except Exception as e:
            print(f"Error in get_family_head_info: {str(e)}")
            return None

    elif getattr(obj, 'pat_type', None) == 'Transient' and getattr(obj, 'trans_id', None):
        try:
            trans = obj.trans_id
            if getattr(trans, 'mother_fname', None) or getattr(trans, 'mother_lname', None):
                family_heads['mother'] = {
                    'role': 'Mother',
                    'personal_info': {
                        'per_fname': trans.mother_fname,
                        'per_lname': trans.mother_lname,
                        'per_mname': trans.mother_mname,
                        'per_dob': trans.mother_dob,
                    },
                    'family_planning_method': None
                }

            if getattr(trans, 'father_fname', None) or getattr(trans, 'father_lname', None):
                family_heads['father'] = {
                    'role': 'Father',
                    'personal_info': {
                        'per_fname': trans.father_fname,
                        'per_lname': trans.father_lname,
                        'per_mname': trans.father_mname,
                        'per_dob': trans.father_dob,
                    },
                    'family_planning_method': None
                }

            return {
                'fam_id': None,
                'family_heads': family_heads,
                'has_mother': 'mother' in family_heads,
                'has_father': 'father' in family_heads,
                'total_heads': len(family_heads)
            }
        except Exception as e:
            print(f"Error in get_family_head_info: {str(e)}")
            return None

    return None



def get_family(obj):
    """
    Returns the family composition info for a Resident patient.
    """
    if getattr(obj, 'pat_type', None) == 'Resident' and getattr(obj, 'rp_id', None):
        try:
            current_composition = FamilyComposition.objects.filter(
                rp=obj.rp_id
            ).order_by('-fam_id__fam_date_registered', '-fc_id').first()
            
            if not current_composition:
                print(f'No family composition found for resident {obj.rp_id.rp_id}')
                return None

            fam_id = current_composition.fam_id

            all_compositions = FamilyComposition.objects.filter(
                fam_id=fam_id
            ).select_related('rp', 'rp__per')

            current_role = FamilyComposition.objects.filter(rp=obj.rp_id).order_by('-fam_id__fam_date_registered', '-fc_id').first()
            if current_role:
                return {
                    'fam_id': str(current_role.fam_id),
                    'fc_role': current_role.fc_role,
                    'fc_id': current_role.fc_id
                }

            mother_composition = all_compositions.filter(fc_role__iexact='Mother').first()
            if mother_composition:
                return {
                    'fam_id': str(mother_composition.fam_id),
                    'fc_role': 'Mother',
                    'fc_id': mother_composition.fc_id
                }
            
            father_composition = all_compositions.filter(fc_role__iexact='Father').first()
            if father_composition:
                return {
                    'fam_id': str(father_composition.fam_id),
                    'fc_role': 'Father',
                    'fc_id': father_composition.fc_id
                }
            
            other_composition = all_compositions.exclude(
                fc_role__iexact='Mother'
            ).exclude(
                fc_role__iexact='Father'
            ).first()

            if other_composition:
                return {
                    'fam_id': str(other_composition.fam_id),
                    'fc_role': other_composition.fc_role,
                    'fc_id': other_composition.fc_id
                }
            
            return None
        
        except Exception as e:
            print(f'Error fetching fam_id for resident {obj.rp_id.rp_id}: {str(e)}')
            return None
    return 



# utils/patient_additional_info.py

def get_additional_info(obj):
    """
    Reusable function to get additional patient information for both Resident and Transient patients.
    """
    try:
        additional_info = {}

        # Case 1: Resident patient with rp_id
        if getattr(obj, 'pat_id', None) and getattr(obj, 'rp_id', None):
            # Philhealth from HealthRelatedDetails (resident)
            per_ph_id = HealthRelatedDetails.objects.filter(rp=obj.rp_id).first()
            if per_ph_id:
                additional_info['philhealth_id'] = per_ph_id.per_add_philhealth_id

            # Try to find latest family composition for this resident
            current_composition = FamilyComposition.objects.filter(rp=obj.rp_id).order_by('-fam_id__fam_date_registered','-fc_id').first()
            if current_composition:
                try:
                    current_role = (current_composition.fc_role or '').strip().lower()
                except Exception:
                    current_role = ''

                # Get total children count (DEPENDENT + INDEPENDENT)
                fam_id = current_composition.fam_id
                total_children = FamilyComposition.objects.filter(
                    fam_id=fam_id,
                    fc_role__in=['DEPENDENT', 'INDEPENDENT', 'Dependent', 'Independent', 'dependent', 'independent']
                ).count()
                
                if total_children > 0:
                    additional_info['total_children'] = total_children

                # If current patient is MOTHER, get child dependents
                if current_role == 'mother':
                    child_dependents = _get_child_dependents(obj, current_composition)
                    if child_dependents:
                        additional_info['child_dependents'] = child_dependents

                # If not father role, fetch mother TT status
                if current_role != 'father':
                    all_compositions = FamilyComposition.objects.filter(fam_id=fam_id).select_related('rp', 'rp__per')
                    mother_comp = all_compositions.filter(fc_role__iexact='Mother').first()
                    if mother_comp:
                        try:
                            tt_status = TT_Status.objects.filter(
                                pat_id__rp_id=mother_comp.rp.rp_id
                            ).order_by('-tts_date_given', '-tts_id').first()
                            if tt_status:
                                additional_info['mother_tt_status'] = {
                                    'status': tt_status.tts_status,
                                    'date_given': tt_status.tts_date_given
                                }
                            else:
                                additional_info['mother_tt_status'] = None
                        except Exception as e:
                            additional_info['mother_tt_status'] = None

            # Check for latest pregnancy and AOG data
            try:
                latest_pregnancy = Pregnancy.objects.filter(
                    pat_id=obj,
                    status='active'
                ).order_by('-created_at').first()
                
                if latest_pregnancy:
                    latest_prenatal = Prenatal_Form.objects.filter(
                        pregnancy_id=latest_pregnancy
                    ).order_by('-created_at').first()

                    if latest_prenatal:
                        # Build latest_pregnancy structure with pregnancy_id, pf_id, and ppr_id
                        pregnancy_data = {
                            'pregnancy_id': latest_pregnancy.pregnancy_id,
                            'pf_id': latest_prenatal.pf_id,
                        }
                        
                        # Fetch ppr_id from PostpartumRecord if exists
                        postpartum_record = PostpartumRecord.objects.filter(
                            pregnancy_id=latest_pregnancy
                        ).order_by('-created_at').first()
                        if postpartum_record:
                            pregnancy_data['ppr_id'] = postpartum_record.ppr_id
                        
                        additional_info['latest_pregnancy'] = pregnancy_data
                        
                        latest_prenatal_care = PrenatalCare.objects.filter(
                            pf_id=latest_prenatal,
                            pfpc_aog_wks__isnull=False
                        ).order_by('-pfpc_date', '-created_at').first()
                        
                        if latest_prenatal_care:
                            additional_info['latest_aog_weeks'] = latest_prenatal_care.pfpc_aog_wks
                            additional_info['latest_aog_days'] = latest_prenatal_care.pfpc_aog_days
                else:
                    # Get mother's AOG data if current patient is a child
                    current_composition = FamilyComposition.objects.filter(rp=obj.rp_id).order_by('-fam_id__fam_date_registered', '-fc_id').first()
                    if current_composition:
                        current_role = (current_composition.fc_role or '').strip().lower()
                        print(f"🔍 Patient {obj.pat_id} role: {current_role}")
                        if current_role not in ['mother', 'father']:
                            fam_id = current_composition.fam_id
                            all_compositions = FamilyComposition.objects.filter(fam_id=fam_id).select_related('rp', 'rp__per')
                            mother_comp = all_compositions.filter(fc_role__iexact='Mother').first()
                            print(f"🔍 Found mother composition: {mother_comp}")
                            
                            if mother_comp and mother_comp.rp:
                                mother_patient = Patient.objects.filter(rp_id=mother_comp.rp).first()
                                print(f"🔍 Found mother patient: {mother_patient}")
                                if mother_patient:
                                    mother_pregnancy = Pregnancy.objects.filter(
                                        pat_id=mother_patient,
                                        status='active'
                                    ).order_by('-created_at').first()
                                    print(f"🔍 Found mother pregnancy: {mother_pregnancy}")
                                    
                                    if mother_pregnancy:
                                        mother_prenatal = Prenatal_Form.objects.filter(
                                            pregnancy_id=mother_pregnancy
                                        ).order_by('-created_at').first()
                                        print(f"🔍 Found mother prenatal: {mother_prenatal}")
                                        
                                        if mother_prenatal:
                                            pregnancy_data = {
                                                'pregnancy_id': mother_pregnancy.pregnancy_id,
                                                'pf_id': mother_prenatal.pf_id,
                                                'mother_pat_id': mother_patient.pat_id,  # Add mother's patient ID
                                            }
                                            
                                            # fetch ppr_id from PostpartumRecord if exists
                                            postpartum_record = PostpartumRecord.objects.filter(
                                                pregnancy_id=mother_pregnancy
                                            ).order_by('-created_at').first()
                                            if postpartum_record:
                                                pregnancy_data['ppr_id'] = postpartum_record.ppr_id
                                            
                                            additional_info['mother_latest_pregnancy'] = pregnancy_data
                                            print(f"✅ Added mother_latest_pregnancy: {pregnancy_data}")

                                            
                                            mother_prenatal_care = PrenatalCare.objects.filter(
                                                pf_id=mother_prenatal,
                                                pfpc_aog_wks__isnull=False
                                            ).order_by('-pfpc_date', '-created_at').first()
                                            
                                            if mother_prenatal_care:
                                                additional_info['mother_latest_aog_weeks'] = mother_prenatal_care.pfpc_aog_wks
                                                additional_info['mother_latest_aog_days'] = mother_prenatal_care.pfpc_aog_days
                                        else:
                                            print("❌ No prenatal form found for mother pregnancy")
                                    else:
                                        print("❌ No active pregnancy found for mother")
                                else:
                                    print("❌ No patient record found for mother")
                            else:
                                print("❌ No mother composition found in family")
                        else:
                            print(f"❌ Patient role '{current_role}' is mother/father, skipping mother pregnancy lookup")
                    else:
                        print("❌ No current composition found for patient")
            except Exception as e:
                print(f"Error fetching AOG data for resident: {str(e)}")

            print(f"🔍 Final additional_info for resident {obj.pat_id}: {additional_info}")
            return additional_info if additional_info else None

        # Case 2: Transient patient
        if getattr(obj, 'pat_id', None) and getattr(obj, 'trans_id', None):
            trans = obj.trans_id
            if getattr(trans, 'philhealth_id', None):
                additional_info['philhealth_id'] = trans.philhealth_id

            try:
                tt_qs = TT_Status.objects.filter(
                    pat_id=obj
                ).select_related('pat_id').order_by('-tts_date_given', '-tts_id')
                if tt_qs.exists():
                    latest_tt_status = tt_qs.first()
                    additional_info['mother_tt_status'] = {
                        'status': latest_tt_status.tts_status,
                        'date_given': latest_tt_status.tts_date_given
                    }
                else:
                    additional_info['mother_tt_status'] = None
            except Exception:
                additional_info['mother_tt_status'] = None

            # Check for latest pregnancy and AOG data
            try:
                latest_pregnancy = Pregnancy.objects.filter(
                    pat_id=obj,
                    status='active'
                ).order_by('-created_at').first()
                
                if latest_pregnancy:
                    latest_prenatal = Prenatal_Form.objects.filter(
                        pregnancy_id=latest_pregnancy
                    ).order_by('-created_at').first()

                    if latest_prenatal:
                        pregnancy_data = {
                            'pregnancy_id': latest_pregnancy.pregnancy_id,
                            'pf_id': latest_prenatal.pf_id,
                        }
                        
                        # fetch ppr_id from PostpartumRecord if exists
                        postpartum_record = PostpartumRecord.objects.filter(
                            pregnancy_id=latest_pregnancy
                        ).order_by('-created_at').first()
                        if postpartum_record:
                            pregnancy_data['ppr_id'] = postpartum_record.ppr_id
                        
                        additional_info['latest_pregnancy'] = pregnancy_data
                        
                        latest_prenatal_care = PrenatalCare.objects.filter(
                            pf_id=latest_prenatal,
                            pfpc_aog_wks__isnull=False
                        ).order_by('-pfpc_date', '-created_at').first()
                        
                        if latest_prenatal_care:
                            additional_info['latest_aog_weeks'] = latest_prenatal_care.pfpc_aog_wks
                            additional_info['latest_aog_days'] = latest_prenatal_care.pfpc_aog_days
            except Exception as e:
                print(f"Error fetching AOG data for transient: {str(e)}")

            return additional_info if additional_info else None

        return None
    except Exception as e:
        print(f"Error in get_additional_info: {str(e)}")
        return None


def _get_child_dependents(obj, current_composition):
    """Helper function to get child dependents for mother role"""
    try:
        fam_id = current_composition.fam_id
        child_dependents = FamilyComposition.objects.filter(
            fam_id=fam_id,
            fc_role__in=['DEPENDENT', 'INDEPENDENT', 'Dependent', 'Independent', 'dependent', 'independent']
        ).select_related('rp', 'rp__per').order_by('fc_dob')

        dependent_list = []
        for child in child_dependents:
            if child.rp and child.rp.per:
                dependent_info = {
                    'fc_id': child.fc_id,
                    'name': f"{child.rp.per.per_fname or ''} {child.rp.per.per_lname or ''}".strip(),
                    'dob': child.fc_dob,
                    'sex': getattr(child.rp.per, 'per_sex', None),
                    'role': child.fc_role
                }
                dependent_list.append(dependent_info)

        return dependent_list if dependent_list else None
    except Exception as e:
        print(f"Error fetching child dependents: {str(e)}")
        return None