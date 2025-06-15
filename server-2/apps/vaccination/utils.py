from .models import *
from apps.inventory.models import *
from apps.patientrecords.serializers import PatientSerializer
from apps.patientrecords.models import *
from django.db.models import Q
from collections import defaultdict

# def get_unvaccinated_vaccines_for_patient(pat_id):
#     vaccinated_vac_ids = VaccinationHistory.objects.filter(
#         vacrec__patrec_id__pat_id=pat_id
#     ).values_list('vacStck__vac_id', flat=True).distinct()

#     unvaccinated_vaccines = VaccineList.objects.exclude(vac_id__in=vaccinated_vac_ids)
#     return unvaccinated_vaccines



def get_unvaccinated_vaccines_for_patient(pat_id):
    today = timezone.now().date()

    # Get all vaccine IDs already given to the patient
    vaccinated_vac_ids = VaccinationHistory.objects.filter(
        vacrec__patrec_id__pat_id=pat_id
    ).values_list('vacStck__vac_id', flat=True).distinct()

    # Get overdue follow-up vaccines of type "routine"
    overdue_vac_ids = VaccinationHistory.objects.filter(
        vacrec__patrec_id__pat_id=pat_id,
        vacStck__vac_id__vac_type_choices="routine",
        followv__followv_date__lt=today,
    ).values_list('vacStck__vac_id', flat=True).distinct()

    # Combine: all vaccines EXCEPT vaccinated ones MINUS those with overdue routine followups
    unvaccinated_vaccines = VaccineList.objects.exclude(vac_id__in=vaccinated_vac_ids).union(
        VaccineList.objects.filter(vac_id__in=overdue_vac_ids)
    )

    return unvaccinated_vaccines

def has_existing_vaccine_history(pat_id, vac_id):
    return VaccinationHistory.objects.filter(
        vacrec__patrec_id__pat_id=pat_id,
        vacStck__vac_id=vac_id
    ).exists()
    
def get_patient_vaccines_with_followups(pat_id):
    history_records = VaccinationHistory.objects.filter(
        vacrec__patrec_id__pat_id=pat_id,
        followv__followv_status="pending"  # ✅ only pending follow-up visits
    ).select_related('vacStck__vac_id', 'followv')

    if not history_records.exists():
        return [{"message": "No vaccine or pending follow-up visit data found for this patient."}]

    results = []

    for record in history_records:
        vacStck = getattr(record, 'vacStck', None)
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

        # Get the patient details from the linked PatientRecord
        patient = vac_record.patrec_id

        # Serialize patient details using PatientSerializer

        patient_serializer = PatientSerializer(patient)
        patient_info = patient_serializer.data

        return {"patient_info": patient_info}

    except VaccinationRecord.DoesNotExist:
        return {"message": "No vaccination record found for this patient."}

def get_vaccination_record_count(pat_id):
   
    return VaccinationRecord.objects.filter(patrec_id__pat_id=pat_id).count()
# def get_unvaccinated_vaccines_for_patient(pat_id):
#     today = timezone.now().date()

#     # 1. Vaccines already received (any status)
#     vaccinated_vac_ids = VaccinationHistory.objects.filter(
#         vacrec__patrec_id__pat_id=pat_id
#     ).values_list('vacStck__vac_id', flat=True).distinct()

#     # 2. Partially vaccinated vaccines
#     partial_vac_ids = VaccinationHistory.objects.filter(
#         vacrec__patrec_id__pat_id=pat_id,
#         vachist_status__iexact="Partially Vaccinated"
#     ).values_list('vacStck__vac_id', flat=True).distinct()

#     # 3. Overdue routine vaccines
#     overdue_vac_ids = VaccinationHistory.objects.filter(
#         vacrec__patrec_id__pat_id=pat_id,
#         vacStck__vac_id__vac_type_choices="routine",
#         followv__followv_date__lt=today,
#     ).values_list('vacStck__vac_id', flat=True).distinct()

#     # 4. Vaccines never received
#     never_received = VaccineList.objects.exclude(vac_id__in=vaccinated_vac_ids)

#     # 5. Union all: never received + partial + overdue
#     unvaccinated_vac_ids = set(never_received.values_list('vac_id', flat=True)) \
#         | set(partial_vac_ids) \
#         | set(overdue_vac_ids)

#     # 6. Get the VaccineList entries for those
#     unvaccinated_vaccines = VaccineList.objects.filter(vac_id__in=unvaccinated_vac_ids)

#     return 




def get_all_residents_not_vaccinated():
    results = defaultdict(list)

    # Step 1: Get all active Resident patients
    residents = Patient.objects.filter(pat_type="Resident", pat_status="Active")

    # Step 2: Get all vaccines
    all_vaccines = VaccineList.objects.all()

    for vaccine in all_vaccines:
        # Step 3: Get IDs of residents who HAVE received this vaccine
        vaccinated_ids = VaccinationHistory.objects.filter(
            vacStck__vac_id=vaccine.vac_id
        ).values_list('vacrec__patrec_id__pat_id', flat=True).distinct()

        # Step 4: Get residents who have NOT received this vaccine
        unvaccinated = residents.exclude(pat_id__in=vaccinated_ids)

        for patient in unvaccinated:
            results[vaccine.vac_name].append({
                'pat_id': patient.pat_id,
                'rp_id': getattr(patient.rp_id, 'id', None),  # or any other details
            })

    return results
