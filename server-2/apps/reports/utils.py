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

from apps.childhealthservices.models  import *
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