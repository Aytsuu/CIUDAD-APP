# Standard library imports
from collections import defaultdict
from datetime import datetime, timedelta

# Django imports
from django.db.models import (
    Case, When, F, CharField, Q, Prefetch, Count
)
from django.db.models.functions import TruncMonth
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

# DRF imports
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

# Local app imports
from .models import *
from .serializers import *
from .utils import get_childhealth_record_count
from apps.patientrecords.models import *
from apps.healthProfiling.models import *
from pagination import StandardResultsPagination



class ChildHealthRecordsView(generics.ListCreateAPIView):
    queryset = ChildHealthrecord.objects.all()
    serializer_class = ChildHealthrecordSerializer


class ChildHealthHistoryView(generics.ListCreateAPIView):
    queryset = ChildHealth_History.objects.all()
    serializer_class = ChildHealthHistorySerializer
    
class CheckUPChildHealthHistoryView(generics.ListAPIView):
    serializer_class = ChildHealthHistoryFullSerializer

    def get_queryset(self):
        return ChildHealth_History.objects.filter(status="check-up").order_by('-created_at')  # Filter by check-up and order by most recent first
    
class ChildHealthImmunizationStatusListView(generics.ListAPIView):
    serializer_class = ChildHealthHistoryFullSerializer

    def get_queryset(self):
        return ChildHealth_History.objects.filter(status="immunization").order_by('-created_at')  # Filter by check-up and order by most recent first
    
class UpdateChildHealthHistoryView(generics.RetrieveUpdateAPIView):
    queryset = ChildHealth_History.objects.all()
    serializer_class = ChildHealthHistorySerializer
    lookup_field = 'chhist_id'

class PendingMedConChildCountView(APIView):
    def get(self, request, *args, **kwargs):
        count = (
            ChildHealth_History.objects
            .filter(status="check-up")
            .count()
        )
        return Response({"count": count})

class ChildHealthNotesView(generics.ListCreateAPIView):
    queryset = ChildHealthNotes.objects.all()
    serializer_class = ChildHealthNotesSerializer

class ChildHealthNotesUpdateView(generics.RetrieveUpdateAPIView):
    queryset = ChildHealthNotes.objects.all()
    serializer_class = ChildHealthNotesSerializer
 
    def get_object(self):
        chnotes_id = self.kwargs.get("chnotes_id")
        if not chnotes_id:
            raise NotFound(detail="Child health notes ID not provided", code=status.HTTP_400_BAD_REQUEST)
        return get_object_or_404(ChildHealthNotes, chnotes_id=chnotes_id)
    
class DeleteChildHealthNotesView(generics.DestroyAPIView):
    queryset = ChildHealthNotes.objects.all()
    serializer_class = ChildHealthNotesSerializer
    lookup_field = 'chnotes_id'

    
class ChildHealthSupplementsView(generics.ListCreateAPIView):
    queryset = ChildHealthSupplements.objects.all()
    serializer_class = ChildHealthSupplementsSerializer
    
class ChildHealthSupplementStatusView(generics.ListCreateAPIView):
    queryset = ChildHealthSupplementsStatus.objects.all()
    serializer_class = ChildHealthSupplementStatusSerializer


class UpdateChildHealthSupplementsStatusView(generics.RetrieveUpdateAPIView):
    def patch(self, request, *args, **kwargs):
        data = request.data  # Expecting a list of updates
        if not isinstance(data, list) or not data:
            return Response(
                {"detail": "Expected a non-empty list of updates."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated = []
        errors = []

        for item in data:
            chssupplementstat_id = item.get("chssupplementstat_id")
            date_completed = item.get("date_completed")

            if not chssupplementstat_id:
                errors.append(
                    {
                        "error": "Missing chssupplementstat_id",
                        "item": item,
                    }
                )
                continue

            try:
                instance = ChildHealthSupplementsStatus.objects.get(
                    pk=chssupplementstat_id
                )
            except ChildHealthSupplementsStatus.DoesNotExist:
                errors.append(
                    {
                        "error": f"Record with id {chssupplementstat_id} not found",
                    }
                )
                continue

            # Only include the allowed field(s)
            update_data = {}
            if date_completed is not None:
                update_data["date_completed"] = date_completed
           

            serializer = ChildHealthSupplementStatusSerializer(
                instance, data=update_data, partial=True
            )

            if serializer.is_valid():
                serializer.save()
                updated.append(serializer.data)
            else:
                errors.append(
                    {
                        "id": chssupplementstat_id,
                        "errors": serializer.errors,
                    }
                )

        return Response(
            {
                "updated": updated,
                "errors": errors,
            },
            status=status.HTTP_200_OK,
        )

    

class NutritionalStatusView(generics.ListCreateAPIView):
    queryset = NutritionalStatus.objects.all()
    serializer_class = NutritionalStatusSerializerBase
    
    

class ChildHealthVitalSignsView(generics.ListCreateAPIView):
    queryset = ChildHealthVitalSigns.objects.all()
    serializer_class = ChildHealthVitalSignsSerializer
    
class UpdateChildHealthVitalSignsView(generics.RetrieveUpdateAPIView):
    queryset = ChildHealthVitalSigns.objects.all()
    serializer_class = ChildHealthVitalSignsSerializer
    lookup_field = 'chvital_id'
    
    
class ChildHealthNutrionalStatusListView(APIView):
    def get(self, request, chrec_id):
        vitals = ChildHealthVitalSigns.objects.filter(
            chhist__chrec_id=chrec_id
        ).order_by('-created_at')

        if not vitals.exists():
            return Response(
                {"detail": "No vital signs found for this child."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ChildHealthVitalSignsSerializerFull(vitals, many=True)
        return Response(serializer.data)
    

class ExclusiveBFCheckView(generics.ListCreateAPIView):
    queryset = ExclusiveBFCheck.objects.all()
    serializer_class = ExclusiveBFCheckSerializer

    def create(self, request, *args, **kwargs):
        chhist_id = request.data.get("chhist")
        bf_dates = request.data.get("BFdates", [])

        if not chhist_id or not isinstance(bf_dates, list):
            return Response({"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)

        instances = []
        for date in bf_dates:
            instances.append(ExclusiveBFCheck(ebf_date=date, chhist_id=chhist_id))

        ExclusiveBFCheck.objects.bulk_create(instances)

        serializer = self.get_serializer(instances, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ChildHealthImmunizationHistoryView(generics.ListCreateAPIView):
    queryset = ChildHealthImmunizationHistory.objects.all()
    serializer_class = ChildHealthImmunizationHistorySerializer
class DeleteChildHealthImmunizationHistoryView(generics.DestroyAPIView):
    queryset = ChildHealthImmunizationHistory.objects.all()
    serializer_class = ChildHealthImmunizationHistorySerializer
    lookup_field = 'imt_id'

class IndivChildHealthHistoryView(generics.ListAPIView):
    serializer_class = ChildHealthHistoryFullSerializer

    def get_queryset(self):
        chhist_id = self.kwargs['chhist_id']
        return ChildHealth_History.objects.filter(chhist_id=chhist_id, status="recorded").order_by('-created_at')  # Optional: most recent first
    
    
    

class IndivChildHealthHistoryView(generics.ListAPIView):
    serializer_class = ChildHealthrecordSerializerFull

    def get_queryset(self):
        chrec_id = self.kwargs['chrec_id']

        # Prefetch ChildHealth_History and its deep relations
        child_health_history_qs = (
            ChildHealth_History.objects
            .filter(status__in=["recorded", "immunization", "check-up"])
            .select_related('chrec')  # already implied, but safe
            .prefetch_related(
                'child_health_notes',
                'child_health_notes__followv',
                'child_health_notes__staff',
                'child_health_vital_signs',
                'child_health_vital_signs__vital',
                'child_health_vital_signs__bm',
                'child_health_vital_signs__find',
                'child_health_vital_signs__nutritional_status',
                'child_health_supplements',
                'child_health_supplements__medrec',
                'exclusive_bf_checks',
                'immunization_tracking',
                'immunization_tracking__vachist',
                'supplements_statuses',
            )
        )

        return (
            ChildHealthrecord.objects
            .filter(chrec_id=chrec_id)
            .select_related('patrec', 'staff')
            .prefetch_related(
                Prefetch(
                    'child_health_histories',
                    queryset=child_health_history_qs
                ),
                Prefetch('patrec__patient_disabilities')  # For disabilities
            )
        )
        
class GeChildHealthRecordCountView(APIView):
    def get(self, request, pat_id):
        try:
            count = get_childhealth_record_count(pat_id)
            return Response({'pat_id': pat_id, 'childhealthrecord_count': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ChildHealthRecordByPatIDView(APIView):
    def get(self, request, pat_id):
       
        try:
            chrec = ChildHealthrecord.objects.get(
                patrec__pat_id=pat_id,
                patrec__patrec_type="Child Health Record"
            )
        except ChildHealthrecord.DoesNotExist:
            return Response({"detail": "Child health record not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ChildHealthrecordSerializerFull(chrec)
        return Response(serializer.data)
    

class ChildHealthImmunizationCountView(APIView):
    def get(self, request, *args, **kwargs):
        count = (
            ChildHealthrecord.objects
            .filter(child_health_histories__status="immunization")
            .distinct()
            .count()
        )
        return Response({"count": count})
   

class ChildHealthCurrentandLastMonthCountAPIView(APIView):
    def get(self, request):
        try:
            today = datetime.now()
            current_month_start = today.replace(day=1)
            last_month_start = (current_month_start - relativedelta(months=1)).replace(day=1)
            last_month_end = current_month_start - timedelta(days=1)

            # Count records for current month
            current_month_count = ChildHealthVitalSigns.objects.filter(
                bm__created_at__year=current_month_start.year,
                bm__created_at__month=current_month_start.month
            ).count()

            # Count records for last month
            last_month_count = ChildHealthVitalSigns.objects.filter(
                bm__created_at__year=last_month_start.year,
                bm__created_at__month=last_month_start.month
            ).count()

            return Response({
                'success': True,
                'current_month': {
                    'month': current_month_start.strftime('%Y-%m'),
                    'total_records': current_month_count
                },
                'last_month': {
                    'month': last_month_start.strftime('%Y-%m'),
                    'total_records': last_month_count
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)



 
class OPTTrackingViews(APIView):
    def get(self, request, *args, **kwargs):
        opt_tracking = ChildHealthVitalSigns.objects.all().order_by('-created_at')
        serializer = OPTTrackingSerializer(opt_tracking, many=True)
        return Response(serializer.data)
    
    
    
class MonthlyOPTChildHealthSummariesAPIView(APIView):
    pagination_class = StandardResultsPagination

    def get(self, request):
        try:
            queryset = ChildHealthVitalSigns.objects.select_related(
                'bm', 'chhist', 'chhist__chrec', 'chhist__chrec__patrec'
            ).order_by('-bm__created_at')

            # Search query (month name or year)
            search_query = request.GET.get('search', '').strip()

            # Filter by year or year-month
            year_param = request.GET.get('year', 'all')
            if year_param and year_param != 'all':
                try:
                    if '-' in year_param:
                        year, month = map(int, year_param.split('-'))
                        queryset = queryset.filter(
                            bm__created_at__year=year,
                            bm__created_at__month=month
                        )
                    else:
                        year = int(year_param)
                        queryset = queryset.filter(bm__created_at__year=year)
                except ValueError:
                    return Response({
                        'success': False,
                        'error': 'Invalid format for year. Use YYYY or YYYY-MM.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Annotate and count records per month
            monthly_data = queryset.annotate(
                month=TruncMonth('bm__created_at')
            ).values('month').annotate(
                record_count=Count('vital_id')
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
   



# class MonthlyOPTChildHealthReportAPIView(generics.ListAPIView):
#     serializer_class = OPTTrackingSerializer
#     pagination_class = StandardResultsPagination

#     def get_queryset(self):
#         month = self.kwargs.get('month')
#         try:
#             year, month_num = map(int, month.split('-'))
#             start_date = datetime(year, month_num, 1)
#             end_date = datetime(year, month_num + 1, 1) if month_num < 12 else datetime(year + 1, 1, 1)
#             end_date -= timedelta(microseconds=1)
#         except ValueError:
#             return ChildHealthVitalSigns.objects.none()

#         queryset = ChildHealthVitalSigns.objects.filter(
#             bm__created_at__gte=start_date,
#             bm__created_at__lte=end_date
#         ).select_related(
#             'bm', 'chhist', 'chhist__chrec', 'chhist__chrec__patrec',
#             'chhist__chrec__patrec__pat_id', 'chhist__chrec__patrec__pat_id__rp_id',
#             'chhist__chrec__patrec__pat_id__rp_id__per', 'chhist__chrec__patrec__pat_id__trans_id',
#             'chhist__chrec__patrec__pat_id__trans_id__tradd_id'
#         ).prefetch_related(
#             'nutritional_status',
#             Prefetch(
#                 'chhist__chrec__patrec__pat_id__rp_id__per__personaladdress_set',
#                 queryset=PersonalAddress.objects.select_related('add', 'add__sitio'),
#                 to_attr='prefetched_personal_addresses'
#             ),
#             Prefetch(
#                 'chhist__chrec__patrec__pat_id__rp_id__household_set',
#                 queryset=Household.objects.select_related('add', 'add__sitio'),
#                 to_attr='prefetched_households'
#             )
#         ).order_by('bm__created_at')

#         search_query = self.request.query_params.get('search', '').strip()
#         if search_query:
#             queryset = self._apply_search_filter(queryset, search_query)

#         age_range = self.request.query_params.get('age_range', '').strip()
#         if age_range:
#             queryset = self._apply_age_filter(queryset, age_range)

#         return queryset

#     def _parse_age_to_months(self, age_str):
#         """Convert age string to whole number of months"""
#         if not age_str:
#             return 0
            
#         try:
#             # Case 1: "X weeks and Y days"
#             if 'week' in age_str and 'day' in age_str:
#                 parts = age_str.split()
#                 weeks = int(parts[0])
#                 days = int(parts[3])
#                 total_days = weeks * 7 + days
#                 return int(total_days / 30.44)  # Convert to whole number
            
#             # Case 2: "X weeks"
#             elif 'week' in age_str:
#                 weeks = int(age_str.split()[0])
#                 return int((weeks * 7) / 30.44)
                
#             # Case 3: "X months"
#             elif 'month' in age_str:
#                 return int(age_str.split()[0])
                
#             # Case 4: "X years"
#             elif 'year' in age_str:
#                 return int(age_str.split()[0]) * 12
                
#             return 0
#         except (ValueError, IndexError, AttributeError):
#             return 0

#     def _apply_age_filter(self, queryset, age_range):
#         """Apply age range filter to queryset"""
#         try:
#             min_age, max_age = map(int, age_range.split('-'))
#             filtered_data = []
#             for obj in queryset:
#                 age_str = obj.bm.age if hasattr(obj, 'bm') and obj.bm else ''
#                 age_months = self._parse_age_to_months(age_str)
#                 if min_age <= age_months <= max_age:
#                     filtered_data.append(obj)
#             return filtered_data
#         except ValueError:
#             return queryset

#     def _apply_search_filter(self, queryset, search_query):
#         """Apply multi-keyword search filter to queryset"""
#         # Split search terms by comma and remove empty/whitespace-only terms
#         search_terms = [term.strip() for term in search_query.split(',') if term.strip()]
#         if not search_terms:
#             return queryset

#         # Initialize Q objects for different search types
#         name_query = Q()
#         family_no_query = Q()
#         person_ids = set()
#         transient_ids = set()

#         for term in search_terms:
#             # Build name query (search across first, middle, last names)
#             name_query &= (
#                 Q(chhist__chrec__patrec__pat_id__rp_id__per__per_fname__icontains=term) |
#                 Q(chhist__chrec__patrec__pat_id__rp_id__per__per_mname__icontains=term) |
#                 Q(chhist__chrec__patrec__pat_id__rp_id__per__per_lname__icontains=term)
#             )

#             # Build family number query
#             family_no_query |= Q(chhist__chrec__family_no__icontains=term)

#             # Search addresses for resident patients
#             matching_person_ids = PersonalAddress.objects.filter(
#                 Q(add__add_city__icontains=term) |
#                 Q(add__add_barangay__icontains=term) |
#                 Q(add__add_street__icontains=term) |
#                 Q(add__add_external_sitio__icontains=term) |
#                 Q(add__add_province__icontains=term) |
#                 Q(add__sitio__sitio_name__icontains=term)
#             ).values_list('per', flat=True)
#             person_ids.update(matching_person_ids)

#             # Search addresses for transient patients
#             matching_transient_ids = Transient.objects.filter(
#                 Q(tradd_id__tradd_city__icontains=term) |
#                 Q(tradd_id__tradd_barangay__icontains=term) |
#                 Q(tradd_id__tradd_street__icontains=term) |
#                 Q(tradd_id__tradd_sitio__icontains=term) |
#                 Q(tradd_id__tradd_province__icontains=term)
#             ).values_list('trans_id', flat=True)
#             transient_ids.update(matching_transient_ids)

#         # Combine all queries
#         combined_query = name_query | family_no_query
#         if person_ids:
#             combined_query |= Q(chhist__chrec__patrec__pat_id__rp_id__per__in=person_ids)
#         if transient_ids:
#             combined_query |= Q(chhist__chrec__patrec__pat_id__trans_id__in=transient_ids)

#         return queryset.filter(combined_query)

#     def _format_report_data(self, data, queryset_objects=None):
#         report_data = []
        
#         if queryset_objects:
#             for i, entry in enumerate(data):
#                 try:
#                     vs_obj = queryset_objects[i]
#                     vs = entry['vital_signs']
#                     chist = entry['chist_details']
#                     patrec = chist['chrec_details']['patrec_details']['pat_details']

#                     address, sitio, is_transient = self._get_patient_address(vs_obj)

#                     # Calculate age in whole months
#                     age_in_months = 0
#                     if vs.get('bm_details') and vs['bm_details'].get('age'):
#                         age_str = vs['bm_details']['age']
#                         age_in_months = self._parse_age_to_months(age_str)

#                     # Format parents information
#                     parents = {}
#                     family_info = patrec.get('family_head_info', {})
#                     if family_info.get('has_mother'):
#                         mother = family_info['family_heads']['mother']['personal_info']
#                         parents['mother'] = f"{mother['per_fname']} {mother['per_mname']} {mother['per_lname']}"
#                     if family_info.get('has_father'):
#                         father = family_info['family_heads']['father']['personal_info']
#                         parents['father'] = f"{father['per_fname']} {father['per_mname']} {father['per_lname']}"

#                     # Format nutritional status
#                     nutritional_status = {}
#                     if vs.get('nutritional_status'):
#                         ns = vs['nutritional_status']
#                         nutritional_status = {
#                             'wfa': ns.get('wfa'),
#                             'lhfa': ns.get('lhfa'),
#                             'wfl': ns.get('wfl'),
#                             'muac': ns.get('muac'),
#                             'edema': ns.get('edemaSeverity'),
#                             'muac_status': ns.get('muac_status')
#                         }

#                     report_entry = {
#                         'household_no': chist['chrec_details'].get('family_no', 'N/A'),
#                         'child_name': f"{patrec['personal_info']['per_fname']} {patrec['personal_info']['per_mname']} {patrec['personal_info']['per_lname']}",
#                         'sex': patrec['personal_info']['per_sex'],
#                         'date_of_birth': patrec['personal_info']['per_dob'],
#                         'age_in_months': age_in_months,
#                         'parents': parents,
#                         'address': address,
#                         'sitio': sitio,
#                         'transient': is_transient,
#                         'date_of_weighing': vs['bm_details']['created_at'][:10] if vs.get('bm_details') else None,
#                         'age_at_weighing': vs['bm_details']['age'] if vs.get('bm_details') else None,
#                         'weight': vs['bm_details']['weight'] if vs.get('bm_details') else None,
#                         'height': vs['bm_details']['height'] if vs.get('bm_details') else None,
#                         'nutritional_status': nutritional_status,
#                         'type_of_feeding': chist['chrec_details'].get('type_of_feeding')
#                     }

#                     report_data.append(report_entry)
#                 except Exception as e:
#                     print(f"Error formatting report entry {i}: {e}")
#                     continue

#         return {
#             'month': self.kwargs['month'],
#             'total_entries': len(report_data),
#             'report_data': report_data
#         }

#     def _get_patient_address(self, vital_signs_obj):
#         """Helper method to get patient address"""
#         try:
#             patient = vital_signs_obj.chhist.chrec.patrec.pat_id
            
#             if patient.pat_type == 'Transient' and patient.trans_id:
#                 trans = patient.trans_id
#                 if trans.tradd_id:
#                     trans_addr = trans.tradd_id
#                     sitio = trans_addr.tradd_sitio
#                     address_parts = [
#                         trans_addr.tradd_street,
#                         trans_addr.tradd_barangay,
#                         trans_addr.tradd_city,
#                         trans_addr.tradd_province,
#                         f"Sitio {sitio}" if sitio else None
#                     ]
#                     return ", ".join(filter(None, address_parts)), sitio, True
            
#             elif patient.pat_type == 'Resident' and patient.rp_id:
#                 rp = patient.rp_id
#                 if rp.per:
#                     if hasattr(rp.per, 'prefetched_personal_addresses'):
#                         for addr in rp.per.prefetched_personal_addresses:
#                             if addr.add:
#                                 address = addr.add
#                                 sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
#                                 address_parts = [
#                                     address.add_street,
#                                     address.add_barangay,
#                                     address.add_city,
#                                     address.add_province,
#                                     f"Sitio {sitio}" if sitio else None
#                                 ]
#                                 return ", ".join(filter(None, address_parts)), sitio, False
                    
#                     personal_address = PersonalAddress.objects.filter(
#                         per=rp.per
#                     ).select_related('add', 'add__sitio').first()
                    
#                     if personal_address and personal_address.add:
#                         address = personal_address.add
#                         sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
#                         address_parts = [
#                             address.add_street,
#                             address.add_barangay,
#                             address.add_city,
#                             address.add_province,
#                             f"Sitio {sitio}" if sitio else None
#                         ]
#                         return ", ".join(filter(None, address_parts)), sitio, False
                
#                 return None, None, False
            
#         except Exception as e:
#             print(f"Error getting address: {e}")
#             return None, None, None

#     def list(self, request, *args, **kwargs):
#         queryset = self.filter_queryset(self.get_queryset())
#         page = self.paginate_queryset(queryset)

#         if page is not None:
#             serializer = self.get_serializer(page, many=True)
#             return self.get_paginated_response(self._format_report_data(serializer.data, page))

#         serializer = self.get_serializer(queryset, many=True)
#         return Response(self._format_report_data(serializer.data, queryset))

class MonthlyOPTChildHealthReportAPIView(generics.ListAPIView):
    serializer_class = OPTTrackingSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        month = self.kwargs.get('month')
        try:
            year, month_num = map(int, month.split('-'))
            start_date = datetime(year, month_num, 1)
            end_date = datetime(year, month_num + 1, 1) if month_num < 12 else datetime(year + 1, 1, 1)
            end_date -= timedelta(microseconds=1)
        except ValueError:
            return ChildHealthVitalSigns.objects.none()

        queryset = ChildHealthVitalSigns.objects.filter(
            bm__created_at__gte=start_date,
            bm__created_at__lte=end_date
        ).select_related(
            'bm', 'chhist', 'chhist__chrec', 'chhist__chrec__patrec',
            'chhist__chrec__patrec__pat_id', 'chhist__chrec__patrec__pat_id__rp_id',
            'chhist__chrec__patrec__pat_id__rp_id__per', 'chhist__chrec__patrec__pat_id__trans_id',
            'chhist__chrec__patrec__pat_id__trans_id__tradd_id'
        ).prefetch_related(
            'nutritional_status',
            Prefetch(
                'chhist__chrec__patrec__pat_id__rp_id__per__personaladdress_set',
                queryset=PersonalAddress.objects.select_related('add', 'add__sitio'),
                to_attr='prefetched_personal_addresses'
            ),
            Prefetch(
                'chhist__chrec__patrec__pat_id__rp_id__household_set',
                queryset=Household.objects.select_related('add', 'add__sitio'),
                to_attr='prefetched_households'
            )
        ).order_by('bm__created_at')

        # Sitio search
        sitio_search = self.request.query_params.get('sitio', '').strip()
        if sitio_search:
            queryset = self._apply_sitio_search(queryset, sitio_search)

        # Nutritional status search
        nutritional_search = self.request.query_params.get('nutritional_status', '').strip()
        if nutritional_search:
            queryset = self._apply_nutritional_search(queryset, nutritional_search)

        age_range = self.request.query_params.get('age_range', '').strip()
        if age_range:
            queryset = self._apply_age_filter(queryset, age_range)

        return queryset

    def _apply_sitio_search(self, queryset, search_query):
        """Search only by sitio or external sitio - returns empty if no matches"""
        search_terms = [term.strip() for term in search_query.split(',') if term.strip()]
        if not search_terms:
            return queryset.none()  # Return empty if no search terms

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

        # If no matches found in either search, return empty queryset
        if not person_ids and not transient_ids:
            return queryset.none()

        # Build the query
        combined_query = Q()
        
        if person_ids:
            combined_query |= Q(chhist__chrec__patrec__pat_id__rp_id__per__in=person_ids)
        if transient_ids:
            combined_query |= Q(chhist__chrec__patrec__pat_id__trans_id__in=transient_ids)

        return queryset.filter(combined_query)


    def _apply_nutritional_search(self, queryset, search_query):
        """Search by nutritional status"""
        search_terms = [term.strip().lower() for term in search_query.split(',') if term.strip()]
        if not search_terms:
            return queryset

        status_query = Q()
        for term in search_terms:
            status_query |= (
                Q(nutritional_status__wfa__iexact=term) |
                Q(nutritional_status__lhfa__iexact=term) |
                Q(nutritional_status__wfl__iexact=term) |
                Q(nutritional_status__muac_status__iexact=term)
            )
        
        return queryset.filter(status_query)

    def _parse_age_to_months(self, age_str):
        """Convert age string to whole number of months"""
        if not age_str:
            return 0
            
        try:
            # Case 1: "X weeks and Y days"
            if 'week' in age_str and 'day' in age_str:
                parts = age_str.split()
                weeks = int(parts[0])
                days = int(parts[3])
                total_days = weeks * 7 + days
                return int(total_days / 30.44)  # Convert to whole number
            
            # Case 2: "X weeks"
            elif 'week' in age_str:
                weeks = int(age_str.split()[0])
                return int((weeks * 7) / 30.44)
                
            # Case 3: "X months"
            elif 'month' in age_str:
                return int(age_str.split()[0])
                
            # Case 4: "X years"
            elif 'year' in age_str:
                return int(age_str.split()[0]) * 12
                
            return 0
        except (ValueError, IndexError, AttributeError):
            return 0

    def _apply_age_filter(self, queryset, age_range):
        """Apply age range filter to queryset"""
        try:
            min_age, max_age = map(int, age_range.split('-'))
            filtered_data = []
            for obj in queryset:
                age_str = obj.bm.age if hasattr(obj, 'bm') and obj.bm else ''
                age_months = self._parse_age_to_months(age_str)
                if min_age <= age_months <= max_age:
                    filtered_data.append(obj)
            return filtered_data
        except ValueError:
            return queryset

    def _format_report_data(self, data, queryset_objects=None):
        report_data = []
        
        if queryset_objects:
            for i, entry in enumerate(data):
                try:
                    vs_obj = queryset_objects[i]
                    vs = entry['vital_signs']
                    chist = entry['chist_details']
                    patrec = chist['chrec_details']['patrec_details']['pat_details']

                    address, sitio, is_transient = self._get_patient_address(vs_obj)

                    # Calculate age in whole months
                    age_in_months = 0
                    if vs.get('bm_details') and vs['bm_details'].get('age'):
                        age_str = vs['bm_details']['age']
                        age_in_months = self._parse_age_to_months(age_str)

                    # Format parents information
                    parents = {}
                    family_info = patrec.get('family_head_info', {})
                    if family_info.get('has_mother'):
                        mother = family_info['family_heads']['mother']['personal_info']
                        parents['mother'] = f"{mother['per_fname']} {mother['per_mname']} {mother['per_lname']}"
                    if family_info.get('has_father'):
                        father = family_info['family_heads']['father']['personal_info']
                        parents['father'] = f"{father['per_fname']} {father['per_mname']} {father['per_lname']}"

                    # Format nutritional status
                    nutritional_status = {}
                    if vs.get('nutritional_status'):
                        ns = vs['nutritional_status']
                        nutritional_status = {
                            'wfa': ns.get('wfa'),
                            'lhfa': ns.get('lhfa'),
                            'wfl': ns.get('wfl'),
                            'muac': ns.get('muac'),
                            'edema': ns.get('edemaSeverity'),
                            'muac_status': ns.get('muac_status')
                        }

                    report_entry = {
                        'household_no': chist['chrec_details'].get('family_no', 'N/A'),
                        'child_name': f"{patrec['personal_info']['per_fname']} {patrec['personal_info']['per_mname']} {patrec['personal_info']['per_lname']}",
                        'sex': patrec['personal_info']['per_sex'],
                        'date_of_birth': patrec['personal_info']['per_dob'],
                        'age_in_months': age_in_months,
                        'parents': parents,
                        'address': address,
                        'sitio': sitio,
                        'transient': is_transient,
                        'date_of_weighing': vs['bm_details']['created_at'][:10] if vs.get('bm_details') else None,
                        'age_at_weighing': vs['bm_details']['age'] if vs.get('bm_details') else None,
                        'weight': vs['bm_details']['weight'] if vs.get('bm_details') else None,
                        'height': vs['bm_details']['height'] if vs.get('bm_details') else None,
                        'nutritional_status': nutritional_status,
                        'type_of_feeding': chist['chrec_details'].get('type_of_feeding')
                    }

                    report_data.append(report_entry)
                except Exception as e:
                    print(f"Error formatting report entry {i}: {e}")
                    continue

        return {
            'month': self.kwargs['month'],
            'total_entries': len(report_data),
            'report_data': report_data
        }

    def _get_patient_address(self, vital_signs_obj):
        """Helper method to get patient address"""
        try:
            patient = vital_signs_obj.chhist.chrec.patrec.pat_id
            
            if patient.pat_type == 'Transient' and patient.trans_id:
                trans = patient.trans_id
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
            
            elif patient.pat_type == 'Resident' and patient.rp_id:
                rp = patient.rp_id
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

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(self._format_report_data(serializer.data, page))

        serializer = self.get_serializer(queryset, many=True)
        return Response(self._format_report_data(serializer.data, queryset))
    




# =====OPT  SUMMARY=====


class OPTSummaryAllMonths(APIView):
    def get(self, request):
        try:
            # Base queryset with all necessary relations
            queryset = ChildHealthVitalSigns.objects.select_related(
                'bm', 'chhist', 'chhist__chrec', 'chhist__chrec__patrec',
                'chhist__chrec__patrec__pat_id', 'chhist__chrec__patrec__pat_id__rp_id',
                'chhist__chrec__patrec__pat_id__rp_id__per', 'chhist__chrec__patrec__pat_id__trans_id'
            ).annotate(
                sex=Case(
                    When(chhist__chrec__patrec__pat_id__pat_type='Resident',
                         then=F('chhist__chrec__patrec__pat_id__rp_id__per__per_sex')),
                    When(chhist__chrec__patrec__pat_id__pat_type='Transient',
                         then=F('chhist__chrec__patrec__pat_id__trans_id__tran_sex')),
                    output_field=CharField()
                )
            ).order_by('-bm__created_at')

            # Search query (month name or year)
            search_query = request.GET.get('search', '').strip()

            # Filter by year or year-month
            year_param = request.GET.get('year', 'all')
            if year_param and year_param != 'all':
                try:
                    if '-' in year_param:
                        year, month = map(int, year_param.split('-'))
                        queryset = queryset.filter(
                            bm__created_at__year=year,
                            bm__created_at__month=month
                        )
                    else:
                        year = int(year_param)
                        queryset = queryset.filter(bm__created_at__year=year)
                except ValueError:
                    return Response({
                        'success': False,
                        'error': 'Invalid format for year. Use YYYY or YYYY-MM.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Annotate and count records per month with gender breakdown
            monthly_data = queryset.annotate(
                month=TruncMonth('bm__created_at')
            ).values('month').annotate(
                record_count=Count('vital_id'),
                male_count=Count('vital_id', filter=Q(sex='Male')),
                female_count=Count('vital_id', filter=Q(sex='Female'))
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
                    'record_count': item['record_count'],
                    'gender_totals': {
                        'Male': item['male_count'],
                        'Female': item['female_count']
                    }
                })

            # Calculate overall totals
            overall_totals = {
                'Male': sum(item['male_count'] for item in monthly_data),
                'Female': sum(item['female_count'] for item in monthly_data)
            }

            return Response({
                'success': True,
                'data': formatted_data,
                'total_months': len(formatted_data),
                'overall_totals': overall_totals
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
  
  
class MonthlyOPTSummaryDetailedReport(generics.ListAPIView):
    serializer_class = OPTTrackingSerializer
    pagination_class = None

    AGE_BUCKETS = [
        (0, 5, "0-5"),
        (6, 11, "6-11"),
        (12, 23, "12-23"),
        (24, 35, "24-35"),
        (36, 47, "36-47"),
        (48, 59, "48-59"),
        (60, 71, "60-71"),
    ]

    # Define all possible status categories and their values
    STATUS_CATEGORIES = {
        "WFA": ["N", "UW", "SUW","OW"],  # Weight-for-age
        "HFA": ["N", "ST", "SST", "T"],  # Height-for-age
        "WFH": ["N", "W", "SW", "OW"]   # Weight-for-height
    }

    def get_queryset(self):
        month = self.kwargs.get('month')
        try:
            year, month_num = map(int, month.split('-'))
            start_date = datetime(year, month_num, 1)
            end_date = datetime(year, month_num + 1, 1) if month_num < 12 else datetime(year + 1, 1, 1)
            end_date -= timedelta(microseconds=1)
        except ValueError:
            return ChildHealthVitalSigns.objects.none()

        queryset = ChildHealthVitalSigns.objects.filter(
            bm__created_at__gte=start_date,
            bm__created_at__lte=end_date
        ).annotate(
            sex=Case(
                When(chhist__chrec__patrec__pat_id__pat_type='Resident',
                     then=F('chhist__chrec__patrec__pat_id__rp_id__per__per_sex')),
                When(chhist__chrec__patrec__pat_id__pat_type='Transient',
                     then=F('chhist__chrec__patrec__pat_id__trans_id__tran_sex')),
                output_field=CharField()
            )
        ).select_related(
            'bm', 'chhist', 'chhist__chrec', 'chhist__chrec__patrec',
            'chhist__chrec__patrec__pat_id', 'chhist__chrec__patrec__pat_id__rp_id',
            'chhist__chrec__patrec__pat_id__rp_id__per', 'chhist__chrec__patrec__pat_id__trans_id',
            'chhist__chrec__patrec__pat_id__trans_id__tradd_id'
        ).prefetch_related('nutritional_status')

        # Add sitio search functionality
        sitio_search = self.request.query_params.get('sitio', '').strip()
        if sitio_search:
            queryset = self._apply_sitio_search(queryset, sitio_search)

        return queryset

    def _apply_sitio_search(self, queryset, search_query):
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

        # Build the query
        combined_query = Q()
        
        if person_ids:
            combined_query |= Q(chhist__chrec__patrec__pat_id__rp_id__per__in=person_ids)
        if transient_ids:
            combined_query |= Q(chhist__chrec__patrec__pat_id__trans_id__in=transient_ids)

        return queryset.filter(combined_query)

    def _parse_age_to_months(self, age_str):
        if not age_str:
            return 0
        try:
            if 'week' in age_str and 'day' in age_str:
                parts = age_str.split()
                weeks = int(parts[0])
                days = int(parts[3])
                total_days = weeks * 7 + days
                return int(total_days / 30.44)
            elif 'week' in age_str:
                weeks = int(age_str.split()[0])
                return int((weeks * 7) / 30.44)
            elif 'month' in age_str:
                return int(age_str.split()[0])
            elif 'year' in age_str:
                return int(age_str.split()[0]) * 12
            return 0
        except (ValueError, IndexError, AttributeError):
            return 0

    def _get_age_bucket(self, age_months):
        for min_age, max_age, label in self.AGE_BUCKETS:
            if min_age <= age_months <= max_age:
                return label
        return None

    def _initialize_report_structure(self):
        """Initialize the complete report structure with all categories and age groups"""
        report_data = {}
        
        for category, statuses in self.STATUS_CATEGORIES.items():
            report_data[category] = {
                "age_groups": {},
                "totals": {"Male": 0, "Female": 0}
            }
            
            # Initialize all age groups with all statuses
            for _, _, age_label in self.AGE_BUCKETS:
                report_data[category]["age_groups"][age_label] = {
                    status: {"Male": 0, "Female": 0} for status in statuses
                }
                # Add Total field for each age group
                report_data[category]["age_groups"][age_label]["Total"] = {"Male": 0, "Female": 0}
        
        return report_data

    def _count_statuses(self, queryset):
        report_data = self._initialize_report_structure()
        overall_totals = {"Male": 0, "Female": 0}

        for obj in queryset:
            age_months = self._parse_age_to_months(obj.bm.age)
            age_bucket = self._get_age_bucket(age_months)
            if not age_bucket:
                continue

            sex = (obj.sex or "").strip()
            if sex not in ["Male", "Female"]:
                continue

            ns = obj.nutritional_status.first()
            if not ns:
                continue

            # Process each category
            for category, statuses in self.STATUS_CATEGORIES.items():
                status_value = getattr(ns, {
                    "WFA": "wfa",
                    "HFA": "lhfa",
                    "WFH": "wfl"
                }[category], None)
                
                if status_value in statuses:
                    # Update specific status count
                    report_data[category]["age_groups"][age_bucket][status_value][sex] += 1
                    # Update age group total
                    report_data[category]["age_groups"][age_bucket]["Total"][sex] += 1
                    # Update category total
                    report_data[category]["totals"][sex] += 1
                    # Update overall total
                    overall_totals[sex] += 1

        # Add overall totals to the report
        report_data["overall_totals"] = overall_totals
        return report_data

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        table_counts = self._count_statuses(queryset)

        # Get the sitio search parameter if it exists
        sitio_search = request.query_params.get('sitio', '').strip()

        return Response({
            "month": self.kwargs.get("month"),
            "sitio_filter": sitio_search if sitio_search else "All Sitios",
            "report": table_counts
        })