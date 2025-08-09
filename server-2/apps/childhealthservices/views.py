from rest_framework import generics
from rest_framework.views import APIView
from .serializers import *
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound
from .utils import get_childhealth_record_count
from .models import *
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Prefetch
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from apps.healthProfiling.models import *
from django.db.models import Q
from pagination import StandardResultsPagination
from django.db.models.functions import TruncMonth
from django.db.models import Count
from apps.patientrecords.models import *






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
 
 
 
class MonthlyOPTChildHealthReportAPIView(generics.ListAPIView):
    serializer_class = OPTTrackingSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        month = self.kwargs.get('month')
        search_query = self.request.query_params.get('search', '').strip()
        age_range = self.request.query_params.get('age_range', '').strip()

        try:
            year, month_num = map(int, month.split('-'))
            if month_num < 1 or month_num > 12:
                raise ValueError
            start_date = datetime(year, month_num, 1)
            end_date = (datetime(year + (month_num // 12), ((month_num % 12) + 1), 1) 
                        - timedelta(days=1))
        except (ValueError, TypeError):
            return ChildHealthVitalSigns.objects.none()

        # Optimized queryset with proper relationships
        queryset = (
            ChildHealthVitalSigns.objects.filter(
                bm__created_at__gte=start_date,
                bm__created_at__lte=end_date
            )
            .select_related(
                'bm',
                'chhist',
                'chhist__chrec',
                'chhist__chrec__patrec',
                'chhist__chrec__patrec__pat_id',
                'chhist__chrec__patrec__pat_id__rp_id',
                'chhist__chrec__patrec__pat_id__rp_id__per',
                'chhist__chrec__patrec__pat_id__trans_id',
                'chhist__chrec__patrec__pat_id__trans_id__tradd_id',
            )
            .prefetch_related(
                'nutritional_status',
                # For resident addresses
                Prefetch(
                    'chhist__chrec__patrec__pat_id__rp_id__per__personaladdress_set',
                    queryset=PersonalAddress.objects.select_related('add', 'add__sitio'),
                    to_attr='prefetched_personal_addresses'
                ),
                # For household addresses as fallback
                Prefetch(
                    'chhist__chrec__patrec__pat_id__rp_id__household_set',
                    queryset=Household.objects.select_related('add', 'add__sitio'),
                    to_attr='prefetched_households'
                )
            )
            .order_by('bm__created_at')
        )

        if age_range:
            try:
                min_age, max_age = map(int, age_range.split('-'))
                queryset = queryset.filter(
                    bm__age_months__gte=min_age,
                    bm__age_months__lte=max_age
                )
            except (ValueError, AttributeError):
                pass

        if search_query:
            try:
                # Search in addresses
                matching_person_ids = PersonalAddress.objects.filter(
                    Q(add__add_city__icontains=search_query) |
                    Q(add__add_barangay__icontains=search_query) |
                    Q(add__add_street__icontains=search_query) |
                    Q(add__add_external_sitio__icontains=search_query) |
                    Q(add__add_province__icontains=search_query) |
                    Q(add__sitio__sitio_name__icontains=search_query)
                ).values_list('per', flat=True)

                # Also search in transient addresses
                matching_transient_ids = Transient.objects.filter(
                    Q(tradd_id__tradd_city__icontains=search_query) |
                    Q(tradd_id__tradd_barangay__icontains=search_query) |
                    Q(tradd_id__tradd_street__icontains=search_query) |
                    Q(tradd_id__tradd_sitio__icontains=search_query) |
                    Q(tradd_id__tradd_province__icontains=search_query)
                ).values_list('trans_id', flat=True)

                queryset = queryset.filter(
                    Q(chhist__chrec__patrec__pat_id__rp_id__per__per_fname__icontains=search_query) |
                    Q(chhist__chrec__patrec__pat_id__rp_id__per__per_mname__icontains=search_query) |
                    Q(chhist__chrec__patrec__pat_id__rp_id__per__per_lname__icontains=search_query) |
                    Q(chhist__chrec__family_no__icontains=search_query) |
                    Q(chhist__chrec__patrec__pat_id__rp_id__per__in=matching_person_ids) |
                    Q(chhist__chrec__patrec__pat_id__trans_id__in=matching_transient_ids)
                )
            except Exception as e:
                print(f"Search query error: {e}")

        return queryset

    def _get_patient_address(self, vital_signs_obj):
        """Get address and sitio from the ChildHealthVitalSigns object using prefetched data"""
        try:
            patient = vital_signs_obj.chhist.chrec.patrec.pat_id
            
            if patient.pat_type == 'Transient' and patient.trans_id:
                # Handle transient patients
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
                    full_address = ", ".join(filter(None, address_parts))
                    return full_address, sitio, True
                return None, None, True
            
            elif patient.pat_type == 'Resident' and patient.rp_id:
                # Handle resident patients
                rp = patient.rp_id
                if rp.per:
                    # Try to use prefetched personal addresses
                    if hasattr(rp.per, 'prefetched_personal_addresses'):
                        personal_addresses = rp.per.prefetched_personal_addresses
                        if personal_addresses:
                            personal_address = personal_addresses[0]
                            if personal_address.add:
                                address = personal_address.add
                                sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                                address_parts = [
                                    address.add_street,
                                    address.add_barangay,
                                    address.add_city,
                                    address.add_province,
                                    f"Sitio {sitio}" if sitio else None
                                ]
                                full_address = ", ".join(filter(None, address_parts))
                                return full_address, sitio, False
                    
                    # Fallback: Try prefetched households
                    if hasattr(rp, 'prefetched_households'):
                        households = rp.prefetched_households
                        if households:
                            household = households[0]
                            if household.add:
                                address = household.add
                                sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                                address_parts = [
                                    address.add_street,
                                    address.add_barangay,
                                    address.add_city,
                                    address.add_province,
                                    f"Sitio {sitio}" if sitio else None
                                ]
                                full_address = ", ".join(filter(None, address_parts))
                                return full_address, sitio, False
                    
                    # Last resort: Direct database query (not ideal for performance)
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
                        full_address = ", ".join(filter(None, address_parts))
                        return full_address, sitio, False
                    
                    # Household fallback
                    household = Household.objects.filter(
                        rp=rp
                    ).select_related('add', 'add__sitio').first()
                    
                    if household and household.add:
                        address = household.add
                        sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                        address_parts = [
                            address.add_street,
                            address.add_barangay,
                            address.add_city,
                            address.add_province,
                            f"Sitio {sitio}" if sitio else None
                        ]
                        full_address = ", ".join(filter(None, address_parts))
                        return full_address, sitio, False
                
                return None, None, False
            
        except AttributeError as e:
            print(f"Attribute error getting address: {e}")
            return None, None, None
        except Exception as e:
            print(f"Error getting address: {e}")
            return None, None, None

        return None, None, None

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(self._format_report_data(serializer.data, page))

        serializer = self.get_serializer(queryset, many=True)
        return Response(self._format_report_data(serializer.data, queryset))

    def _format_report_data(self, data, queryset_objects=None):
        report_data = []

        # If we have the actual queryset objects, use them for better address retrieval
        if queryset_objects:
            for i, entry in enumerate(data):
                try:
                    vs_obj = queryset_objects[i]  # Get the actual model instance
                    vs = entry['vital_signs']
                    chist = entry['chist_details']
                    patrec = chist['chrec_details']['patrec_details']['pat_details']

                    # Get address using the actual object (more reliable)
                    address, sitio, is_transient = self._get_patient_address(vs_obj)

                    # Age calculation
                    age_in_months = 0
                    if vs.get('bm_details') and vs['bm_details'].get('age'):
                        age_parts = vs['bm_details']['age'].split()
                        if 'month' in vs['bm_details']['age']:
                            age_in_months = int(age_parts[0])
                        elif 'week' in vs['bm_details']['age']:
                            weeks = int(age_parts[0])
                            age_in_months = weeks // 4

                    # Parents info
                    parents = {}
                    family_info = patrec.get('family_head_info', {})
                    if family_info.get('has_mother'):
                        mother = family_info['family_heads']['mother']['personal_info']
                        parents['mother'] = f"{mother['per_fname']} {mother['per_mname']} {mother['per_lname']}"
                    if family_info.get('has_father'):
                        father = family_info['family_heads']['father']['personal_info']
                        parents['father'] = f"{father['per_fname']} {father['per_mname']} {father['per_lname']}"

                    # Nutritional status
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
        else:
            # Fallback to original logic if no queryset objects
            for entry in data:
                try:
                    vs = entry['vital_signs']
                    chist = entry['chist_details']
                    patrec = chist['chrec_details']['patrec_details']['pat_details']

                    # Get address (less reliable without actual objects)
                    address, sitio, is_transient = self._get_patient_address_from_serialized_data(patrec)

                    # Rest of the logic remains the same...
                    # [Include the same logic as above for consistency]

                except Exception as e:
                    print(f"Error formatting report entry: {e}")
                    continue

        return {
            'month': self.kwargs['month'],
            'total_entries': len(report_data),
            'report_data': report_data
        }

    def _get_patient_address_from_serialized_data(self, pat_details):
        """Fallback method for getting address from serialized data"""
        if not pat_details:
            return None, None, None

        try:
            # Handle Transient patients
            if pat_details.get('pat_type') == 'Transient':
                trans_addr = pat_details.get('trans_id', {}).get('tradd_id', {})
                if trans_addr:
                    sitio = trans_addr.get('tradd_sitio')
                    address_parts = [
                        trans_addr.get('tradd_street'),
                        trans_addr.get('tradd_barangay'),
                        trans_addr.get('tradd_city'),
                        trans_addr.get('tradd_province'),
                        f"Sitio {sitio}" if sitio else None
                    ]
                    full_address = ", ".join(filter(None, address_parts))
                    return full_address, sitio, True

            # Handle Resident patients
            rp_info = pat_details.get('rp_id', {})
            per_info = rp_info.get('per', {})
            per_id = per_info.get('per_id')

            # Try PersonalAddress first
            if per_id:
                personal_address = (
                    PersonalAddress.objects
                    .filter(per_id=per_id)
                    .select_related('add', 'add__sitio')
                    .first()
                )
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
                    full_address = ", ".join(filter(None, address_parts))
                    return full_address, sitio, False

            # Fallback to Household address
            rp_id = rp_info.get('rp_id')
            if rp_id:
                household = (
                    Household.objects
                    .filter(rp_id=rp_id)
                    .select_related('add', 'add__sitio')
                    .first()
                )
                if household and household.add:
                    address = household.add
                    sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                    address_parts = [
                        address.add_street,
                        address.add_barangay,
                        address.add_city,
                        address.add_province,
                        f"Sitio {sitio}" if sitio else None
                    ]
                    full_address = ", ".join(filter(None, address_parts))
                    return full_address, sitio, False

        except Exception as e:
            print(f"Error getting address from serialized data: {e}")

        return None, None, None