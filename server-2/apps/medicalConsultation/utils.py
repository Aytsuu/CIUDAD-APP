from .models import *
from django.db.models import Q
from apps.healthProfiling.models import FamilyComposition, PersonalAddress
from apps.patientrecords.models import Transient


def get_medcon_record_count(pat_id):
    return MedicalConsultation_Record.objects.filter(patrec_id__pat_id=pat_id, medrec_status='completed').count()


def get_patient_parents_info(pat_obj):
    """Get parents information for a patient - reusable function"""
    parents = {}
    
    if pat_obj.pat_type == 'Resident' and pat_obj.rp_id:
        try:
            current_composition = FamilyComposition.objects.filter(
                rp=pat_obj.rp_id
            ).order_by('-fam_id__fam_date_registered', '-fc_id').first()
            
            if current_composition:
                fam_id = current_composition.fam_id
                family_compositions = FamilyComposition.objects.filter(
                    fam_id=fam_id
                ).select_related('rp', 'rp__per')
                
                for composition in family_compositions:
                    role = composition.fc_role.lower()
                    if role in ['mother', 'father'] and composition.rp and hasattr(composition.rp, 'per'):
                        personal = composition.rp.per
                        parents[role] = f"{personal.per_fname} {personal.per_mname} {personal.per_lname}"
        except Exception as e:
            print(f"Error fetching parents info for resident {pat_obj.rp_id.rp_id}: {str(e)}")
    
    elif pat_obj.pat_type == 'Transient' and pat_obj.trans_id:
        trans = pat_obj.trans_id
        if hasattr(trans, 'mother_fname') and (trans.mother_fname or trans.mother_lname):
            parents['mother'] = f"{trans.mother_fname or ''} {trans.mother_mname or ''} {trans.mother_lname or ''}".strip()
        
        if hasattr(trans, 'father_fname') and (trans.father_fname or trans.father_lname):
            parents['father'] = f"{trans.father_fname or ''} {trans.father_mname or ''} {trans.father_lname or ''}".strip()
    
    return parents

def get_patient_address_and_sitio(pat_obj):
    """Get address and sitio information for a patient - reusable function"""
    address = "N/A"
    sitio = "N/A"
    
    try:
        if pat_obj.pat_type == 'Resident' and pat_obj.rp_id and hasattr(pat_obj.rp_id, 'per'):
            per = pat_obj.rp_id.per
            personal_address = PersonalAddress.objects.filter(
                per=per
            ).select_related('add', 'add__sitio').first()
            
            if personal_address and personal_address.add:
                address = personal_address.add.add_street or "N/A"
                if personal_address.add.sitio:
                    sitio = personal_address.add.sitio.sitio_name or "N/A"
        
        elif pat_obj.pat_type == 'Transient' and pat_obj.trans_id:
            trans = pat_obj.trans_id
            if hasattr(trans, 'tradd_id') and trans.tradd_id:
                address = trans.tradd_id.tradd_street or "N/A"
                sitio = trans.tradd_id.tradd_sitio or "N/A"
    
    except Exception as e:
        print(f"Error fetching address for patient {pat_obj.pat_id}: {str(e)}")
    
    return address, sitio

def apply_patient_search_filter(queryset, search_query):
    """Reusable search filter for patients"""
    search_terms = [term.strip() for term in search_query.split(',') if term.strip()]
    if not search_terms:
        return queryset
    name_query = Q()
    patient_id_query = Q()
    person_ids = set()
    transient_ids = set()
    
    for term in search_terms:
        # Search by patient name (both resident and transient)
        name_query |= (
            Q(rp_id__per__per_fname__icontains=term) |
            Q(rp_id__per__per_mname__icontains=term) |
            Q(rp_id__per__per_lname__icontains=term) |
            Q(trans_id__tran_fname__icontains=term) |
            Q(trans_id__tran_mname__icontains=term) |
            Q(trans_id__tran_lname__icontains=term)
        )
        
        # Search by patient ID
        patient_id_query |= Q(pat_id__icontains=term)
        
        # Search by resident profile ID and transient ID
        patient_id_query |= Q(rp_id__rp_id__icontains=term)
        patient_id_query |= Q(trans_id__trans_id__icontains=term)
        
        matching_person_ids = PersonalAddress.objects.filter(
            Q(add__add_external_sitio__icontains=term) |
            Q(add__add_province__icontains=term) |
            Q(add__add_city__icontains=term) |
            Q(add__add_street__icontains=term) |
            Q(add__sitio__sitio_name__icontains=term)
        ).values_list('per', flat=True)
        person_ids.update(matching_person_ids)
        
        # Search by sitio for transients
        matching_transient_ids = Transient.objects.filter(
            Q(tradd_id__tradd_sitio__icontains=term) |
            Q(tradd_id__tradd_street__icontains=term) |
            Q(tradd_id__tradd_barangay__icontains=term) |
            Q(tradd_id__tradd_province__icontains=term) |
            Q(tradd_id__tradd_city__icontains=term)  
        ).values_list('trans_id', flat=True)
        transient_ids.update(matching_transient_ids)
    
    # Combine all search queries
    combined_query = name_query | patient_id_query 
    
    if person_ids:
        combined_query |= Q(rp_id__per__in=person_ids)
    if transient_ids:
        combined_query |= Q(trans_id__in=transient_ids)
    
    return queryset.filter(combined_query)

def apply_patient_type_filter(queryset, patient_type):
    """Reusable patient type filter"""
    search_terms = [term.strip().lower() for term in patient_type.split(',') if term.strip()]
    if not search_terms:
        return queryset    
    type_query = Q()
    for term in search_terms:
        if term in ['resident', 'transient']:
            type_query |= Q(pat_type__iexact=term)
    
    return queryset.filter(type_query) if type_query else queryset