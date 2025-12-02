# Standard library imports
from datetime import datetime, timedelta
from django.db.models import ( Q, Prefetch, Count)
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

# Local app imports
from apps.childhealthservices.models import *
from apps.childhealthservices.serializers import *
from ..utils import *
from apps.patientrecords.models import *
from apps.healthProfiling.models import *
from pagination import *
from apps.inventory.models import * 
from apps.patientrecords.serializers.bodymesurement_serializers import *

class MonthlyOPTChildHealthSummariesAPIView(APIView):
    pagination_class = StandardResultsPagination

    def get(self, request):
        try:
            # Include both residents and transients, filter for OPT records only
            queryset = BodyMeasurement.objects.filter(is_opt=True).select_related(
                 'pat', 'pat__rp_id', 'pat__trans_id'  # Added pat__trans_id for transient data
            ).order_by('-created_at')

            # Search query (month name or year)
            search_query = request.GET.get('search', '').strip()

            # Filter by year or year-month
            year_param = request.GET.get('year', 'all')
            if year_param and year_param != 'all':
                try:
                    if '-' in year_param:
                        year, month = map(int, year_param.split('-'))
                        queryset = queryset.filter(
                            created_at__year=year,
                            created_at__month=month
                        )
                    else:
                        year = int(year_param)
                        queryset = queryset.filter(created_at__year=year)
                except ValueError:
                    return Response({
                        'success': False,
                        'error': 'Invalid format for year. Use YYYY or YYYY-MM.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Annotate and count records per month
            monthly_data = queryset.annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                record_count=Count('bm_id')  # Changed from 'nutstat_id' to 'bm_id'
            ).order_by('-month')

            formatted_data = []
            for item in monthly_data:
                month_str = item['month'].strftime('%Y-%m')
                month_name = item['month'].strftime('%B %Y')

                # Apply search filter if provided
                if search_query and search_query.lower() not in month_name.lower():
                    continue

                formatted_data.append({
                    'month': month_str,
                    'month_name': month_name,
                    'record_count': item['record_count']
                })

            # Pagination
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(formatted_data, request)
            if page is not None:
                return paginator.get_paginated_response({
                    'success': True,
                    'data': page,
                    'total_months': len(formatted_data)
                })

            return Response({
                'success': True,
                'data': formatted_data,
                'total_months': len(formatted_data)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
# NOW THE REFACTORED API VIEW USING THE REUSABLE FUNCTIONS
class MonthlyOPTChildHealthReportAPIView(generics.ListAPIView):
    serializer_class = BodyMeasurementSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        month = self.kwargs.get('month')
        try:
            year, month_num = map(int, month.split('-'))
            start_date = datetime(year, month_num, 1)
            end_date = datetime(year, month_num + 1, 1) if month_num < 12 else datetime(year + 1, 1, 1)
            end_date -= timedelta(microseconds=1)
        except ValueError:
            return BodyMeasurement.objects.none()

        # Include both residents and transients
        queryset = BodyMeasurement.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date,
            is_opt=True
        ).select_related(
            'pat', 'pat__rp_id', 'pat__rp_id__per', 'pat__trans_id'
        ).prefetch_related(
            Prefetch(
                'pat__rp_id__per__personal_addresses',
                queryset=PersonalAddress.objects.select_related('add', 'add__sitio'),
                to_attr='prefetched_personal_addresses'
            ),
            Prefetch(
                'pat__rp_id__household_set',
                queryset=Household.objects.select_related('add', 'add__sitio'),
                to_attr='prefetched_households'
            )
        ).order_by('created_at')

        # Track if any filter is applied
        filters_applied = False
        original_count = queryset.count()

        # Combined search (child/patient name, family number, and sitio)
        search_query = self.request.query_params.get('search', '').strip()
        sitio_search = self.request.query_params.get('sitio', '').strip()
        
        # Combine search and sitio parameters
        combined_search_terms = []
        if search_query and len(search_query) >= 3:
            combined_search_terms.append(search_query)
        if sitio_search:
            combined_search_terms.append(sitio_search)
        
        if combined_search_terms:
            filters_applied = True
            combined_search = ','.join(combined_search_terms)
            queryset = apply_search_filter_to_body_measurement(queryset, combined_search)
            if queryset.count() == 0 and original_count > 0:
                return BodyMeasurement.objects.none()

        # Nutritional status search
        nutritional_search = self.request.query_params.get('nutritional_status', '').strip()
        if nutritional_search:
            filters_applied = True
            queryset = apply_nutritional_search_to_body_measurement(queryset, nutritional_search)
            if queryset.count() == 0 and original_count > 0:
                return BodyMeasurement.objects.none()

        # Age range filter
        age_range = self.request.query_params.get('age_range', '').strip()
        if age_range:
            filters_applied = True
            queryset = apply_age_filter_to_body_measurement(queryset, age_range)
            if not queryset and original_count > 0:
                return BodyMeasurement.objects.none()

        return queryset

    def _get_family_planning_method(self, patient_obj):
        """
        Returns the latest family planning method used (from FP_type.fpt_method_used).
        Fetches the most recent FP_Record, then its associated FP_type.
        Returns None if no records exist.
        Uses the same logic as PatientSerializer.get_family_planning_method.
        """
        try:
            latest_fp_record = patient_obj.fp_records.order_by('-created_at').first()
            
            if latest_fp_record:
                fp_type = latest_fp_record.fp_type_set.first()
                if fp_type:
                    return fp_type.fpt_method_used
            
            return None
        except Exception as e:
            print(f"Error getting family planning method for patient {patient_obj.pat_id}: {e}")
            return None

    def format_body_measurement_report_data(self, data, queryset_objects, month=None):
        """Format BodyMeasurement data for report output"""
        report_data = []
        
        if queryset_objects:
            for i, entry in enumerate(data):
                try:
                    bm_obj = queryset_objects[i]
                    pat = entry.get('patient_details', {})
                    # Get child name from pat_details.personal_info
                    pat_details = entry.get('pat_details', {})
                    personal_info = pat_details.get('personal_info', {})
                    
                    child_fname = personal_info.get('per_fname', '')
                    child_mname = personal_info.get('per_mname', '')
                    child_lname = personal_info.get('per_lname', '')
                    child_fname = child_fname if child_fname else ''
                    child_mname = child_mname if child_mname else ''
                    child_lname = child_lname if child_lname else ''
                    child_name = f"{child_fname} {child_mname} {child_lname}".strip()

                    
                    # Get address information for both residents and transients
                    address, sitio, is_transient = get_patient_address(bm_obj.pat)

                    # Get patient's date of birth, sex, and created_at date
                    pat_obj = bm_obj.pat
                    dob = None
                    sex = None
                    
                    if pat_obj.pat_type == 'Resident' and hasattr(pat_obj, 'rp_id') and pat_obj.rp_id:
                        dob = pat_obj.rp_id.per.per_dob
                        sex = pat_obj.rp_id.per.per_sex
                    elif pat_obj.pat_type == 'Transient' and hasattr(pat_obj, 'trans_id') and pat_obj.trans_id:
                        dob = pat_obj.trans_id.tran_dob
                        sex = pat_obj.trans_id.tran_sex
                    
                    # Get created_at date
                    created_at = bm_obj.created_at
                    
                    # Calculate age in months
                    age_in_months = calculate_age_in_months(dob, created_at)

                    # Get household number using the same logic as PatientSerializer
                    household_no = get_household_no(pat_obj)

                    # Get parents information using the same logic as PatientSerializer
                    parents = get_parents_info(pat_obj)

                    # Get family planning method using the same logic as PatientSerializer
                    family_planning_method = self._get_family_planning_method(pat_obj)

                    # Format nutritional status (direct from the object)
                    nutritional_status = {
                        'wfa': bm_obj.wfa,
                        'lhfa': bm_obj.lhfa,
                        'wfl': bm_obj.wfl,
                        'muac': bm_obj.muac,
                        'edema': bm_obj.edemaSeverity,
                        'muac_status': bm_obj.muac_status
                    }

                    report_entry = {
                        'household_no': household_no,
                        'child_name': child_name,
                        'sex': sex,
                        'date_of_birth': dob,
                        'age_in_months': age_in_months,
                        'parents': parents,
                        'address': address,
                        'sitio': sitio,
                        'transient': is_transient,
                        'date_of_weighing': entry.get('created_at', '')[:10],
                        'age_at_weighing': age_in_months,
                        'weight': entry.get('weight'),
                        'height': entry.get('height'),
                        'nutritional_status': nutritional_status,
                        'type_of_feeding': 'N/A',
                        'family_planning_method': family_planning_method  # Add family planning method
                    }

                    report_data.append(report_entry)
                except Exception as e:
                    print(f"Error formatting report entry {i}: {e}")
                    continue

        result = {
            'total_entries': len(report_data),
            'report_data': report_data
        }
        
        if month:
            result['month'] = month
            
        return result

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            formatted_data = self.format_body_measurement_report_data(serializer.data, page, self.kwargs['month'])
            return self.get_paginated_response(formatted_data)

        serializer = self.get_serializer(queryset, many=True)
        formatted_data = self.format_body_measurement_report_data(serializer.data, queryset, self.kwargs['month'])
        return Response(formatted_data)


class BodyMeasurementSerializer(serializers.ModelSerializer):
    pat_details = PatientSerializer(source='pat', read_only=True)
    class Meta:
        model = BodyMeasurement
        fields = '__all__'



class PatientSerializer(serializers.ModelSerializer):
    personal_info = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    rp_id = ResidentProfileMinimalSerializer(read_only=True)
    family_compositions = serializers.SerializerMethodField()
    households = serializers.SerializerMethodField()
    family = serializers.SerializerMethodField()
    family_head_info = serializers.SerializerMethodField()
    spouse_info = serializers.SerializerMethodField()
    additional_info = serializers.SerializerMethodField()
    completed_pregnancy_count = serializers.IntegerField(read_only=True)
    family_planning_method = serializers.SerializerMethodField()
    
    
    class Meta:
        model = Patient
        fields = '__all__'

    def get_family_planning_method(self, obj):
        """
        Returns the latest family planning method used (from FP_type.fpt_method_used).
        Fetches the most recent FP_Record, then its associated FP_type.
        Returns None if no records exist.
        """
        latest_fp_record = obj.fp_records.order_by('-created_at').first()
        
        if latest_fp_record:
            fp_type = latest_fp_record.fp_type_set.first()
            if fp_type:
                return fp_type.fpt_method_used
        
        return None
    
    def get_personal_info(self, obj):
        return get_personal_info(obj, context=self.context)

    def get_family_compositions(self, obj):
        if obj.pat_type == 'Resident' and obj.rp_id:
            try:
                current_compositions = FamilyComposition.objects.filter(
                    rp=obj.rp_id
                ).order_by('-fam_id__fam_date_registered', '-fc_id').first()

                if not current_compositions:
                    return []

                all_fam_composition = FamilyComposition.objects.filter(
                    fam_id=current_compositions.fam_id
                ).select_related('rp', 'rp__per')
                return FCWithProfileDataSerializer(all_fam_composition, many=True, context=self.context).data
            except Exception as e:
                print(f'Error fetching family compositions for resident {obj.rp_id.rp_id}: {str(e)}')
                return []
        return []
    

    def get_family(self, obj):
        return get_family(obj)

    def get_mother_tt_status(self, mother_rp):
        """Method to retrieve a mother's TT Status"""
        try:
            tt_qs = TT_Status.objects.filter(
                pat_id__rp_id=mother_rp
            ).order_by('-tts_date_given', '-tts_id')

            if tt_qs.exists():
                return tt_qs.first().tts_status
            return 'No TT Status found'
        
        except Exception as e:
            print(f'Error in getting mother tt status: {str(e)}')
            return f'TT Status not found - {str(e)}'

    def get_family_head_info(self, obj):
        return get_family_head_info(obj, context=self.context)

    def get_households(self, obj):
        if obj.pat_type == 'Resident' and obj.rp_id and hasattr(obj.rp_id, 'per'):
            rp_ids = obj.rp_id.per.personal_information.all()
            households = Household.objects.filter(rp__in=rp_ids)
            return HouseholdMinimalSerializer(households, many=True, context=self.context).data
        return []

    def get_address(self, obj):
            return get_address(obj)

    def get_spouse_info(self, obj):
        try:
            if obj.pat_type == 'Resident' and obj.rp_id:
                family_heads_info = self.get_family_head_info(obj)
                current_family_info = self.get_family(obj)
                
                if not family_heads_info or not current_family_info:
                    medical_spouse = self._check_medical_records_for_spouse(obj)
                    if not medical_spouse.get('spouse_exists', False):
                        return {
                            'spouse_exists': False,
                            'allow_spouse_insertion': True,
                            'reason': 'No family composition found - can add spouse'
                        }
                    return medical_spouse
                
                current_role = current_family_info['fc_role'].lower()
                family_heads = family_heads_info['family_heads']
                
                if current_role not in ['mother', 'father']:
                    medical_spouse = self._check_medical_records_for_spouse(obj)
                    
                    if not medical_spouse.get('spouse_exists', False):
                        return {
                            'spouse_exists': False,
                            'allow_spouse_insertion': True,
                            'reason': f'Resident has {current_role} role - can add spouse independently'
                        }
                    
                    return medical_spouse
                
                spouse_role = 'father' if current_role == 'mother' else 'mother'
                
                if spouse_role in family_heads:
                    spouse_info = family_heads[spouse_role]
                    personal_info = spouse_info['personal_info']
                    
                    return {
                        'spouse_exists': True,
                        'spouse_source': 'family_composition',
                        'spouse_info': {
                            'rp_id': spouse_info['rp_id'],
                            'spouse_lname': personal_info.get('per_lname', ''),
                            'spouse_fname': personal_info.get('per_fname', ''),
                            'spouse_mname': personal_info.get('per_mname', ''),
                            'spouse_dob': personal_info.get('per_dob', ''),
                            'spouse_occupation': personal_info.get('per_occupation', ''),
                            'fc_role': spouse_info['role'],
                            'composition_id': spouse_info['composition_id']
                        }
                    }
                else:
                    spouse_role_title = spouse_role.title()
                    return {
                        'spouse_exists': False,
                        'allow_spouse_insertion': True,
                        'reason': f'{current_role.title()} role found but no {spouse_role_title} in family composition'
                    }
            
            elif obj.pat_type == 'Transient':
                medical_spouse = self._check_medical_records_for_spouse(obj)
                
                if not medical_spouse.get('spouse_exists', False):
                    return {
                        'spouse_exists': False,
                        'allow_spouse_insertion': True,
                        'reason': 'Transient patient - can add spouse'
                    }
                
                return medical_spouse
            
            else:
                return {
                    'spouse_exists': False,
                    'allow_spouse_insertion': True,
                    'reason': 'Unknown patient type - can add spouse'
                }
        
        except Exception as e:
            print(f"Error in get_spouse_info: {str(e)}")
            return {
                'spouse_exists': False,
                'allow_spouse_insertion': True,
                'reason': f'Error occurred: {str(e)}'
            }


    def _check_medical_records_for_spouse(self, obj):
        try:
            family_planning_with_spouse = FP_Record.objects.filter(
                patrec_id__pat_id=obj,
                spouse_id__isnull=False
            ).select_related('spouse').order_by('-created_at').first()
            
            if family_planning_with_spouse and family_planning_with_spouse.spouse_id:
                return {
                    'spouse_exists': True,
                    'spouse_source': 'family_planning_record',
                    'spouse_info': SpouseSerializer(family_planning_with_spouse.spouse_id, context=self.context).data
                }

            postpartum_with_spouse = PostpartumRecord.objects.filter(
                patrec_id__pat_id=obj,
                spouse_id__isnull=False
            ).select_related('spouse_id').order_by('-created_at').first()
            
            if postpartum_with_spouse and postpartum_with_spouse.spouse_id:
                return {
                    'spouse_exists': True,
                    'spouse_source': 'postpartum_record',
                    'spouse_info': SpouseSerializer(postpartum_with_spouse.spouse_id, context=self.context).data
                }
            
            prental_with_spouse = Prenatal_Form.objects.filter(
                patrec_id__pat_id=obj,
                spouse_id__isnull=False
            ).select_related('spouse_id').order_by('-created_at').first()
            
            if prental_with_spouse and prental_with_spouse.spouse_id:
                return {
                    'spouse_exists': True,
                    'spouse_source': 'prenatal_form',
                    'spouse_info': SpouseSerializer(prental_with_spouse.spouse_id, context=self.context).data
                }
            
            return {
                'spouse_exists': False,
                'allow_spouse_insertion': True,
                'reason': 'No spouse found in family composition or medical records'
            }

        except Exception as e:
            print(f"Error checking medical records for spouse: {str(e)}")
            return {
                'spouse_exists': False,
                'allow_spouse_insertion': True,
                'reason': f'Error in medical records check: {str(e)}'
            }

    def _get_family_head_address(self, rp):
        """
        Helper method to get address information for a family head (resident profile).
        Similar to the main get_address method but for family head members.
        """
        try:
            # First try to get personal address
            personal_address = PersonalAddress.objects.select_related('add', 'add__sitio').filter(per=rp.per).first()
            if personal_address and personal_address.add:
                address = personal_address.add
                sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                address_parts = [
                    address.add_barangay if address.add_barangay else None,
                    address.add_city if address.add_city else None,
                    address.add_province if address.add_province else None,
                    address.add_street if address.add_street else None,
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

            # Fallback to household address
            household = Household.objects.select_related('add', 'add__sitio').filter(rp=rp).first()
            if household and household.add:
                address = household.add
                sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                address_parts = [
                    address.add_barangay if address.add_barangay else None,
                    address.add_city if address.add_city else None,
                    address.add_province if address.add_province else None,
                    address.add_street if address.add_street else None,
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
            
        except Exception as e:
            print(f"Error retrieving family head address for rp_id {rp.rp_id}: {str(e)}")
            return None
        
    def get_additional_info(self, obj):
        try:
            additional_info = {}

            # Case 1: Resident patient with rp_id
            if obj.pat_id and obj.rp_id:
                # philhealth from HealthRelatedDetails (resident)
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
                        child_dependents = self._get_child_dependents(obj, current_composition)
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
            if obj.pat_id and obj.trans_id:
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


    def _get_child_dependents(self, patient_obj, mother_composition):
        """
        Helper method to get all child dependents for a MOTHER patient.
        Returns list of child information including chrec_id and pat_id.
        """
        try:
            child_dependents = []
            fam_id = mother_composition.fam_id
            
            # Get all children (DEPENDENT and INDEPENDENT) in this family
            child_compositions = FamilyComposition.objects.filter(
                fam_id=fam_id,
                fc_role__in=['DEPENDENT', 'INDEPENDENT', 'Dependent', 'Independent', 'dependent', 'independent']
            ).select_related('rp', 'rp__per')
            
            for child_comp in child_compositions:
                child_rp = child_comp.rp
                child_personal = child_rp.per
                
                # Get patient record for this child
                child_patients = Patient.objects.filter(rp_id=child_rp)
                
                for child_patient in child_patients:
                    # Get patient records
                    patient_records = PatientRecord.objects.filter(pat_id=child_patient)
                    
                    for patrec in patient_records:
                        # Get child health records
                        child_health_records = ChildHealthrecord.objects.filter(
                            patrec=patrec
                        ).order_by('-created_at')
                        
                        # Calculate age
                        age = None
                        if child_personal.per_dob:
                            today = date.today()
                            age = today.year - child_personal.per_dob.year - (
                                (today.month, today.day) < 
                                (child_personal.per_dob.month, child_personal.per_dob.day)
                            )
                        
                        for chrec in child_health_records:
                            child_info = {
                                'chrec_id': chrec.chrec_id,
                                'pat_id': child_patient.pat_id,
                                'patrec_id': patrec.patrec_id,
                                'rp_id': child_rp.rp_id,
                                'child_name': f"{child_personal.per_fname} {child_personal.per_mname or ''} {child_personal.per_lname}".strip(),
                                'child_age': age,
                                'child_sex': child_personal.per_sex,
                                'child_dob': child_personal.per_dob,
                                'birth_order': chrec.birth_order,
                                'ufc_no': chrec.ufc_no,
                                'family_no': chrec.family_no,
                                'fam_id': str(fam_id),
                                'pregnancy_id': chrec.pregnancy_id,
                            }
                            child_dependents.append(child_info)
            
            # Remove duplicates based on chrec_id and sort by birth order
            unique_children = {child['chrec_id']: child for child in child_dependents}.values()
            sorted_children = sorted(unique_children, key=lambda x: x.get('birth_order', 0))
            
            return list(sorted_children) if sorted_children else None
            
        except Exception as e:
            print(f"Error getting child dependents: {str(e)}")
            import traceback
            traceback.print_exc()
            return None    