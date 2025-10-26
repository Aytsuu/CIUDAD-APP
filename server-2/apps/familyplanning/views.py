import traceback
from venv import logger
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.db import transaction  # For atomic operations if needed
from django.db.models import Exists, Sum, Q, Min, F, Case, When, DateField, Subquery, Value, OuterRef,Prefetch
from django.db.models.functions import ExtractMonth, ExtractYear, TruncMonth
from django.utils import timezone
from datetime import date, timedelta
from .models import *
from .serializers import *
from apps.patientrecords.models import *
from apps.healthProfiling.models import *
from apps.healthProfiling.serializers.base import *
from apps.maternal.models import *
from apps.patientrecords.serializers.patients_serializers import PatientSerializer, PatientRecordSerializer
from apps.patientrecords.serializers.bodymesurement_serializers import *
from apps.patientrecords.serializers.vitalsigns_serializers import *
from apps.patientrecords.serializers.followvisits_serializers import *
from apps.patientrecords.serializers.obstetrical_serializers import *
from apps.maternal.serializers.serializer import *
from apps.patientrecords.serializers.spouse_serializers import *
from apps.inventory.models import CommodityList, CommodityInventory # Import CommodityList and CommodityInventory
from .api_functions import get_checkbox_name_from_illness
from dateutil.relativedelta import relativedelta
from .mappings.mappings import *
from rest_framework.pagination import PageNumberPagination
from django.http import Http404
from .mappings.mappings import get_pelvic_exam_display_values
from collections import defaultdict

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    
# class PatientListForOverallTable(generics.ListAPIView):
#     serializer_class = FPRecordSerializer 
#     pagination_class = StandardResultsSetPagination  
    
#     def get_queryset(self):
#         # Start with all FP_Record objects
#         queryset = FP_Record.objects.select_related(
#             "pat",
#             "pat__rp_id__per",
#             "pat__trans_id",
#         ).prefetch_related(
#             'fp_type_set'
#         ).order_by("-created_at") 
        
#         search_query = self.request.query_params.get('search', None)
#         if search_query:
#             queryset = queryset.filter(
#                 Q(pat__rp_id__per__per_lname__icontains=search_query) |
#                 Q(pat__rp_id__per__per_fname__icontains=search_query) |
#                 Q(pat__trans_id__tran_lname__icontains=search_query) |
#                 Q(pat__trans_id__tran_fname__icontains=search_query) |
#                 Q(client_id__icontains=search_query) |
#                 Q(fp_type_set__fpt_client_type__icontains=search_query) |
#                 Q(fp_type_set__fpt_method_used__icontains=search_query)
#             ).distinct() # Use distinct to avoid duplicate records if multiple FP_types match
#         # Apply client_type filter if 'client_type' query parameter is present
#         client_type_filter = self.request.query_params.get('client_type', None)
#         if client_type_filter and client_type_filter != "all":
#             queryset = queryset.filter(fp_type_set__fpt_client_type__iexact=client_type_filter).distinct()
#         return queryset
    
#     def list(self, request, *args, **kwargs):
#         queryset = self.get_queryset()
#         page = self.paginate_queryset(queryset)
#         if page is not None:
#             patient_data_map = {}
#             for record in page:
#                 patient_id = record.pat.pat_id
#                 if patient_id not in patient_data_map:
#                     patient_data_map[patient_id] = patient_entry
#             response_data = list(patient_data_map.values())
#             return self.get_paginated_response(response_data)
     
#         return Response([])
    
@api_view(['GET'])
def get_fp_patient_counts(request):
    try:
        today = timezone.now().date()
        eighteen_years_ago = today - timedelta(days=18*365.25) 
        all_fp_patients = FP_Record.objects.select_related('pat').values('pat__pat_id', 'pat__pat_type').distinct()
        total_fp_patients = all_fp_patients.count()
        resident_fp_patients = all_fp_patients.filter(pat__pat_type='Resident').count()
        transient_fp_patients = all_fp_patients.filter(pat__pat_type='Transient').count() 

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
def get_illness_list(request):
    try:
        illnesses = Illness.objects.all().order_by('ill_id')

        # NEW: Get ill_code_prefix from query parameters
        ill_code_prefix = request.query_params.get('ill_code_prefix', None)
        if ill_code_prefix:
            illnesses = illnesses.filter(ill_code__startswith=ill_code_prefix)

        illness_data = []
        for illness in illnesses:
            illness_data.append({'ill_id': illness.ill_id,'illname': illness.illname,'ill_description': illness.ill_description,'ill_code': illness.ill_code})

        return Response(illness_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Error fetching illnesses: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



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

@api_view(['GET'])
def get_patient_medical_history(request, patrec_id):
    try:
        patient_record = PatientRecord.objects.get(patrec_id=patrec_id)
        medical_histories = MedicalHistory.objects.filter(patrec=patient_record).select_related('ill')
        
        history_data = []
        for history in medical_histories:
            history_data.append({
                'medhist_id': history.medhist_id,
                'ill_id': history.ill.ill_id,
                'illname': history.ill.illname,
                'ill_code': history.ill.ill_code,
                'created_at': history.created_at
            })
        
        return Response(history_data, status=status.HTTP_200_OK)
        
    except PatientRecord.DoesNotExist:
        return Response(
            {'error': 'Patient record not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error fetching medical history: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(["GET"])
def get_body_measurements(request, pat_id):
    try:
        # Fetch the patient
        patient = get_object_or_404(Patient, pat_id=pat_id)
        body_measurement = BodyMeasurement.objects.filter(pat=patient).order_by('-created_at').first()
        
        if body_measurement:
            body_measurement_data = BodyMeasurementSerializer(body_measurement).data
            print("Body measruement data ",body_measurement_data)
            data = {
                "patient": pat_id,
                "body_measurement": {
                    "weight": str(body_measurement_data.get("weight", "0.00")),
                    "height": str(body_measurement_data.get("height", "0.00")),
                    "created_at": body_measurement_data.get("created_at"),
                    "wfa": body_measurement_data.get("wfa") or None,
                    "lhfa": body_measurement_data.get("lhfa") or None,
                    "wfl": body_measurement_data.get("wfl") or None,
                    "muac": body_measurement_data.get("muac") or None,
                    "edemaSeverity": body_measurement_data.get("edemaSeverity") or None,
                    "muac_status": body_measurement_data.get("muac_status") or None,
                    "remarks": body_measurement_data.get("remarks") or None,
                    "is_opt": body_measurement_data.get("is_opt") or None,
                }
            }
        else:
            data = {
                "patient": pat_id,
                "body_measurement": {}
            }
        
        return Response(data, status=200)
    
    except Exception as e:
        return Response({"error": str(e)}, status=500)


def get_or_create_illness(illname, ill_description="", ill_code_prefix="FP"):
    try:
        return Illness.objects.get(illname=illname)
    except Illness.DoesNotExist:
        # Wrap in a transaction to avoid race conditions
        with transaction.atomic():
            result = Illness.objects.filter(ill_code__startswith=ill_code_prefix).aggregate(Max('ill_code'))
            max_ill_code = result['ill_code__max']
            
            new_code_num = 1
            if max_ill_code:
                try:
                    current_num = int(max_ill_code[len(ill_code_prefix):])
                    new_code_num = current_num + 1
                except (ValueError, IndexError):
                    logger.warning(f"Could not parse number from max_ill_code: {max_ill_code}. Resetting to 1.")
            
            new_ill_code = f"{ill_code_prefix}{str(new_code_num).zfill(3)}"
            
            try:
                illness = Illness.objects.create(
                    illname=illname,
                    ill_description=ill_description,
                    ill_code=new_ill_code
                )
                logger.info(f"Created new Illness: {illness.illname} ({illness.ill_code})")
                return illness
            except IntegrityError:
                # If another process created it first, just fetch it now
                return Illness.objects.get(illname=illname)
    
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
            "record_count": FP_Record.objects.filter(pat=record.pat).count(),
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
def get_fp_records_for_patient(request, patient_id):
    try:
        patient = get_object_or_404(
            Patient.objects.select_related('rp_id__per', 'trans_id'),
            pat_id=patient_id
        )

        # Optimize FP_Record query with related data
        fp_records = FP_Record.objects.filter(pat=patient).select_related(
            'patrec', 'spouse', 'pat'
        ).prefetch_related(
            'fp_type_set', # Prefetch FP_type related to FP_Record
            'fp_assessment_record__followv' # Prefetch assessment and its follow-up visit
        ).order_by("-created_at")

        if not fp_records.exists():
            return Response(
                {"detail": f"No Family Planning records found for patient ID: {patient_id}."},
                status=status.HTTP_404_NOT_FOUND,
            )

        data = []
        for record in fp_records:
            # Access pre-fetched assessment and follow-up
            assessment = record.fp_assessment_record.first() # Use .first() as it's a related_name
            follow_up_date = assessment.followv.followv_date if assessment and hasattr(assessment, 'followv') else None
            follow_up_status = assessment.followv.followv_status if assessment and hasattr(assessment, 'followv') else None

            patient_name = ""
            patient_age = None
            patient_sex = ""
            
            # Access pre-fetched patient details
            if patient.pat_type == "Resident" and patient.rp_id and patient.rp_id.per:
                personal = patient.rp_id.per
                patient_name = f"{personal.per_lname}, {personal.per_fname} {personal.per_mname or ''}".strip()
                patient_age = (
                    calculate_age_from_dob(personal.per_dob.isoformat())
                    if personal.per_dob
                    else None
                )
                patient_sex = personal.per_sex

            elif patient.pat_type == "Transient" and patient.trans_id:
                transient = patient.trans_id
                patient_name = f"{transient.tran_lname}, {transient.tran_fname} {transient.tran_mname or ''}".strip()
                patient_age = (
                    calculate_age_from_dob(transient.tran_dob.isoformat())
                    if transient.tran_dob
                    else None
                )
                patient_sex = transient.tran_sex

            # Access pre-fetched FP_type
            fp_type_instance = record.fp_type_set.first()
            raw_subtype = fp_type_instance.fpt_subtype if fp_type_instance else "N/A"

            data.append(
                {
                    "fprecord": record.fprecord_id,
                    "patrec_id": record.patrec.patrec_id,
                    "client_id": record.client_id or "N/A",
                    "patient_name": patient_name,
                    "patient_age": patient_age,
                    "sex": patient_sex,
                    "client_type": (
                        map_client_type(fp_type_instance.fpt_client_type) if fp_type_instance else "N/A"
                    ),
                    "method_used": (
                        fp_type_instance.fpt_method_used if fp_type_instance else "N/A"
                    ),
                    "subtype": raw_subtype,
                    "other_method": (
                        fp_type_instance.fpt_other_method if fp_type_instance else "N/A"
                    ),
                    "created_at": (
                        record.created_at.isoformat() if record.created_at else "N/A"
                    ),
                   
                    "dateOfFollowUp": (
                        follow_up_date.isoformat() if follow_up_date else "N/A"
                    ),
                    "followv_status": (
                        follow_up_status if follow_up_status else "N/A"
                    ),
                    "avg_monthly_income": record.avg_monthly_income or "N/A",
                }
            )

        return Response(data, status=status.HTTP_200_OK)

    except Patient.DoesNotExist:
        return Response(
            {"detail": f"Patient with ID {patient_id} not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        traceback.print_exc()
        return Response(
            {"error": f"Error fetching FP records for patient: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["GET"])
def get_obstetrical_history(request, pat_id):
    try:
        if not pat_id or pat_id == "undefined":
            raise ValueError("Invalid patient ID provided")

        patient = get_object_or_404(Patient, pat_id=pat_id)
        patient_records = PatientRecord.objects.filter(pat_id=patient)

        # Get summary obstetrical history
        obstetrical_summary_history = (
            Obstetrical_History.objects.filter(patrec_id__in=patient_records)  # Use 'patrec_id__in'
            .order_by("-patrec_id__created_at").first()  # Order by PatientRecord's created_at
        )

        # Get latest previous pregnancy (using direct FK to PatientRecord)
        latest_previous_pregnancy = (
            Previous_Pregnancy.objects.filter(patrec_id__in=patient_records)  # Use 'patrec_id__in'
            .order_by("-date_of_delivery", "-pfpp_id").first()  # Order to get the absolute latest
        )

        response_data = {
            "g_pregnancies": 0,
            "p_pregnancies": 0,
            "fullTerm": 0,
            "premature": 0,
            "abortion": 0,
            "livingChildren": 0,
            "lastDeliveryDate": None,
            "typeOfLastDelivery": None,
        }

        if obstetrical_summary_history:
            response_data.update({
                "g_pregnancies": obstetrical_summary_history.obs_gravida or 0,
                "p_pregnancies": obstetrical_summary_history.obs_para or 0,
                "fullTerm": obstetrical_summary_history.obs_fullterm or 0,
                "premature": obstetrical_summary_history.obs_preterm or 0,
                "abortion": obstetrical_summary_history.obs_abortion or 0,
                "livingChildren": obstetrical_summary_history.obs_living_ch or 0,
            })
        
        if latest_previous_pregnancy:
            response_data.update({
                "lastDeliveryDate": (
                    latest_previous_pregnancy.date_of_delivery.isoformat()
                    if latest_previous_pregnancy.date_of_delivery else None
                ),
                "typeOfLastDelivery": latest_previous_pregnancy.type_of_delivery or None,
            })
            
        return Response(response_data, status=200)

    except ValueError as ve:
        logger.error(f"ValueError in get_obstetrical_history: {str(ve)}")
        return Response({"error": str(ve)}, status=400)
    except Http404:
        logger.error(f"Patient not found for pat_id: {pat_id}")
        return Response({"error": "Patient not found."}, status=404)
    except Exception as e:
        logger.error(f"Error in get_obstetrical_history: {str(e)}")
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)
    
    
@api_view(["GET"])
def get_patient_details_data(request, patient_id):
    try:
        patient = get_object_or_404(Patient, pat_id=patient_id)
        serializer = PatientSerializer(patient)
        bodymeasure = BodyMeasurementReadSerializer(patient)
        latest_body = bodymeasure.data.get("body_measurement",{})
        patient_data = serializer.data
        personal_info = patient_data.get("personal_info", {})
        
        body_measurement = BodyMeasurement.objects.filter(pat=patient).order_by('-created_at').first()
        print("LATEST BODY MEASUREMENT: ", body_measurement)
        if body_measurement:
            body_measurement_data = BodyMeasurementSerializer(body_measurement).data
            weight = float(body_measurement_data.get("weight", "0.00"))
            height = float(body_measurement_data.get("height", "0.00"))
            body_measurement_date = body_measurement.created_at.isoformat()
        else:
            weight = 0.0
            height = 0.0
            body_measurement_date = None
            
        fp_form_data = {
            "pat_id": patient_data.get("pat_id", ""),
            "client_id": patient_data.get("client_id", ""),
            "philhealthNo": "",
            "nhts_status": "",
            "fourps": "",
            "lastName": personal_info.get("per_lname", ""),
            "givenName": personal_info.get("per_fname", ""),
            "contact": personal_info.get("per_contact", ""),  # ADD THIS
            "religion": personal_info.get("per_religion", ""),  # ADD THIS
            "middleInitial": personal_info.get("per_mname", "")[:1] if personal_info.get("per_mname") else "",
            "dateOfBirth": personal_info.get("per_dob", ""),
            "age": calculate_age_from_dob(personal_info.get("per_dob")) if personal_info.get("per_dob") else 0,
            "educationalAttainment": personal_info.get("per_edAttainment", ""),
            "occupation": patient_data.get("occupation", ""),
            "address": {
                "houseNumber": "",
                "street": "",
                "barangay": "",
                "municipality": "",
                "province": "",
            },
            "spouse": {
                "s_lastName": "",
                "s_givenName": "",
                "s_middleInitial": "",
                "s_dateOfBirth": "",
                "s_age": 0,
                "s_occupation": "",
            },
            "numOfLivingChildren": 0,
            "plan_more_children": False,
            "avg_monthly_income": patient_data.get("avgmonthlyincome", ""),
            "weight": weight,
            "height": height,
            "bodyMeasurementRecordedAt": body_measurement_date,
            "obstetricalHistory": {
                "g_pregnancies": 0,
                "p_pregnancies": 0,
                "fullTerm": 0,
                "premature": 0,
                "abortion": 0,
                "livingChildren": 0,
                "lastDeliveryDate": "",
                "typeOfLastDelivery": "",
                "lastMenstrualPeriod": "",
                "previousMenstrualPeriod": "",
                "menstrualFlow": "Scanty",
                "dysmenorrhea": False,
                "hydatidiformMole": False,
                "ectopicPregnancyHistory": False,
            },
        }

   
        address_info = patient_data.get("address")
        if address_info:
            fp_form_data["address"] = {
                "houseNumber": address_info.get("add_houseno", "")
                or "",  # Assuming add_houseno exists
                "street": address_info.get("add_street", ""),
                "barangay": address_info.get("add_barangay", ""),
                "municipality": address_info.get("add_city", ""),
                "province": address_info.get("add_province", ""),
            }
        

        # Fetch PhilHealth ID and NHTS status for Resident patients
        if patient.pat_type == "Resident" and patient.rp_id:
            try:
                hrd = HealthRelatedDetails.objects.filter(rp=patient.rp_id).first()
                if hrd:
                    fp_form_data["philhealthNo"] = hrd.per_add_philhealth_id or ""
                    print(f"✓ PhilHealth ID: {fp_form_data['philhealthNo']}")
            except Exception as e:
                print(f"Error fetching HealthRelatedDetails: {e}")

            try:
                household = Household.objects.filter(rp=patient.rp_id).first()
                if household:
                    fp_form_data["nhts_status"] = household.hh_nhts == "Yes"
                    print(f"✓ NHTS Status: {fp_form_data['nhts_status']}")
            except Exception as e:
                print(f"Error fetching Household: {e}")

        if patient.pat_type == "Transient" and patient.trans_id:
            try:
                transient = Transient.objects.filter(pk=patient.trans_id_id).first()
                if transient:
                    fp_form_data["contact"] = transient.tran_contact or ""
                    fp_form_data["religion"] = transient.tran_religion or ""
                    fp_form_data["philhealthNo"] = transient.philhealth_id or ""
                    print(f"✓ PhilHealth ID: {fp_form_data['philhealthNo']}")
            except Exception as e:
                print(f"Error fetching Transient PhilHealth ID: {e}")

        latest_fp_record = FP_Record.objects.filter(pat_id=patient_id).order_by('-created_at').first()
        try:
            if latest_fp_record.spouse:
                spouse_data = SpouseSerializer(latest_fp_record.spouse).data
                fp_form_data["spouse"] = {
                    "s_lastName": spouse_data.get("spouse_lname", ""),
                    "s_givenName": spouse_data.get("spouse_fname", ""),
                    "s_middleInitial": spouse_data.get("spouse_mname", "")[:1] if spouse_data.get("spouse_mname") else "",
                    "s_dateOfBirth": spouse_data.get("spouse_dob"),
                    "s_occupation": spouse_data.get("spouse_occupation", ""),
                    "s_educationalAttainment": spouse_data.get("spouse_ed_attainment", "")
                }
            else:
                fp_form_data["spouse"] = {}
        except Exception as e:
            print(f"Error fetching spouse information: {e}")

        # Fetch obstetrical history
      
        try:
            # First get the patient's records
            patient_records = PatientRecord.objects.filter(pat_id=patient)
            
            if patient_records.exists():
                # Get the most recent obstetrical history from patient records
                obstetrical_history = Obstetrical_History.objects.filter(
                    patrec_id__in=patient_records
                ).order_by('-patrec_id__created_at').first()
                
                if obstetrical_history:
                    fp_form_data["obstetricalHistory"] = {
                        "g_pregnancies": obstetrical_history.obs_gravida or 0,
                        "p_pregnancies": obstetrical_history.obs_para or 0,
                        "fullTerm": obstetrical_history.obs_fullterm or 0,
                        "premature": obstetrical_history.obs_preterm or 0,
                        "abortion": obstetrical_history.obs_abortion or 0,
                        "livingChildren": obstetrical_history.obs_living_ch or 0,
                        # "lastDeliveryDate": obstetrical_history.obs_last_delivery.isoformat() if hasattr(obstetrical_history, 'obs_last_delivery') and obstetrical_history.obs_last_delivery else "",
                        # "typeOfLastDelivery": obstetrical_history.obs_type_last_delivery or "",
                        "lastMenstrualPeriod": obstetrical_history.obs_lmp.isoformat() if obstetrical_history.obs_lmp else "",
                        # "previousMenstrualPeriod": obstetrical_history.obs_previous_period.isoformat() if hasattr(obstetrical_history, 'obs_previous_period') and obstetrical_history.obs_previous_period else "",
                        # "menstrualFlow": obstetrical_history.obs_mens_flow or "Scanty",
                        # "dysmenorrhea": obstetrical_history.obs_dysme or False,
                        # "hydatidiformMole": obstetrical_history.obs_hydatidiform or False,
                        # "ectopicPregnancyHistory": obstetrical_history.obs_ectopic_pregnancy or False,
                    }
                    print("✓ Complete obstetrical history:", fp_form_data["obstetricalHistory"])

                    # Fetch FP-specific obstetrical history
                    try:
                        # Get FP records for this patient
                        fp_records = FP_Record.objects.filter(patrec__in=patient_records).order_by('-created_at')
                        if fp_records.exists():
                            fp_record = fp_records.first()
                            fp_obs_history = FP_Obstetrical_History.objects.filter(fprecord=fp_record).first()
                            if fp_obs_history:
                                fp_form_data["obstetricalHistory"].update({
                                    "lastDeliveryDate": fp_obs_history.fpob_last_delivery.isoformat() if fp_obs_history.fpob_last_delivery else fp_form_data["obstetricalHistory"]["lastDeliveryDate"],
                                    "typeOfLastDelivery": fp_obs_history.fpob_type_last_delivery or fp_form_data["obstetricalHistory"]["typeOfLastDelivery"],
                                    "lastMenstrualPeriod": fp_obs_history.fpob_last_period.isoformat() if hasattr(fp_obs_history, 'fpob_last_period') and fp_obs_history.fpob_last_period else fp_form_data["obstetricalHistory"]["lastMenstrualPeriod"],
                                    "previousMenstrualPeriod": fp_obs_history.fpob_previous_period.isoformat() if fp_obs_history.fpob_previous_period else fp_form_data["obstetricalHistory"]["previousMenstrualPeriod"],
                                    "menstrualFlow": fp_obs_history.fpob_mens_flow or fp_form_data["obstetricalHistory"]["menstrualFlow"],
                                    "dysmenorrhea": fp_obs_history.fpob_dysme or fp_form_data["obstetricalHistory"]["dysmenorrhea"],
                                    "hydatidiformMole": fp_obs_history.fpob_hydatidiform or fp_form_data["obstetricalHistory"]["hydatidiformMole"],
                                    "ectopicPregnancyHistory": fp_obs_history.fpob_ectopic_pregnancy or fp_form_data["obstetricalHistory"]["ectopicPregnancyHistory"],
                                })
                                print("✓ Updated with FP-specific obstetrical history")
                    except Exception as e:
                        print(f"Error fetching FP-specific obstetrical history: {e}")
        except Exception as e:
            print(f"Error fetching obstetrical history: {e}")

        print(f"✓ Body Measurement Date: {body_measurement_date}")
         
        return Response(fp_form_data, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
def get_latest_fp_record_for_patient(request, patient_id):
    try:
        patient = get_object_or_404(Patient, pat_id=patient_id)
        fp_record = (
            FP_Record.objects.filter(pat=patient).order_by("-created_at").first()
        )

        if not fp_record:
            print(f"No FP records found for patient {patient_id}. Returning basic patient details.")
            fp_form_data = get_patient_details_data(patient_id)
            return Response(fp_form_data, status=status.HTTP_200_OK)

        print(f"DEBUG: fp_record.fprecord_id={fp_record.fprecord_id}, type={type(fp_record.fprecord_id)}")
        if not isinstance(fp_record.fprecord_id, (int, str)):
            raise ValueError(f"Invalid fprecord_id type: {type(fp_record.fprecord_id)}")
        complete_data = get_complete_fp_record_data(request, fp_record.fprecord_id)
        return Response(complete_data, status=status.HTTP_200_OK)

    except Patient.DoesNotExist:
        return Response(
            {"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            {"error": f"Error fetching latest complete FP record for patient: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
# def map_income_display(income):
#     """Map income IDs to human-readable labels"""
#     income_map = {
#         "lower": "Lower than 5,000",
#         "5,000-10,000": "5,000-10,000",
#         "10,000-30,000": "10,000-30,000",
#         "30,000-50,000": "30,000-50,000",
#         "50,000-80,000": "50,000-80,000",
#         "80,000-100,000": "80,000-100,000",
#         "100,000-200,000": "100,000-200,000",
#         "higher": "Higher than 200,000",
#     }
#     return income_map.get(income, income.title() if income else "")

@api_view(["GET"])
def get_complete_fp_record(request, fprecord_id):
    try:
        fp_record = get_object_or_404(
            FP_Record.objects.select_related(
                "pat",
                "pat__rp_id",
                "pat__rp_id__per",
                "pat__trans_id",
                "pat__trans_id__tradd_id"
            ).prefetch_related(
                "pat__rp_id__per__personal_addresses__add", 
                "pat__rp_id__household_set__add"
            ),
            fprecord_id=fprecord_id,
        )

        complete_data = FPRecordSerializer(fp_record).data
        print("Serialized FPRecord data:", complete_data)  # Debug
        complete_data["fprecord"] = fp_record.fprecord_id
        complete_data["plan_more_children"] = fp_record.plan_more_children
        complete_data["occupation"] = fp_record.occupation or "N/A"  # Set once
        complete_data["avg_monthly_income"] =  fp_record.avg_monthly_income or ""  # Original ID
        complete_data["avg_monthly_income_display"] = map_income_display(fp_record.avg_monthly_income) or ""  # Display value
        # complete_data["numOfLivingChildren"] = complete_data.num_of_children or 0
        complete_data["contact"] = ""
        complete_data["religion"] = ""
        
        try:
            fp_type = FP_type.objects.get(fprecord_id=fp_record)
            complete_data["fp_type"] = FPTypeSerializer(fp_type).data
            complete_data["typeOfClient"] = map_client_type(fp_type.fpt_client_type)
            complete_data["subTypeOfClient"] = map_subtype_display(fp_type.fpt_subtype)
            raw_reason = fp_type.fpt_reason_fp
            complete_data["reasonForFP"] = map_reason_display(raw_reason)
            
            if fp_type.fpt_client_type == "newacceptor":
                complete_data["reasonForFP"] = map_reason_display(fp_type.fpt_reason_fp)
                complete_data["reason"] = map_reason_display(fp_type.fpt_reason)
                complete_data["otherReasonForFP"] = map_reason_display(fp_type.fpt_reason)
            elif fp_type.fpt_client_type == "currentuser":
                complete_data["reasonForFP"] = map_reason_display(fp_type.fpt_reason_fp)
                complete_data["reason"] = map_reason_display(fp_type.fpt_reason)
                complete_data["otherReasonForFP"] = map_reason_display(fp_type.fpt_reason)
            else:
                complete_data["reasonForFP"] = fp_type.fpt_reason_fp
                complete_data["reason"] = fp_type.fpt_reason_fp
                complete_data["otherReasonForFP"] = None

            complete_data["methodCurrentlyUsed"] = fp_type.fpt_method_used
            complete_data["otherMethod"] = fp_type.fpt_other_method
        except FP_type.DoesNotExist:
            complete_data.update({
                "fp_type": None, "typeOfClient": None, "subTypeOfClient": None,
                "reasonForFP": None, "reason": None, "methodCurrentlyUsed": None,
                "otherReasonForFP": None, "otherMethod": None
            })
        
        # Patient data handling
        try:
            patient = fp_record.pat
            if not patient:
                raise Exception("No patient associated with this FP record")

            
            complete_data["pat_id"] = patient.pat_id
            complete_data["client_id"] = fp_record.client_id
            # Initialize default values (exclude occupation to preserve earlier value)
            complete_data.update({
                "lastName": "", "givenName": "", "middleInitial": "",
                "dateOfBirth": "", "age": "", "educationalAttainment": "",
                "philhealthNo": "", "nhts_status": False,
                "contact": "", "religion": "",  
                "address": {
                    "houseNumber": "", "street": "", "barangay": "",
                    "municipality": "", "province": "",
                }
            })
            philhealth_id = ""
            
            try:
                if patient.pat_type == "Resident" and patient.rp_id:
                    hrd = HealthRelatedDetails.objects.filter(rp=patient.rp_id).first()
                    if hrd:
                        philhealth_id = hrd.per_add_philhealth_id or ""
            except Exception as e:
                print(f"Error fetching health details: {e}")
            
            complete_data['philhealthNo'] = philhealth_id

            if patient.pat_type == "Resident" and patient.rp_id:
                print(f"Processing Resident Patient: {patient.pat_id}")
                if hasattr(patient.rp_id, "per") and patient.rp_id.per:
                    personal_info = patient.rp_id.per
                    complete_data.update({
                        "lastName": personal_info.per_lname or "",
                        "givenName": personal_info.per_fname or "",
                        "middleInitial": (personal_info.per_mname[:1] if personal_info.per_mname else ""),
                        "dateOfBirth": (personal_info.per_dob.isoformat() if personal_info.per_dob else ""),
                        "age": (calculate_age_from_dob(personal_info.per_dob.isoformat()) if personal_info.per_dob else 0),
                        "educationalAttainment": personal_info.per_edAttainment or "",
                        "contact": personal_info.per_contact or "",  # ADD CONTACT
                        "religion": personal_info.per_religion or "",  # ADD RELIGION
                    })

                address_found = False
                try:
                    households = Household.objects.filter(rp=patient.rp_id).select_related('add')
                    household = households.first()
                    if household and household.add:
                        address_info = household.add
                        complete_data["address"] = {
                            "houseNumber": "",
                            "street": address_info.add_street or "",
                            "barangay": address_info.add_barangay or "",
                            "municipality": address_info.add_city or "",
                            "province": address_info.add_province or "",
                        }
                        complete_data["nhts_status"] = household.hh_nhts == "Yes"
                        address_found = True
                except Exception as e:
                    print(f"Error getting address via Household: {e}")

                if not address_found and patient.rp_id.per:
                    try:
                        personal_addresses = patient.rp_id.per.personal_addresses.select_related('add').all()
                        personal_address = personal_addresses.first()
                        if personal_address and personal_address.add:
                            address_info = personal_address.add
                            complete_data["address"] = {
                                "houseNumber": "",
                                "street": address_info.add_street or "",
                                "barangay": address_info.add_barangay or "",
                                "municipality": address_info.add_city or "",
                                "province": address_info.add_province or "",
                            }
                            address_found = True
                    except Exception as e:
                        print(f"Error getting address via PersonalAddress: {e}")

            elif patient.pat_type == "Transient" and patient.trans_id:
                print(f"Processing Transient Patient: {patient.pat_id}")
                transient_info = patient.trans_id
                complete_data.update({
                    "lastName": transient_info.tran_lname or "",
                    "givenName": transient_info.tran_fname or "",
                    "middleInitial": (transient_info.tran_mname[:1] if transient_info.tran_mname else ""),
                    "dateOfBirth": (transient_info.tran_dob.isoformat() if transient_info.tran_dob else ""),
                    "age": (calculate_age_from_dob(transient_info.tran_dob.isoformat()) if transient_info.tran_dob else 0),
                    "educationalAttainment": transient_info.tran_ed_attainment or "",
                    "contact": transient_info.tran_contact or "",  # ADD CONTACT
                    "religion": transient_info.tran_religion or "",  # ADD RELIGION
                })
                if hasattr(transient_info, "tradd_id") and transient_info.tradd_id:
                    address_info = transient_info.tradd_id
                    complete_data["address"] = {
                        "houseNumber": "",
                        "street": address_info.tradd_street or "",
                        "barangay": address_info.tradd_barangay or "",
                        "municipality": address_info.tradd_city or "",
                        "province": address_info.tradd_province or "",
                    }

            if fp_record.spouse:
                spouse_data = SpouseSerializer(fp_record.spouse).data
                complete_data["spouse"] = {
                    "s_lastName": spouse_data.get("spouse_lname", ""),
                    "s_givenName": spouse_data.get("spouse_fname", ""),
                    "s_middleInitial": (spouse_data.get("spouse_mname", "")[:1] if spouse_data.get("spouse_mname") else ""),
                    "s_dateOfBirth": spouse_data.get("spouse_dob", ""),
                    "s_age": (calculate_age_from_dob(spouse_data.get("spouse_dob")) if spouse_data.get("spouse_dob") else 0),
                    "s_occupation": spouse_data.get("spouse_occupation", ""),
                }
            else:
                complete_data["spouse"] = {
                    "s_lastName": "", "s_givenName": "", "s_middleInitial": "",
                    "s_dateOfBirth": "", "s_age": 0, "s_occupation": "",
                }

        except Exception as e:
            print(f"Error fetching Patient/Personal Info for fprecord_id {fprecord_id}: {e}")
            complete_data.update({
                "patient_info": None, "lastName": "", "givenName": "", "middleInitial": "",
                "dateOfBirth": "", "age": "", "educationalAttainment": "", "address":"",
                "philhealthNo": "", "nhts_status": False, "spouse": {}, "contact": "", "religion":""
                # Do NOT set occupation here to preserve earlier value
            })

        # Fetch FP_Obstetrical_History
        try:
            fp_obstetrical_history = FP_Obstetrical_History.objects.filter(fprecord_id=fp_record).first()
            if fp_obstetrical_history:
                # complete_data["fp_obstetrical_history"] = FP_ObstetricalHistorySerializer(fp_obstetrical_history).data
                complete_data["obstetricalHistory"] = {
                    "lastDeliveryDate": (
                        fp_obstetrical_history.fpob_last_delivery.isoformat()
                        if fp_obstetrical_history.fpob_last_delivery else None
                    ),
                    "typeOfLastDelivery": fp_obstetrical_history.fpob_type_last_delivery or "",
                    "lastMenstrualPeriod": "",  # Initialize as empty string, will be updated from main obs
                    "previousMenstrualPeriod": (
                        fp_obstetrical_history.fpob_previous_period.isoformat()
                        if fp_obstetrical_history.fpob_previous_period else ""
                    ),
                    "menstrualFlow": fp_obstetrical_history.fpob_mens_flow or "Scanty",
                    "dysmenorrhea": fp_obstetrical_history.fpob_dysme or False,
                    "hydatidiformMole": fp_obstetrical_history.fpob_hydatidiform or False,
                    "ectopicPregnancyHistory": fp_obstetrical_history.fpob_ectopic_pregnancy or False,
                }
                
                if hasattr(fp_obstetrical_history, 'obs_id') and fp_obstetrical_history.obs_id:
                    try:
                        main_obs = Obstetrical_History.objects.get(obs_id=fp_obstetrical_history.obs_id)
                        # UPDATE: Add obs_lmp to lastMenstrualPeriod
                        complete_data["obstetricalHistory"].update({
                            "g_pregnancies": main_obs.obs_gravida or 0,
                            "p_pregnancies": main_obs.obs_para or 0,
                            "fullTerm": main_obs.obs_fullterm or 0,
                            "premature": main_obs.obs_preterm or 0,
                            "abortion": main_obs.obs_abortion or 0,
                            "numOfLivingChildren": main_obs.obs_living_ch or 0,
                            "childrenBornAlive": main_obs.obs_ch_born_alive or 0,
                            "largeBabies": main_obs.obs_lg_babies or 0,
                            "obs_lg_babies_str": main_obs.obs_lg_babies_str or "",
                            "stillBirth": main_obs.obs_still_birth or 0,
                            "lastMenstrualPeriod": (
                                main_obs.obs_lmp.isoformat()
                                if main_obs.obs_lmp else ""
                            ),  # ADD THIS LINE
                        })
                        complete_data["main_obstetrical_history"] = main_obs.obs_id
                    except Obstetrical_History.DoesNotExist:
                        complete_data["main_obstetrical_history"] = None
                else:
                    complete_data["main_obstetrical_history"] = None
                    
                # If no main obs found but we have FP obs with z field, use that as fallback
                if not complete_data["obstetricalHistory"]["lastMenstrualPeriod"] and hasattr(fp_obstetrical_history, 'z') and fp_obstetrical_history.z:
                    complete_data["obstetricalHistory"]["lastMenstrualPeriod"] = (
                        fp_obstetrical_history.z.isoformat()
                        if fp_obstetrical_history.z else ""
                    )
            else:
                # complete_data["fp_obstetrical_history"] = None
                complete_data["main_obstetrical_history"] = None
                complete_data["obstetricalHistory"] = {}
        except Exception as e:
            print(f"Error fetching FP Obstetrical History: {e}")
            # complete_data["fp_obstetrical_history"] = None
            complete_data["main_obstetrical_history"] = None
            complete_data["obstetricalHistory"] = {}

        # Fetch Risk STI
        try:
            risk_sti = FP_RiskSti.objects.get(fprecord_id=fp_record)
            # complete_data["risk_sti"] = FPRiskStiSerializer(risk_sti).data
            complete_data["sexuallyTransmittedInfections"] = {
                "abnormalDischarge": risk_sti.sti_abnormal_discharge,
                "dischargeFrom": risk_sti.sti_discharge_from,
                "sores": risk_sti.sti_sores,
                "pain": risk_sti.sti_pain,
                "history": risk_sti.sti_history,
                "hiv": risk_sti.sti_hiv,
            }
        except FP_RiskSti.DoesNotExist:
            complete_data["risk_sti"] = None
            complete_data["sexuallyTransmittedInfections"] = {}

        # Fetch Risk VAW
        try:
            risk_vaw = FP_RiskVaw.objects.get(fprecord_id=fp_record)
            complete_data["risk_vaw"] = FPRiskVawSerializer(risk_vaw).data
            complete_data["violenceAgainstWomen"] = {
                "unpleasantRelationship": risk_vaw.vaw_unpleasant_rs,
                "partnerDisapproval": risk_vaw.vaw_partner_disapproval,
                "domesticViolence": risk_vaw.vaw_domestic_violence,
                "referredTo": risk_vaw.vaw_referred_to,
            }
        except FP_RiskVaw.DoesNotExist:
            complete_data["risk_vaw"] = None
            complete_data["violenceAgainstWomen"] = {}

        # Fetch FP_Physical_Exam
        try:
            fp_physical_exam = FP_Physical_Exam.objects.get(fprecord_id=fp_record)
            physical_exam_serialized_data = FPPhysicalExamSerializer(fp_physical_exam).data
            print("PE DATA: ", physical_exam_serialized_data)
            complete_data["fp_physical_exam"] = physical_exam_serialized_data
            complete_data.update({
                "skinExamination": physical_exam_serialized_data.get("skin_exam"),
                "conjunctivaExamination": physical_exam_serialized_data.get("conjunctiva_exam"),
                "neckExamination": physical_exam_serialized_data.get("neck_exam"),
                "breastExamination": physical_exam_serialized_data.get("breast_exam"),
                "abdomenExamination": physical_exam_serialized_data.get("abdomen_exam"),
                "extremitiesExamination": physical_exam_serialized_data.get("extremities_exam"),
            })

            # Fetch the patient from fp_record
            patient = fp_record.pat

            # Fetch the latest BodyMeasurement for the patient
            latest_body_measurement = BodyMeasurement.objects.filter(pat=patient).order_by('-created_at').first()
            
            if latest_body_measurement:
                body_measurement_data = BodyMeasurementSerializer(latest_body_measurement).data
                complete_data["body_measurement"] = body_measurement_data
                complete_data["weight"] = body_measurement_data.get("weight", 0)
                complete_data["height"] = body_measurement_data.get("height", 0)
                complete_data["bodyMeasurementRecordedAt"] = body_measurement_data.get("created_at", None)
            else:
                complete_data["body_measurement"] = None
                complete_data["weight"] = 0
                complete_data["height"] = 0
                complete_data["bodyMeasurementRecordedAt"] = None

            # Fetch the latest VitalSigns for the patient across all PatientRecords
            latest_vital = VitalSigns.objects.filter(patrec__pat_id=patient).order_by('-created_at').first()
            
            if latest_vital:
                vital_signs_data = VitalSignsSerializer(latest_vital).data
                complete_data["pulseRate"] = vital_signs_data.get("vital_pulse", "N/A")
                complete_data["temperature"] = vital_signs_data.get("vital_temp", "N/A")
                complete_data["respiratoryRate"] = vital_signs_data.get("vital_RR", "N/A")
                complete_data["oxygenSaturation"] = vital_signs_data.get("vital_o2", "N/A")
                systolic = vital_signs_data.get("vital_bp_systolic", "N/A")
                diastolic = vital_signs_data.get("vital_bp_diastolic", "N/A")
                complete_data["bloodPressure"] = (
                    f"{systolic}/{diastolic}" if systolic != "N/A" and diastolic != "N/A"
                    else systolic if systolic != "N/A" else diastolic if diastolic != "N/A" else "N/A"
                )
            else:
                complete_data["pulseRate"] = "N/A"
                complete_data["temperature"] = "N/A"
                complete_data["respiratoryRate"] = "N/A"
                complete_data["oxygenSaturation"] = "N/A"
                complete_data["bloodPressure"] = "N/A"
        except FP_Physical_Exam.DoesNotExist:
            complete_data["fp_physical_exam"] = None
            complete_data["body_measurement"] = None
            complete_data["skinExamination"] = None
            complete_data["conjunctivaExamination"] = None
            complete_data["neckExamination"] = None
            complete_data["breastExamination"] = None
            complete_data["abdomenExamination"] = None
            complete_data["extremitiesExamination"] = None
            complete_data["bloodPressure"] = None
            complete_data["pulseRate"] = None
            complete_data["weight"] = 0
            complete_data["height"] = 0

        # Fetch FP_Pelvic_Exam
        try:
            fp_pelvic_exam = FP_Pelvic_Exam.objects.get(fprecord_id=fp_record)
            pelvic_exam_serialized_data = PelvicExamSerializer(fp_pelvic_exam).data
            display_values = get_pelvic_exam_display_values(pelvic_exam_serialized_data)
            complete_data["fp_pelvic_exam"] = display_values  
            print("Display values: ", display_values)
            print("Raw values: ", pelvic_exam_serialized_data)
            # complete_data.update({
            #     "pelvic_exam": display_values["pelvicExamination"],
            #     "cervical_consistency": display_values["cervicalConsistency"],
            #     "cervical_tenderness": display_values["cervicalTenderness"],
            #     "cervical_adnexal": display_values["cervicalAdnexal"],
            #     "uterine_position": display_values["uterinePosition"],
            #     "uterine_depth": display_values["uterineDepth"],
            # })
        except FP_Pelvic_Exam.DoesNotExist:
            complete_data["fp_pelvic_exam"] = None
            complete_data["pelvicExamination"] = None
            complete_data["cervicalConsistency"] = None
            complete_data["cervicalTenderness"] = False
            complete_data["cervicalAdnexal"] = False
            complete_data["uterinePosition"] = None
            complete_data["uterineDepth"] = None

        # Fetch FP_Acknowledgement
        try:
            fp_acknowledgement = FP_Acknowledgement.objects.get(fprecord_id=fp_record)
            acknowledgement_serialized_data = AcknowledgementSerializer(fp_acknowledgement).data
            
            complete_data["fp_acknowledgement"] = acknowledgement_serialized_data
            complete_data["acknowledgement"] = {
                "selectedMethod": acknowledgement_serialized_data.get("ack_client_method_choice")
                    or (fp_type.fpt_method_used if fp_type else None),
                "clientSignature": acknowledgement_serialized_data.get("ack_client_signature") or "",
                "clientSignatureDate": acknowledgement_serialized_data.get("ack_client_signature_date") or "",
                "clientName": acknowledgement_serialized_data.get("ack_client_name") or "",
                "guardianSignature": acknowledgement_serialized_data.get("ack_guardian_signature") or "",
                "guardianSignatureDate": acknowledgement_serialized_data.get("ack_guardian_signature_date") or "",
            }
        except FP_Acknowledgement.DoesNotExist:
            complete_data["fp_acknowledgement"] = None
            complete_data["acknowledgement"] = {
                "selectedMethod": None,
                "clientSignature": "",
                "clientSignatureDate": "",
                "clientName": "",
                "guardianSignature": "",
                "guardianSignatureDate": "",
            }

        # Fetch FP_PregnancyCheck
        try:
            fp_pregnancy_check = FP_pregnancy_check.objects.get(fprecord_id=fp_record)
            pregnancy_check_serialized_data = FP_PregnancyCheckSerializer(fp_pregnancy_check).data
            complete_data["fp_pregnancy_check"] = pregnancy_check_serialized_data
            complete_data["pregnancyCheck"] = {
                "breastfeeding": pregnancy_check_serialized_data.get("fp_pc_breastfeeding", False),
                "abstained": pregnancy_check_serialized_data.get("fp_pc_abstained", False),
                "recent_baby": pregnancy_check_serialized_data.get("fp_pc_recent_baby", False),
                "recent_period": pregnancy_check_serialized_data.get("fp_pc_recent_period", False),
                "recent_abortion": pregnancy_check_serialized_data.get("fp_pc_recent_abortion", False),
                "using_contraceptive": pregnancy_check_serialized_data.get("fp_pc_using_contraceptive", False),
            }
        except FP_pregnancy_check.DoesNotExist:
            complete_data["fp_pregnancy_check"] = None
            complete_data["pregnancyCheck"] = {
                "breastfeeding": False,
                "abstained": False,
                "recent_baby": False,
                "recent_period": False,
                "recent_abortion": False,
                "using_contraceptive": False,
            }
        # Fetch Medical History
        fp_medical_history_links = FP_MedicalHistory.objects.filter(
        fprecord=fp_record
        ).select_related("medhist", "medhist__ill").order_by("created_at")

        # Build current medical history data (only for this FP record)
        current_medical_history_data = []
        current_selected_illness_ids = []

        # Initialize the medicalHistory dictionary
        complete_data["medicalHistory"] = {
            "severeHeadaches": False,
            "strokeHeartAttackHypertension": False,
            "hematomaBruisingBleeding": False,
            "breastCancerHistory": False,
            "severeChestPain": False,
            "cough": False,
            "jaundice": False,
            "unexplainedVaginalBleeding": False,
            "abnormalVaginalDischarge": False,
            "phenobarbitalOrRifampicin": False,
            "smoker": False,
            "disability": False,
            "disabilityDetails": ""
        }

        for link in fp_medical_history_links:
            history = link.medhist
            current_medical_history_data.append({
                "medhist_id": history.medhist_id,
                "ill_id": history.ill.ill_id,
                "illname": history.ill.illname,
                "ill_code": history.ill.ill_code,
                "created_at": history.created_at.isoformat() if history.created_at else None
            })
            current_selected_illness_ids.append(history.ill.ill_id)

            # Dynamically mark checkboxes
            checkbox_name = get_checkbox_name_from_illness(history.ill.illname)
            if checkbox_name and checkbox_name in complete_data["medicalHistory"]:
                complete_data["medicalHistory"][checkbox_name] = True
            elif history.ill.illname.lower().startswith("disability") or history.ill.illname.lower().startswith("others"):
                complete_data["medicalHistory"]["disability"] = True
                if hasattr(history, 'disability_details'):
                    complete_data["medicalHistory"]["disabilityDetails"] = history.disability_details or ""

        # If you still want to show ALL historical medical history for the patient (optional)
        historical_data = []
        for history in MedicalHistory.objects.filter(patrec=fp_record.patrec).select_related("ill").order_by("-created_at"):
            historical_data.append({
                "medhist_id": history.medhist_id,
                "ill_id": history.ill.ill_id,
                "illname": history.ill.illname,
                "ill_code": history.ill.ill_code,
                "created_at": history.created_at.isoformat() if history.created_at else None,
                "is_current": history.medhist_id in [link.medhist_id for link in fp_medical_history_links]
            })

        complete_data["medical_history_records"] = current_medical_history_data
        complete_data["selectedIllnessIds"] = current_selected_illness_ids
        complete_data["historical_medical_history"] = historical_data

        current_patrec_id = fp_record.patrec_id
        current_method = fp_type.fpt_method_used if fp_type else None

        current_assessment = fp_record.fp_assessment_record.first()
        if current_assessment:
            current_visit_date = None
            if current_assessment.followv:
                if current_assessment.followv.completed_at:
                    current_visit_date = current_assessment.followv.completed_at
                elif current_assessment.followv.created_at:
                    current_visit_date = current_assessment.followv.created_at.date()
            if not current_visit_date:
                current_visit_date = fp_record.created_at.date()
        else:
            current_visit_date = fp_record.created_at.date()

        print(f"Debug: Current visit date: {current_visit_date}")
        print(f"Debug: Current fprecord_id: {fp_record.fprecord_id}")

        # Get all FP records that belong to the SAME patient record (patrec_id)
        all_fp_records_for_patrec = FP_Record.objects.filter(
            patrec_id=current_patrec_id  # Only records from the same patient record
        ).order_by('created_at').prefetch_related(  # Ascending order for chronological
            Prefetch('fp_assessment_record', queryset=FP_Assessment_Record.objects.select_related('followv')),
            Prefetch('fp_physical_exam', queryset=FP_Physical_Exam.objects.select_related('bm', 'vital')),
            Prefetch('fp_acknowledgement', queryset=FP_Acknowledgement.objects.select_related('fpt'))
        )

        # Additional filtering for method consistency within the patient record
        if current_method:
            all_fp_records_for_patrec = all_fp_records_for_patrec.filter(
                fp_type__fpt_method_used=current_method
            )

        print(f"Debug: Current patrec_id: {current_patrec_id}")
        print(f"Debug: Current method: {current_method}")
        print(f"Debug: Found {all_fp_records_for_patrec.count()} FP records for this patient record")

        # Build service provision records
        service_provision_records = []

        # Get the current fprecord_id as the upper limit
        current_fprecord_id = fp_record.fprecord_id

        for historical_fp_record in all_fp_records_for_patrec:
            # Only include records that have assessment records (actual visits)
            assessment = historical_fp_record.fp_assessment_record.first()
            if not assessment:
                print(f"Debug: Skipping FP record {historical_fp_record.fprecord_id} - no assessment")
                continue

            # Compute visit_date for reference
            visit_date = None
            if assessment.followv:
                if assessment.followv.completed_at:
                    visit_date = assessment.followv.completed_at
                elif assessment.followv.created_at:
                    visit_date = assessment.followv.created_at.date()
            if not visit_date:
                visit_date = historical_fp_record.created_at.date()

            # Filter: include only records up to and including the current fprecord_id
            if historical_fp_record.fprecord_id > current_fprecord_id:
                print(f"Debug: Skipping future record {historical_fp_record.fprecord_id}")
                continue

            physical_exam = historical_fp_record.fp_physical_exam.first()
            acknowledgement = historical_fp_record.fp_acknowledgement.first()

            # For display, use strftime
            display_visit_date = visit_date.strftime('%Y-%m-%d') if visit_date else ''

            service_dict = {
                'dateOfVisit': display_visit_date,
                'dateOfFollowUp': (
                    assessment.followv.followv_date.strftime('%Y-%m-%d')
                    if assessment.followv and assessment.followv.followv_date
                    else ''
                ),
                'weight': (
                    physical_exam.bm.weight if physical_exam and physical_exam.bm else 0
                ),
                'bloodPressure': (
                    f"{physical_exam.vital.vital_bp_systolic}/{physical_exam.vital.vital_bp_diastolic}"
                    if physical_exam and physical_exam.vital and physical_exam.vital.vital_bp_systolic and physical_exam.vital.vital_bp_diastolic
                    else 'N/A'
                ),
                'medicalFindings': assessment.as_findings or '',
                'methodAccepted': (
                    acknowledgement.fpt.fpt_method_used if acknowledgement and acknowledgement.fpt else ''
                ),
                'methodQuantity': assessment.quantity or 0,
                'serviceProviderSignature': assessment.as_provider_signature or '',
                'nameOfServiceProvider': assessment.as_provider_name or '',
                'fprecord_id': historical_fp_record.fprecord_id,  # Add this for debugging
            }
            service_provision_records.append(service_dict)
            print(f"Debug: Added service record for FP {historical_fp_record.fprecord_id} with visit date {visit_date}")

        print(f"Debug: Final service provision records count: {len(service_provision_records)}")

        # Sort by visit date and fprecord_id as secondary key (earliest first)
        service_provision_records.sort(
            key=lambda x: (x['dateOfVisit'] if x['dateOfVisit'] else '1900-01-01', x['fprecord_id'])
        )

        complete_data["serviceProvisionRecords"] = service_provision_records

        print("Final occupation before response:", complete_data["occupation"])  # Debug
        return Response(complete_data, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            {"error": f"Error fetching complete FP record: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    
def get_complete_fp_record_data(request, fprecord_id):
    try:
        fp_record = FP_Record.objects.select_related(
            "pat",
            "pat__rp_id",
            "pat__rp_id__per",
            "pat__trans_id",
            "pat__trans_id__tradd_id"
        ).prefetch_related(
            "pat__rp_id__per__personal_addresses__add", 
            "pat__rp_id__household_set__add"
        ).get(fprecord_id=fprecord_id)

        complete_data = FPRecordSerializer(fp_record).data
        print("Serialized FPRecord data:", complete_data)  # Debug
        complete_data["fprecord"] = fp_record.fprecord_id
        complete_data["plan_more_children"] = fp_record.plan_more_children
        complete_data["occupation"] = fp_record.occupation or "N/A"  # Set once
        complete_data["avg_monthly_income"] =  fp_record.avg_monthly_income or ""  # Original ID
        complete_data["avg_monthly_income_display"] = map_income_display(fp_record.avg_monthly_income) or ""  # Display value
        complete_data["contact"] = ""
        complete_data["religion"] = ""
        
        print("Initial occupation set:", complete_data["occupation"])  # Debug
        
        try:
            fp_type = FP_type.objects.get(fprecord_id=fp_record)
            complete_data["fp_type"] = FPTypeSerializer(fp_type).data
            complete_data["typeOfClient"] = map_client_type(fp_type.fpt_client_type)
            complete_data["subTypeOfClient"] = map_subtype_display(fp_type.fpt_subtype)
            raw_reason = fp_type.fpt_reason_fp
            complete_data["reasonForFP"] = map_reason_display(raw_reason)
            
            if fp_type.fpt_client_type == "newacceptor":
                complete_data["reasonForFP"] = map_reason_display(fp_type.fpt_reason_fp)
                complete_data["reason"] = map_reason_display(fp_type.fpt_reason)
                complete_data["otherReasonForFP"] = map_reason_display(fp_type.fpt_reason)
            elif fp_type.fpt_client_type == "currentuser":
                complete_data["reasonForFP"] = map_reason_display(fp_type.fpt_reason_fp)
                complete_data["reason"] = map_reason_display(fp_type.fpt_reason)
                complete_data["otherReasonForFP"] = map_reason_display(fp_type.fpt_reason)
            else:
                complete_data["reasonForFP"] = fp_type.fpt_reason_fp
                complete_data["reason"] = fp_type.fpt_reason_fp
                complete_data["otherReasonForFP"] = None
            complete_data["methodCurrentlyUsed"] = fp_type.fpt_method_used
            complete_data["otherMethod"] = fp_type.fpt_other_method
        except FP_type.DoesNotExist:
            complete_data.update({
                "fp_type": None, "typeOfClient": None, "subTypeOfClient": None,
                "reasonForFP": None, "reason": None, "methodCurrentlyUsed": None,
                "otherReasonForFP": None, "otherMethod": None
            })

        try:
            patient = fp_record.pat
            if not patient:
                raise Exception("No patient associated with this FP record")

            complete_data["pat_id"] = patient.pat_id
            complete_data["client_id"] = fp_record.client_id
            complete_data["fourps"] = fp_record.fourps
            
            # Initialize default values (exclude occupation)
            complete_data.update({
                "lastName": "", "givenName": "", "middleInitial": "",
                "dateOfBirth": "", "age": "", "educationalAttainment": "",
                "philhealthNo": "", "nhts_status": False,
                "address": {
                    "houseNumber": "", "street": "", "barangay": "",
                    "municipality": "", "province": "", "contact": "", "religion": "",
                }
            })

            try:
                if patient.pat_type == "Resident" and patient.rp_id:
                    hrd = HealthRelatedDetails.objects.filter(rp_id=patient.rp_id).first()
                    if hrd:
                        complete_data["philhealthNo"] = hrd.per_add_philhealth_id or ""
            except Exception as e:
                print(f"Error fetching health details: {e}")

            if patient.pat_type == "Resident" and patient.rp_id:
                print(f"Processing Resident Patient: {patient.pat_id}")
                if hasattr(patient.rp_id, "per") and patient.rp_id.per:
                    personal_info = patient.rp_id.per
                    complete_data.update({
                        "lastName": personal_info.per_lname or "",
                        "givenName": personal_info.per_fname or "",
                        "middleInitial": (personal_info.per_mname[:1] if personal_info.per_mname else ""),
                        "dateOfBirth": (personal_info.per_dob.isoformat() if personal_info.per_dob else ""),
                        "age": (calculate_age_from_dob(personal_info.per_dob.isoformat()) if personal_info.per_dob else 0),
                        "educationalAttainment": personal_info.per_edAttainment or "",
                        "contact": personal_info.per_contact or "",
                        "religion": personal_info.per_religion or "",
                    })

                address_found = False
                try:
                    households = Household.objects.filter(rp=patient.rp_id).select_related('add')
                    household = households.first()
                    if household and household.add:
                        address_info = household.add
                        complete_data["address"] = {
                            "houseNumber": "",
                            "street": address_info.add_street or "",
                            "barangay": address_info.add_barangay or "",
                            "municipality": address_info.add_city or "",
                            "province": address_info.add_province or "",
                        }
                        complete_data["nhts_status"] = household.hh_nhts == "Yes"
                        address_found = True
                except Exception as e:
                    print(f"Error getting address via Household: {e}")

                if not address_found and patient.rp_id.per:
                    try:
                        personal_addresses = personal_info.personal_addresses.select_related('add').all()
                        personal_address = personal_addresses.first()
                        if personal_address and personal_address.add:
                            address_info = personal_address.add
                            complete_data["address"] = {
                                "houseNumber": "",
                                "street": address_info.add_street or "",
                                "barangay": address_info.add_barangay or "",
                                "municipality": address_info.add_city or "",
                                "province": address_info.add_province or "",
                            }
                            address_found = True
                    except Exception as e:
                        print(f"Error getting address via PersonalAddress: {e}")

            elif patient.pat_type == "Transient" and patient.trans_id:
                print(f"Processing Transient Patient: {patient.pat_id}")
                transient_info = patient.trans_id
                complete_data.update({
                    "lastName": transient_info.tran_lname or "",
                    "givenName": transient_info.tran_fname or "",
                    "middleInitial": (transient_info.tran_mname[:1] if transient_info.tran_mname else ""),
                    "dateOfBirth": (transient_info.tran_dob.isoformat() if transient_info.tran_dob else ""),
                    "age": (calculate_age_from_dob(transient_info.tran_dob.isoformat()) if transient_info.tran_dob else 0),
                    "educationalAttainment": transient_info.tran_ed_attainment or "",
                })
                if hasattr(transient_info, "tradd_id") and transient_info.tradd_id:
                    address_info = transient_info.tradd_id
                    complete_data["address"] = {
                        "houseNumber": "",
                        "street": address_info.tradd_street or "",
                        "barangay": address_info.tradd_barangay or "",
                        "municipality": address_info.tradd_city or "",
                        "province": address_info.tradd_province or "",
                        "contact": transient_info.tran_contact or "",
                        "religion": transient_info.tran_religion or "",
                    }

            if fp_record.spouse:
                spouse_data = SpouseSerializer(fp_record.spouse).data
                complete_data["spouse"] = {
                    "s_lastName": spouse_data.get("spouse_lname", ""),
                    "s_givenName": spouse_data.get("spouse_fname", ""),
                    "s_middleInitial": (spouse_data.get("spouse_mname", "")[:1] if spouse_data.get("spouse_mname") else ""),
                    "s_dateOfBirth": spouse_data.get("spouse_dob", ""),
                    "s_age": (calculate_age_from_dob(spouse_data.get("spouse_dob")) if spouse_data.get("spouse_dob") else 0),
                    "s_occupation": spouse_data.get("spouse_occupation", ""),
                }
            else:
                complete_data["spouse"] = {
                    "s_lastName": "", "s_givenName": "", "s_middleInitial": "",
                    "s_dateOfBirth": "", "s_age": 0, "s_occupation": "",
                }

        except Exception as e:
            print(f"Error fetching Patient/Personal Info for fprecord_id {fprecord_id}: {e}")
            complete_data.update({
                "patient_info": None, "lastName": "", "givenName": "", "middleInitial": "",
                "dateOfBirth": "", "age": "", "educationalAttainment": "",
                "philhealthNo": "", "nhts_status": False, "spouse": {}, "contact": "", "religion": ""
                # Do NOT set occupation here
            })

        # Fetch FP_Obstetrical_History
        try:
            fp_obstetrical_history = FP_Obstetrical_History.objects.filter(fprecord_id=fp_record).first()
            if fp_obstetrical_history:
                # complete_data["fp_obstetrical_history"] = FP_ObstetricalHistorySerializer(fp_obstetrical_history).data
                complete_data["obstetricalHistory"] = {
                    "lastDeliveryDate": (
                        fp_obstetrical_history.fpob_last_delivery.isoformat()
                        if fp_obstetrical_history.fpob_last_delivery else None
                    ),
                    "typeOfLastDelivery": fp_obstetrical_history.fpob_type_last_delivery or "",
                    "lastMenstrualPeriod": "",  # Initialize as empty string, will be updated from main obs
                    "previousMenstrualPeriod": (
                        fp_obstetrical_history.fpob_previous_period.isoformat()
                        if fp_obstetrical_history.fpob_previous_period else ""
                    ),
                    "menstrualFlow": fp_obstetrical_history.fpob_mens_flow or "Scanty",
                    "dysmenorrhea": fp_obstetrical_history.fpob_dysme or False,
                    "hydatidiformMole": fp_obstetrical_history.fpob_hydatidiform or False,
                    "ectopicPregnancyHistory": fp_obstetrical_history.fpob_ectopic_pregnancy or False,
                }
                
                if hasattr(fp_obstetrical_history, 'obs_id') and fp_obstetrical_history.obs_id:
                    try:
                        main_obs = Obstetrical_History.objects.get(obs_id=fp_obstetrical_history.obs_id)
                        # UPDATE: Add obs_lmp to lastMenstrualPeriod
                        complete_data["obstetricalHistory"].update({
                            "g_pregnancies": main_obs.obs_gravida or 0,
                            "p_pregnancies": main_obs.obs_para or 0,
                            "fullTerm": main_obs.obs_fullterm or 0,
                            "premature": main_obs.obs_preterm or 0,
                            "abortion": main_obs.obs_abortion or 0,
                            "numOfLivingChildren": main_obs.obs_living_ch or 0,
                            "childrenBornAlive": main_obs.obs_ch_born_alive or 0,
                            "largeBabies": main_obs.obs_lg_babies or 0,
                            "obs_lg_babies_str": main_obs.obs_lg_babies_str or "",
                            "stillBirth": main_obs.obs_still_birth or 0,
                            "lastMenstrualPeriod": (
                                main_obs.obs_lmp.isoformat()
                                if main_obs.obs_lmp else ""
                            ),  # ADD THIS LINE
                        })
                        complete_data["main_obstetrical_history"] = main_obs.obs_id
                    except Obstetrical_History.DoesNotExist:
                        complete_data["main_obstetrical_history"] = None
                else:
                    complete_data["main_obstetrical_history"] = None
                    
                # If no main obs found but we have FP obs with z field, use that as fallback
                if not complete_data["obstetricalHistory"]["lastMenstrualPeriod"] and hasattr(fp_obstetrical_history, 'z') and fp_obstetrical_history.z:
                    complete_data["obstetricalHistory"]["lastMenstrualPeriod"] = (
                        fp_obstetrical_history.z.isoformat()
                        if fp_obstetrical_history.z else ""
                    )
            else:
                # complete_data["fp_obstetrical_history"] = None
                complete_data["main_obstetrical_history"] = None
                complete_data["obstetricalHistory"] = {}
        except Exception as e:
            print(f"Error fetching FP Obstetrical History: {e}")
            # complete_data["fp_obstetrical_history"] = None
            complete_data["main_obstetrical_history"] = None
            complete_data["obstetricalHistory"] = {}
            
        # Fetch Risk STI
        try:
            risk_sti = FP_RiskSti.objects.get(fprecord_id=fp_record)
            complete_data["risk_sti"] = FPRiskStiSerializer(risk_sti).data
            complete_data["sexuallyTransmittedInfections"] = {
                "abnormalDischarge": risk_sti.sti_abnormal_discharge,
                "dischargeFrom": risk_sti.sti_discharge_from,
                "sores": risk_sti.sti_sores,
                "pain": risk_sti.sti_pain,
                "history": risk_sti.sti_history,
                "hiv": risk_sti.sti_hiv,
            }
        except FP_RiskSti.DoesNotExist:
            complete_data["risk_sti"] = None
            complete_data["sexuallyTransmittedInfections"] = {}

        # Fetch Risk VAW
        try:
            risk_vaw = FP_RiskVaw.objects.get(fprecord_id=fp_record)
            complete_data["risk_vaw"] = FPRiskVawSerializer(risk_vaw).data
            complete_data["violenceAgainstWomen"] = {
                "unpleasantRelationship": risk_vaw.vaw_unpleasant_rs,
                "partnerDisapproval": risk_vaw.vaw_partner_disapproval,
                "domesticViolence": risk_vaw.vaw_domestic_violence,
                "referredTo": risk_vaw.vaw_referred_to,
            }
        except FP_RiskVaw.DoesNotExist:
            complete_data["risk_vaw"] = None
            complete_data["violenceAgainstWomen"] = {}

        # Fetch FP_Physical_Exam
        try:
            fp_physical_exam = FP_Physical_Exam.objects.get(fprecord_id=fp_record)
            physical_exam_serialized_data = FPPhysicalExamSerializer(fp_physical_exam).data
            complete_data["fp_physical_exam"] = physical_exam_serialized_data
            complete_data.update({
                "skinExamination": physical_exam_serialized_data.get("skin_exam"),
                "conjunctivaExamination": physical_exam_serialized_data.get("conjunctiva_exam"),
                "neckExamination": physical_exam_serialized_data.get("neck_exam"),
                "breastExamination": physical_exam_serialized_data.get("breast_exam"),
                "abdomenExamination": physical_exam_serialized_data.get("abdomen_exam"),
                "extremitiesExamination": physical_exam_serialized_data.get("extremities_exam"),
            })

            # Fetch the patient from fp_record
            patient = fp_record.pat
            print("Patient ",patient)
            # Fetch the latest BodyMeasurement for the patient
            latest_body_measurement = BodyMeasurement.objects.filter(pat=patient).order_by('-created_at').first()
            print("latest_body_measurement",latest_body_measurement)
            
            
            if latest_body_measurement:
                body_measurement_data = BodyMeasurementSerializer(latest_body_measurement).data
                complete_data["body_measurement"] = body_measurement_data
                complete_data["weight"] = body_measurement_data.get("weight", 0)
                complete_data["height"] = body_measurement_data.get("height", 0)
                complete_data["bodyMeasurementRecordedAt"] = body_measurement_data.get("created_at", None)
            else:
                complete_data["body_measurement"] = None
                complete_data["weight"] = 0
                complete_data["height"] = 0
                complete_data["bodyMeasurementRecordedAt"] = None
                
            latest_vital = VitalSigns.objects.filter(patrec__pat_id=patient).order_by('-created_at').first()
            
            if latest_vital:
                vital_signs_data = VitalSignsSerializer(latest_vital).data
                complete_data["pulseRate"] = vital_signs_data.get("vital_pulse", "N/A")
                complete_data["temperature"] = vital_signs_data.get("vital_temp", "N/A")
                complete_data["respiratoryRate"] = vital_signs_data.get("vital_RR", "N/A")
                complete_data["oxygenSaturation"] = vital_signs_data.get("vital_o2", "N/A")
                systolic = vital_signs_data.get("vital_bp_systolic", "N/A")
                diastolic = vital_signs_data.get("vital_bp_diastolic", "N/A")
                complete_data["bloodPressure"] = (
                    f"{systolic}/{diastolic}" if systolic != "N/A" and diastolic != "N/A"
                    else systolic if systolic != "N/A" else diastolic if diastolic != "N/A" else "N/A"
                )
            else:
                complete_data["pulseRate"] = "N/A"
                complete_data["temperature"] = "N/A"
                complete_data["respiratoryRate"] = "N/A"
                complete_data["oxygenSaturation"] = "N/A"
                complete_data["bloodPressure"] = "N/A"
        except FP_Physical_Exam.DoesNotExist:
            complete_data["fp_physical_exam"] = None
            complete_data["body_measurement"] = None
            complete_data["skinExamination"] = None
            complete_data["conjunctivaExamination"] = None
            complete_data["neckExamination"] = None
            complete_data["breastExamination"] = None
            complete_data["abdomenExamination"] = None
            complete_data["extremitiesExamination"] = None
            complete_data["bloodPressure"] = None
            complete_data["pulseRate"] = None
            complete_data["weight"] = 0
            complete_data["height"] = 0

        # Fetch FP_Pelvic_Exam
        try:
            fp_pelvic_exam = FP_Pelvic_Exam.objects.get(fprecord_id=fp_record)
            pelvic_exam_serialized_data = PelvicExamSerializer(fp_pelvic_exam).data
            display_values = get_pelvic_exam_display_values(pelvic_exam_serialized_data)
            complete_data["fp_pelvic_exam"] = display_values
            print("Display values: ", display_values)
            print("Raw values: ", pelvic_exam_serialized_data)
            complete_data.update({
                "pelvicExamination": pelvic_exam_serialized_data.get("pelvicExamination"),
                "cervicalConsistency": pelvic_exam_serialized_data.get("cervicalConsistency"),
                "cervicalTenderness": pelvic_exam_serialized_data.get("cervicalTenderness"),
                "cervicalAdnexal": pelvic_exam_serialized_data.get("cervicalAdnexal"),
                "uterinePosition": pelvic_exam_serialized_data.get("uterinePosition"),
                "uterineDepth": pelvic_exam_serialized_data.get("uterineDepth"),
            })
        except FP_Pelvic_Exam.DoesNotExist:
            complete_data["fp_pelvic_exam"] = None
            complete_data["pelvicExamination"] = None
            complete_data["cervicalConsistency"] = None
            complete_data["cervicalTenderness"] = False
            complete_data["cervicalAdnexal"] = False
            complete_data["uterinePosition"] = None
            complete_data["uterineDepth"] = None

        # Fetch FP_Acknowledgement
        try:
            fp_acknowledgement = FP_Acknowledgement.objects.get(fprecord_id=fp_record)
            acknowledgement_serialized_data = AcknowledgementSerializer(fp_acknowledgement).data
            complete_data["fp_acknowledgement"] = acknowledgement_serialized_data
            complete_data["acknowledgement"] = {
                "selectedMethod": acknowledgement_serialized_data.get("ack_client_method_choice")
                    or (fp_type.fpt_method_used if fp_type else None),
                "clientSignature": acknowledgement_serialized_data.get("ack_clientSignature") or "",
                "clientSignatureDate": acknowledgement_serialized_data.get("ack_clientSignatureDate") or "",
                "clientName": acknowledgement_serialized_data.get("ack_client_name") or "",
                # "guardianName": acknowledgement_serialized_data.get("guardian_name") or "",
                "guardianSignature": acknowledgement_serialized_data.get("ack_guardian_signature") or "",
                "guardianSignatureDate": acknowledgement_serialized_data.get("ack_guardian_signature_date") or "",
            }
        except FP_Acknowledgement.DoesNotExist:
            complete_data["fp_acknowledgement"] = None
            complete_data["acknowledgement"] = {
                "selectedMethod": None,
                "clientSignature": "",
                "clientSignatureDate": "",
                "clientName": "",
                # "guardianName": "",
                "guardianSignature": "",
                "guardianSignatureDate": "",
            }

        # Fetch FP_PregnancyCheck
        try:
            fp_pregnancy_check = FP_pregnancy_check.objects.get(fprecord_id=fp_record)
            pregnancy_check_serialized_data = FP_PregnancyCheckSerializer(fp_pregnancy_check).data
            complete_data["fp_pregnancy_check"] = pregnancy_check_serialized_data
            complete_data["pregnancyCheck"] = {
                "breastfeeding": pregnancy_check_serialized_data.get("fp_pc_breastfeeding", False),
                "abstained": pregnancy_check_serialized_data.get("fp_pc_abstained", False),
                "recent_baby": pregnancy_check_serialized_data.get("fp_pc_recent_baby", False),
                "recent_period": pregnancy_check_serialized_data.get("fp_pc_recent_period", False),
                "recent_abortion": pregnancy_check_serialized_data.get("fp_pc_recent_abortion", False),
                "using_contraceptive": pregnancy_check_serialized_data.get("fp_pc_using_contraceptive", False),
            }
        except FP_pregnancy_check.DoesNotExist:
            complete_data["fp_pregnancy_check"] = None
            complete_data["pregnancyCheck"] = {
                "breastfeeding": False,
                "abstained": False,
                "recent_baby": False,
                "recent_period": False,
                "recent_abortion": False,
                "using_contraceptive": False,
            }

        fp_medical_history_links = FP_MedicalHistory.objects.filter(
        fprecord=fp_record
        ).select_related("medhist", "medhist__ill").order_by("created_at")

        # Build current medical history data (only for this FP record)
        current_medical_history_data = []
        current_selected_illness_ids = []

        # Initialize the medicalHistory dictionary
        complete_data["medicalHistory"] = {
            "severeHeadaches": False,
            "strokeHeartAttackHypertension": False,
            "hematomaBruisingBleeding": False,
            "breastCancerHistory": False,
            "severeChestPain": False,
            "cough": False,
            "jaundice": False,
            "unexplainedVaginalBleeding": False,
            "abnormalVaginalDischarge": False,
            "phenobarbitalOrRifampicin": False,
            "smoker": False,
            "disability": False,
            "disabilityDetails": ""
        }

        for link in fp_medical_history_links:
            history = link.medhist
            current_medical_history_data.append({
                "medhist_id": history.medhist_id,
                "ill_id": history.ill.ill_id,
                "illname": history.ill.illname,
                "ill_code": history.ill.ill_code,
                "created_at": history.created_at.isoformat() if history.created_at else None
            })
            current_selected_illness_ids.append(history.ill.ill_id)

            # Dynamically mark checkboxes
            checkbox_name = get_checkbox_name_from_illness(history.ill.illname)
            if checkbox_name and checkbox_name in complete_data["medicalHistory"]:
                complete_data["medicalHistory"][checkbox_name] = True
            elif history.ill.illname.lower().startswith("disability") or history.ill.illname.lower().startswith("others"):
                complete_data["medicalHistory"]["disability"] = True
                if hasattr(history, 'disability_details'):
                    complete_data["medicalHistory"]["disabilityDetails"] = history.disability_details or ""

        # If you still want to show ALL historical medical history for the patient (optional)
        historical_data = []
        for history in MedicalHistory.objects.filter(patrec=fp_record.patrec).select_related("ill").order_by("-created_at"):
            historical_data.append({
                "medhist_id": history.medhist_id,
                "ill_id": history.ill.ill_id,
                "illname": history.ill.illname,
                "ill_code": history.ill.ill_code,
                "created_at": history.created_at.isoformat() if history.created_at else None,
                "is_current": history.medhist_id in [link.medhist_id for link in fp_medical_history_links]
            })

        complete_data["medical_history_records"] = current_medical_history_data
        complete_data["selectedIllnessIds"] = current_selected_illness_ids
        complete_data["historical_medical_history"] = historical_data
        # Fetch FP_Assessment_Record
        try:
            fp_physical_exam = FP_Physical_Exam.objects.select_related('vital').get(fprecord_id=fp_record)
            complete_data["fp_physical_exam"] = FPPhysicalExamSerializer(fp_physical_exam).data
            complete_data["vital_signs_detail"] = VitalSignsSerializer(fp_physical_exam.vital).data if fp_physical_exam.vital else None
        except FP_Physical_Exam.DoesNotExist:
            complete_data["fp_physical_exam"] = None
            complete_data["vital_signs_detail"] = None

        try:
            fp_assessment = FP_Assessment_Record.objects.get(fprecord=fp_record)
            assessment_serialized_data = FPAssessmentSerializer(fp_assessment).data
            follow_up_date_value = fp_assessment.followv.followv_date if fp_assessment.followv else ""
            complete_data["fp_assessment"] = assessment_serialized_data
            complete_data["serviceProvisionRecords"] = [
                {
                    "dateOfVisit": (
                        fp_assessment.fprecord.created_at.strftime('%Y-%m-%d')
                        if fp_assessment.fprecord and fp_assessment.fprecord.created_at else ""
                    ),
                    "methodAccepted": assessment_serialized_data.get("fpt_method_used") or "",
                    "nameOfServiceProvider": assessment_serialized_data.get("as_provider_name") or "",
                    "dateOfFollowUp": follow_up_date_value or "",
                    "methodQuantity": str(assessment_serialized_data.get("quantity", "")),
                    "serviceProviderSignature": assessment_serialized_data.get("as_provider_signature") or "",
                    "medicalFindings": assessment_serialized_data.get("as_findings") or "",
                    "weight": assessment_serialized_data.get("bm_weight", 0),
                    "bp_systolic": (
                        int(fp_physical_exam.vital.vital_bp_systolic)
                        if fp_physical_exam and fp_physical_exam.vital and fp_physical_exam.vital.vital_bp_systolic and fp_physical_exam.vital.vital_bp_systolic != "N/A"
                        else 0
                    ),
                    "bp_diastolic": (
                        int(fp_physical_exam.vital.vital_bp_diastolic)
                        if fp_physical_exam and fp_physical_exam.vital and fp_physical_exam.vital.vital_bp_diastolic and fp_physical_exam.vital.vital_bp_diastolic != "N/A"
                        else 0
                    ),
                    "vital_pulse": (
                        int(fp_physical_exam.vital.vital_pulse)
                        if fp_physical_exam and fp_physical_exam.vital and fp_physical_exam.vital.vital_pulse and fp_physical_exam.vital.vital_pulse != "N/A"
                        else 0
                    ),
                }
            ]
            complete_data["follow_up_visit"] = FollowUpVisitSerializer(fp_assessment.followv).data if fp_assessment.followv else None
        except FP_Assessment_Record.DoesNotExist:
            complete_data["fp_assessment"] = None
            complete_data["follow_up_visit"] = None
            complete_data["serviceProvisionRecords"] = []

        return complete_data

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise e


            
@api_view(["GET"])
def get_last_previous_pregnancy(request, patient_id):
    try:
        patient = get_object_or_404(Patient, pat_id=patient_id)
        patient_records = PatientRecord.objects.filter(pat_id=patient)
        
        last_previous_pregnancy = Previous_Pregnancy.objects.filter(
            patrec_id__in=patient_records.values_list('patrec_id', flat=True)
        ).order_by('-date_of_delivery', '-pfpp_id').first() # Order by delivery date, then ID for stability

        if last_previous_pregnancy:
            data = {
                "last_delivery_date": last_previous_pregnancy.date_of_delivery.isoformat() if last_previous_pregnancy.date_of_delivery else None,
                "last_delivery_type": last_previous_pregnancy.type_of_delivery,
            }
            return Response(data, status=status.HTTP_200_OK)
        
        # Return default empty values if no records are found to avoid frontend errors
        return Response({"last_delivery_date": None, "last_delivery_type": None}, status=status.HTTP_200_OK)

    except Patient.DoesNotExist:
        # Handle cases where the patient ID does not exist
        return Response(
            {"detail": f"Patient with ID {patient_id} not found."}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        # Catch any other unexpected errors and log them
        traceback.print_exc() # Prints the full traceback to your console for debugging
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _are_dicts_equal(dict1, dict2, ignore_fields=None):
    """Compare two dictionaries, ignoring specified fields"""
    if ignore_fields is None:
        ignore_fields = []
    
    keys1 = set(k for k in dict1.keys() if k not in ignore_fields)
    keys2 = set(k for k in dict2.keys() if k not in ignore_fields)
    
    if keys1 != keys2:
        return False
    
    for key in keys1:
        if dict1.get(key) != dict2.get(key):
            return False
    
    return True

def _find_existing_record(model, filters, comparison_data=None, ignore_fields=None):
    """
    Find existing record and optionally compare data
    Returns (existing_record, is_duplicate)
    """
    try:
        existing_record = model.objects.filter(**filters).first()
        if existing_record and comparison_data:
            # Convert model instance to dict for comparison
            existing_data = model.objects.filter(pk=existing_record.pk).values().first()
            if existing_data and _are_dicts_equal(existing_data, comparison_data, ignore_fields):
                return existing_record, True
        return existing_record, False
    except Exception as e:
        logger.warning(f"Error checking existing record for {model.__name__}: {e}")
        return None, False
    
def _create_fp_records_core(data, patient_record_instance, staff_id_from_request):
    patrec_id = patient_record_instance.patrec_id
    staff_id_from_request = data.get('staff_id')
    patient_gender = data.get("gender", "").lower()
    
    # Track all created instances for rollback if needed
    created_instances = {}
    
    try:
        # 1. Handle Spouse with duplicate checking
        spouse_instance = None
        spouse_type = ""
        if patient_gender == "female":
            spouse_type = "Husband"
        elif patient_gender == "male":
            spouse_type = "Wife"
        else:
            spouse_type = "Spouse"

        spouse_data = data.get("spouse", {})
        s_lname = spouse_data.get("s_lastName")
        s_fname = spouse_data.get("s_givenName")
        s_dob = spouse_data.get("s_dateOfBirth")
        
        if s_lname and s_fname and s_dob:
            spouse_comparison_data = {
                "spouse_lname": s_lname,
                "spouse_fname": s_fname,
                "spouse_mname": spouse_data.get("s_middleInitial") or None,
                "spouse_dob": s_dob,
                "spouse_occupation": spouse_data.get("s_occupation") or None,
                "spouse_type": spouse_type,
            }
            
            # Check for existing spouse with same data
            existing_spouse, is_duplicate = _find_existing_record(
                Spouse, 
                {
                    "spouse_lname__iexact": s_lname,
                    "spouse_fname__iexact": s_fname,
                    "spouse_dob": s_dob
                },
                spouse_comparison_data,
                ignore_fields=['spouse_id']  # Ignore PK field
            )
            
            if existing_spouse:
                spouse_instance = existing_spouse
                if is_duplicate:
                    logger.info(f"Using existing duplicate Spouse record ID: {spouse_instance.pk}")
                else:
                    # Update spouse type if different
                    if spouse_instance.spouse_type != spouse_type:
                        spouse_instance.spouse_type = spouse_type
                        spouse_instance.save()
                        logger.info(f"Updated spouse type for existing spouse record ID: {spouse_instance.pk}")
            else:
                spouse_serializer = SpouseSerializer(data=spouse_comparison_data)
                spouse_serializer.is_valid(raise_exception=True)
                spouse_instance = spouse_serializer.save()
                created_instances['spouse'] = spouse_instance
                logger.info(f"Created new Spouse record with ID: {spouse_instance.pk}")

        # 2. Check for duplicate FP Record
        fp_record_comparison_data = {
            "client_id": data.get("client_id") or "",
            "fourps": data.get("fourps") or False,
            "plan_more_children": data.get("plan_more_children"),
            "avg_monthly_income": data.get("avg_monthly_income") or "0",
            "occupation": data.get("occupation") or None,
            "pat": patient_record_instance.pat_id.pat_id,
            "patrec": patrec_id,
            "spouse": spouse_instance.pk if spouse_instance else None,
            "num_of_children": data.get("numOfLivingChildren") or 0,
        }
        
        # Check for existing FP Record with same data (within last 24 hours to avoid exact duplicates)
        time_threshold = timezone.now() - timezone.timedelta(hours=24)
        existing_fp_record, is_duplicate = _find_existing_record(
            FP_Record,
            {
                "patrec": patrec_id,
                "created_at__gte": time_threshold
            },
            fp_record_comparison_data,
            ignore_fields=['fprecord_id', 'created_at', 'hrd']
        )
        
        if existing_fp_record and is_duplicate:
            logger.warning(f"Duplicate FP Record detected within 24 hours. Using existing record ID: {existing_fp_record.fprecord_id}")
            return existing_fp_record.fprecord_id  # Return early, no need to create duplicates
        
        # Create FP Record if not duplicate
        fp_record_serializer = FPRecordSerializer(data=fp_record_comparison_data)
        fp_record_serializer.is_valid(raise_exception=True)
        fp_record_instance = fp_record_serializer.save()
        created_instances['fp_record'] = fp_record_instance
        fprecord_id = fp_record_instance.fprecord_id
        logger.info(f"Created FP Record with ID: {fprecord_id}")

        current_fp_record = fp_record_instance
        current_patient_record = patient_record_instance

        # 3. Handle illnesses + snapshots (with duplicate checking)
        selected_illness_ids = data.get("selectedIllnessIds", [])
        custom_disability_details = data.get("customDisabilityDetails")

        if isinstance(selected_illness_ids, str):
            try:
                selected_illness_ids = [int(i.strip()) for i in selected_illness_ids.split(',') if i.strip()]
            except ValueError:
                selected_illness_ids = []

        if custom_disability_details:
            custom_illness_instance = get_or_create_illness(
                illname=custom_disability_details,
                ill_description=f"User-specified disability: {custom_disability_details}",
                ill_code_prefix="FP"
            )
            if custom_illness_instance.ill_id not in selected_illness_ids:
                selected_illness_ids.append(custom_illness_instance.ill_id)

        # Get current snapshots
        existing_snapshot_medhist_ids = FP_MedicalHistory.objects.filter(
            fprecord=current_fp_record
        ).values_list("medhist_id", flat=True)

        current_illness_set = set(
            MedicalHistory.objects.filter(medhist_id__in=existing_snapshot_medhist_ids)
            .values_list("ill_id", flat=True)
        )

        new_illness_set = set(selected_illness_ids)
        newly_selected = new_illness_set - current_illness_set

        for illness_id in newly_selected:
            illness_instance = get_object_or_404(Illness, ill_id=illness_id)
            
            # Check for existing medical history
            existing_medhist = MedicalHistory.objects.filter(
                ill=illness_instance,
                patrec=current_patient_record
            ).first()
            
            if existing_medhist:
                medhist = existing_medhist
                logger.info(f"Using existing MedicalHistory record {medhist.medhist_id}")
            else:
                medhist = MedicalHistory.objects.create(
                    ill=illness_instance,
                    patrec=current_patient_record
                )
                created_instances['medical_history'] = created_instances.get('medical_history', []) + [medhist]
                logger.info(f"Created new MedicalHistory record {medhist.medhist_id}")
            
            # Check for duplicate FP medical history snapshot
            existing_fp_medhist = FP_MedicalHistory.objects.filter(
                fprecord=current_fp_record,
                medhist=medhist
            ).first()
            
            if not existing_fp_medhist:
                fp_medhist = FP_MedicalHistory.objects.create(
                    fprecord=current_fp_record,
                    medhist=medhist
                )
                created_instances['fp_medical_history'] = created_instances.get('fp_medical_history', []) + [fp_medhist]

        # 4. Check for duplicate FP Type
        fp_type_comparison_data = {
            "fpt_client_type": data.get("typeOfClient") or "New Acceptor",
            "fpt_subtype": data.get("subTypeOfClient") or None,
            "fpt_reason_fp": data.get("reasonForFP") or None,
            "fpt_reason": data.get("otherReasonForFP") or None,
            "fpt_other_reason": data.get("otherReasonForFP") or None,
            "fpt_method_used": data.get("methodCurrentlyUsed") or "None",
            "fpt_other_method": data.get("otherMethod") or "",
            "fprecord": fprecord_id,
        }
        
        existing_fp_type, is_duplicate = _find_existing_record(
            FP_type,
            {"fprecord": fprecord_id},
            fp_type_comparison_data,
            ignore_fields=['fpt_id']
        )
        
        if existing_fp_type and is_duplicate:
            fp_type_instance = existing_fp_type
            logger.info(f"Using existing duplicate FP_type record ID: {fp_type_instance.fpt_id}")
        else:
            fp_type_serializer = FPTypeSerializer(data=fp_type_comparison_data)
            fp_type_serializer.is_valid(raise_exception=True)
            fp_type_instance = fp_type_serializer.save()
            created_instances['fp_type'] = fp_type_instance
            logger.info(f"Created FP_type with ID: {fp_type_instance.fpt_id}")

        fpt_id = fp_type_instance.fpt_id

        # 5. Obstetrical History - Check for duplicates
        main_obs_instance = None
        if patient_gender != "male":
            main_obs_data_from_request = data.get("obstetricalHistory", {})
            patient_id = patient_record_instance.pat_id.pat_id
            print("PAT ID: ",patient_id)
            # Check if obstetrical data has changed
            latest_existing_main_obs = Obstetrical_History.objects.filter(
                patrec_id__pat_id=patient_id
                ).order_by('-patrec_id').first()
            print("LATEST MAIN OBS: ",latest_existing_main_obs)
            last_menstrual_period = main_obs_data_from_request.get('lastMenstrualPeriod')
            if last_menstrual_period == "":
                last_menstrual_period = None
            
            main_obs_comparison_data = {
                "patrec_id": patrec_id,
                "obs_living_ch": main_obs_data_from_request.get("numOfLivingChildren") or 0,
                "obs_abortion": main_obs_data_from_request.get("abortion") or 0,
                "obs_gravida": main_obs_data_from_request.get("g_pregnancies") or 0,
                "obs_para": main_obs_data_from_request.get("p_pregnancies") or 0,
                "obs_fullterm": main_obs_data_from_request.get("fullTerm") or 0,
                "obs_preterm": main_obs_data_from_request.get("premature") or 0,
                "obs_ch_born_alive": latest_existing_main_obs.obs_ch_born_alive if latest_existing_main_obs else  0,
                "obs_lg_babies": latest_existing_main_obs.obs_lg_babies if latest_existing_main_obs else  0,
                "obs_lg_babies_str": latest_existing_main_obs.obs_lg_babies_str if latest_existing_main_obs else False,
                "obs_still_birth": latest_existing_main_obs.obs_still_birth if latest_existing_main_obs else  0,
                "obs_lmp": last_menstrual_period,
            }
            
            # Check if obstetrical data is different from latest
            should_create_obs = True
            if latest_existing_main_obs:
                existing_obs_data = Obstetrical_History.objects.filter(
                    pk=latest_existing_main_obs.pk
                ).values().first()
                
                if existing_obs_data and _are_dicts_equal(
                    existing_obs_data, 
                    main_obs_comparison_data, 
                    ignore_fields=['obs_id', 'patrec_id', 'created_at']
                ):
                    main_obs_instance = latest_existing_main_obs
                    should_create_obs = False
                    logger.info(f"Using existing Obstetrical_History record ID: {main_obs_instance.obs_id}")
            
            if should_create_obs:
                main_obs_serializer = ObstetricalHistorySerializer(data=main_obs_comparison_data)
                main_obs_serializer.is_valid(raise_exception=True)
                main_obs_instance = main_obs_serializer.save()
                created_instances['obstetrical_history'] = main_obs_instance
                logger.info(f"Created new Obstetrical_History with ID: {main_obs_instance.obs_id}")

        # 6. Handle FP-specific Obstetrical History with duplicate checking
        fp_obstetrical_instance = None
        if patient_gender != "male":
            fp_obstetrical_history_data = data.get('obstetricalHistory', {})
            if fp_obstetrical_history_data and fp_record_instance:
                fpob_last_delivery_val = fp_obstetrical_history_data.get('lastDeliveryDate')
                if fpob_last_delivery_val == "":
                    fpob_last_delivery_val = None

                fpob_type_last_delivery_val = fp_obstetrical_history_data.get('typeOfLastDelivery')
                if fpob_type_last_delivery_val == "":
                    fpob_type_last_delivery_val = None
                    
                last_period_val = fp_obstetrical_history_data.get('lastMenstrualPeriod')
                if last_period_val == "":
                    last_period_val = None

                previous_period_val = fp_obstetrical_history_data.get('previousMenstrualPeriod')
                if previous_period_val == "":
                    previous_period_val = None

                fp_obs_comparison_data = {
                    "fpob_last_delivery": fpob_last_delivery_val,
                    "fpob_type_last_delivery": fpob_type_last_delivery_val,
                    "z": last_period_val,
                    "fpob_previous_period": previous_period_val,
                    "fpob_mens_flow": fp_obstetrical_history_data.get('menstrualFlow') or "Normal",
                    "fpob_dysme": fp_obstetrical_history_data.get('dysmenorrhea') or False,
                    "fpob_hydatidiform": fp_obstetrical_history_data.get('hydatidiformMole') or False,
                    "fpob_ectopic_pregnancy": fp_obstetrical_history_data.get('ectopicPregnancyHistory') or False,
                    "fprecord": fprecord_id,
                    "obs": main_obs_instance.obs_id if main_obs_instance else None,
                }

                # Check for existing FP Obstetrical History
                existing_fp_obs, is_duplicate = _find_existing_record(
                    FP_Obstetrical_History,
                    {"fprecord": fprecord_id},
                    fp_obs_comparison_data,
                    ignore_fields=['fpob_id']
                )
                
                if existing_fp_obs and is_duplicate:
                    fp_obstetrical_instance = existing_fp_obs
                    logger.info(f"Using existing duplicate FP_Obstetrical_History record ID: {fp_obstetrical_instance.fpob_id}")
                else:
                    fp_obs_serializer = FP_ObstetricalHistorySerializer(data=fp_obs_comparison_data)
                    fp_obs_serializer.is_valid(raise_exception=True)
                    fp_obstetrical_instance = fp_obs_serializer.save()
                    created_instances['fp_obstetrical_history'] = fp_obstetrical_instance
                    logger.info(f"Created new FP_Obstetrical_History with ID: {fp_obstetrical_instance.fpob_id}")
                
                # Handle Previous Pregnancy with duplicate checking
                if fp_obstetrical_history_data:
                    last_delivery_date_for_prev_preg = fp_obstetrical_history_data.get('lastDeliveryDate')
                    type_of_last_delivery_for_prev_preg = fp_obstetrical_history_data.get('typeOfLastDelivery')

                    if last_delivery_date_for_prev_preg == "":
                        last_delivery_date_for_prev_preg = None
                    if type_of_last_delivery_for_prev_preg == "":
                        type_of_last_delivery_for_prev_preg = None

                    if last_delivery_date_for_prev_preg and type_of_last_delivery_for_prev_preg:
                        # GET LATEST PREVIOUS PREGNANCY DATA FOR SAME PATREC_ID
                        latest_previous_pregnancy = Previous_Pregnancy.objects.filter(
                            patrec_id=patrec_id
                        ).order_by('-pfpp_id').first()
                        
                        # Use latest data if available, otherwise use None
                        outcome = latest_previous_pregnancy.outcome if latest_previous_pregnancy else None
                        babys_wt = latest_previous_pregnancy.babys_wt if latest_previous_pregnancy else None
                        gender = latest_previous_pregnancy.gender if latest_previous_pregnancy else None
                        ballard_score = latest_previous_pregnancy.ballard_score if latest_previous_pregnancy else None
                        apgar_score = latest_previous_pregnancy.apgar_score if latest_previous_pregnancy else None

                        prev_pregnancy_comparison_data = {
                            "date_of_delivery": last_delivery_date_for_prev_preg,
                            "type_of_delivery": type_of_last_delivery_for_prev_preg,
                            "outcome": outcome,
                            "babys_wt": babys_wt,
                            "gender": gender,
                            "ballard_score": ballard_score,
                            "apgar_score": apgar_score,
                            "patrec_id": patrec_id, 
                        }
                        
                        # Check for existing Previous Pregnancy with same delivery date
                        existing_prev_pregnancy, is_duplicate = _find_existing_record(
                            Previous_Pregnancy,
                            {
                                "patrec_id": patrec_id,
                                "date_of_delivery": last_delivery_date_for_prev_preg
                            },
                            prev_pregnancy_comparison_data,
                            ignore_fields=['pfpp_id']
                        )
                        
                        if existing_prev_pregnancy and is_duplicate:
                            logger.info(f"Using existing Previous_Pregnancy record ID: {existing_prev_pregnancy.pfpp_id}")
                        else:
                            prev_pregnancy_serializer = PreviousPregnancyCreateSerializer(data=prev_pregnancy_comparison_data)
                            if prev_pregnancy_serializer.is_valid():
                                prev_pregnancy_instance = prev_pregnancy_serializer.save()
                                created_instances['previous_pregnancy'] = prev_pregnancy_instance
                                logger.info(f"Created new Previous_Pregnancy record: {prev_pregnancy_instance.pfpp_id}")
                                logger.info(f"Previous Pregnancy Data - Outcome: {outcome}, Baby Weight: {babys_wt}, Gender: {gender}, Ballard: {ballard_score}, Apgar: {apgar_score}")
                            else:
                                logger.error(f"Error validating Previous_Pregnancy data: {prev_pregnancy_serializer.errors}")

        # 7. Create Risk STI with duplicate checking
        risk_sti_data = data.get("sexuallyTransmittedInfections", {})
        risk_sti_comparison_data = {
            "sti_abnormal_discharge": risk_sti_data.get("abnormalDischarge") or False,
            "sti_discharge_from": risk_sti_data.get("dischargeFrom") if risk_sti_data.get("abnormalDischarge") else None,
            "sti_sores": risk_sti_data.get("sores") or False,
            "sti_pain": risk_sti_data.get("pain") or False,
            "sti_history": risk_sti_data.get("history") or False,
            "sti_hiv": risk_sti_data.get("hiv") or False,
            "fprecord": fprecord_id,
        }
        
        existing_risk_sti, is_duplicate = _find_existing_record(
            FP_RiskSti,
            {"fprecord": fprecord_id},
            risk_sti_comparison_data,
            ignore_fields=['sti_id']
        )
        
        if existing_risk_sti and is_duplicate:
            logger.info(f"Using existing duplicate FP_RiskSti record ID: {existing_risk_sti.sti_id}")
        else:
            risk_sti_serializer = FPRiskStiSerializer(data=risk_sti_comparison_data)
            risk_sti_serializer.is_valid(raise_exception=True)
            risk_sti_instance = risk_sti_serializer.save()
            created_instances['risk_sti'] = risk_sti_instance
            logger.info("Created FP_RiskSti.")

        # 8. Create Risk VAW with duplicate checking
        risk_vaw_data = data.get("violenceAgainstWomen", {})
        risk_vaw_comparison_data = {
            "vaw_unpleasant_rs": risk_vaw_data.get("unpleasantRelationship") or False,
            "vaw_partner_disapproval": risk_vaw_data.get("partnerDisapproval") or False,
            "vaw_domestic_violence": risk_vaw_data.get("domesticViolence") or False,
            "vaw_referred_to": risk_vaw_data.get("referredTo") or None,
            "fprecord": fprecord_id,
        }
        
        existing_risk_vaw, is_duplicate = _find_existing_record(
            FP_RiskVaw,
            {"fprecord": fprecord_id},
            risk_vaw_comparison_data,
            ignore_fields=['vaw_id']
        )
        
        if existing_risk_vaw and is_duplicate:
            logger.info(f"Using existing duplicate FP_RiskVaw record ID: {existing_risk_vaw.vaw_id}")
        else:
            risk_vaw_serializer = FPRiskVawSerializer(data=risk_vaw_comparison_data)
            risk_vaw_serializer.is_valid(raise_exception=True)
            risk_vaw_instance = risk_vaw_serializer.save()
            created_instances['risk_vaw'] = risk_vaw_instance
            logger.info("Created FP_RiskVaw.")

        # 9. Create Body Measurement with duplicate checking
        bm_id = None
        current_weight = data.get("weight")
        current_height = data.get("height")
        patient = patient_record_instance.pat_id
        
        previous_bm = BodyMeasurement.objects.filter(pat=patient).order_by('-created_at').first()
        bm_comparison_data = {
            "weight": float(current_weight) if current_weight is not None else 0,
            "height": float(current_height) if current_height is not None else 0,
            "age": data.get("age") or 0,
            "wfa": previous_bm.wfa if previous_bm else "N/A",
            "lhfa": previous_bm.lhfa if previous_bm else "N/A",
            "wfl": previous_bm.wfl if previous_bm else "N/A",
            "muac": previous_bm.muac if previous_bm else "N/A",
            "edemaSeverity": previous_bm.edemaSeverity if previous_bm else "N/A",
            "muac_status": previous_bm.muac_status if previous_bm else "N/A",
            "remarks": previous_bm.remarks if previous_bm else "N/A",
            "is_opt": previous_bm.is_opt if previous_bm else False,
            "staff": staff_id_from_request,
            "pat": patient.pat_id,
        }

        # Check if body measurement has changed significantly (more than 0.1 kg or 0.1 cm)
        should_create_bm = True
        if previous_bm:
            weight_diff = abs(float(current_weight or 0) - float(previous_bm.weight or 0))
            height_diff = abs(float(current_height or 0) - float(previous_bm.height or 0))
            
            if weight_diff < 0.1 and height_diff < 0.1:
                bm_id = previous_bm.bm_id
                should_create_bm = False
                logger.info(f"Using existing BodyMeasurement record ID: {bm_id} (minimal changes)")

        if should_create_bm:
            bm_serializer = BodyMeasurementSerializer(data=bm_comparison_data)
            bm_serializer.is_valid(raise_exception=True)
            new_bm = bm_serializer.save()
            bm_id = new_bm.bm_id
            created_instances['body_measurement'] = new_bm
            logger.info(f"Created new BodyMeasurement with ID: {bm_id}")

        # 10. Create Vital Signs with duplicate checking
        vital_bp_systolic = "N/A"
        vital_bp_diastolic = "N/A"
        if data.get("bloodPressure") and isinstance(data["bloodPressure"], str):
            bp_parts = data["bloodPressure"].split("/")
            if len(bp_parts) == 2:
                vital_bp_systolic = bp_parts[0].strip()
                vital_bp_diastolic = bp_parts[1].strip()
            else:
                vital_bp_systolic = data["bloodPressure"].strip()
                
        latest_vital = VitalSigns.objects.filter(patrec__pat_id=patient).order_by('-created_at').first()
        vital_comparison_data = {
            "vital_bp_systolic": vital_bp_systolic,
            "vital_bp_diastolic": vital_bp_diastolic,
            "vital_temp": latest_vital.vital_temp if latest_vital else "N/A",
            "vital_RR": latest_vital.vital_RR if latest_vital else "N/A",
            "vital_o2": latest_vital.vital_o2 if latest_vital else "N/A",
            "vital_pulse": data.get("pulseRate") or "N/A",
            "staff": staff_id_from_request,
            "patrec": patrec_id, 
        }
        
        # Check if vital signs are significantly different
        current_pulse = int(data.get("pulseRate") or 0)
        latest_pulse = 0
        
        # Safely convert the database value (which is a VARCHAR) to an integer
        if latest_vital and latest_vital.vital_pulse is not None:
             try:
                 latest_pulse = int(latest_vital.vital_pulse)
             except ValueError:
                 # Log a warning if the VARCHAR is not a valid number
                 logger.warning(f"latest_vital.vital_pulse '{latest_vital.vital_pulse}' is not a valid integer. Using 0 for comparison.")
                 latest_pulse = 0
                 
        should_create_vital = True
        
        if latest_vital:
            # Now perform comparison using the integer values
            pulse_diff = abs(current_pulse - latest_pulse) 
            
            bp_same = (vital_bp_systolic == latest_vital.vital_bp_systolic and 
                       vital_bp_diastolic == latest_vital.vital_bp_diastolic)
            
            if bp_same:
                vital_id = latest_vital.vital_id
                should_create_vital = False
                logger.info(f"Using existing VitalSigns record ID: {vital_id} (minimal changes)")

        if should_create_vital:
            vital_signs_serializer = VitalSignsSerializer(data=vital_comparison_data)
            vital_signs_serializer.is_valid(raise_exception=True)
            vital_signs_instance = vital_signs_serializer.save()
            vital_id = vital_signs_instance.vital_id
            created_instances['vital_signs'] = vital_signs_instance
            logger.info(f"Created VitalSigns with ID: {vital_id}")

        # 11. Create Physical Exam with duplicate checking
        physical_exam_comparison_data = {
            "skin_exam": data.get("skinExamination") or "Normal",
            "conjunctiva_exam": data.get("conjunctivaExamination") or "Normal",
            "neck_exam": data.get("neckExamination") or "Normal",
            "breast_exam": data.get("breastExamination") or "Normal",
            "abdomen_exam": data.get("abdomenExamination") or "Normal",
            "extremities_exam": data.get("extremitiesExamination") or "Normal",
            "fprecord": fprecord_id,
            "bm": bm_id,
            "vital": vital_id,
        }
        
        existing_physical_exam, is_duplicate = _find_existing_record(
            FP_Physical_Exam,
            {"fprecord": fprecord_id},
            physical_exam_comparison_data,
            ignore_fields=['fp_pe_id']
        )
        
        if existing_physical_exam and is_duplicate:
            logger.info(f"Using existing duplicate FP_Physical_Exam record ID: {existing_physical_exam.fp_pe_id}")
        else:
            physical_exam_serializer = FPPhysicalExamSerializer(data=physical_exam_comparison_data)
            physical_exam_serializer.is_valid(raise_exception=True)
            physical_exam_instance = physical_exam_serializer.save()
            created_instances['physical_exam'] = physical_exam_instance
            logger.info("Created FP_Physical_Exam.")

        # 12. Pelvic Exam with duplicate checking
        if patient_gender != "male":
            is_iud_selected = "IUD" in (data.get("methodCurrentlyUsed") or "")
            if is_iud_selected:
                uterine_position = data.get("uterinePosition", "")
                if uterine_position == "middle":
                    uterine_position = "Middle"
                elif uterine_position == "anteflexed":
                    uterine_position = "Anteflexed"
                elif uterine_position == "retroflexed":
                    uterine_position = "Retroflexed"
                
                pelvic_exam_comparison_data = {
                    "pelvic_exam": data.get("pelvicExamination") or "Normal",
                    "cervical_consistency": data.get("cervicalConsistency") or "Firm",
                    "cervical_tenderness": data.get("cervicalTenderness") or False,
                    "cervical_adnexal": data.get("cervicalAdnexal") or False,
                    "uterine_position": uterine_position,
                    "uterine_depth": data.get("uterineDepth") or "",
                    "fprecord": fprecord_id,
                }
                
                existing_pelvic_exam, is_duplicate = _find_existing_record(
                    FP_Pelvic_Exam,
                    {"fprecord": fprecord_id},
                    pelvic_exam_comparison_data,
                    ignore_fields=['pelvic_id']
                )
                
                if existing_pelvic_exam and is_duplicate:
                    logger.info(f"Using existing duplicate FP_Pelvic_Exam record ID: {existing_pelvic_exam.pelvic_id}")
                else:
                    pelvic_exam_serializer = PelvicExamSerializer(data=pelvic_exam_comparison_data)
                    pelvic_exam_serializer.is_valid(raise_exception=True)
                    pelvic_exam_instance = pelvic_exam_serializer.save()
                    created_instances['pelvic_exam'] = pelvic_exam_instance
                    logger.info("Created FP_Pelvic_Exam (IUD method).")

        # 13. Create Acknowledgement with duplicate checking
        acknowledgement_data = data.get("acknowledgement", {})
        client_full_name = f"{data.get('lastName')}, {data.get('givenName')} {data.get('middleInitial') or ''}".strip()
        acknowledgement_comparison_data = {
            "ack_client_signature": acknowledgement_data.get("clientSignature") or "",
            "ack_client_signature_date": acknowledgement_data.get("clientSignatureDate") or date.today().isoformat(),
            "ack_client_name": client_full_name,
            "ack_guardian_signature": acknowledgement_data.get("guardianSignature") or "",
            "ack_guardian_signature_date": acknowledgement_data.get("guardianSignatureDate") or None,
            "fprecord": fprecord_id,
            "fpt": fpt_id,
        }
        
        existing_acknowledgement, is_duplicate = _find_existing_record(
            FP_Acknowledgement,
            {"fprecord": fprecord_id},
            acknowledgement_comparison_data,
            ignore_fields=['ack_id']
        )
        
        if existing_acknowledgement and is_duplicate:
            logger.info(f"Using existing duplicate FP_Acknowledgement record ID: {existing_acknowledgement.ack_id}")
        else:
            acknowledgement_serializer = AcknowledgementSerializer(data=acknowledgement_comparison_data)
            acknowledgement_serializer.is_valid(raise_exception=True)
            acknowledgement_instance = acknowledgement_serializer.save()
            created_instances['acknowledgement'] = acknowledgement_instance
            logger.info("Created FP_Acknowledgement.")

        # 14. Create Pregnancy Check with duplicate checking
        if patient_gender != "male":
            pregnancy_check_data = data.get("pregnancyCheck", {})
            pregnancy_check_comparison_data = {
                "fp_pc_breastfeeding": pregnancy_check_data.get("breastfeeding") or False,
                "fp_pc_abstained": pregnancy_check_data.get("abstained") or False,
                "fp_pc_recent_baby": pregnancy_check_data.get("recent_baby") or False,
                "fp_pc_recent_period": pregnancy_check_data.get("recent_period") or False,
                "fp_pc_recent_abortion": pregnancy_check_data.get("recent_abortion") or False,
                "fp_pc_using_contraceptive": pregnancy_check_data.get("using_contraceptive") or False,
                "fprecord": fprecord_id,
            }
            
            existing_pregnancy_check, is_duplicate = _find_existing_record(
                FP_pregnancy_check,
                {"fprecord": fprecord_id},
                pregnancy_check_comparison_data,
                ignore_fields=['fp_pc_id']
            )
            
            if existing_pregnancy_check and is_duplicate:
                logger.info(f"Using existing duplicate FP_pregnancy_check record ID: {existing_pregnancy_check.fp_pc_id}")
            else:
                pregnancy_check_serializer = FP_PregnancyCheckSerializer(data=pregnancy_check_comparison_data)
                pregnancy_check_serializer.is_valid(raise_exception=True)
                pregnancy_check_instance = pregnancy_check_serializer.save()
                created_instances['pregnancy_check'] = pregnancy_check_instance
                logger.info("Created FP_pregnancy_check.")

        # 15. Create Assessment and handle stock deduction with duplicate checking
        service_records = data.get("serviceProvisionRecords", [])
        if service_records:
            latest_record = service_records[-1]
            method_accepted = latest_record.get('methodAccepted')
            method_quantity_str = latest_record.get('methodQuantity')

            method_quantity = 0
            if method_quantity_str:
                try:
                    method_quantity = int(method_quantity_str)
                except (ValueError, TypeError):
                    logger.error(f"Invalid quantity provided: {method_quantity_str}. Defaulting to 0.")

            # Handle follow-up visit status update
            last_follow_up_visit = FollowUpVisit.objects.filter(patrec=patient_record_instance).order_by('-created_at').first()
            if last_follow_up_visit:
                if last_follow_up_visit.followv_status == 'pending':
                    last_follow_up_visit.followv_status = 'completed'
                    last_follow_up_visit.completed_at = timezone.now().date()
                    last_follow_up_visit.save()
                    logger.info(f"Updated last follow-up visit status to 'completed'.")

            # Create new Follow-up Visit
            date_of_follow_up = latest_record.get("dateOfFollowUp")
            if not date_of_follow_up or date_of_follow_up == "":
                date_of_follow_up = timezone.now().date()

            follow_up_comparison_data = {
                "patrec": patrec_id,
                "followv_date": date_of_follow_up,
                "followv_status": "pending",
                "followv_description": "Family Planning Follow up",
            }
            
            existing_follow_up, is_duplicate = _find_existing_record(
                FollowUpVisit,
                {
                    "patrec": patrec_id,
                    "followv_date": date_of_follow_up
                },
                follow_up_comparison_data,
                ignore_fields=['followv_id', 'created_at']
            )
            
            if existing_follow_up and is_duplicate:
                follow_up_instance = existing_follow_up
                logger.info(f"Using existing duplicate FollowUpVisit record ID: {follow_up_instance.followv_id}")
            else:
                follow_up_serializer = FollowUpVisitSerializer(data=follow_up_comparison_data)
                follow_up_serializer.is_valid(raise_exception=True)
                follow_up_instance = follow_up_serializer.save()
                created_instances['follow_up'] = follow_up_instance
                logger.info(f"Created NEW FollowUpVisit with ID: {follow_up_instance.followv_id}")

            followv_id = follow_up_instance.followv_id

            # Handle stock deduction (no duplicate checking needed as it's transactional)
            if method_accepted and method_quantity > 0:
                try:
                    commodity = CommodityList.objects.get(com_name=method_accepted)
                    commodity_inventory_item = CommodityInventory.objects.filter(
                        com_id=commodity,
                        cinv_qty_avail__gte=method_quantity,
                        inv_id__is_Archived=False
                    ).order_by('inv_id__expiry_date').first()

                    if commodity_inventory_item:
                        commodity_inventory_item.cinv_qty_avail -= method_quantity
                        commodity_inventory_item.save()

                        original_unit = commodity_inventory_item.cinv_qty_unit
                        transaction_unit = "pc/s" if original_unit == "boxes" else original_unit
                        final_comt_qty = f"{method_quantity} {transaction_unit}"
                        
                        CommodityTransaction.objects.create(
                            cinv_id=commodity_inventory_item,
                            comt_qty=final_comt_qty,
                            comt_action="Deducted for FP Service",
                            staff=staff_id_from_request or None
                        )
                        logger.info(f"Successfully deducted {method_quantity} of {method_accepted}")

                except (CommodityList.DoesNotExist, ValueError) as e:
                    logger.error(f"Stock deduction error for {method_accepted}: {e}")
                    raise

            # Create Assessment with duplicate checking
            assessment_comparison_data = {
                "quantity": method_quantity,
                "as_provider_signature": latest_record.get("serviceProviderSignature") or "",
                "as_provider_name": latest_record.get("nameOfServiceProvider") or "",
                "as_findings": latest_record.get("medicalFindings") or "None",
                "followv": followv_id,
                "fprecord": fprecord_id,
                "fpt": fpt_id,
                "bm": bm_id,
            }
            
            existing_assessment, is_duplicate = _find_existing_record(
                FP_Assessment_Record,
                {
                    "fprecord": fprecord_id,
                    "followv": followv_id
                },
                assessment_comparison_data,
                ignore_fields=['assessment_id']
            )
            
            if existing_assessment and is_duplicate:
                logger.info(f"Using existing duplicate FP_Assessment_Record ID: {existing_assessment.assessment_id}")
            else:
                assessment_serializer = FPAssessmentSerializer(data=assessment_comparison_data)
                assessment_serializer.is_valid(raise_exception=True)
                assessment_instance = assessment_serializer.save()
                created_instances['assessment'] = assessment_instance
                logger.info("Created FP_Assessment_Record.")

        logger.info(f"Successfully completed FP record creation with ID: {fprecord_id}")
        return fprecord_id
    
    except Exception as e:
        # Rollback: Delete any created instances
        logger.error(f"Error during FP record creation: {e}. Rolling back created instances.")
        for key, instance in created_instances.items():
            if isinstance(instance, list):
                for item in instance:
                    try:
                        item.delete()
                        logger.info(f"Rolled back {key} instance: {item.pk}")
                    except Exception as delete_error:
                        logger.error(f"Error deleting {key}: {delete_error}")
            else:
                try:
                    instance.delete()
                    logger.info(f"Rolled back {key} instance: {instance.pk}")
                except Exception as delete_error:
                    logger.error(f"Error deleting {key}: {delete_error}")
        raise  


@api_view(['POST'])
def submit_full_family_planning_form(request):
    data = request.data
    staff_id_from_request = data.get('staff_id')

    try:
        with transaction.atomic():
            logger.info("Starting atomic transaction for full FP form submission (new record set).")
            print("\n--- Starting Full FP Form Submission (New Record Set) ---")

            patient_record_data = {
                "patrec_type": "Family Planning",
                "pat_id": data.get("pat_id"),
            }
            patient_record_serializer = PatientRecordSerializer(data=patient_record_data)
            patient_record_serializer.is_valid(raise_exception=True)
            patient_record_instance = patient_record_serializer.save()
            logger.info(f"Created NEW PatientRecord with ID: {patient_record_instance.patrec_id}")

            # Call the core logic
            fprecord_id = _create_fp_records_core(data, patient_record_instance, staff_id_from_request)

            logger.info("Full FP form submission (new record set) completed successfully.")
            return Response(
                {"message": "Family Planning record created successfully!", "fprecord": fprecord_id},
                status=status.HTTP_201_CREATED
            )

    except Exception as e:
        logger.error(f"Full FP form submission (new record set) failed: {e}", exc_info=True)
        return Response(
            {"detail": f"Failed to submit Family Planning record: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )
        

# @api_view(['GET'])
# def get_monthly_fp_list(request):
#     try:
#         # Get distinct year-month combinations from FP_Record
#         monthly_data = FP_Record.objects.annotate(
#             year=ExtractYear('created_at'),
#             month=ExtractMonth('created_at')
#         ).values('year', 'month').distinct().order_by('-year', '-month')

#         response_data = []
#         for entry in monthly_data:
#             year, month = entry['year'], entry['month']
#             # Count records for the month
#             month_start = date(year, month, 1)
#             next_month = month_start + relativedelta(months=1)
#             month_end = next_month - timedelta(days=1)
#             record_count = FP_Record.objects.filter(
#                 created_at__range=(month_start, month_end)
#             ).count()

#             response_data.append({
#                 'month': f"{year}-{month:02d}",  # Format as YYYY-MM
#                 'record_count': record_count,
#                 'records': []  # Optionally include record IDs if needed
#             })

#         return Response({'data': response_data}, status=status.HTTP_200_OK)

#     except Exception as e:
#         traceback.print_exc()
#         return Response(
#             {"detail": f"Error fetching monthly list: {str(e)}"},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )
            
@api_view(['POST'])
def submit_follow_up_family_planning_form(request):
    data = request.data
    staff_id_from_request = data.get('staff_id')
    
    existing_patrec_id = data.get('patrec_id') 
    if not existing_patrec_id:
        return Response(
            {"detail": "Existing patrec_id is required for follow-up record."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        with transaction.atomic():
            logger.info(f"Starting atomic transaction for follow-up FP form submission for patrec_id: {existing_patrec_id}.")
            print(f"\n--- Starting Follow-up FP Form Submission for patrec_id: {existing_patrec_id} ---")

            # Retrieve the existing PatientRecord instance
            patient_record_instance = get_object_or_404(PatientRecord, patrec_id=existing_patrec_id)
            logger.info(f"Reusing existing PatientRecord with ID: {patient_record_instance.patrec_id}")

            # Call the core logic
            fprecord_id = _create_fp_records_core(data, patient_record_instance, staff_id_from_request)

            logger.info("Follow-up FP form submission completed successfully.")
            return Response(
                {"message": "Family Planning follow-up record created successfully!", "fprecord": fprecord_id},
                status=status.HTTP_201_CREATED
            )

    except PatientRecord.DoesNotExist:
        return Response(
            {"detail": f"PatientRecord with ID {existing_patrec_id} not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Follow-up FP form submission failed: {e}", exc_info=True)
        return Response(
            {"detail": f"Failed to submit Family Planning follow-up record: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )
        
# FP Record CRUD
class FP_RecordListCreateView(generics.ListCreateAPIView):
    serializer_class = FPRecordSerializer
    queryset = FP_Record.objects.all()

class PatientRecordCreateView(generics.CreateAPIView):
    serializer_class = PatientRecordSerializer
    queryset = PatientRecord.objects.all()

# FP Type CRUD
class FP_TypeListCreateView(generics.ListCreateAPIView):
    serializer_class = FPTypeSerializer
    queryset = FP_type.objects.all()


class FP_TypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPTypeSerializer
    queryset = FP_type.objects.all()
    lookup_field = "fpt_id"


# Risk STI CRUD
class RiskStiListCreateView(generics.ListCreateAPIView):
    serializer_class = FPRiskStiSerializer
    queryset = FP_RiskSti.objects.all()


class RiskStiDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPRiskStiSerializer
    queryset = FP_RiskSti.objects.all()
    lookup_field = "sti_id"


# Risk VAW CRUD
class RiskVawListCreateView(generics.ListCreateAPIView):
    serializer_class = FPRiskVawSerializer
    queryset = FP_RiskVaw.objects.all()


class RiskVawDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPRiskVawSerializer
    queryset = FP_RiskVaw.objects.all()
    lookup_field = "vaw_id"


# Physical Exam CRUD
class PhysicalExamListCreateView(generics.ListCreateAPIView):
    serializer_class = FPPhysicalExamSerializer
    queryset = FP_Physical_Exam.objects.all()


class PhysicalExamDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPPhysicalExamSerializer
    queryset = FP_Physical_Exam.objects.all()
    lookup_field = "fp_pe_id"


# Assessment CRUD
class FPAssessmentListCreateView(generics.ListCreateAPIView):
    serializer_class = FPAssessmentSerializer
    queryset = FP_Assessment_Record.objects.all()


class FPAssessmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FPAssessmentSerializer
    queryset = FP_Assessment_Record.objects.all()
    lookup_field = "assessment_id"


# Pelvic Exam CRUD
class PelvicExamListCreateView(generics.ListCreateAPIView):
    serializer_class = PelvicExamSerializer
    queryset = FP_Pelvic_Exam.objects.all()


class PelvicExamDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PelvicExamSerializer
    queryset = FP_Pelvic_Exam.objects.all()
    lookup_field = "pelvic_id"


# Acknowledgement CRUD
class AcknowledgementListCreateView(generics.ListCreateAPIView):
    serializer_class = AcknowledgementSerializer
    queryset = FP_Acknowledgement.objects.all()


class AcknowledgementDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AcknowledgementSerializer
    queryset = FP_Acknowledgement.objects.all()
    lookup_field = "ack_id"


class FP_ObstetricalListCreateView(generics.ListCreateAPIView):
    queryset = FP_Obstetrical_History.objects.all()
    serializer_class = FP_ObstetricalHistorySerializer


class FP_ObstetricalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FP_ObstetricalHistorySerializer
    queryset = FP_Obstetrical_History.objects.all()
    lookup_field = "fpob_id"


# Pregnancy Check CRUD
class FP_PregnancyCheckListCreateView(generics.ListCreateAPIView):
    serializer_class = FP_PregnancyCheckSerializer
    queryset = FP_pregnancy_check.objects.all()


class FP_PregnancyCheckDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FP_PregnancyCheckSerializer
    queryset = FP_pregnancy_check.objects.all()
    lookup_field = "fp_pc_id"


        
@api_view(['GET'])
def get_fp_method_distribution(request):
    """
    Get distribution of family planning methods by distinct patients
    """
    try:
        # More efficient query using distinct patients
        method_distribution = FP_type.objects.values('fpt_method_used').annotate(
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
    Get distribution of client types by distinct patients
    """
    try:
        # Count distinct patients per client type
        client_type_distribution = FP_type.objects.values('fpt_client_type').annotate(
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
    Get summary statistics for Family Planning dashboard cards
    """
    try:
        today = timezone.now()
        first_day_this_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        first_day_last_month = (first_day_this_month - relativedelta(months=1))
        last_month_end = first_day_this_month - timezone.timedelta(days=1)
        
        # Get all distinct patients with FP records
        total_patients = FP_Record.objects.values('pat').distinct().count()
        
        # Get new acceptors and current users using subqueries for better performance
        new_acceptors = FP_Record.objects.filter(
            fp_type__fpt_client_type='newacceptor'
        ).values('pat').distinct().count()
        
        current_users = FP_Record.objects.filter(
            fp_type__fpt_client_type='currentuser'
        ).values('pat').distinct().count()
        
        # Monthly registrations
        this_month_registrations = FP_Record.objects.filter(
            created_at__gte=first_day_this_month
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
            'average_children': FP_Record.objects.aggregate(
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
    Get monthly trends for FP records with better performance
    """
    try:
        year = int(request.query_params.get('year', datetime.now().year))
        
        # Single database query to get monthly aggregates
        monthly_data = FP_Record.objects.filter(
            created_at__year=year
        ).annotate(
            month=ExtractMonth('created_at')
        ).values('month').annotate(
            total=Count('fprecord_id', distinct=True),
            new_acceptors=Count('fp_type__fpt_id', filter=Q(fp_type__fpt_client_type='newacceptor'), distinct=True),
            current_users=Count('fp_type__fpt_id', filter=Q(fp_type__fpt_client_type='currentuser'), distinct=True)
        ).order_by('month')
        
        # Create a dictionary for easy lookup
        monthly_dict = {item['month']: item for item in monthly_data}
        
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        data = []
        for i, month_name in enumerate(months, 1):
            month_data = monthly_dict.get(i, {
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
    Get age distribution of FP patients with optimized queries
    """
    try:
        today = date.today()
        
        # Get distinct patients with FP records - fixed PostgreSQL DISTINCT ON issue
        distinct_patient_ids = FP_Record.objects.values_list('pat', flat=True).distinct()
        
        # Get patient objects with related data
        patients = Patient.objects.filter(
            pat_id__in=distinct_patient_ids
        ).select_related('rp_id__per', 'trans_id')
        
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
    Get follow-up visit compliance statistics with optimized query
    """
    try:
        today = timezone.now().date()
        
        # Single query to get compliance statistics
        compliance_data = FP_Assessment_Record.objects.select_related('followv').aggregate(
            completed=Count('followv_id', filter=Q(followv__followv_status='completed')),
            pending=Count('followv_id', filter=Q(followv__followv_status='pending') & Q(followv__followv_date__gte=today)),
            overdue=Count('followv_id', filter=Q(followv__followv_status='pending') & Q(followv__followv_date__lt=today))
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
