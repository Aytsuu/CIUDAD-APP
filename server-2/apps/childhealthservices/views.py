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
from .utils import *
from apps.patientrecords.models import *
from apps.healthProfiling.models import *
from pagination import *
from apps.inventory.models import * 



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
    serializer_class = NutritionalStatusSerializerBase
    
    def get_queryset(self):
        queryset = NutritionalStatus.objects.all()
        pat_id = self.kwargs.get('pat_id')
        
        if pat_id:
            queryset = queryset.filter(pat_id=pat_id)
        
        return queryset
    


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
   



class MonthlyNutritionalStatusViewChart(generics.ListAPIView):
    serializer_class = NutritionalStatusSerializerBase
    
    def get_queryset(self):
        """
        Get nutritional status records for a specific month
        Defaults to current month if no parameters provided
        """
        # Get month and year from query parameters
        month = self.request.query_params.get('month', None)
        year = self.request.query_params.get('year', None)
        
        # If no parameters provided, use current month
        if not month or not year:
            current_date = timezone.now()
            month = current_date.month
            year = current_date.year
        
        # Filter by month and year
        queryset = NutritionalStatus.objects.filter(
            created_at__month=month,
            created_at__year=year
        ).order_by('-created_at')
        
        return queryset
    
    
# class MonthlyOPTChildHealthSummariesAPIView(APIView):
#     pagination_class = StandardResultsPagination

#     def get(self, request):
#         try:
#             queryset = ChildHealthVitalSigns.objects.select_related(
#                 'bm', 'chhist', 'chhist__chrec', 'chhist__chrec__patrec'
#             ).order_by('-bm__created_at')

#             # Search query (month name or year)
#             search_query = request.GET.get('search', '').strip()

#             # Filter by year or year-month
#             year_param = request.GET.get('year', 'all')
#             if year_param and year_param != 'all':
#                 try:
#                     if '-' in year_param:
#                         year, month = map(int, year_param.split('-'))
#                         queryset = queryset.filter(
#                             bm__created_at__year=year,
#                             bm__created_at__month=month
#                         )
#                     else:
#                         year = int(year_param)
#                         queryset = queryset.filter(bm__created_at__year=year)
#                 except ValueError:
#                     return Response({
#                         'success': False,
#                         'error': 'Invalid format for year. Use YYYY or YYYY-MM.'
#                     }, status=status.HTTP_400_BAD_REQUEST)

#             # Annotate and count records per month
#             monthly_data = queryset.annotate(
#                 month=TruncMonth('bm__created_at')
#             ).values('month').annotate(
#                 record_count=Count('vital_id')
#             ).order_by('-month')

#             formatted_data = []
#             for item in monthly_data:
#                 month_str = item['month'].strftime('%Y-%m')
#                 month_name = item['month'].strftime('%B %Y')

#                 # Apply search filter if provided
#                 if search_query and search_query.lower() not in month_name.lower():
#                     continue

#                 formatted_data.append({
#                     'month': month_str,
#                     'month_name': month_name,
#                     'record_count': item['record_count']
#                 })

#             # Pagination
#             paginator = self.pagination_class()
#             page = paginator.paginate_queryset(formatted_data, request)
#             if page is not None:
#                 return paginator.get_paginated_response({
#                     'success': True,
#                     'data': page,
#                     'total_months': len(formatted_data)
#                 })

#             return Response({
#                 'success': True,
#                 'data': formatted_data,
#                 'total_months': len(formatted_data)
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 'success': False,
#                 'error': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   



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

#         # Sitio search
#         sitio_search = self.request.query_params.get('sitio', '').strip()
#         if sitio_search:
#             queryset = ChildHealthReportUtils.apply_sitio_search(queryset, sitio_search)

#         # Nutritional status search
#         nutritional_search = self.request.query_params.get('nutritional_status', '').strip()
#         if nutritional_search:
#             queryset = self._apply_nutritional_search(queryset, nutritional_search)

#         age_range = self.request.query_params.get('age_range', '').strip()
#         if age_range:
#             queryset = self._apply_age_filter(queryset, age_range)

#         return queryset

#     def _apply_nutritional_search(self, queryset, search_query):
#         """Search by nutritional status"""
#         search_terms = [term.strip().lower() for term in search_query.split(',') if term.strip()]
#         if not search_terms:
#             return queryset

#         status_query = Q()
#         for term in search_terms:
#             status_query |= (
#                 Q(nutritional_status__wfa__iexact=term) |
#                 Q(nutritional_status__lhfa__iexact=term) |
#                 Q(nutritional_status__wfl__iexact=term) |
#                 Q(nutritional_status__muac_status__iexact=term)
#             )
        
#         return queryset.filter(status_query)

#     def _apply_age_filter(self, queryset, age_range):
#         """Apply age range filter to queryset"""
#         try:
#             min_age, max_age = map(int, age_range.split('-'))
#             filtered_data = []
#             for obj in queryset:
#                 age_str = obj.bm.age if hasattr(obj, 'bm') and obj.bm else ''
#                 age_months = ChildHealthReportUtils.parse_age_to_months(age_str)
#                 if min_age <= age_months <= max_age:
#                     filtered_data.append(obj)
#             return filtered_data
#         except ValueError:
#             return queryset

#     def _format_report_data(self, data, queryset_objects=None):
#         report_data = []
        
#         if queryset_objects:
#             for i, entry in enumerate(data):
#                 try:
#                     vs_obj = queryset_objects[i]
#                     vs = entry['vital_signs']
#                     chist = entry['chist_details']
#                     patrec = chist['chrec_details']['patrec_details']['pat_details']

#                     address, sitio, is_transient = ChildHealthReportUtils.get_patient_address(vs_obj.chhist.chrec.patrec.pat_id)

#                     # Calculate age in whole months
#                     age_in_months = 0
#                     if vs.get('bm_details') and vs['bm_details'].get('age'):
#                         age_str = vs['bm_details']['age']
#                         age_in_months = ChildHealthReportUtils.parse_age_to_months(age_str)

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

#     def list(self, request, *args, **kwargs):
#         queryset = self.filter_queryset(self.get_queryset())
#         page = self.paginate_queryset(queryset)

#         if page is not None:
#             serializer = self.get_serializer(page, many=True)
#             return self.get_paginated_response(self._format_report_data(serializer.data, page))

#         serializer = self.get_serializer(queryset, many=True)
#         return Response(self._format_report_data(serializer.data, queryset))


class ChildHealthTotalCountAPIView(APIView):
    def get(self, request):
        try:
            # Count total unique child health records
            total_records = ChildHealthrecord.objects.count()
            
            return Response({
                'success': True,
                'total_records': total_records
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)