from .models import *
from apps.inventory.models import *
from apps.patientrecords.serializers import PatientSerializer
from apps.patientrecords.models import *
from django.db.models import Q
from collections import defaultdict
from apps.healthProfiling.serializers.resident_profile_serializers import ResidentPersonalInfoSerializer
from .serializers import *

def get_unvaccinated_vaccines_for_patient(pat_id):
    today = timezone.now().date()

    # Get all vaccine IDs already given to the patient
    vaccinated_vac_ids = VaccinationHistory.objects.filter(
        vacrec__patrec_id__pat_id=pat_id
    ).values_list('vacStck_id__vac_id', flat=True).distinct()

    # Get overdue follow-up vaccines of type "routine"
    overdue_vac_ids = VaccinationHistory.objects.filter(
        vacrec__patrec_id__pat_id=pat_id,
        vacStck_id__vac_id__vac_type_choices="routine",
        followv__followv_date__lt=today,
    ).values_list('vacStck_id__vac_id', flat=True).distinct()

    # Combine: all vaccines EXCEPT vaccinated ones MINUS those with overdue routine followups
    unvaccinated_vaccines = VaccineList.objects.exclude(vac_id__in=vaccinated_vac_ids).union(
        VaccineList.objects.filter(vac_id__in=overdue_vac_ids)
    )

    return unvaccinated_vaccines

def has_existing_vaccine_history(pat_id, vac_id):
    return VaccinationHistory.objects.filter(
        vacrec__patrec_id__pat_id=pat_id,
        vacStck_id__vac_id=vac_id
    ).exists()
    
    
def get_patient_vaccines_with_followups(pat_id):
    history_records = VaccinationHistory.objects.filter(
        vacrec__patrec_id__pat_id=pat_id,
        followv__followv_status="pending"  # ✅ only pending follow-up visits
    ).select_related('vacStck_id__vac_id', 'followv')

    if not history_records.exists():
        return [{"message": "No vaccine or pending follow-up visit data found for this patient."}]

    results = []

    for record in history_records:
        vacStck = getattr(record, 'vacStck_id', None)
        vac = getattr(vacStck, 'vac_id', None)

        vac_name = getattr(vac, 'vac_name', None)
        vac_type = getattr(vac, 'vac_type_choices', None)
        followup_date = getattr(record.followv, 'followv_date', None)
        followup_status = getattr(record.followv, 'followv_status', None)

        results.append({
            'vac_name': vac_name,
            'vac_type_choices': vac_type,
            'followup_date': followup_date,
            'followup_status': followup_status,
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
    patients = Patient.objects.filter(pat_type="Resident", pat_status="Active").select_related('rp_id', 'rp_id__per')

    # Map rp_id -> patient
    patient_map = {p.rp_id.rp_id: p for p in patients if p.rp_id}

    # 📦 All vaccines
    all_vaccines = VaccineList.objects.all()

    for vaccine in all_vaccines:
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
                        "vaccine_not_received": vaccine.vac_name
                    })
            else:
                # No patient — definitely not vaccinated for this vaccine
                result[vaccine.vac_name].append({
                    "status": "No patient record",
                    "pat_id": None,
                    "rp_id": rp_id,
                    "personal_info": personal_info,
                    "vaccine_not_received": vaccine.vac_name
                })

    return result


def count_vaccinated_by_patient_type():
    vaccinated_pat_ids = VaccinationHistory.objects.values_list(
        'vacrec__patrec_id__pat_id', flat=True
    ).distinct()

    vaccinated_patients = Patient.objects.filter(pat_id__in=vaccinated_pat_ids)

    resident_count = vaccinated_patients.filter(pat_type="Resident").count()
    transient_count = vaccinated_patients.filter(pat_type="Transient").count()

    return {
        "resident_vaccinated": resident_count,
        "transient_vaccinated": transient_count
    }


