from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics, status
from django.utils import timezone
from datetime import date, timedelta
from ..models import *
import traceback
from dateutil.relativedelta import relativedelta
from django.db.models import *
from django.shortcuts import get_object_or_404
from ..serializers import *
from rest_framework.pagination import PageNumberPagination
from venv import logger
from django.db.models.functions import ExtractMonth, ExtractYear, TruncMonth,TruncYear


def calculate_age_from_dob(dob_string):
    if not dob_string:
        return 0
    try:
        from datetime import datetime

        birth_date = datetime.strptime(dob_string, "%Y-%m-%d").date()
        today = date.today()
        return (
            today.year
            - birth_date.year
            - ((today.month, today.day) < (birth_date.month, birth_date.day))
        )
    except:
        return 0
    
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    
class PatientListForOverallTable(generics.ListAPIView):
    serializer_class = OverallFPRecordSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        # Start with FP_type objects since that's where the main data is
        queryset = FP_type.objects.select_related(
            "fprecord",
            "fprecord__pat",
            "fprecord__pat__rp_id__per", 
            "fprecord__pat__trans_id",
        ).order_by("-fprecord__created_at")
        
        # Apply search filter if 'search' query parameter is present
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(fprecord__pat__rp_id__per__per_lname__icontains=search_query) |
                Q(fprecord__pat__rp_id__per__per_fname__icontains=search_query) |
                Q(fprecord__pat__trans_id__tran_lname__icontains=search_query) |
                Q(fprecord__pat__trans_id__tran_fname__icontains=search_query) |
                Q(fprecord__client_id__icontains=search_query) |
                Q(fpt_client_type__icontains=search_query) |
                Q(fpt_method_used__icontains=search_query)
            ).distinct()
        
        # Apply client_type filter if 'client_type' query parameter is present
        client_type_filter = self.request.query_params.get('client_type', None)
        if client_type_filter and client_type_filter != "all":
            queryset = queryset.filter(fpt_client_type__iexact=client_type_filter).distinct()
        
        # NEW: Apply patient_type filter if 'patient_type' query parameter is present
        patient_type_filter = self.request.query_params.get('patient_type', None)
        if patient_type_filter and patient_type_filter != "all":
            queryset = queryset.filter(fprecord__pat__pat_type__iexact=patient_type_filter).distinct()
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Get distinct patients with their latest record
        patient_data_map = {}
        for fp_type in queryset:
            record = fp_type.fprecord
            patient_id = record.pat.pat_id
            
            # Only take the latest record per patient
            if patient_id not in patient_data_map:
                patient_entry = self._build_patient_entry(record, fp_type)
                patient_data_map[patient_id] = patient_entry
        
        # Convert to list for pagination
        patient_list = list(patient_data_map.values())
        
        # Manual pagination since we transformed the data
        page = self.paginate_queryset(patient_list)
        if page is not None:
            return self.get_paginated_response(page)
        
        return Response(patient_list)
    
    def _build_patient_entry(self, record, fp_type):
        """Helper method to build patient entry data"""
        patient_id = record.pat.pat_id
        patient_type = record.pat.pat_type
        
        raw_subtype = fp_type.fpt_subtype if fp_type else "N/A"
        subtype = map_subtype_display(raw_subtype)
        
        # Count distinct methods instead of total records
        from django.db.models import Count
        
        # Get distinct method count for this patient
        method_count = FP_type.objects.filter(
            fprecord__pat=record.pat
        ).values('fpt_method_used').distinct().count()
        
        # Get total visits count (optional - for reference)
        total_visits = FP_Record.objects.filter(pat=record.pat).count()
        
        # Build basic patient entry
        patient_entry = {
            "patient_id": patient_id,
            "patient_name": "",
            "patient_age": None,
            "sex": "",
            "client_type": map_client_type(fp_type.fpt_client_type) if fp_type else "N/A",
            "subtype": subtype,
            "patient_type": patient_type,
            "method_used": fp_type.fpt_method_used if fp_type else "N/A",
            "created_at": record.created_at.isoformat() if record.created_at else None,
            "fprecord_id": record.fprecord_id,
            "record_count": method_count,  # Use distinct method count instead of total visits
            "total_visits": total_visits,  # Keep this for reference if needed
        }
        
        # Add patient details based on type
        if patient_type == "Resident" and record.pat.rp_id and record.pat.rp_id.per:
            personal = record.pat.rp_id.per
            patient_entry["patient_name"] = f"{personal.per_lname}, {personal.per_fname} {personal.per_mname or ''}".strip()
            patient_entry["patient_age"] = calculate_age_from_dob(personal.per_dob.isoformat()) if personal.per_dob else None
            patient_entry["sex"] = personal.per_sex
        
        elif patient_type == "Transient" and record.pat.trans_id:
            transient = record.pat.trans_id
            patient_entry["patient_name"] = f"{transient.tran_lname}, {transient.tran_fname} {transient.tran_mname or ''}".strip()
            patient_entry["patient_age"] = calculate_age_from_dob(transient.tran_dob.isoformat()) if transient.tran_dob else None
            patient_entry["sex"] = transient.tran_sex
        
        return patient_entry
    
    
@api_view(["GET"])
def get_fp_methods_count_for_patient(request, patient_id):
    try:
        patient = get_object_or_404(Patient, pat_id=patient_id)
        
        # Count distinct patient records (each should represent a method episode)
        distinct_patrec_count = FP_Record.objects.filter(pat=patient)\
            .values('patrec_id')\
            .distinct()\
            .count()
            
        total_records_count = FP_Record.objects.filter(pat=patient).count()
        
        return Response({
            "patient_id": patient_id,
            "fp_methods_count": distinct_patrec_count,
            "fp_total_records": total_records_count
        })
        
    except Patient.DoesNotExist:
        return Response(
            {"detail": f"Patient with ID {patient_id} not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
        
        
@api_view(['GET'])
def get_filtered_commodity_list(request):
    client_type = request.query_params.get('client_type', None)
    gender = request.query_params.get('gender', None)

    commodities = CommodityList.objects.all()

    if client_type:
        # Filter by user_type: 'New acceptor', 'Current user', or 'Both'
        commodities = commodities.filter(user_type__in=[client_type, 'Both'])

    if gender:
        # Filter by gender_type: 'Male', 'Female', or 'Both'
        commodities = commodities.filter(gender_type__in=[gender, 'Both'])

    formatted_commodities = [
        {'id': com.com_name, 'name': com.com_name, 'user_type': com.user_type, 'gender_type': com.gender_type}
        for com in commodities
    ]
    return Response(formatted_commodities, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_commodity_stock(request, commodity_name):
    try:
        # Find the commodity in CommodityList by its name
        commodity = CommodityList.objects.get(com_name=commodity_name)

        # Sum up available quantities from all CommodityInventory records for this commodity
        total_available_stock = CommodityInventory.objects.filter(
            com_id=commodity
        ).aggregate(total_stock=Sum('cinv_qty_avail'))['total_stock']

        # If no inventory records, total_stock will be None, treat as 0
        total_available_stock = total_available_stock if total_available_stock is not None else 0

        return Response(
            {"commodity_name": commodity_name, "available_stock": total_available_stock},
            status=status.HTTP_200_OK
        )
    except CommodityList.DoesNotExist:
        return Response(
            {"detail": f"Commodity '{commodity_name}' not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            {"detail": f"Internal server error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
        
@api_view(['GET'])
def get_fp_patient_counts(request):
    try:
        today = timezone.now().date()
        eighteen_years_ago = today - timedelta(days=18*365.25) 
        all_fp_patients = FP_Record.objects.select_related('pat').values('pat__pat_id', 'pat__pat_type').distinct()
        total_fp_patients = all_fp_patients.count()
        resident_fp_patients = all_fp_patients.filter(pat__pat_type='Resident').count()
        transient_fp_patients = all_fp_patients.filter(pat__pat_type='Transient').count() # Count transients among FP patients

        # Count minor residents (under 18) among FP patients
        minor_resident_fp_patients = FP_Record.objects.filter(pat__pat_type='Resident',pat__rp_id__per__per_dob__gt=eighteen_years_ago).values('pat__pat_id').distinct().count()
        minor_transient_fp_patients = FP_Record.objects.filter(pat__pat_type='Transient',pat__trans_id__tran_dob__gt=eighteen_years_ago).values('pat__pat_id').distinct().count()
        minor_fp_patients = minor_resident_fp_patients + minor_transient_fp_patients
        response_data = {"total_fp_patients": total_fp_patients,"resident_fp_patients": resident_fp_patients,"transient_fp_patients": transient_fp_patients,"minor_fp_patients": minor_fp_patients,}
        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"detail": f"Error fetching FP patient counts: {str(e)}"},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
def get_detailed_monthly_fp_report(request, year, month):
    try:
        # Define month range with timezone-aware datetimes
        month_start = timezone.make_aware(datetime(int(year), int(month), 1))
        next_month = month_start + relativedelta(months=1)
        month_end = (next_month - timedelta(days=1)).replace(hour=23, minute=59, second=59, microsecond=999999)
        
        # Previous month range
        prev_month_start = month_start - relativedelta(months=1)
        prev_month_end = (month_start - timedelta(days=1)).replace(hour=23, minute=59, second=59, microsecond=999999)

        # Check and update dropouts
        cutoff_start = month_start - timedelta(days=3)
        cutoff_end = month_end + timedelta(days=3)
        
        pending_follow_ups = FollowUpVisit.objects.filter(
            followv_status="Pending",
            followv_date__range=(cutoff_start, cutoff_end)
        ).select_related('patrec__pat_id')
        
        patient_ids = set(fu.patrec.pat_id.pat_id for fu in pending_follow_ups if fu.patrec and fu.patrec.pat_id)
        for pat_id in patient_ids:
            _check_and_update_dropouts_for_patient(pat_id)

        # Define methods and age groups
        methods = ["BTL", "NSV", "Condom", "POP", "COC", "DMPA", "Implant", "IUD-Interval", "IUD-Post Partum", "LAM", "BBT", "CMM", "STM", "SDM"]
        age_groups = ['10-14', '15-19', '20-49', 'Total']

        # METHOD MAPPING
        METHOD_MAP = {
            "NSV": ["NSV", "Vasectomy"],
            "CMM": ["CMM", "BOM/CMM"],
            "Condom": ["Condom", "condom", "CONDOM"],
            "IUD-Post Partum": ["IUD-Post Partum", "IUD-PostPartum", "IUD Post Partum", "IUD-Postpartum"],
            "POP": ["POP", "pop", "Progestin-Only Pill"],
            "SDM": ["SDM", "sdm", "Standard Days Method"],
            "COC": ["COC", "coc", "Combined Oral Contraceptive"],
            "Implant": ["Implant", "Implants"],
            "STM": ["stm", "STM"],
            "DMPA": ["dmpa", "DMPA"],
            **{m: [m] for m in methods if m not in ["NSV", "CMM", "Condom", "Implant","IUD-Post Partum", "POP", "DMPA", "SDM", "COC","STM"]}
        }

        # Initialize count dictionaries
        bom_counts = {method: {age: 0 for age in age_groups} for method in methods}
        new_counts = {method: {age: 0 for age in age_groups} for method in methods}
        other_counts = {method: {age: 0 for age in age_groups} for method in methods}
        drop_outs_counts = {method: {age: 0 for age in age_groups} for method in methods}
        prev_month_new_counts = {method: {age: 0 for age in age_groups} for method in methods}

        today = timezone.now().date()

        for method in methods:
            # Case-insensitive method filter
            method_names = METHOD_MAP.get(method, [method])
            method_filter = Q()
            for name in method_names:
                method_filter |= Q(fp_type__fpt_method_used__iexact=name)
            
            for age_group in age_groups:
                # DOB annotation
                dob_annotation = Case(
                    When(pat__pat_type='Resident', then=F('pat__rp_id__per__per_dob')),
                    When(pat__pat_type='Transient', then=F('pat__trans_id__tran_dob')),
                    default=None,
                    output_field=DateField()
                )

                # Age filter
                if age_group != 'Total':
                    if age_group == '10-14':
                        dob_gt = today - relativedelta(years=15)
                        dob_lte = today - relativedelta(years=10)
                    elif age_group == '15-19':
                        dob_gt = today - relativedelta(years=20)
                        dob_lte = today - relativedelta(years=15)
                    elif age_group == '20-49':
                        dob_gt = today - relativedelta(years=50)
                        dob_lte = today - relativedelta(years=20)
                    age_filter = Q(dob__gt=dob_gt, dob__lte=dob_lte)
                else:
                    age_filter = Q()

                # 1. Previous month new acceptors - DISTINCT PATIENTS
                prev_month_new_query = FP_Record.objects.annotate(
                    dob=dob_annotation,
                    first_record_date=Min('pat__fp_records__created_at'),
                    has_current=Exists(
                        FP_Record.objects.filter(
                            pat__pat_id=OuterRef('pat__pat_id'),
                            created_at__range=(prev_month_start, prev_month_end),
                            fp_type__fpt_client_type__iexact='currentuser'
                        )
                    )
                ).filter(
                    age_filter,
                    method_filter,
                    created_at__range=(prev_month_start, prev_month_end),
                    fp_type__fpt_client_type__iexact='newacceptor',
                    first_record_date=F('created_at'),
                    has_current=False
                ).values('pat__pat_id').distinct()  # DISTINCT PATIENTS
                
                prev_month_new_counts[method][age_group] = prev_month_new_query.count()

                # 2. BOM: Previous month's active users + new acceptors - DISTINCT PATIENTS
                # Get distinct patients from previous month who were active
                bom_active_patients = FP_Record.objects.annotate(
                    dob=dob_annotation,
                    latest_fp_record_id=Subquery(
                        FP_Record.objects.filter(
                            pat__pat_id=OuterRef('pat__pat_id'),
                            created_at__lt=prev_month_start
                        ).order_by('-created_at').values('fprecord_id')[:1]
                    )
                ).filter(
                    age_filter,
                    method_filter,
                    fprecord_id__isnull=False,
                    fprecord_id=F('latest_fp_record_id'),
                ).annotate(
                    has_dropout=Exists(
                        FP_Assessment_Record.objects.filter(
                            fprecord_id=OuterRef('fprecord_id'),
                            followv__followv_status__iexact='dropout',
                            followv__followv_date__lt=prev_month_start
                        )
                    )
                ).filter(
                    has_dropout=False
                ).values('pat__pat_id').distinct()  # DISTINCT PATIENTS
                
                bom_carryover_count = bom_active_patients.count()
                bom_counts[method][age_group] = bom_carryover_count + prev_month_new_counts[method][age_group]

                # 3. NEW: Current month new acceptors - DISTINCT PATIENTS
                new_query = FP_Record.objects.annotate(
                    dob=dob_annotation,
                    first_record_date=Min('pat__fp_records__created_at'),
                    has_current=Exists(
                        FP_Record.objects.filter(
                            pat__pat_id=OuterRef('pat__pat_id'),
                            created_at__range=(month_start, month_end),
                            fp_type__fpt_client_type__iexact='currentuser'
                        )
                    )
                ).filter(
                    age_filter,
                    method_filter,
                    created_at__range=(month_start, month_end),
                    fp_type__fpt_client_type__iexact='newacceptor',
                    first_record_date=F('created_at'),
                    has_current=False
                ).values('pat__pat_id').distinct()  # DISTINCT PATIENTS
                
                new_counts[method][age_group] = new_query.count()

                # 4. OTHER: Current users with previous records - DISTINCT PATIENTS
                other_query = FP_Record.objects.annotate(
                    dob=dob_annotation,
                    first_record_date=Min('pat__fp_records__created_at')
                ).filter(
                    age_filter,
                    method_filter,
                    created_at__range=(month_start, month_end),
                    fp_type__fpt_client_type__iexact='currentuser',
                    first_record_date__lt=F('created_at')
                ).values('pat__pat_id').distinct()  # DISTINCT PATIENTS
                
                other_counts[method][age_group] = other_query.count()

                # 5. DROP-OUTS - DISTINCT PATIENTS
                dropout_method_filter = Q()
                for name in method_names:
                    dropout_method_filter |= Q(fprecord__fp_type__fpt_method_used__iexact=name)

                dropout_query = FP_Assessment_Record.objects.annotate(
                    dob=Case(
                        When(fprecord__pat__pat_type='Resident', then=F('fprecord__pat__rp_id__per__per_dob')),
                        When(fprecord__pat__pat_type='Transient', then=F('fprecord__pat__trans_id__tran_dob')),
                        default=None,
                        output_field=DateField()
                    ),
                    dropout_date=Case(
                        When(Q(followv__followv_status__iexact='Dropout') | Q(followv__followv_status__iexact='Missed'), 
                            then=F('followv__followv_date')),
                        When(
                            Q(followv__followv_status__iexact='Pending') & 
                            Q(followv__followv_date__lte=today - timedelta(days=3)),
                            then=F('followv__followv_date') + timedelta(days=3)
                        ),
                        default=None,
                        output_field=DateField()
                    )
                ).filter(
                    age_filter,
                    dropout_method_filter,
                    Q(followv__followv_status__iexact='Dropout') |
                    Q(followv__followv_status__iexact='Missed') | 
                    Q(followv__followv_status__iexact='Pending', followv__followv_date__lte=today - timedelta(days=3)),
                    dropout_date__range=(month_start, month_end)
                ).values('fprecord__pat__pat_id').distinct()  # DISTINCT PATIENTS
                
                drop_outs_counts[method][age_group] = dropout_query.count()

        response_data = {
            'bom_counts': bom_counts,
            'new_counts': new_counts,
            'other_counts': other_counts,
            'drop_outs_counts': drop_outs_counts,
            'prev_month_new_counts': prev_month_new_counts,
        }

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error in get_detailed_monthly_fp_report: {str(e)}")
        return Response(
            {'error': f'Failed to generate report: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['GET'])
def get_fp_monthly_records(request):
    year = request.GET.get('year')               # optional filter
    qs = FP_Record.objects.all()
    if year and year != 'all':
        qs = qs.filter(created_at__year=year)

    monthly = (
        qs.annotate(
            month=TruncMonth('created_at'),
            year=TruncYear('created_at')
        )
        .values('month', 'year')
        .annotate(record_count=Count('fprecord_id'))
        .order_by('-year', '-month')
    )

    data = [
        {
            "month": item['month'].strftime('%Y-%m'),          # 2025-11
            "month_name": item['month'].strftime('%B %Y'),    # November 2025
            "record_count": item['record_count'],
        }
        for item in monthly
    ]

    return Response({
        "success": True,
        "data": data,
        "total_records": len(data)
    })
    
    
def map_subtype_display(subtype):
    """Map subtype IDs to human-readable labels"""
    subtype_map = {
        "changingmethod": "Changing Method",
        "changingclinic": "Changing Clinic", 
        "dropoutrestart": "Dropout/Restart",
        "medicalcondition": "Medical Condition",
        "sideeffects": "Side Effects",
        # Add more mappings as needed
    }
    return subtype_map.get(subtype)  # Fallback to title case

def map_reason_display(reason):
    """Map reason IDs to human-readable labels"""
    reason_map = {
        "spacing": "Spacing",
        "limiting": "Limiting",
        "fp_others": "Others",
        "medicalcondition": "Medical Condition",
        "sideeffects": "Side Effects",
        # Add more mappings as needed
    }
    return reason_map.get(reason)  # Fallback to title case

def map_client_type(client_type):
    """Map client type to readable labels"""
    if not client_type:
        return ""
    client_type = client_type.lower()
    if client_type == "newacceptor":
        return "New Acceptor"
    elif client_type == "currentuser":
        return "Current User"
    elif client_type == "restart":
        return "Restart"
    else:
        return client_type.title()  # Fallback to title case
    
def map_income_display(income):
    """Map income IDs to human-readable labels"""
    income_map = {
        "lower": "Lower than 5,000",
        "5,000-10,000": "5,000-10,000",
        "10,000-30,000": "10,000-30,000",
        "30,000-50,000": "30,000-50,000",
        "50,000-80,000": "50,000-80,000",
        "80,000-100,000": "80,000-100,000",
        "100,000-200,000": "100,000-200,000",
        "higher": "Higher than 200,000",
    }
    return income_map.get(income, income.title() if income else "")

def get_pelvic_exam_display_values(data):
    """Convert pelvic exam field values to human-readable labels"""
    display_map = {
        "normal": "Normal",
        "mass": "Mass",
        "abnormal_discharge": "Abnormal Discharge",
        "cervical_abnormalities": "Cervical Abnormalities",
        "warts": "Warts",
        "polyp_or_cyst": "Polyp or Cyst",
        "inflammation_or_erosion": "Inflammation or Erosion",
        "bloody_discharge": "Bloody Discharge",
        "not_applicable": "Not Applicable",
    }
    
    return {
        "pelvicExamination": display_map.get(data.get("pelvic_exam"), data.get("pelvic_exam", "Not Applicable")),
        "cervicalConsistency": data.get("cervical_consistency", "Not Applicable"),  # Assuming no mapping needed here
        "cervicalTenderness": bool(data.get("cervical_tenderness", False)),  # Simplified boolean conversion
        "cervicalAdnexal": bool(data.get("cervical_adnexal", False)),  # Simplified boolean conversion
        "uterinePosition": data.get("uterine_position", "Not Applicable"),
        "uterineDepth": data.get("uterine_depth", "Not Applicable"),  
    }
    
def map_physical_exam_display_values(data):
    """Convert physical exam field values to human-readable labels"""
    display_map = {
        # Skin Examination
        "normal": "Normal",
        "pale": "Pale",
        "yellowish": "Yellowish",
        "hematoma": "Hematoma",
        "not_applicable": "Not Applicable",
        
        # Conjunctiva Examination
        "normal": "Normal",
        "pale": "Pale",
        "yellowish": "Yellowish",
        
        # Neck Examination
        "normal": "Normal",
        "neck_mass": "Neck Mass",
        "enlarged_lymph_nodes": "Enlarged Lymph Nodes",
        
        # Breast Examination
        "normal": "Normal",
        "mass": "Mass",
        "nipple_discharge": "Nipple Discharge",
        
        # Abdomen Examination
        "normal": "Normal",
        "abdominal_mass": "Abdominal Mass",
        "varicosities": "Varicosities",
        
        # Extremities Examination
        "normal": "Normal",
        "edema": "Edema",
        "varicosities": "Varicosities",
    }
    
    return {
        "skinExamination": display_map.get(data.get("skin_exam")),
        "conjunctivaExamination": display_map.get(data.get("conjunctiva_exam")),
        "neckExamination": display_map.get(data.get("neck_exam")),
        "breastExamination": display_map.get(data.get("breast_exam")),
        "abdomenExamination": display_map.get(data.get("abdomen_exam")),
        "extremitiesExamination": display_map.get(data.get("extremities_exam")),
    }



@api_view(['GET'])
def get_fp_method_distribution(request):
    """
    Get distribution of family planning methods by distinct patients for a specific month
    """
    try:
        month = request.query_params.get('month', datetime.now().strftime('%Y-%m'))
        try:
            year, month_num = map(int, month.split('-'))
            start_date = datetime(year, month_num, 1)
            end_date = (start_date + relativedelta(months=1)) - timezone.timedelta(days=1)
        except ValueError:
            return Response(
                {'error': 'Invalid month format. Use YYYY-MM'},
                status=status.HTTP_400_BAD_REQUEST
            )

        method_distribution = FP_type.objects.filter(
            fprecord__created_at__gte=start_date,
            fprecord__created_at__lte=end_date
        ).values('fpt_method_used').annotate(
            patient_count=Count('fprecord__pat', distinct=True)
        ).filter(patient_count__gt=0).order_by('-patient_count')

        data = [
            {
                'name': item['fpt_method_used'] if item['fpt_method_used'] != "Others" else "Others",
                'value': item['patient_count']
            }
            for item in method_distribution
        ]

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in get_fp_method_distribution: {str(e)}")
        return Response(
            {'error': 'Error fetching method distribution'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_fp_client_type_distribution(request):
    """
    Get distribution of client types by distinct patients for a specific month
    """
    try:
        month = request.query_params.get('month', datetime.now().strftime('%Y-%m'))
        try:
            year, month_num = map(int, month.split('-'))
            start_date = datetime(year, month_num, 1)
            end_date = (start_date + relativedelta(months=1)) - timezone.timedelta(days=1)
        except ValueError:
            return Response(
                {'error': 'Invalid month format. Use YYYY-MM'},
                status=status.HTTP_400_BAD_REQUEST
            )

        client_type_distribution = FP_type.objects.filter(
            fprecord__created_at__gte=start_date,
            fprecord__created_at__lte=end_date
        ).values('fpt_client_type').annotate(
            patient_count=Count('fprecord__pat', distinct=True)
        ).filter(patient_count__gt=0).order_by('-patient_count')

        data = [
            {
                'name': map_client_type(item['fpt_client_type']),
                'value': item['patient_count']
            }
            for item in client_type_distribution
        ]

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in get_fp_client_type_distribution: {str(e)}")
        return Response(
            {'error': 'Error fetching client type distribution'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_fp_analytics_summary(request):
    """
    Get summary statistics for Family Planning dashboard cards for a specific month
    """
    try:
        month = request.query_params.get('month', datetime.now().strftime('%Y-%m'))
        try:
            year, month_num = map(int, month.split('-'))
            first_day_this_month = datetime(year, month_num, 1)
            first_day_last_month = first_day_this_month - relativedelta(months=1)
            last_month_end = first_day_this_month - timezone.timedelta(days=1)
        except ValueError:
            return Response(
                {'error': 'Invalid month format. Use YYYY-MM'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get all distinct patients with FP records up to the end of the selected month
        total_patients = FP_Record.objects.filter(
            created_at__lte=first_day_this_month + relativedelta(months=1) - timezone.timedelta(days=1)
        ).values('pat').distinct().count()

        # Get new acceptors and current users for the selected month
        new_acceptors = FP_Record.objects.filter(
            fp_type__fpt_client_type='newacceptor',
            created_at__gte=first_day_this_month,
            created_at__lte=first_day_this_month + relativedelta(months=1) - timezone.timedelta(days=1)
        ).values('pat').distinct().count()

        current_users = FP_Record.objects.filter(
            fp_type__fpt_client_type='currentuser',
            created_at__lte=first_day_this_month + relativedelta(months=1) - timezone.timedelta(days=1)
        ).values('pat').distinct().count()

        # Monthly registrations
        this_month_registrations = FP_Record.objects.filter(
            created_at__gte=first_day_this_month,
            created_at__lte=first_day_this_month + relativedelta(months=1) - timezone.timedelta(days=1)
        ).values('pat').distinct().count()

        last_month_registrations = FP_Record.objects.filter(
            created_at__gte=first_day_last_month,
            created_at__lte=last_month_end
        ).values('pat').distinct().count()

        # Calculate growth rate
        growth_rate = 0
        if last_month_registrations > 0:
            growth_rate = round(
                ((this_month_registrations - last_month_registrations) / last_month_registrations) * 100, 1
            )
        elif this_month_registrations > 0:
            growth_rate = 100

        data = {
            'total_patients': total_patients,
            'new_acceptors': new_acceptors,
            'current_users': current_users,
            'this_month_registrations': this_month_registrations,
            'growth_rate': growth_rate,
            'average_children': FP_Record.objects.filter(
                created_at__lte=first_day_this_month + relativedelta(months=1) - timezone.timedelta(days=1)
            ).aggregate(
                avg_children=Avg('num_of_children')
            )['avg_children'] or 0
        }

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in get_fp_analytics_summary: {str(e)}")
        return Response(
            {'error': 'Error fetching FP analytics summary'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
        
@api_view(['GET'])
def get_fp_monthly_trends(request):
    """
    Get monthly trends for FP records for the past 12 months ending in the specified month
    """
    try:
        month = request.query_params.get('month', datetime.now().strftime('%Y-%m'))
        try:
            year, month_num = map(int, month.split('-'))
            end_date = datetime(year, month_num, 1) + relativedelta(months=1) - timezone.timedelta(days=1)
            start_date = end_date - relativedelta(months=11)
        except ValueError:
            return Response(
                {'error': 'Invalid month format. Use YYYY-MM'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Single database query to get monthly aggregates
        monthly_data = FP_Record.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        ).annotate(
            month=ExtractMonth('created_at'),
            year=ExtractYear('created_at')
        ).values('year', 'month').annotate(
            total=Count('fprecord_id', distinct=True),
            new_acceptors=Count('fp_type__fpt_id', filter=Q(fp_type__fpt_client_type='newacceptor'), distinct=True),
            current_users=Count('fp_type__fpt_id', filter=Q(fp_type__fpt_client_type='currentuser'), distinct=True)
        ).order_by('year', 'month')

        # Create a dictionary for easy lookup
        monthly_dict = {(item['year'], item['month']): item for item in monthly_data}

        # Generate data for the last 12 months
        months = []
        current_date = start_date
        while current_date <= end_date:
            months.append((current_date.year, current_date.month))
            current_date += relativedelta(months=1)

        data = []
        for year, month in months:
            month_name = datetime(year, month, 1).strftime('%b')
            month_data = monthly_dict.get((year, month), {
                'total': 0,
                'new_acceptors': 0,
                'current_users': 0
            })

            data.append({
                'month': month_name,
                'newAcceptors': month_data['new_acceptors'],
                'currentUsers': month_data['current_users'],
                'total': month_data['total']
            })

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in get_fp_monthly_trends: {str(e)}")
        return Response(
            {'error': 'Error fetching monthly trends'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_fp_age_distribution(request):
    """
    Get age distribution of FP patients for a specific month
    """
    try:
        month = request.query_params.get('month', datetime.now().strftime('%Y-%m'))
        try:
            year, month_num = map(int, month.split('-'))
            start_date = datetime(year, month_num, 1)
            end_date = start_date + relativedelta(months=1) - timezone.timedelta(days=1)
        except ValueError:
            return Response(
                {'error': 'Invalid month format. Use YYYY-MM'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get distinct patients with FP records in the specified month
        distinct_patient_ids = FP_Record.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        ).values_list('pat', flat=True).distinct()

        # Get patient objects with related data
        patients = Patient.objects.filter(
            pat_id__in=distinct_patient_ids
        ).select_related('rp_id__per', 'trans_id')

        today = end_date.date()
        age_groups = {
            '15-19': 0,
            '20-24': 0,
            '25-29': 0,
            '30-34': 0,
            '35-39': 0,
            '40-44': 0,
            '45+': 0
        }

        for patient in patients:
            dob = None
            if patient.pat_type == 'Resident' and patient.rp_id and patient.rp_id.per:
                dob = patient.rp_id.per.per_dob
            elif patient.pat_type == 'Transient' and patient.trans_id:
                dob = patient.trans_id.tran_dob

            if dob:
                age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
                if 15 <= age <= 19:
                    age_groups['15-19'] += 1
                elif 20 <= age <= 24:
                    age_groups['20-24'] += 1
                elif 25 <= age <= 29:
                    age_groups['25-29'] += 1
                elif 30 <= age <= 34:
                    age_groups['30-34'] += 1
                elif 35 <= age <= 39:
                    age_groups['35-39'] += 1
                elif 40 <= age <= 44:
                    age_groups['40-44'] += 1
                elif age >= 45:
                    age_groups['45+'] += 1

        # Convert to list format
        data = [
            {'ageGroup': age_group, 'count': count}
            for age_group, count in age_groups.items()
        ]

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in get_fp_age_distribution: {str(e)}")
        return Response(
            {'error': 'Error fetching age distribution'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_fp_follow_up_compliance(request):
    """
    Get follow-up visit compliance statistics for a specific month
    """
    try:
        month = request.query_params.get('month', datetime.now().strftime('%Y-%m'))
        try:
            year, month_num = map(int, month.split('-'))
            start_date = datetime(year, month_num, 1)
            end_date = start_date + relativedelta(months=1) - timezone.timedelta(days=1)
        except ValueError:
            return Response(
                {'error': 'Invalid month format. Use YYYY-MM'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Single query to get compliance statistics
        compliance_data = FP_Assessment_Record.objects.filter(
            followv__followv_date__gte=start_date,
            followv__followv_date__lte=end_date
        ).select_related('followv').aggregate(
            completed=Count('followv_id', filter=Q(followv__followv_status='completed')),
            pending=Count('followv_id', filter=Q(followv__followv_status='pending') & Q(followv__followv_date__gte=end_date)),
            overdue=Count('followv_id', filter=Q(followv__followv_status='pending') & Q(followv__followv_date__lt=end_date))
        )

        data = [
            {'name': 'Completed', 'value': compliance_data['completed'] or 0},
            {'name': 'Pending', 'value': compliance_data['pending'] or 0},
            {'name': 'Overdue', 'value': compliance_data['overdue'] or 0}
        ]

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in get_fp_follow_up_compliance: {str(e)}")
        return Response(
            {'error': 'Error fetching follow-up compliance'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )