from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics, status
from django.utils import timezone
from datetime import date, timedelta
from ..models import *
import traceback
from dateutil.relativedelta import relativedelta
from django.db.models import *


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

        # Debug: Print date range
        print(f"Date range: {month_start} to {month_end}")
        print(f"Previous month range: {prev_month_start} to {prev_month_end}")

        # Debug: Print unique fpt_method_used values
        unique_methods = FP_Record.objects.values('fp_type__fpt_method_used').distinct()
        print("Unique fpt_method_used values:", [m['fp_type__fpt_method_used'] for m in unique_methods])

        # Debug: Print all FP_Record details
        all_records = FP_Record.objects.select_related('fp_type').values(
            'fp_type__fpt_method_used', 'created_at', 'fp_type__fpt_client_type', 'fprecord_id', 'pat__pat_id'
        )
        print("All FP_Record details:")
        for record in all_records:
            print(f"Method: {record['fp_type__fpt_method_used']}, Created: {record['created_at']}, Client Type: {record['fp_type__fpt_client_type']}, Record ID: {record['fprecord_id']}, Patient ID: {record['pat__pat_id']}")

        # Debug: Print FP_Assessment_Record details
        assessment_records = FP_Assessment_Record.objects.select_related('fprecord__fp_type').values(
            'fprecord__fp_type__fpt_method_used', 'followv__followv_status', 'followv__followv_date', 'fprecord_id'
        )
        print("FP_Assessment_Record details:")
        for record in assessment_records:
            print(f"Method: {record['fprecord__fp_type__fpt_method_used']}, Status: {record['followv__followv_status']}, Date: {record['followv__followv_date']}, Record ID: {record['fprecord_id']}")

        # Check and update dropouts
        cutoff_start = month_start - timedelta(days=3)
        cutoff_end = month_end + timedelta(days=3)
        
        pending_follow_ups = FollowUpVisit.objects.filter(
            followv_status="Pending",
            followv_date__range=(cutoff_start, cutoff_end)
        ).select_related('patrec__pat_id')
        
        patient_ids = set(fu.patrec.pat_id.pat_id for fu in pending_follow_ups if fu.patrec and fu.patrec.pat_id)
        print(f"Pending follow-ups patient IDs: {patient_ids}")
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
            
            # Debug: Print raw record count
            raw_count = FP_Record.objects.filter(
                method_filter,
                created_at__range=(month_start, month_end)
            ).count()
            print(f"Method {method}: {raw_count} records in {month_start} to {month_end}")

            # Debug: Print records outside date range
            outside_count = FP_Record.objects.filter(
                method_filter
            ).exclude(
                created_at__range=(month_start, month_end)
            ).count()
            print(f"Method {method}: {outside_count} records outside {month_start} to {month_end}")

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

                # 1. Previous month new acceptors
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
                )
                # Debug: Print matching records
                print(f"Prev month new {method} (age {age_group}): {list(prev_month_new_query.values('fprecord_id', 'fp_type__fpt_method_used', 'created_at', 'pat__pat_id'))}")
                prev_month_new_counts[method][age_group] = prev_month_new_query.count()

                # 2. BOM: Previous month's active users + new acceptors
                bom_carryover_subquery = Subquery(
                    FP_Record.objects.filter(
                        pat__pat_id=OuterRef('pat__pat_id'),
                        created_at__lt=prev_month_start
                    ).order_by('-created_at').values('fprecord_id')[:1]
                )
                
                bom_carryover_query = FP_Record.objects.annotate(
                    dob=dob_annotation,
                    latest_fp_record_id=bom_carryover_subquery
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
                )
                # Debug: Print matching records
                print(f"BOM {method} (age {age_group}): {list(bom_carryover_query.values('fprecord_id', 'fp_type__fpt_method_used', 'created_at', 'pat__pat_id'))}")
                bom_counts[method][age_group] = bom_carryover_query.count() + prev_month_new_query.count()

                # 3. NEW: Current month new acceptors
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
                )
                # Debug: Print matching records
                print(f"New {method} (age {age_group}): {list(new_query.values('fprecord_id', 'fp_type__fpt_method_used', 'created_at', 'pat__pat_id'))}")
                new_counts[method][age_group] = new_query.count()

                # 4. OTHER: Current users with previous records
                other_query = FP_Record.objects.annotate(
                    dob=dob_annotation,
                    first_record_date=Min('pat__fp_records__created_at')
                ).filter(
                    age_filter,
                    method_filter,
                    created_at__range=(month_start, month_end),
                    fp_type__fpt_client_type__iexact='currentuser',
                    first_record_date__lt=F('created_at')
                )
                # Debug: Print matching records
                print(f"Other {method} (age {age_group}): {list(other_query.values('fprecord_id', 'fp_type__fpt_method_used', 'created_at', 'pat__pat_id'))}")
                other_counts[method][age_group] = other_query.count()

                # 5. DROP-OUTS
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
                )
                # Debug: Print matching dropouts
                print(f"Dropouts for {method} (age {age_group}): {list(dropout_query.values('fprecord_id', 'fprecord__fp_type__fpt_method_used', 'followv__followv_date'))}")
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
        traceback.print_exc()
        return Response({"detail": f"Error generating report: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
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



# @api_view(['GET'])
# def get_illness_list(request):
#     try:
#         illnesses = Illness.objects.all().order_by('ill_id')

#         # NEW: Get ill_code_prefix from query parameters
#         ill_code_prefix = request.query_params.get('ill_code_prefix', None)
#         if ill_code_prefix:
#             illnesses = illnesses.filter(ill_code__startswith=ill_code_prefix)

#         illness_data = []
#         for illness in illnesses:
#             illness_data.append({
#                 'ill_id': illness.ill_id,
#                 'illname': illness.illname,
#                 'ill_description': illness.ill_description,
#                 'ill_code': illness.ill_code
#             })

#         return Response(illness_data, status=status.HTTP_200_OK)
#     except Exception as e:
#         return Response(
#             {'error': f'Error fetching illnesses: {str(e)}'},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )


