from .models import *
from apps.inventory.models import *
from apps.inventory.serializers.vaccine_serializers import *
from apps.patientrecords.serializers.patients_serializers import PatientSerializer
from apps.patientrecords.models import *
from django.db.models import Q
from collections import defaultdict
from apps.healthProfiling.serializers.resident_profile_serializers import ResidentPersonalInfoSerializer
from .serializers import *
from django.db.models import Count, Q
from apps.childhealthservices.models import *
from apps.childhealthservices.serializers import *
from datetime import date, timedelta
from django.utils import timezone


def _convert_age_to_days(value, unit):
    """Convert an age value expressed in various units into days."""
    if value is None or unit is None:
        return None
    try:
        value = float(value)
    except (TypeError, ValueError):
        return None

    normalized = unit.strip().lower()
    if "day" in normalized:
        return value
    if "week" in normalized:
        return value * 7
    if "month" in normalized:
        return value * 30  # Approximate months to 30 days for comparisons
    if "year" in normalized:
        return value * 365  # Approximate years to 365 days for comparisons
    return None


def _get_patient_age_in_days(pat_id):
    """Return patient's age in days or None if DOB is unavailable."""
    try:
        patient = Patient.objects.select_related("rp_id__per", "trans_id").get(pat_id=pat_id)
    except Patient.DoesNotExist:
        print(f"Patient {pat_id} not found")
        return None

    dob = None
    if patient.pat_type == "Resident" and patient.rp_id and patient.rp_id.per:
        dob = patient.rp_id.per.per_dob
    elif patient.pat_type == "Transient" and patient.trans_id:
        dob = patient.trans_id.tran_dob

    if not dob:
        print(f"No date of birth found for patient {pat_id}")
        return None

    return (date.today() - dob).days


def _should_include_vaccine_for_patient(patient_age_days, vaccine):
    """Determine if a vaccine should be presented based on the patient's age."""
    if patient_age_days is None:
        return True

    age_group = getattr(vaccine, "ageGroup", None)
    if not age_group:
        return True

    # Check if age group has valid restrictions
    time_unit = getattr(age_group, "time_unit", None)
    min_age = getattr(age_group, "min_age", None)
    max_age = getattr(age_group, "max_age", None)

    # If time_unit is "NA" or no valid age restrictions, include the vaccine
    if time_unit == "NA" or min_age is None or max_age is None:
        return True

    min_age_days = _convert_age_to_days(min_age, time_unit)
    max_age_days = _convert_age_to_days(max_age, time_unit)

    if min_age_days is None or max_age_days is None:
        return True

    six_years_in_days = 6 * 365

    # Children within 0-6 years should see vaccines they can catch up on
    if patient_age_days <= six_years_in_days:
        # Show vaccines where:
        # 1. Patient has reached minimum age (can start the vaccine)
        # 2. Patient is still within 6 years (catch-up period)
        # This ensures babies/toddlers see all age-appropriate vaccines they haven't completed yet
        if patient_age_days >= min_age_days:
            # If vaccine max age is also within 0-6 years range, always show it
            if max_age_days <= six_years_in_days:
                return True
            # If vaccine extends beyond 6 years, only show if patient is within reasonable range
            return patient_age_days <= max_age_days
        return False

    # For patients older than 6 years, only show vaccines they are currently eligible for
    return patient_age_days >= min_age_days and patient_age_days <= max_age_days


def get_unvaccinated_vaccines_for_patient(pat_id):
    patient_age_days = _get_patient_age_in_days(pat_id)

    # Get all vaccine IDs that patient has completed (from both fields)
    completed_vaccines = set()
    
    # From vacStck_id field
    completed_vaccines.update(VaccinationHistory.objects.filter(
        vacrec__patrec_id__pat_id=pat_id,
        vachist_status="completed",
        vacStck_id__isnull=False
    ).values_list('vacStck_id__vac_id', flat=True))
    
    # From vac field
    completed_vaccines.update(VaccinationHistory.objects.filter(
        vacrec__patrec_id__pat_id=pat_id,
        vachist_status="completed", 
        vac__isnull=False
    ).values_list('vac__vac_id', flat=True))

    print(f"Completed vaccine IDs: {completed_vaccines}")

    # Get all vaccines
    all_vaccines = VaccineList.objects.select_related("ageGroup").all()
    unvaccinated_vaccines = []
    
    for vaccine in all_vaccines:
        if patient_age_days is not None and not _should_include_vaccine_for_patient(patient_age_days, vaccine):
            continue
        # For non-routine vaccines, use simple completion check
        if vaccine.vac_type_choices != 'routine':
            if vaccine.vac_id not in completed_vaccines:
                unvaccinated_vaccines.append(vaccine)
        else:
            # For routine vaccines, check frequency intervals
            is_unvaccinated = check_routine_vaccine_status(pat_id, vaccine)
            if is_unvaccinated:
                unvaccinated_vaccines.append(vaccine)
    
    return unvaccinated_vaccines

def check_routine_vaccine_status(pat_id, vaccine):
    """
    Check if a routine vaccine should be considered unvaccinated based on frequency
    """
    try:
        # Get the routine frequency for this vaccine
        routine_freq = RoutineFrequency.objects.get(vac_id=vaccine.vac_id)
    except RoutineFrequency.DoesNotExist:
        # If no frequency defined, use simple completion check
        completed_vaccines = VaccinationHistory.objects.filter(
            vacrec__patrec_id__pat_id=pat_id,
            vachist_status="completed"
        ).filter(
            Q(vacStck_id__vac_id=vaccine.vac_id) | 
            Q(vac__vac_id=vaccine.vac_id)
        )
        return not completed_vaccines.exists()
    
    # Get the most recent completed vaccination for this routine vaccine
    latest_vaccination = VaccinationHistory.objects.filter(
        vacrec__patrec_id__pat_id=pat_id,
        vachist_status="completed"
    ).filter(
        Q(vacStck_id__vac_id=vaccine.vac_id) | 
        Q(vac__vac_id=vaccine.vac_id)
    ).order_by('-date_administered').first()
    
    # If never vaccinated, mark as unvaccinated
    if not latest_vaccination:
        return True
    
    # Calculate the next due date based on frequency
    last_administered = latest_vaccination.date_administered
    today = timezone.now().date()
    
    # Calculate time delta based on frequency
    if routine_freq.time_unit == 'days':
        next_due_date = last_administered + timedelta(days=routine_freq.interval)
    elif routine_freq.time_unit == 'weeks':
        next_due_date = last_administered + timedelta(weeks=routine_freq.interval)
    elif routine_freq.time_unit == 'months':
        # Approximate months as 30 days
        next_due_date = last_administered + timedelta(days=routine_freq.interval * 30)
    elif routine_freq.time_unit == 'years':
        # Approximate years as 365 days
        next_due_date = last_administered + timedelta(days=routine_freq.interval * 365)
    else:
        # Default to days if unknown unit
        next_due_date = last_administered + timedelta(days=routine_freq.interval)
    
    # If today is past the next due date, mark as unvaccinated
    return today >= next_due_date

def has_existing_vaccine_history(pat_id, vac_id):
    return VaccinationHistory.objects.filter(
        vacrec__patrec_id__pat_id=pat_id,
        vacStck_id__vac_id=vac_id
    ).exists()
    
    


def get_patient_vaccines_with_followups(pat_id):
    history_records = VaccinationHistory.objects.filter(
        vacrec__patrec_id__pat_id=pat_id
    ).select_related('vacStck_id__vac_id', 'followv')

    if not history_records.exists():
        return [{"message": "No vaccine or pending follow-up visit data found for this patient."}]

    results = []

    for record in history_records:
        vacStck = getattr(record, 'vacStck_id', None)
        vac = getattr(vacStck, 'vac_id', None)

        vac_name = getattr(vac, 'vac_name', None)
        vac_type = getattr(vac, 'vac_type_choices', None)
        followup = getattr(record, 'followv', None)

        followup_date = getattr(followup, 'followv_date', None)
        followup_status = getattr(followup, 'followv_status', None)
        completed_at = getattr(followup, 'completed_at', None)  # Use correct field name

        # Use today’s date if not completed
        today = date.today()
        reference_date = completed_at if completed_at else today

        missed_status = None
        days_missed = None

        if followup_date and reference_date > followup_date:
            missed_status = "missed"
            days_missed = (reference_date - followup_date).days

        results.append({
            'vac_name': vac_name,
            'vac_type_choices': vac_type,
            'followup_date': followup_date,
            'followup_status': followup_status,
            'completed_at': completed_at,
            'missed_status': missed_status,
            'days_missed': days_missed,
        })

    return results



# ...existing code...
def get_child_followups(pat_id):
    # Get follow-ups from vaccination history
    history_records = VaccinationHistory.objects.filter(
        vacrec__patrec_id__pat_id=pat_id,
        followv__isnull=False
    ).select_related('followv')

    # Get follow-ups from child health notes
    child_history_records = ChildHealthNotes.objects.filter(
        chhist__chrec__patrec__pat_id=pat_id,
        followv__isnull=False
    ).select_related('followv')

    if not history_records.exists() and not child_history_records.exists():
        return [{"message": "No follow ups or pending follow-up visit data found for this patient."}]

    results = []
    today = date.today()

    # Add from VaccinationHistory
    for record in history_records:
        followup = record.followv
        followup_date = followup.followv_date
        completed_at = getattr(followup, 'completed_at', None)

        # Only mark missed if NOT completed and past due
        missed_status = None
        days_missed = None
        if followup_date and not completed_at and today > followup_date:
            missed_status = "missed"
            days_missed = (today - followup_date).days

        results.append({
            'source': 'VaccinationHistory',
            'followup_description': followup.followv_description,
            'followup_date': followup_date,
            'followup_status': followup.followv_status,
            'completed_at': completed_at,
            'missed_status': missed_status,
            'days_missed': days_missed,
        })

    # Add from ChildHealthNotes
    for note in child_history_records:
        followup = note.followv
        followup_date = followup.followv_date
        completed_at = getattr(followup, 'completed_at', None)

        # Only mark missed if NOT completed and past due
        missed_status = None
        days_missed = None
        if followup_date and not completed_at and today > followup_date:
            missed_status = "missed"
            days_missed = (today - followup_date).days

        results.append({
            'source': 'ChildHealthNotes',
            'followup_description': followup.followv_description,
            'followup_date': followup_date,
            'followup_status': followup.followv_status,
            'completed_at': completed_at,
            'missed_status': missed_status,
            'days_missed': days_missed,
        })

    return results



def get_patient_info_from_vaccination_record(patrec_pat_id):
    try:
        # Find the vaccination record using the PatientRecord's pat_id
        vac_record = VaccinationRecord.objects.select_related('patrec_id__pat_id').get(
            patrec_id__pat_id=patrec_pat_id
        )

        patient = vac_record.patrec_id
        patient_serializer = PatientSerializer(patient)
        patient_info = patient_serializer.data

        return {"patient_info": patient_info}

    except VaccinationRecord.DoesNotExist:
        return {"message": "No vaccination record found for this patient."}
    

def get_vaccination_record_count(pat_id):
    return VaccinationRecord.objects.filter(patrec_id__pat_id=pat_id).count()


def get_all_residents_not_vaccinated():
    result = defaultdict(list)

    # 🧍 All ResidentProfiles
    all_residents = ResidentProfile.objects.select_related('per').all()

    # 📋 All Resident-type, Active Patients
    patients = Patient.objects.filter(
        pat_type="Resident", pat_status="Active"
    ).select_related('rp_id', 'rp_id__per')

    # Map rp_id -> patient
    patient_map = {p.rp_id.rp_id: p for p in patients if p.rp_id}

    # 📦 All vaccines
    all_vaccines = VaccineList.objects.all()

    for vaccine in all_vaccines:
        # Serialize vaccine full data
        vaccine_data = VacccinationListSerializer(vaccine).data

        # 🧪 Get pat_id of patients who already got this vaccine
        vaccinated_ids = VaccinationHistory.objects.filter(
            vacStck_id__vac_id=vaccine.vac_id
        ).values_list('vacrec__patrec_id__pat_id', flat=True).distinct()

        for resident in all_residents:
            rp_id = resident.rp_id
            personal_info = ResidentPersonalInfoSerializer(resident).data

            patient = patient_map.get(rp_id)
 
            if patient:
                # Has patient — check if vaccinated
                if patient.pat_id not in vaccinated_ids:
                    result[vaccine.vac_name].append({
                        "status": "Has patient, not vaccinated for this vaccine",
                        "pat_id": patient.pat_id,
                        "rp_id": rp_id,
                        "personal_info": personal_info,
                        "vaccine_not_received": vaccine_data
                    })
            else:
                # No patient — definitely not vaccinated for this vaccine
                result[vaccine.vac_name].append({
                    "status": "No patient record",
                    "pat_id": None,
                    "rp_id": rp_id,
                    "personal_info": personal_info,
                    "vaccine_not_received": vaccine_data
                })

    return result


def count_vaccinated_by_patient_type():
    try:
        counts = (
            Patient.objects.filter(
                patient_records__vaccination_records__vaccination_histories__vachist_status="completed"
            )
            .distinct()  # Ensure unique patients
            .values('pat_type')
            .annotate(total=Count('pat_id', distinct=True))
        )

        result = {"resident_vaccinated": 0, "transient_vaccinated": 0}
        for entry in counts:
            if entry["pat_type"] == "Resident":
                result["resident_vaccinated"] = entry["total"]
            elif entry["pat_type"] == "Transient":
                result["transient_vaccinated"] = entry["total"]

        return result
    except Exception as e:
        print(f"Error counting vaccinated patients: {str(e)}")
        return {"resident_vaccinated": 0, "transient_vaccinated": 0}