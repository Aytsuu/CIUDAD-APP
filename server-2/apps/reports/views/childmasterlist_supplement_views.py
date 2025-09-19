# Standard library imports
from datetime import datetime


# Django imports
from django.db.models import Q, Prefetch
from django.shortcuts import get_object_or_404

# DRF imports
from rest_framework import generics
from rest_framework.response import Response

# Local app imports
from ..models import *
from pagination import *
from ..serializers import *
from apps.patientrecords.models import *
from apps.healthProfiling.models import *
from pagination import *
from apps.inventory.models import *
from apps.childhealthservices.models import * 
from ..utils import *


class ChildHealthSupplementsMasterReport(generics.ListAPIView):
    pagination_class = ExportPagination
    
    def get_queryset(self):
        self.vitamin_a_category = Category.objects.filter(cat_name__icontains='vitamin a').first()
        self.deworming_category = Category.objects.filter(cat_name__icontains='deworming').first() 
        self.mnp_category = Category.objects.filter(cat_name__icontains='mnp').first()

        queryset = ChildHealthrecord.objects.filter(
            child_health_histories__child_health_supplements__isnull=False
        ).select_related(
            'patrec', 
            'patrec__pat_id',  
            'patrec__pat_id__rp_id', 
            'patrec__pat_id__rp_id__per',
            'patrec__pat_id__trans_id', 
            'patrec__pat_id__trans_id__tradd_id'
        ).prefetch_related(
            Prefetch(
                'child_health_histories__child_health_supplements__medrec',
                queryset=MedicineRecord.objects.select_related(
                    'minv_id', 'minv_id__med_id', 'minv_id__med_id__cat'
                )
            ),
            Prefetch(
                'patrec__pat_id__rp_id__household_set',
                queryset=Household.objects.select_related('add', 'add__sitio'),
                to_attr='prefetched_households'
            ),
            Prefetch(
                'patrec__pat_id__rp_id__per__personaladdress_set',
                queryset=PersonalAddress.objects.select_related('add', 'add__sitio'),
                to_attr='prefetched_personal_addresses'
            )
        ).distinct().order_by('created_at')

        search_query = self.request.query_params.get('search', '').strip()
        if search_query and len(search_query) >= 3:
            queryset = self._apply_search_filter(queryset, search_query)

        return queryset

    def _apply_search_filter(self, queryset, search_query):
        search_terms = [term.strip() for term in search_query.split(',') if term.strip()]
        if not search_terms:
            return queryset

        name_query = Q()
        family_no_query = Q()
        person_ids = set()
        transient_ids = set()

        for term in search_terms:
            name_query |= (
                Q(patrec__pat_id__rp_id__per__per_fname__icontains=term) |
                Q(patrec__pat_id__rp_id__per__per_mname__icontains=term) |
                Q(patrec__pat_id__rp_id__per__per_lname__icontains=term) |
                Q(patrec__pat_id__trans_id__tran_fname__icontains=term) |
                Q(patrec__pat_id__trans_id__tran_mname__icontains=term) |
                Q(patrec__pat_id__trans_id__tran_lname__icontains=term)
            )

            family_no_query |= Q(family_no__icontains=term)

            matching_person_ids = PersonalAddress.objects.filter(
                Q(add__add_external_sitio__icontains=term) |
                Q(add__sitio__sitio_name__icontains=term)
            ).values_list('per', flat=True)
            person_ids.update(matching_person_ids)

            matching_transient_ids = Transient.objects.filter(
                Q(tradd_id__tradd_sitio__icontains=term)
            ).values_list('trans_id', flat=True)
            transient_ids.update(matching_transient_ids)

        combined_query = name_query | family_no_query
        if person_ids:
            combined_query |= Q(patrec__pat_id__rp_id__per__in=person_ids)
        if transient_ids:
            combined_query |= Q(patrec__pat_id__trans_id__in=transient_ids)

        return queryset.filter(combined_query)

    def _get_mother_info(self, child):
        try:
            patrec = child.patrec
            
            if hasattr(patrec, 'family_head_info') and patrec.family_head_info:
                family_info = patrec.family_head_info
                if family_info.get('has_mother'):
                    mother = family_info['family_heads']['mother']['personal_info']
                    return f"{mother['per_fname']} {mother.get('per_mname', '')} {mother['per_lname']}".strip()
            
            if patrec.pat_id.pat_type == 'Transient' and hasattr(patrec.pat_id, 'trans_id'):
                trans = patrec.pat_id.trans_id
                return f"{trans.mother_fname or ''} {trans.mother_mname or ''} {trans.mother_lname or ''}".strip()
            
            if patrec.pat_id.pat_type == 'Resident' and hasattr(patrec.pat_id, 'rp_id'):
                rp = patrec.pat_id.rp_id
                
                current_composition = FamilyComposition.objects.filter(
                    rp=rp
                ).order_by('-fam_id__fam_date_registered', '-fc_id').first()
                
                if current_composition:
                    mother_composition = FamilyComposition.objects.filter(
                        fam_id=current_composition.fam_id,
                        fc_role__iexact='mother'
                    ).select_related('rp__per').first()
                    
                    if mother_composition and hasattr(mother_composition.rp, 'per'):
                        mother = mother_composition.rp.per
                        return f"{mother.per_fname} {mother.per_mname or ''} {mother.per_lname}".strip()
        
        except Exception as e:
            print(f"Error getting mother info: {str(e)}")
            import traceback
            traceback.print_exc()
        
        return "Not available"

    def _get_supplement_history(self, child):
        vitamin_a = {
            '6-11': None,
            '12-23': {'1st_dose': None, '2nd_dose': None},
            '24-35': {'1st_dose': None, '2nd_dose': None},
            '36-47': {'1st_dose': None, '2nd_dose': None},
            '48-59': {'1st_dose': None, '2nd_dose': None}
        }
        
        deworming = {
            '12-23': {'1st_dose': None, '2nd_dose': None},
            '24-59': {'1st_dose': None, '2nd_dose': None}
        }
        
        supplement_records = []
        mnp = {
            '6-11': [],
            '12-23': []
        }
        
    
        try:
            if child.patrec.pat_id.pat_type == 'Resident':
                dob = child.patrec.pat_id.rp_id.per.per_dob
            else:
                dob = child.patrec.pat_id.trans_id.tran_dob

            for history in child.child_health_histories.all():
                for supplement in history.child_health_supplements.all():
                    med_rec = supplement.medrec
                    if not med_rec or not hasattr(med_rec, 'minv_id') or not med_rec.minv_id.med_id:
                        continue
                    
                    cat = med_rec.minv_id.med_id.cat
                    supplement_date = med_rec.requested_at.date()
                    age_months = (supplement_date.year - dob.year) * 12 + (supplement_date.month - dob.month)
                    supplement_records.append({
                        'date': supplement_date,
                        'age_months': age_months,
                        'medicine': med_rec.minv_id.med_id.med_name,
                        'category': cat.cat_name if cat else 'Unknown'
                    })
                    if cat == self.vitamin_a_category:
                        if 6 <= age_months <= 11:
                            if not vitamin_a['6-11'] or supplement_date > vitamin_a['6-11']:
                                vitamin_a['6-11'] = supplement_date
                        elif 12 <= age_months <= 23:
                            if not vitamin_a['12-23']['1st_dose']:
                                vitamin_a['12-23']['1st_dose'] = supplement_date
                            elif not vitamin_a['12-23']['2nd_dose'] and supplement_date != vitamin_a['12-23']['1st_dose']:
                                vitamin_a['12-23']['2nd_dose'] = supplement_date
                        elif 24 <= age_months <= 35:
                            if not vitamin_a['24-35']['1st_dose']:
                                vitamin_a['24-35']['1st_dose'] = supplement_date
                            elif not vitamin_a['24-35']['2nd_dose'] and supplement_date != vitamin_a['24-35']['1st_dose']:
                                vitamin_a['24-35']['2nd_dose'] = supplement_date
                        elif 36 <= age_months <= 47:
                            if not vitamin_a['36-47']['1st_dose']:
                                vitamin_a['36-47']['1st_dose'] = supplement_date
                            elif not vitamin_a['36-47']['2nd_dose'] and supplement_date != vitamin_a['36-47']['1st_dose']:
                                vitamin_a['36-47']['2nd_dose'] = supplement_date
                        elif 48 <= age_months <= 59:
                            if not vitamin_a['48-59']['1st_dose']:
                                vitamin_a['48-59']['1st_dose'] = supplement_date
                            elif not vitamin_a['48-59']['2nd_dose'] and supplement_date != vitamin_a['48-59']['1st_dose']:
                                vitamin_a['48-59']['2nd_dose'] = supplement_date
                    
                    elif cat == self.deworming_category:
                        if 12 <= age_months <= 23:
                            if not deworming['12-23']['1st_dose']:
                                deworming['12-23']['1st_dose'] = supplement_date
                            elif not deworming['12-23']['2nd_dose'] and supplement_date != deworming['12-23']['1st_dose']:
                                deworming['12-23']['2nd_dose'] = supplement_date
                        elif 24 <= age_months <= 59:
                            if not deworming['24-59']['1st_dose']:
                                deworming['24-59']['1st_dose'] = supplement_date
                            elif not deworming['24-59']['2nd_dose'] and supplement_date != deworming['24-59']['1st_dose']:
                                deworming['24-59']['2nd_dose'] = supplement_date
                    
                    elif cat == self.mnp_category:
                        if 6 <= age_months <= 11:
                            mnp['6-11'].append(supplement_date)
                        elif 12 <= age_months <= 23:
                            mnp['12-23'].append(supplement_date)

            mnp['6-11'].sort()
            mnp['12-23'].sort()

        except (AttributeError, TypeError, ValueError) as e:
            print(f"Error processing supplements for child {child.id}: {str(e)}")

        return {
            'vitamin_a': vitamin_a,
            'deworming': deworming,
            'mnp': mnp,            
            'all_supplements': supplement_records  # For debugging

        }

    def list(self, request, *args, **kwargs):
        children = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(children)
        if page is not None:
            report_data = self._process_children(page)
            return self.get_paginated_response(report_data)
        
        report_data = self._process_children(children)
        return Response({
            'total_children': len(report_data),
            'children': report_data
        })

    def _process_children(self, children):
        report_data = []
        
        for child in children:
            try:
                if child.patrec.pat_id.pat_type == 'Resident':
                    per = child.patrec.pat_id.rp_id.per
                    dob = per.per_dob
                    sex = per.per_sex
                    child_name = f"{per.per_fname} {per.per_mname or ''} {per.per_lname}".strip()
                else:
                    trans = child.patrec.pat_id.trans_id
                    dob = trans.tran_dob
                    sex = trans.tran_sex
                    child_name = f"{trans.tran_fname} {trans.tran_mname or ''} {trans.tran_lname}".strip()
                    
                age_months = (datetime.now().year - dob.year) * 12 + (datetime.now().month - dob.month)
                
                mother_name = self._get_mother_info(child)
                address_info = get_patient_address(child.patrec.pat_id)
                family_no = child.family_no or 'N/A'
                feeding_type = child.type_of_feeding or 'N/A'

                if 6 <= age_months <= 59:
                    report_data.append({
                        'date_registered': child.created_at.date(),
                        'child_name': child_name,
                        'sex': sex,
                        'date_of_birth': dob,
                        'mother_name': mother_name,
                        'current_age_months': age_months,
                        'address': address_info[0] if address_info[0] else "Address not available",
                        'sitio': address_info[1] if address_info[1] else "",
                        'family_no': family_no,
                        'supplements': self._get_supplement_history(child),
                        'type_of_feeding': feeding_type
                    })
                    
            except (AttributeError, TypeError, ValueError) as e:
                print(f"\nERROR processing child record: {e}")
                continue
        
        return report_data