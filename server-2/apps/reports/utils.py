from .models import *
# Local app imports
from .serializers import *
from apps.patientrecords.models import *
from apps.healthProfiling.models import *
from pagination import *
from apps.inventory.models import * 
# Django imports
from django.db.models import (
    Case, When, F, CharField, Q, Prefetch, Count
)
from apps.childhealthservices.models import *
from datetime import datetime, timedelta

def get_childhealth_record_count(pat_id):
    return ChildHealthrecord.objects.filter(patrec_id__pat_id=pat_id).count()

class ChildHealthReportUtils:
   
    @staticmethod
    def apply_sitio_search(queryset, search_query):
        """Search only by sitio or external sitio"""
        search_terms = [term.strip() for term in search_query.split(',') if term.strip()]
        if not search_terms:
            return queryset
        person_ids = set()
        transient_ids = set()
        
        for term in search_terms:
            # Search addresses for regular patients
            matching_person_ids = PersonalAddress.objects.filter(
                Q(add__add_external_sitio__icontains=term) |
                Q(add__sitio__sitio_name__icontains=term)
            ).values_list('per', flat=True)
            person_ids.update(matching_person_ids)
            # Search addresses for transient patients
            matching_transient_ids = Transient.objects.filter(
                Q(tradd_id__tradd_sitio__icontains=term)
            ).values_list('trans_id', flat=True)
            transient_ids.update(matching_transient_ids)
        combined_query = Q()
        if person_ids:
            combined_query |= Q(chhist__chrec__patrec__pat_id__rp_id__per__in=person_ids)
        if transient_ids:
            combined_query |= Q(chhist__chrec__patrec__pat_id__trans_id__in=transient_ids)
        return queryset.filter(combined_query)

    @staticmethod 
    def get_patient_address(patient_obj):
        """Unified address retrieval for both resident and transient patients"""
        try:
            if patient_obj.pat_type == 'Transient' and patient_obj.trans_id:
                trans = patient_obj.trans_id
                if trans.tradd_id:
                    trans_addr = trans.tradd_id
                    sitio = trans_addr.tradd_sitio
                    address_parts = [
                        trans_addr.tradd_street,
                        trans_addr.tradd_barangay,
                        trans_addr.tradd_city,
                        trans_addr.tradd_province,
                        f"Sitio {sitio}" if sitio else None
                    ]
                    return ", ".join(filter(None, address_parts)), sitio, True
            
            elif patient_obj.pat_type == 'Resident' and patient_obj.rp_id:
                rp = patient_obj.rp_id
                if rp.per:
                    if hasattr(rp.per, 'prefetched_personal_addresses'):
                        for addr in rp.per.prefetched_personal_addresses:
                            if addr.add:
                                address = addr.add
                                sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                                address_parts = [
                                    address.add_street,
                                    address.add_barangay,
                                    address.add_city,
                                    address.add_province,
                                    f"Sitio {sitio}" if sitio else None
                                ]
                                return ", ".join(filter(None, address_parts)), sitio, False
                    
                    personal_address = PersonalAddress.objects.filter(
                        per=rp.per
                    ).select_related('add', 'add__sitio').first()
                    
                    if personal_address and personal_address.add:
                        address = personal_address.add
                        sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                        address_parts = [
                            address.add_street,
                            address.add_barangay,
                            address.add_city,
                            address.add_province,
                            f"Sitio {sitio}" if sitio else None
                        ]
                        return ", ".join(filter(None, address_parts)), sitio, False
                
                return None, None, False
            
        except Exception as e:
            print(f"Error getting address: {e}")
            return None, None, None

    @staticmethod
    def get_parents_info(pat_obj):
        """
        Get parents information for a patient based on the reference PatientSerializer logic
        """
        parents = {}
        
        if pat_obj.pat_type == 'Resident' and pat_obj.rp_id:
            try:
                # Get family head info similar to PatientSerializer
                current_composition = FamilyComposition.objects.filter(
                    rp=pat_obj.rp_id
                ).order_by('-fam_id__fam_date_registered', '-fc_id').first()
                
                if current_composition:
                    fam_id = current_composition.fam_id
                    
                    # Get all family members in the same family
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
            if trans.mother_fname or trans.mother_lname:
                parents['mother'] = f"{trans.mother_fname} {trans.mother_mname} {trans.mother_lname}".strip()
            
            if trans.father_fname or trans.father_lname:
                parents['father'] = f"{trans.father_fname} {trans.father_mname} {trans.father_lname}".strip()
        
        return parents

    @staticmethod
    def get_household_no(pat_obj):
        """
        Get household number for a patient based on the reference PatientSerializer logic
        """
        if pat_obj.pat_type == 'Resident' and pat_obj.rp_id:
            try:
                # Get the most recent family composition for this resident
                current_composition = FamilyComposition.objects.filter(
                    rp=pat_obj.rp_id
                ).order_by('-fam_id__fam_date_registered', '-fc_id').first()
                
                if current_composition:
                    return str(current_composition.fam_id.fam_no) if hasattr(current_composition.fam_id, 'fam_no') else 'N/A'
            except Exception as e:
                print(f"Error fetching household number for resident {pat_obj.rp_id.rp_id}: {str(e)}")
        
        return 'N/A'

    @staticmethod
    def calculate_age_in_months(dob, reference_date):
        """
        Calculate age in months based on date of birth and reference date (created_at)
        """
        try:
            if not dob or not reference_date:
                return 0
            
            # Convert reference_date to date if it's datetime
            if hasattr(reference_date, 'date'):
                reference_date = reference_date.date()
            
            # Convert dob to date if it's datetime
            if hasattr(dob, 'date'):
                dob = dob.date()
                
            # Calculate age in months
            age_months = (reference_date.year - dob.year) * 12 + (reference_date.month - dob.month)
            
            # Adjust if the day hasn't been reached yet in the current month
            if reference_date.day < dob.day:
                age_months -= 1
                
            return max(0, age_months)
            
        except (AttributeError, TypeError, ValueError) as e:
            print(f"Error calculating age: {e}")
            return 0

    @staticmethod
    def apply_age_filter(queryset, age_range):
        """Apply age range filter to queryset"""
        try:
            min_age, max_age = map(int, age_range.split('-'))
            filtered_data = []
            for obj in queryset:
                # Get patient's date of birth - both residents and transients
                pat = obj.pat
                dob = None
                
                if pat.pat_type == 'Resident' and hasattr(pat, 'rp_id') and pat.rp_id:
                    dob = pat.rp_id.per.per_dob
                elif pat.pat_type == 'Transient' and hasattr(pat, 'trans_id') and pat.trans_id:
                    dob = pat.trans_id.tran_dob
                
                # Get created_at date
                created_at = obj.created_at
                
                # Calculate age in months
                age_months = ChildHealthReportUtils.calculate_age_in_months(dob, created_at)
                
                if min_age <= age_months <= max_age:
                    filtered_data.append(obj)
            return filtered_data
        except ValueError:
            return queryset

    @staticmethod
    def apply_nutritional_search(queryset, search_query):
        """Search by nutritional status"""
        search_terms = [term.strip().lower() for term in search_query.split(',') if term.strip()]
        if not search_terms:
            return queryset
        status_query = Q()
        for term in search_terms:
            status_query |= (
                Q(wfa__iexact=term) |        # Direct field access
                Q(lhfa__iexact=term) |       # Direct field access
                Q(wfl__iexact=term) |        # Direct field access
                Q(muac_status__iexact=term)  # Direct field access
            )
        
        return queryset.filter(status_query)

    @staticmethod
    def apply_search_filter(queryset, search_query):
        """Search by child/patient name, family number, and sitio - for both residents and transients"""
        search_terms = [term.strip() for term in search_query.split(',') if term.strip()]
        if not search_terms:
            return queryset

        name_query = Q()
        family_no_query = Q()
        person_ids = set()
        transient_ids = set()

        for term in search_terms:
            # Search by child/patient name (both resident and transient)
            name_query |= (
                Q(pat__rp_id__per__per_fname__icontains=term) |
                Q(pat__rp_id__per__per_mname__icontains=term) |
                Q(pat__rp_id__per__per_lname__icontains=term) |
                Q(pat__trans_id__tran_fname__icontains=term) |
                Q(pat__trans_id__tran_mname__icontains=term) |
                Q(pat__trans_id__tran_lname__icontains=term)
            )

            # Search by family number (Note: NutritionalStatus doesn't have direct family_no)
            # You might need to adjust this based on your data model
            # family_no_query |= Q(pat__family_no__icontains=term)  # Adjust if needed

            # Search by sitio for residents (case-insensitive and partial match)
            matching_person_ids = PersonalAddress.objects.filter(
                Q(add__add_external_sitio__icontains=term) |
                Q(add__sitio__sitio_name__icontains=term)
            ).values_list('per', flat=True)
            person_ids.update(matching_person_ids)

            # Search by sitio for transients (case-insensitive and partial match)
            matching_transient_ids = Transient.objects.filter(
                Q(tradd_id__tradd_sitio__icontains=term)
            ).values_list('trans_id', flat=True)
            transient_ids.update(matching_transient_ids)

        # Combine all search queries
        combined_query = name_query | family_no_query
        
        if person_ids:
            combined_query |= Q(pat__rp_id__per__in=person_ids)
        if transient_ids:
            combined_query |= Q(pat__trans_id__in=transient_ids)

        return queryset.filter(combined_query)