import traceback
from venv import logger
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.db import transaction  # For atomic operations if needed
from django.db.models import Exists, Sum, Q, Min, F, Case, When, DateField, Subquery, Value, OuterRef,Prefetch
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

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    
class PatientListForOverallTable(generics.ListAPIView):
    serializer_class = FPRecordSerializer # This serializer is not directly used for the final output, but for internal processing
    pagination_class = StandardResultsSetPagination # Apply pagination
    
    
    def get_queryset(self):
        # Start with all FP_Record objects
        queryset = FP_Record.objects.select_related(
            "pat",
            "pat__rp_id__per",
            "pat__trans_id",
        ).prefetch_related(
            'fp_type_set' # Prefetch related FP_type instances
        ).order_by("-created_at") # Order by creation date descending
        # Apply search filter if 'search' query parameter is present
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(pat__rp_id__per__per_lname__icontains=search_query) |
                Q(pat__rp_id__per__per_fname__icontains=search_query) |
                Q(pat__trans_id__tran_lname__icontains=search_query) |
                Q(pat__trans_id__tran_fname__icontains=search_query) |
                Q(client_id__icontains=search_query) |
                Q(fp_type_set__fpt_client_type__icontains=search_query) |
                Q(fp_type_set__fpt_method_used__icontains=search_query)
            ).distinct() # Use distinct to avoid duplicate records if multiple FP_types match
        # Apply client_type filter if 'client_type' query parameter is present
        client_type_filter = self.request.query_params.get('client_type', None)
        if client_type_filter and client_type_filter != "all":
            queryset = queryset.filter(fp_type_set__fpt_client_type__iexact=client_type_filter).distinct()
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            patient_data_map = {}
            for record in page:
                patient_id = record.pat.pat_id
                if patient_id not in patient_data_map:
                    # build patient_entry as before
                    # ...
                    patient_data_map[patient_id] = patient_entry
            response_data = list(patient_data_map.values())
            return self.get_paginated_response(response_data)
        # fallback if pagination is not applied
        return Response([])
    
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

# def map_subtype_display(subtype):
#     """Map subtype IDs to human-readable labels"""
#     subtype_map = {
#         "changingmethod": "Changing Method",
#         "changingclinic": "Changing Clinic", 
#         "dropoutrestart": "Dropout/Restart",
#         "medicalcondition": "Medical Condition",
#         "sideeffects": "Side Effects",
#         # Add more mappings as needed
#     }
#     return subtype_map.get(subtype)  # Fallback to title case

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
        
        # Fetch the latest BodyMeasurement for the patient
        body_measurement = BodyMeasurement.objects.filter(pat=patient).order_by('-created_at').first()
        
        # Prepare response in the same format as BodyMeasurementReadSerializer
        if body_measurement:
            body_measurement_data = BodyMeasurementSerializer(body_measurement).data
            data = {
                "patient": pat_id,
                "body_measurement": {
                    "weight": str(body_measurement_data.get("weight", "0.00")),
                    "height": str(body_measurement_data.get("height", "0.00")),
                    "created_at": body_measurement_data.get("created_at")
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

# def map_client_type(client_type):
#     """Map client type to readable labels"""
#     if not client_type:
#         return ""
#     client_type = client_type.lower()
#     if client_type == "newacceptor":
#         return "New Acceptor"
#     elif client_type == "currentuser":
#         return "Current User"
#     elif client_type == "restart":
#         return "Restart"
#     else:
#         return client_type.title()  # Fallback to title case

# def map_physical_exam_display_values(data):
#     """Convert physical exam field values to human-readable labels"""
#     display_map = {
#         # Skin Examination
#         "normal": "Normal",
#         "pale": "Pale",
#         "yellowish": "Yellowish",
#         "hematoma": "Hematoma",
#         "not_applicable": "Not Applicable",
        
#         # Conjunctiva Examination
#         "normal": "Normal",
#         "pale": "Pale",
#         "yellowish": "Yellowish",
        
#         # Neck Examination
#         "normal": "Normal",
#         "neck_mass": "Neck Mass",
#         "enlarged_lymph_nodes": "Enlarged Lymph Nodes",
        
#         # Breast Examination
#         "normal": "Normal",
#         "mass": "Mass",
#         "nipple_discharge": "Nipple Discharge",
        
#         # Abdomen Examination
#         "normal": "Normal",
#         "abdominal_mass": "Abdominal Mass",
#         "varicosities": "Varicosities",
        
#         # Extremities Examination
#         "normal": "Normal",
#         "edema": "Edema",
#         "varicosities": "Varicosities",
#     }
    
#     return {
#         "skinExamination": display_map.get(data.get("skin_exam")),
#         "conjunctivaExamination": display_map.get(data.get("conjunctiva_exam")),
#         "neckExamination": display_map.get(data.get("neck_exam")),
#         "breastExamination": display_map.get(data.get("breast_exam")),
#         "abdomenExamination": display_map.get(data.get("abdomen_exam")),
#         "extremitiesExamination": display_map.get(data.get("extremities_exam")),
#     }
        
# @api_view(['GET'])
# def get_illnesses_by_ids(request):
#     """
#     Fetches illnesses based on a list of provided IDs.
#     """
#     illness_ids_str = request.query_params.get('ids', '')
#     if not illness_ids_str:
#         return Response([], status=status.HTTP_200_OK)

#     try:
#         illness_ids = [int(id_str) for id_str in illness_ids_str.split(',') if id_str.strip()]
#         illnesses = Illness.objects.filter(ill_id__in=illness_ids).order_by('illname')
        
#         illness_data = []
#         for illness in illnesses:
#             illness_data.append({
#                 'ill_id': illness.ill_id,
#                 'illname': illness.illname,
#                 'ill_description': illness.ill_description,
#                 'ill_code': illness.ill_code
#             })
#         return Response(illness_data, status=status.HTTP_200_OK)
#     except ValueError:
#         return Response({'error': 'Invalid illness IDs provided.'}, status=status.HTTP_400_BAD_REQUEST)
#     except Exception as e:
#         return Response({'error': f'Error fetching illnesses by IDs: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   
    
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
# @api_view(["GET"])
# def get_last_previous_pregnancy(request, patient_id):
#     try:
#         patient = get_object_or_404(Patient, pat_id=patient_id)
#         patient_records = PatientRecord.objects.filter(pat_id=patient)

#         latest_prenatal_form = Prenatal_Form.objects.filter(
#             patrec_id__in=patient_records
#         ).order_by('-created_at').first()

#         if latest_prenatal_form:
#             last_previous_pregnancy = Previous_Pregnancy.objects.filter(
#                 pf_id=latest_prenatal_form
#             ).order_by('date_of_delivery', '-pfpp_id').first()

#             if last_previous_pregnancy:
#                 data = {
#                     "last_delivery_date": last_previous_pregnancy.date_of_delivery.isoformat() if last_previous_pregnancy.date_of_delivery else None,
#                     "last_delivery_type": last_previous_pregnancy.type_of_delivery,
#                 }
#                 return Response(data)
#             else:
#                 # No previous pregnancy records found for the latest prenatal form
#                 return Response({}, status=status.HTTP_200_OK)
#         else:
#             # No prenatal forms found for this patient via PatientRecord
#             return Response({}, status=status.HTTP_200_OK)

#     except Patient.DoesNotExist:
#         return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)
#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
def get_patient_health_and_nhts_data(request, patient_id):
    try:
        patient = get_object_or_404(Patient, pat_id=patient_id)
        
        philhealth_id = ""
        nhts_status = ""

        if patient.pat_type == "Resident" and patient.rp_id:
            hrd = HealthRelatedDetails.objects.filter(rp=patient.rp_id).first()
            if hrd:
                philhealth_id = hrd.per_add_philhealth_id or ""
            
            household = Household.objects.filter(rp=patient.rp_id).first()
            if household:
                nhts_status = household.hh_nhts or "" # Assuming hh_nhts is the field name
        
        response_data = {
            "philhealthNo": philhealth_id,
            "nhts_status": nhts_status
        }
        
        return Response(response_data, status=status.HTTP_200_OK)

    except Patient.DoesNotExist:
        return Response({"detail": f"Patient with ID {patient_id} not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"detail": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# @api_view(["GET"])
# def get_patient_spouse(request, patient_id):
#     try:
#         print(f"\n=== DEBUG: Starting spouse lookup for patient {patient_id} ===")
#         patient = get_object_or_404(Patient, pat_id=patient_id)
        
#         # Initialize default empty spouse data
#         spouse_data = {
#             "spouse_lname": "",
#             "spouse_fname": "",
#             "spouse_mname": "",
#             "spouse_dob": "",
#             "spouse_occupation": ""
#         }

#         # 1. First try to get spouse from FP records
#         print("\nDEBUG: Checking FP Records for spouse...")
#         fp_record = FP_Record.objects.filter(pat=patient).order_by('-created_at').first()
        
#         if fp_record:
#             print(f"DEBUG: Found FP Record {fp_record.fprecord_id}")
#             if fp_record.spouse:
#                 spouse = fp_record.spouse
#                 print(f"DEBUG: Found spouse in FP Record: {spouse.spouse_lname}, {spouse.spouse_fname}")
#                 print(f"DEBUG: Spouse details - DOB: {spouse.spouse_dob}, Occupation: {spouse.spouse_occupation}")
                
#                 spouse_data = {
#                     "spouse_lname": spouse.spouse_lname or "",
#                     "spouse_fname": spouse.spouse_fname or "",
#                     "spouse_mname": spouse.spouse_mname or "",
#                     "spouse_dob": spouse.spouse_dob.isoformat() if spouse.spouse_dob else "",
#                     "spouse_occupation": spouse.spouse_occupation or ""
#                 }
#             else:
#                 print("DEBUG: No spouse associated with this FP Record")
#         else:
#             print("DEBUG: No FP Records found for this patient")

#         # 2. For resident patients, if no spouse in FP records, check family composition
#         if not any(spouse_data.values()) and patient.pat_type == "Resident" and patient.rp_id:
#             print("\nDEBUG: Checking family composition for spouse...")
#             try:
#                 household = Household.objects.filter(rp=patient.rp_id).first()
#                 if household:
#                     print(f"DEBUG: Found household {household.hh_id}")
                    
#                     # Fixed: Using select_related('rp') instead of select_related('rp_id')
#                     spouse_composition = FamilyComposition.objects.filter(
#                         fam__hh=household,
#                         fc_role='Spouse'
#                     ).select_related('rp', 'rp__per').first()
                    
#                     if spouse_composition:
#                         print(f"DEBUG: Found spouse in family composition: {spouse_composition.rp}")
                        
#                         if hasattr(spouse_composition.rp, 'per'):
#                             personal_info = spouse_composition.rp.per
#                             print(f"DEBUG: Spouse personal info - Name: {personal_info.per_lname}, {personal_info.per_fname}")
                            
#                             spouse_data = {
#                                 "spouse_lname": personal_info.per_lname or "",
#                                 "spouse_fname": personal_info.per_fname or "",
#                                 "spouse_mname": personal_info.per_mname or "",
#                                 "spouse_dob": personal_info.per_dob.isoformat() if personal_info.per_dob else "",
#                                 "spouse_occupation": personal_info.per_occupation or ""
#                             }
#                         else:
#                             print("DEBUG: No personal info for this family composition")
#                     else:
#                         print("DEBUG: No spouse found in family composition")
#                 else:
#                     print("DEBUG: No household found for this resident")
#             except Exception as e:
#                 print(f"DEBUG ERROR in family composition check: {str(e)}")

#         print("\nDEBUG: Final spouse data to return:", spouse_data)
#         print("=== DEBUG: End of spouse lookup ===")
        
#         return Response(spouse_data, status=status.HTTP_200_OK)

#     except Patient.DoesNotExist:
#         print(f"DEBUG ERROR: Patient {patient_id} not found")
#         return Response(
#             {"error": "Patient not found"}, 
#             status=status.HTTP_404_NOT_FOUND
#         )
#     except Exception as e:
#         print(f"DEBUG ERROR: {str(e)}")
#         return Response(
#             {"error": str(e)}, 
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )
    
class PatientListForOverallTable(generics.ListAPIView):
    serializer_class = OverallFPRecordSerializer  # Use the appropriate serializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        # Start with all FP_Record objects
        queryset = FP_Record.objects.select_related(
            "pat",
            "pat__rp_id__per",
            "pat__trans_id",
        ).prefetch_related(
            'fp_type_set'  # Prefetch related FP_type instances
        ).order_by("-created_at")  # Order by creation date descending
        
        # Apply search filter if 'search' query parameter is present
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(pat__rp_id__per__per_lname__icontains=search_query) |
                Q(pat__rp_id__per__per_fname__icontains=search_query) |
                Q(pat__trans_id__tran_lname__icontains=search_query) |
                Q(pat__trans_id__tran_fname__icontains=search_query) |
                Q(client_id__icontains=search_query) |
                Q(fp_type_set__fpt_client_type__icontains=search_query) |
                Q(fp_type_set__fpt_method_used__icontains=search_query)
            ).distinct()
        
        # Apply client_type filter if 'client_type' query parameter is present
        client_type_filter = self.request.query_params.get('client_type', None)
        if client_type_filter and client_type_filter != "all":
            queryset = queryset.filter(fp_type_set__fpt_client_type__iexact=client_type_filter).distinct()
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Get distinct patients with their latest record
        patient_data_map = {}
        for record in queryset:
            patient_id = record.pat.pat_id
            if patient_id not in patient_data_map:
                # Build patient data structure
                patient_entry = self._build_patient_entry(record)
                patient_data_map[patient_id] = patient_entry
        
        # Convert to list for pagination
        patient_list = list(patient_data_map.values())
        
        # Manual pagination since we transformed the data
        page = self.paginate_queryset(patient_list)
        if page is not None:
            return self.get_paginated_response(page)
        
        return Response(patient_list)
    
    def _build_patient_entry(self, record):
        """Helper method to build patient entry data"""
        patient_id = record.pat.pat_id
        patient_type = record.pat.pat_type
        
        # Get FP type info
        fp_type_instance = record.fp_type_set.first()
        raw_subtype = fp_type_instance.fpt_subtype if fp_type_instance else "N/A"
        subtype = map_subtype_display(raw_subtype)
        
        # Build basic patient entry
        patient_entry = {
            "patient_id": patient_id,
            "patient_name": "",
            "patient_age": None,
            "sex": "",
            "client_type": map_client_type(fp_type_instance.fpt_client_type) if fp_type_instance else "N/A",
            "subtype": subtype,
            "patient_type": patient_type,
            "method_used": fp_type_instance.fpt_method_used if fp_type_instance else "N/A",
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

@api_view(["GET"])
def get_fp_records_for_patient(request, patient_id):
    try:
        _check_and_update_missed_and_dropouts_for_patient(patient_id)
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

# @api_view(["GET"])
# def get_fp_records_for_patient(request, patient_id):
#     try:
#         patient = get_object_or_404(Patient, pat_id=patient_id)
#         fp_records = FP_Record.objects.filter(pat=patient).order_by("-created_at")

#         if not fp_records.exists():
#             return Response(
#                 {"detail": f"No Family Planning records found for patient ID: {patient_id}."},
#                 status=status.HTTP_404_NOT_FOUND,
#             )

#         data = []
#         for record in fp_records:
#             # Get the assessment record to find follow-up date
#             assessment = FP_Assessment_Record.objects.filter(fprecord=record).first()
#             follow_up_date = assessment.followv.followv_date if assessment and hasattr(assessment, 'followv') else None
#             follow_up_status = assessment.followv.followv_status if assessment and hasattr(assessment, 'followv') else None
#             patient_name = ""
#             patient_age = None
#             patient_sex = ""
#             fp_type_instance = record.fp_type_set.first()
#             raw_subtype = fp_type_instance.fpt_subtype if fp_type_instance else "N/A"
            
#             # Handle Resident Patient
#             if patient.pat_type == "Resident" and patient.rp_id and patient.rp_id.per:
#                 personal = patient.rp_id.per
#                 patient_name = f"{personal.per_lname}, {personal.per_fname} {personal.per_mname or ''}".strip()
#                 patient_age = (
#                     calculate_age_from_dob(personal.per_dob.isoformat())
#                     if personal.per_dob
#                     else None
#                 )
#                 patient_sex = personal.per_sex

#             # Handle Transient Patient
#             elif patient.pat_type == "Transient" and patient.trans_id:
#                 transient = patient.trans_id
#                 patient_name = f"{transient.tran_lname}, {transient.tran_fname} {transient.tran_mname or ''}".strip()
#                 patient_age = (
#                     calculate_age_from_dob(transient.tran_dob.isoformat())
#                     if transient.tran_dob
#                     else None
#                 )
#                 patient_sex = transient.tran_sex

#             # Access FP_type via the reverse relationship
#             fp_type_instance = record.fp_type_set.first()

#             data.append(
#                 {
#                     "fprecord": record.fprecord_id,
#                     "patrec_id": record.patrec.patrec_id,
#                     "client_id": record.client_id or "N/A",
#                     "patient_name": patient_name,
#                     "patient_age": patient_age,
#                     "sex": patient_sex,
#                     "client_type": (
#                         map_client_type(fp_type_instance.fpt_client_type) if fp_type_instance else "N/A"
#                     ),
#                     "method_used": (
#                         fp_type_instance.fpt_method_used if fp_type_instance else "N/A"
#                     ),
#                     "subtype": map_subtype_display(raw_subtype),
#                     "other_method": (
#                         fp_type_instance.fpt_other_method if fp_type_instance else "N/A"
#                     ),
#                     "created_at": (
#                         record.created_at.isoformat() if record.created_at else "N/A"
#                     ),
                   
#                     "dateOfFollowUp": (
#                         follow_up_date.isoformat() if follow_up_date else "N/A"
#                     ),
#                     "followv_status": (
#                         follow_up_status if follow_up_status else "N/A"
#                     ),
#                     "avg_monthly_income": record.avg_monthly_income or "N/A",
#                 }
#             )

#         return Response(data, status=status.HTTP_200_OK)

#     except Patient.DoesNotExist:
#         return Response(
#             {"detail": f"Patient with ID {patient_id} not found."},
#             status=status.HTTP_404_NOT_FOUND,
#         )
#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return Response(
#             {"error": f"Error fetching FP records for patient: {str(e)}"},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#         )
        
@api_view(["GET"])
def get_obstetrical_history(request, pat_id):
    try:
        # Validate patient_id format (e.g., P[RT]YYYYXXXX)
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
        print("LATEST BODY: ",latest_body)
        patient_data = serializer.data
        personal_info = patient_data.get("personal_info", {})
        print("PERSONAL:",personal_info)
        
        body_measurement = BodyMeasurement.objects.filter(pat=patient).order_by('-created_at').first()
        if body_measurement:
            body_measurement_data = BodyMeasurementSerializer(body_measurement).data
            weight = float(body_measurement_data.get("weight", "0.00"))
            height = float(body_measurement_data.get("height", "0.00"))
        else:
            weight = 0.0
            height = 0.0
            
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
            "bodyMeasurementRecordedAt": (
            body_measurement.created_at.isoformat() if body_measurement else None
            ),
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

        
        # Fetch spouse information
        # try:
        #     if patient.pat_type == "Resident" and patient.rp_id:
        #         spouse = Spouse.objects.filter(rp_id=patient.rp_id).first()
        #         if spouse:
        #             fp_form_data["spouse"] = {
        #                 "s_lastName": spouse.spouse_lname or "",
        #                 "s_givenName": spouse.spouse_fname or "",
        #                 "s_middleInitial": spouse.spouse_mname[:1] if spouse.spouse_mname else "",
        #                 "s_dateOfBirth": spouse.spouse_dob.isoformat() if spouse.spouse_dob else "",
        #                 "s_age": calculate_age_from_dob(spouse.spouse_dob) if spouse.spouse_dob else 0,
        #                 "s_occupation": spouse.spouse_occupation or None,
        #             }
        #             print(f"✓ Spouse: {fp_form_data['spouse']['s_lastName']}")
        #     else:
        #         print("No spouse data fetched: Patient is not a Resident or no rp_id")
        # except Exception as e:
        #     print(f"Error fetching spouse information: {e}")
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

        # Fetch body measurements
        

        # Fetch obstetrical history
        try:
            obstetrical_history = Obstetrical_History.objects.filter(pat=patient).order_by('-patrec_id__created_at').first()
            if obstetrical_history:
                fp_form_data["obstetricalHistory"] = {
                    "g_pregnancies": obstetrical_history.obs_gravida or 0,
                    "p_pregnancies": obstetrical_history.obs_para or 0,
                    "fullTerm": obstetrical_history.obs_fullterm or 0,
                    "premature": obstetrical_history.obs_preterm or 0,
                    "abortion": obstetrical_history.obs_abortion or 0,
                    "livingChildren": obstetrical_history.obs_living_ch or 0,
                    "lastDeliveryDate": obstetrical_history.obs_last_delivery.isoformat() if obstetrical_history.obs_last_delivery else "",
                    "typeOfLastDelivery": obstetrical_history.obs_type_last_delivery or "",
                    "lastMenstrualPeriod": obstetrical_history.obs_last_period.isoformat() if obstetrical_history.obs_last_period else "",
                    "previousMenstrualPeriod": obstetrical_history.obs_previous_period.isoformat() if obstetrical_history.obs_previous_period else "",
                    "menstrualFlow": obstetrical_history.obs_mens_flow or "Scanty",
                    "dysmenorrhea": obstetrical_history.obs_dysme or False,
                    "hydatidiformMole": obstetrical_history.obs_hydatidiform or False,
                    "ectopicPregnancyHistory": obstetrical_history.obs_ectopic_pregnancy or False,
                }
                print("✓ Complete obstetrical history:", fp_form_data["obstetricalHistory"])

                # Fetch FP-specific obstetrical history
                try:
                    fp_record = FP_Record.objects.filter(pat=patient).order_by('-created_at').first()
                    if fp_record:
                        fp_obs_history = FP_Obstetrical_History.objects.filter(fprecord=fp_record).select_related('obs_record').first()
                        if fp_obs_history:
                            fp_form_data["obstetricalHistory"].update({
                                "lastDeliveryDate": fp_obs_history.fpob_last_delivery.isoformat() if fp_obs_history.fpob_last_delivery else fp_form_data["obstetricalHistory"]["lastDeliveryDate"],
                                "typeOfLastDelivery": fp_obs_history.fpob_type_last_delivery or fp_form_data["obstetricalHistory"]["typeOfLastDelivery"],
                                "lastMenstrualPeriod": fp_obs_history.fpob_last_period.isoformat() if fp_obs_history.fpob_last_period else fp_form_data["obstetricalHistory"]["lastMenstrualPeriod"],
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
                "pat__rp_id__per__personaladdress_set__add", 
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
        
        print("Initial occupation set:", complete_data["occupation"])  # Debug
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
                        personal_addresses = patient.rp_id.per.personaladdress_set.select_related('add').all()
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
                    "lastMenstrualPeriod": (
                        fp_obstetrical_history.fpob_last_period.isoformat()
                        if fp_obstetrical_history.fpob_last_period else ""
                    ),
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
                        complete_data["obstetricalHistory"].update({
                            "g_pregnancies": main_obs.obs_gravida or 0,
                            "p_pregnancies": main_obs.obs_para or 0,
                            "fullTerm": main_obs.obs_fullterm or 0,
                            "premature": main_obs.obs_preterm or 0,
                            "abortion": main_obs.obs_abortion or 0,
                            "numOfLivingChildren": main_obs.obs_living_ch or 0,
                            "childrenBornAlive": main_obs.obs_ch_born_alive or 0,
                            "largeBabies": main_obs.obs_lg_babies or 0,
                            "stillBirth": main_obs.obs_still_birth or 0,
                        })
                        complete_data["main_obstetrical_history"] = main_obs.obs_id
                    except Obstetrical_History.DoesNotExist:
                        complete_data["main_obstetrical_history"] = None
                else:
                    complete_data["main_obstetrical_history"] = None
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
            else:
                complete_data["body_measurement"] = None
                complete_data["weight"] = 0
                complete_data["height"] = 0

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
            complete_data["fp_pelvic_exam"] = display_values  # Use display_values instead of raw data
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
            "pat__rp_id__per__personaladdress_set__add", 
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
                        personal_addresses = personal_info.personaladdress_set.select_related('add').all()
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
                complete_data["fp_obstetrical_history"] = FP_ObstetricalHistorySerializer(fp_obstetrical_history).data
                complete_data["obstetricalHistory"] = {
                    "lastDeliveryDate": (
                        fp_obstetrical_history.fpob_last_delivery.isoformat()
                        if fp_obstetrical_history.fpob_last_delivery else None
                    ),
                    "typeOfLastDelivery": fp_obstetrical_history.fpob_type_last_delivery or "",
                    "lastMenstrualPeriod": (
                        fp_obstetrical_history.fpob_last_period.isoformat()
                        if fp_obstetrical_history.fpob_last_period else ""
                    ),
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
                        complete_data["obstetricalHistory"].update({
                            "g_pregnancies": main_obs.obs_gravida or 0,
                            "p_pregnancies": main_obs.obs_para or 0,
                            "fullTerm": main_obs.obs_fullterm or 0,
                            "premature": main_obs.obs_preterm or 0,
                            "abortion": main_obs.obs_abortion or 0,
                            "numOfLivingChildren": main_obs.obs_living_ch or 0,
                            "childrenBornAlive": main_obs.obs_ch_born_alive or 0,
                            "largeBabies": main_obs.obs_lg_babies or 0,
                            "stillBirth": main_obs.obs_still_birth or 0,
                        })
                        complete_data["main_obstetrical_history"] = main_obs.obs_id
                    except Obstetrical_History.DoesNotExist:
                        complete_data["main_obstetrical_history"] = None
                else:
                    complete_data["main_obstetrical_history"] = None
            else:
                complete_data["fp_obstetrical_history"] = None
                complete_data["main_obstetrical_history"] = None
                complete_data["obstetricalHistory"] = {}
        except Exception as e:
            print(f"Error fetching FP Obstetrical History: {e}")
            complete_data["fp_obstetrical_history"] = None
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

            # Fetch the latest BodyMeasurement for the patient
            latest_body_measurement = BodyMeasurement.objects.filter(pat=patient).order_by('-created_at').first()
            
            if latest_body_measurement:
                body_measurement_data = BodyMeasurementSerializer(latest_body_measurement).data
                complete_data["body_measurement"] = body_measurement_data
                complete_data["weight"] = body_measurement_data.get("weight", 0)
                complete_data["height"] = body_measurement_data.get("height", 0)
            else:
                complete_data["body_measurement"] = None
                complete_data["weight"] = 0
                complete_data["height"] = 0

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


def _create_fp_records_core(data, patient_record_instance, staff_id_from_request):
    patrec_id = patient_record_instance.patrec_id
    staff_id_from_request = data.get('staff_id')
    # Get patient gender from the form data
    patient_gender = data.get("gender", "").lower()
    
    # Determine spouse type based on patient gender
    spouse_type = ""
    if patient_gender == "female":
        spouse_type = "Husband"
    elif patient_gender == "male":
        spouse_type = "Wife"
    else:
        # Default or handle other cases
        spouse_type = "Spouse"
        logger.info(f"Unknown patient gender '{patient_gender}', using default spouse type 'Spouse'")
    
    # Spouse
    spouse_instance = None
    spouse_data = data.get("spouse", {})
    s_lname = spouse_data.get("s_lastName")
    s_fname = spouse_data.get("s_givenName")
    s_dob = spouse_data.get("s_dateOfBirth")
    
    if s_lname and s_fname and s_dob:
        try:
            spouse_instance = Spouse.objects.filter(
                spouse_lname__iexact=s_lname,
                spouse_fname__iexact=s_fname,
                spouse_dob=s_dob
            ).first()
            
            if spouse_instance:
                logger.info(f"Found existing Spouse record with ID: {spouse_instance.pk}. Reusing it.")
                # Update spouse type if it's different
                if spouse_instance.spouse_type != spouse_type:
                    spouse_instance.spouse_type = spouse_type
                    spouse_instance.save()
                    logger.info(f"Updated spouse type to '{spouse_type}' for existing spouse record.")
            else:
                logger.info("No existing Spouse record found with matching identifying details. Creating a new one.")
                spouse_serializer = SpouseSerializer(data={
                    "spouse_lname": s_lname,
                    "spouse_fname": s_fname,
                    "spouse_mname": spouse_data.get("s_middleInitial") or None,
                    "spouse_dob": s_dob,
                    "spouse_occupation": spouse_data.get("s_occupation") or None,
                    "spouse_type": spouse_type,  # Add the spouse type here
                })
                spouse_serializer.is_valid(raise_exception=True)
                spouse_instance = spouse_serializer.save()
                logger.info(f"Created new Spouse record with ID: {spouse_instance.pk} and type: {spouse_type}")
                
        except Exception as e:
            logger.error(f"Error processing spouse record (search or create): {str(e)}")
            raise
    else:
        logger.info("Insufficient identifying Spouse data provided (missing last name, first name, or DOB). Skipping spouse creation/lookup.")
        
    fp_record_data = {
        "spouse": spouse_instance.pk if spouse_instance else None,
    }
    
    # 2. Create FP Record
    fp_record_data = {
        "client_id": data.get("client_id") or "",
        "fourps": data.get("fourps") or False,
        "plan_more_children": data.get("plan_more_children"),
        "avg_monthly_income": data.get("avg_monthly_income") or "0",
        "occupation": data.get("occupation") or None,
        "pat": patient_record_instance.pat_id.pat_id, # Link to the Patient object from the PatientRecord
        "hrd": data.get("hrd_id") or None, # This might need adjustment if HRD is linked to PatientRecord or Patient
        "patrec": patrec_id,  # Use the determined patrec_id
        "spouse": spouse_instance.pk if spouse_instance else None,
    }
    fp_record_serializer = FPRecordSerializer(data=fp_record_data)
    fp_record_serializer.is_valid(raise_exception=True)
    fp_record_instance = fp_record_serializer.save()
    fprecord_id = fp_record_instance.fprecord_id
    logger.info(f"Created FP Record with ID: {fprecord_id} linked to patrec_id: {patrec_id}")
    # print(f"DEBUG: FP Record created with ID: {fprecord_id} linked to patrec_id: {patrec_id}")

   # 3. Create Medical History Records (ALWAYS CREATE NEW RECORDS FOR COMPLETE HISTORY)
    # selected_illness_ids = data.get("selectedIllnessIds", [])
    # custom_disability_details = data.get("customDisabilityDetails")
    # print("Custom: ", custom_disability_details)

    # # Handle case where selectedIllnessIds might be a comma-separated string
    # if isinstance(selected_illness_ids, str):
    #     try:
    #         selected_illness_ids = [int(id_str.strip()) for id_str in selected_illness_ids.split(',') if id_str.strip()]
    #     except ValueError:
    #         selected_illness_ids = []
    #         logger.warning("Failed to parse selectedIllnessIds as comma-separated integers")

    # print("Selected illness IDs for this visit:", selected_illness_ids)

    # # Handle custom disability
    # if custom_disability_details:
    #     custom_illness_description = f"User-specified disability: {custom_disability_details}"
    #     custom_illness_instance = get_or_create_illness(
    #         illname=custom_disability_details,
    #         ill_description=custom_illness_description,
    #         ill_code_prefix="FP"
    #     )
    #     if custom_illness_instance.ill_id not in selected_illness_ids:
    #         selected_illness_ids.append(custom_illness_instance.ill_id)
    #     logger.info(f"Handled custom disability: {custom_illness_instance.illname}")

    # current_patient_record = PatientRecord.objects.get(patrec_id=fp_record_data["patrec"])

    # # Get previous medical history for comparison
    # previous_medical_histories = MedicalHistory.objects.filter(
    #     patrec=current_patient_record
    # ).order_by('-created_at')

    # previous_illness_ids = set()
    # for history in previous_medical_histories:
    #     if history.ill_id not in previous_illness_ids:
    #         previous_illness_ids.add(history.ill_id)

    # # ALWAYS CREATE NEW RECORDS FOR ALL SELECTED ILLNESSES IN THIS VISIT
    # for illness_id in selected_illness_ids:
    #     illness_instance = get_object_or_404(Illness, ill_id=illness_id)
    #     MedicalHistory.objects.create(
    #         ill=illness_instance,
    #         patrec=current_patient_record
    #     )
    #     logger.info(f"Created MedicalHistory record for illness ID: {illness_id}")

    # # Log changes for tracking
    # current_illness_set = set(selected_illness_ids)
    # newly_added = current_illness_set - previous_illness_ids
    # removed = previous_illness_ids - current_illness_set
    # unchanged = current_illness_set.intersection(previous_illness_ids)

    # logger.info(f"Medical History Changes - Added: {len(newly_added)}, Removed: {len(removed)}, Unchanged: {len(unchanged)}")
    # if newly_added:
    #     logger.info(f"Newly added illnesses: {newly_added}")
    # if removed:
    #     logger.info(f"Removed illnesses: {removed}")

    current_fp_record = fp_record_instance
    current_patient_record = patient_record_instance

    # 3. Handle illnesses + snapshots
    selected_illness_ids = data.get("selectedIllnessIds", [])
    custom_disability_details = data.get("customDisabilityDetails")

    if isinstance(selected_illness_ids, str):
        try:
            selected_illness_ids = [int(i.strip()) for i in selected_illness_ids.split(',') if i.strip()]
        except ValueError:
            selected_illness_ids = []
            logger.warning("Failed to parse selectedIllnessIds as comma-separated integers")

    if custom_disability_details:
        custom_illness_description = f"User-specified disability: {custom_disability_details}"
        custom_illness_instance = get_or_create_illness(
            illname=custom_disability_details,
            ill_description=custom_illness_description,
            ill_code_prefix="FP"
        )
        if custom_illness_instance.ill_id not in selected_illness_ids:
            selected_illness_ids.append(custom_illness_instance.ill_id)

    existing_snapshot_medhist_ids = FP_MedicalHistory.objects.filter(
        fprecord=current_fp_record
    ).values_list("medhist_id", flat=True)

    current_illness_set = set(
        MedicalHistory.objects.filter(medhist_id__in=existing_snapshot_medhist_ids)
        .values_list("ill_id", flat=True)
    )

    new_illness_set = set(selected_illness_ids)

    newly_selected = new_illness_set - current_illness_set
    removed_illnesses = current_illness_set - new_illness_set

    for illness_id in newly_selected:
        illness_instance = get_object_or_404(Illness, ill_id=illness_id)
        medhist = MedicalHistory.objects.create(
            ill=illness_instance,
            patrec=current_patient_record
        )
        FP_MedicalHistory.objects.create(
            fprecord=current_fp_record,
            medhist=medhist
        )

    logger.info(f"Medical History Changes for FP Record {current_fp_record.fprecord_id} - Added: {len(newly_selected)}, Removed: {len(removed_illnesses)}")
    if newly_selected:
        logger.info(f"New illnesses added: {newly_selected}")
    if removed_illnesses:
        logger.info(f"Removed illnesses: {removed_illnesses}")

    # return fp_record_instance


    # 4. Create FP Type
    fp_type_data = {
        "fpt_client_type": data.get("typeOfClient") or "New Acceptor",
        "fpt_subtype": data.get("subTypeOfClient") or None,
        "fpt_reason_fp": data.get("reasonForFP") or None,
        "fpt_reason": data.get("otherReasonForFP") or None,
        "fpt_other_reason": data.get("otherReasonForFP") or None,
        "fpt_method_used": data.get("methodCurrentlyUsed") or "None",
        "fpt_other_method": data.get("otherMethod") or "",
        "fprecord": fprecord_id,
    }
    fp_type_serializer = FPTypeSerializer(data=fp_type_data)
    fp_type_serializer.is_valid(raise_exception=True)
    fp_type_instance = fp_type_serializer.save()
    fpt_id = fp_type_instance.fpt_id
    logger.info(f"Created FP_type with ID: {fpt_id}")

    # 5. Obstetrical History (Main Obstetrical Record)
    main_obs_data_from_request = data.get("obstetricalHistory", {})
    main_obs_instance = None

    patient_id = patient_record_instance.pat_id.pat_id # Get patient ID from the determined PatientRecord
    latest_existing_main_obs = Obstetrical_History.objects.filter(
        patrec_id__pat_id=patient_id
    ).order_by('-patrec_id__created_at').first()

    main_obs_serializer_data = {
        "obs_record_from": "Family Planning",
        "patrec_id": patrec_id, # Link to the determined PatientRecord
        "obs_living_ch": 0, "obs_abortion": 0, "obs_gravida": 0, "obs_para": 0,
        "obs_fullterm": 0, "obs_preterm": 0, "obs_ch_born_alive": 0,
        "obs_lg_babies": 0, "obs_still_birth": 0,
    }

    if latest_existing_main_obs:
        main_obs_serializer_data.update({
            "obs_living_ch": latest_existing_main_obs.obs_living_ch,
            "obs_abortion": latest_existing_main_obs.obs_abortion,
            "obs_gravida": latest_existing_main_obs.obs_gravida,
            "obs_para": latest_existing_main_obs.obs_para,
            "obs_fullterm": latest_existing_main_obs.obs_fullterm,
            "obs_preterm": latest_existing_main_obs.obs_preterm,
        })
        if main_obs_data_from_request:
            main_obs_serializer_data.update({
                "obs_living_ch": main_obs_data_from_request.get("numOfLivingChildren", main_obs_serializer_data["obs_living_ch"]),
                "obs_abortion": main_obs_data_from_request.get("abortion", main_obs_serializer_data["obs_abortion"]),
                "obs_gravida": main_obs_data_from_request.get("g_pregnancies", main_obs_serializer_data["obs_gravida"]),
                "obs_para": main_obs_data_from_request.get("p_pregnancies", main_obs_serializer_data["obs_para"]),
                "obs_fullterm": main_obs_data_from_request.get("fullTerm", main_obs_serializer_data["obs_fullterm"]),
                "obs_preterm": main_obs_data_from_request.get("premature", main_obs_serializer_data["obs_preterm"]),
                "obs_ch_born_alive": main_obs_data_from_request.get("childrenBornAlive", main_obs_serializer_data["obs_ch_born_alive"]),
                "obs_lg_babies": main_obs_data_from_request.get("largeBabies", main_obs_serializer_data["obs_lg_babies"]),
                "obs_still_birth": main_obs_data_from_request.get("stillBirth", main_obs_serializer_data["obs_still_birth"]),
            })
    elif main_obs_data_from_request and any(main_obs_data_from_request.values()):
        main_obs_serializer_data.update({
            "obs_living_ch": main_obs_data_from_request.get("numOfLivingChildren") or 0,
            "obs_abortion": main_obs_data_from_request.get("abortion") or 0,
            "obs_gravida": main_obs_data_from_request.get("g_pregnancies") or 0,
            "obs_para": main_obs_data_from_request.get("p_pregnancies") or 0,
            "obs_fullterm": main_obs_data_from_request.get("fullTerm") or 0,
            "obs_preterm": main_obs_data_from_request.get("premature") or 0,
            "obs_ch_born_alive": main_obs_data_from_request.get("childrenBornAlive") or 0,
            "obs_lg_babies": main_obs_data_from_request.get("largeBabies") or 0,
            "obs_still_birth": main_obs_data_from_request.get("stillBirth") or 0,
        })

    main_obs_serializer = ObstetricalHistorySerializer(data=main_obs_serializer_data)
    main_obs_serializer.is_valid(raise_exception=True)
    main_obs_instance = main_obs_serializer.save()
    logger.info(f"Created new Obstetrical_History with ID: {main_obs_instance.obs_id}")

    # 6. Handle FP-specific Obstetrical History (ALWAYS NEW)
    fp_obstetrical_history_data = data.get('obstetricalHistory', {})
    if fp_obstetrical_history_data and fp_record_instance:
        fpob_last_delivery_val = fp_obstetrical_history_data.get('lastDeliveryDate')
        if fpob_last_delivery_val == "":
            fpob_last_delivery_val = None

        fpob_type_last_delivery_val = fp_obstetrical_history_data.get('typeOfLastDelivery')
        if fpob_type_last_delivery_val == "":
            fpob_type_last_delivery_val = None
            
        # Apply the same logic for menstrual period dates
        last_period_val = fp_obstetrical_history_data.get('lastMenstrualPeriod')
        if last_period_val == "":
            last_period_val = None

        previous_period_val = fp_obstetrical_history_data.get('previousMenstrualPeriod')
        if previous_period_val == "":
            previous_period_val = None

        fp_obs_serializer_data = {
            "fpob_last_delivery": fpob_last_delivery_val,
            "fpob_type_last_delivery": fpob_type_last_delivery_val,
            "fpob_last_period": last_period_val,
            "fpob_previous_period": previous_period_val,
            "fpob_mens_flow": fp_obstetrical_history_data.get('menstrualFlow') or "Normal",
            "fpob_dysme": fp_obstetrical_history_data.get('dysmenorrhea') or False,
            "fpob_hydatidiform": fp_obstetrical_history_data.get('hydatidiformMole') or False,
            "fpob_ectopic_pregnancy": fp_obstetrical_history_data.get('ectopicPregnancyHistory') or False,
            "fprecord": fprecord_id,
            "obs": main_obs_instance.obs_id if main_obs_instance else None,
        }

        fp_obs_serializer = FP_ObstetricalHistorySerializer(data=fp_obs_serializer_data)
        fp_obs_serializer.is_valid(raise_exception=True)
        fp_obs_instance = fp_obs_serializer.save()
        logger.info(f"Created new FP_Obstetrical_History with ID: {fp_obs_instance.fpob_id}")
    else:
        logger.info("No FP-specific obstetrical history data or FP_Record not available. Skipping FP_Obstetrical_History creation.")
    
    if fp_obstetrical_history_data:
        last_delivery_date_for_prev_preg = fp_obstetrical_history_data.get('lastDeliveryDate')
        type_of_last_delivery_for_prev_preg = fp_obstetrical_history_data.get('typeOfLastDelivery')

        if last_delivery_date_for_prev_preg == "":
            last_delivery_date_for_prev_preg = None
        if type_of_last_delivery_for_prev_preg == "":
            type_of_last_delivery_for_prev_preg = None

        if last_delivery_date_for_prev_preg and type_of_last_delivery_for_prev_preg:
            prev_pregnancy_data = {
                "date_of_delivery": last_delivery_date_for_prev_preg,
                "type_of_delivery": type_of_last_delivery_for_prev_preg,
                "outcome": None, "babys_wt": None, "gender": None,
                "ballard_score": None, "apgar_score": None,
                "patrec_id": patrec_id, # Link to the determined patrec_id
            }
            prev_pregnancy_serializer = PreviousPregnancyCreateSerializer(data=prev_pregnancy_data)
            if prev_pregnancy_serializer.is_valid():
                prev_pregnancy_instance = prev_pregnancy_serializer.save()
                logger.info(f"Created new Previous_Pregnancy record for last delivery: {prev_pregnancy_instance.pfpp_id}")
            else:
                logger.error(f"Error validating Previous_Pregnancy data: {prev_pregnancy_serializer.errors}")
        else:
            logger.info("Skipping Previous_Pregnancy creation: 'lastDeliveryDate' or 'typeOfLastDelivery' not valid or provided.")

    # 7. Create Risk STI
    risk_sti_data = data.get("sexuallyTransmittedInfections", {})
    risk_sti_payload = {
        "sti_abnormal_discharge": risk_sti_data.get("abnormalDischarge") or False,
        "sti_discharge_from": risk_sti_data.get("dischargeFrom") if risk_sti_data.get("abnormalDischarge") else None,
        "sti_sores": risk_sti_data.get("sores") or False,
        "sti_pain": risk_sti_data.get("pain") or False,
        "sti_history": risk_sti_data.get("history") or False,
        "sti_hiv": risk_sti_data.get("hiv") or False,
        "fprecord": fprecord_id,
    }
    risk_sti_serializer = FPRiskStiSerializer(data=risk_sti_payload)
    risk_sti_serializer.is_valid(raise_exception=True)
    risk_sti_serializer.save()
    logger.info("Created FP_RiskSti.")

    # 8. Create Risk VAW
    risk_vaw_data = data.get("violenceAgainstWomen", {})
    risk_vaw_payload = {
        "vaw_unpleasant_rs": risk_vaw_data.get("unpleasantRelationship") or False,
        "vaw_partner_disapproval": risk_vaw_data.get("partnerDisapproval") or False,
        "vaw_domestic_violence": risk_vaw_data.get("domesticViolence") or False,
        "vaw_referred_to": risk_vaw_data.get("referredTo") or None,
        "fprecord": fprecord_id,
    }
    risk_vaw_serializer = FPRiskVawSerializer(data=risk_vaw_payload)
    risk_vaw_serializer.is_valid(raise_exception=True)
    risk_vaw_serializer.save()
    logger.info("Created FP_RiskVaw.")

    # 9. Handle Body Measurement (ALWAYS CREATE NEW RECORD FOR HISTORY)
    bm_id = None
    current_weight = data.get("weight")
    current_height = data.get("height")
    patient = patient_record_instance.pat_id
    # Always create a new BodyMeasurement record for historical tracking
    bm_data = {
        "weight": float(current_weight) if current_weight is not None else 0,
        "height": float(current_height) if current_height is not None else 0,
        "age": data.get("age") or 0,
        "staff": staff_id_from_request,
        "pat": patient.pat_id,
    }

    print("BM data: ", bm_data)
    bm_serializer = BodyMeasurementSerializer(data=bm_data)
    bm_serializer.is_valid(raise_exception=True)
    new_bm = bm_serializer.save()
    bm_id = new_bm.bm_id

    # Get previous measurement for comparison logging
    previous_bm = BodyMeasurement.objects.filter(
        pat=patient
    ).exclude(bm_id=bm_id).order_by('-created_at').first()

    if previous_bm:
        weight_change = float(current_weight) - float(previous_bm.weight) if current_weight is not None else 0
        height_change = float(current_height) - float(previous_bm.height) if current_height is not None else 0
        logger.info(f"Created new BodyMeasurement with ID: {bm_id}. Previous: W={previous_bm.weight}, H={previous_bm.height}. Change: W={weight_change}, H={height_change}")
    else:
        logger.info(f"Created first BodyMeasurement with ID: {bm_id}")
    
    # 10. Create Vital Signs
    vital_bp_systolic = "N/A"
    vital_bp_diastolic = "N/A"
    if data.get("bloodPressure") and isinstance(data["bloodPressure"], str):
        bp_parts = data["bloodPressure"].split("/")
        if len(bp_parts) == 2:
            vital_bp_systolic = bp_parts[0].strip()
            vital_bp_diastolic = bp_parts[1].strip()
        else:
            vital_bp_systolic = data["bloodPressure"].strip()

    vital_signs_data = {
        "vital_bp_systolic": vital_bp_systolic,
        "vital_bp_diastolic": vital_bp_diastolic,
        "vital_temp": data.get("temperature") or "N/A",
        "vital_RR": data.get("respiratoryRate") or "N/A",
        "vital_o2": data.get("oxygenSaturation") or "N/A",
        "vital_pulse": data.get("pulseRate") or "N/A",
        "staff": staff_id_from_request,
        "patrec": patrec_id, # Link to the determined patrec_id
    }
    vital_signs_serializer = VitalSignsSerializer(data=vital_signs_data)
    vital_signs_serializer.is_valid(raise_exception=True)
    vital_signs_instance = vital_signs_serializer.save()
    vital_id = vital_signs_instance.vital_id
    logger.info(f"Created VitalSigns with ID: {vital_id}")

    # 11. Create Physical Exam
    physical_exam_data = {
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
    physical_exam_serializer = FPPhysicalExamSerializer(data=physical_exam_data)
    physical_exam_serializer.is_valid(raise_exception=True)
    physical_exam_serializer.save()
    logger.info("Created FP_Physical_Exam.")

    # 12. Pelvic Exam (IUD method check)
    is_iud_selected = "IUD" in (data.get("methodCurrentlyUsed") or "")
    if is_iud_selected:
        uterine_position = data.get("uterinePosition", "")
        if uterine_position == "middle":
            uterine_position = "Middle"
        elif uterine_position == "anteflexed":
            uterine_position = "Anteflexed"
        elif uterine_position == "retroflexed":
            uterine_position = "Retroflexed"
        
        pelvic_exam_data = {
            "pelvic_exam": data.get("pelvicExamination") or "Normal",
            "cervical_consistency": data.get("cervicalConsistency") or "Firm",
            "cervical_tenderness": data.get("cervicalTenderness") or False,
            "cervical_adnexal": data.get("cervicalAdnexal") or False,
            "uterine_position": uterine_position,
            "uterine_depth": data.get("uterineDepth") or "",
            "fprecord": fprecord_id,
        }
        pelvic_exam_serializer = PelvicExamSerializer(data=pelvic_exam_data)
        pelvic_exam_serializer.is_valid(raise_exception=True)
        pelvic_exam_serializer.save()
        logger.info("Created FP_Pelvic_Exam (IUD method).")
    else:
        logger.info("Skipping FP_Pelvic_Exam (not IUD method).")

    # 13. Create Acknowledgement
    acknowledgement_data = data.get("acknowledgement", {})
    client_full_name = f"{data.get('lastName')}, {data.get('givenName')} {data.get('middleInitial') or ''}".strip()
    acknowledgement_payload = {
        "ack_client_signature": acknowledgement_data.get("clientSignature") or "",
        "ack_client_signature_date": acknowledgement_data.get("clientSignatureDate") or date.today().isoformat(),
        "ack_client_name": client_full_name,
        "ack_guardian_signature": acknowledgement_data.get("guardianSignature") or "",
        "ack_guardian_signature_date": acknowledgement_data.get("guardianSignatureDate") or None,
        "fprecord": fprecord_id,
        "fpt": fpt_id,
    }
    acknowledgement_serializer = AcknowledgementSerializer(data=acknowledgement_payload)
    acknowledgement_serializer.is_valid(raise_exception=True)
    acknowledgement_serializer.save()
    logger.info("Created FP_Acknowledgement.")

    # 14. Create Pregnancy Check
    print("DEBUG: Preparing Pregnancy Check data...") # Debugging line
    pregnancy_check_data = data.get("pregnancyCheck", {})
    pregnancy_check_payload = {
        "fp_pc_breastfeeding": pregnancy_check_data.get("breastfeeding") or False,
        "fp_pc_abstained": pregnancy_check_data.get("abstained") or False,
        "fp_pc_recent_baby": pregnancy_check_data.get("recent_baby") or False,
        "fp_pc_recent_period": pregnancy_check_data.get("recent_period") or False,
        "fp_pc_recent_abortion": pregnancy_check_data.get("recent_abortion") or False,
        "fp_pc_using_contraceptive": pregnancy_check_data.get("using_contraceptive") or False,
        "fprecord": fprecord_id,
    }
    pregnancy_check_serializer = FP_PregnancyCheckSerializer(data=pregnancy_check_payload)
    print("DEBUG: Validating FP_PregnancyCheckSerializer...")
    print("DATAS PREGNANCY CHECK: ",pregnancy_check_payload)
    pregnancy_check_serializer.is_valid(raise_exception=True)
    pregnancy_check_serializer.save()
    logger.info("Created FP_pregnancy_check.")
    print("DEBUG: FP_pregnancy_check created.")

    # 15. Create Assessment and handle stock deduction
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

        last_follow_up_visit = FollowUpVisit.objects.filter(patrec=patient_record_instance).order_by('-created_at').first()
        if last_follow_up_visit:
            # Only update if the status is not already 'completed' to avoid redundant updates
            if last_follow_up_visit.followv_status != 'completed':
                last_follow_up_visit.followv_status = 'completed'  # Update status to completed
                last_follow_up_visit.completed_at = timezone.now().date()
                last_follow_up_visit.save()  # Save the changes
                logger.info(f"Updated last follow-up visit (ID: {last_follow_up_visit.followv_id}) status to 'completed'.")
            else:
                logger.info(f"Last follow-up visit (ID: {last_follow_up_visit.followv_id}) was already 'completed'. No update needed.")
        else:
            logger.info(f"No previous follow-up visit found for patrec_id: {patient_record_instance.patrec_id} to mark as completed.")
        # Create the NEW Follow-up Visit for the current record
        date_of_follow_up = latest_record.get("dateOfFollowUp")
        if not date_of_follow_up or date_of_follow_up == "":
            # Set a default date or handle differently
            date_of_follow_up = timezone.now().date()  # Or use today's date as default

        follow_up_data = {
            "patrec": patrec_id,
            "followv_date": date_of_follow_up,
            "followv_status": "pending",
            "followv_description": "Family Planning Follow up",
        }
        follow_up_serializer = FollowUpVisitSerializer(data=follow_up_data)
        follow_up_serializer.is_valid(raise_exception=True)
        follow_up_instance = follow_up_serializer.save()
        followv_id = follow_up_instance.followv_id
        logger.info(f"Created NEW FollowUpVisit with ID: {followv_id}")

        # Deduct stock and log transaction if quantity > 0 and method is a commodity
        if method_accepted and method_quantity > 0:
            try:
                print(f"DEBUG: Attempting stock deduction for {method_accepted} (qty: {method_quantity})...") # Debugging line
                commodity = CommodityList.objects.get(com_name=method_accepted)

                print(f"DEBUG: Looking for inventory for commodity {commodity.com_name} with at least {method_quantity} units")
                all_items = CommodityInventory.objects.filter(com_id=commodity)
                print(f"DEBUG: Found {all_items.count()} inventory items for commodity.")

                for item in all_items:
                    print(f"Item: qty={item.cinv_qty_avail}, archived={item.inv_id.is_Archived}, expiry={item.inv_id.expiry_date}")

                commodity_inventory_item = CommodityInventory.objects.filter(
                    com_id=commodity,
                    cinv_qty_avail__gte=method_quantity,
                    inv_id__is_Archived=False
                ).order_by('inv_id__expiry_date').first()

                if not commodity_inventory_item:
                    raise ValueError(f"Insufficient stock ({method_quantity}) for commodity '{method_accepted}' or no suitable inventory item found.")

                # Deduct the stock
                commodity_inventory_item.cinv_qty_avail -= method_quantity
                commodity_inventory_item.save()

                # --- START OF NEW LOGIC TO FIX THE comt_qty ---
                # Get the unit from the inventory item
                original_unit = commodity_inventory_item.cinv_qty_unit
                transaction_unit = original_unit

                # Check if the unit is 'boxes' and change it to 'pc/s'
                if original_unit == "boxes":
                    transaction_unit = "pc/s"

                # Construct the final quantity string to be saved in the transaction
                final_comt_qty = f"{method_quantity} {transaction_unit}"
                # --- END OF NEW LOGIC ---

                CommodityTransaction.objects.create(
                    cinv_id=commodity_inventory_item,
                    comt_qty=final_comt_qty, # Use the new formatted string here
                    comt_action="Deducted for FP Service",
                    staff = staff_id_from_request or None
                )
                logger.info(f"Successfully deducted {method_quantity} of {method_accepted} and logged transaction.")
                print(f"DEBUG: Stock deducted successfully for {method_accepted}. Transaction quantity logged as: {final_comt_qty}") # Debugging line

            except CommodityList.DoesNotExist:
                # ... (your existing exception handling) ...
                logger.warning(f"Commodity '{method_accepted}' not found in CommodityList. Stock not deducted.")
                print(f"DEBUG: Commodity '{method_accepted}' not found for stock deduction.") # Debugging line
                raise # Re-raise to trigger rollback if commodity not found
            except ValueError as ve:
                logger.error(f"Stock deduction error for {method_accepted}: {ve}", exc_info=True)
                raise
            except Exception as e:
                logger.error(f"Unexpected error during stock deduction for {method_accepted}: {e}", exc_info=True)
                raise

        # Create FP Assessment
        assessment_data = {
            "quantity": method_quantity,
            "as_provider_signature": latest_record.get("serviceProviderSignature") or "",
            "as_provider_name": latest_record.get("nameOfServiceProvider") or "",
            "as_findings": latest_record.get("medicalFindings") or "None",
            "followv": followv_id,
            "fprecord": fprecord_id,
            "fpt": fpt_id,
            "bm": bm_id,
        }
        assessment_serializer = FPAssessmentSerializer(data=assessment_data)
        assessment_serializer.is_valid(raise_exception=True)
        assessment_serializer.save()
        logger.info("Created FP_Assessment_Record.")
    else:
        logger.info("No service provision records found, skipping assessment and stock deduction.")

    return fprecord_id # Return the created fprecord_id


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
        
@api_view(['GET'])
def get_detailed_monthly_fp_report(request, year, month):
    try:
        # Define month range
        month_start = date(int(year), int(month), 1)
        next_month = month_start + relativedelta(months=1)
        month_end = next_month - timedelta(days=1)
        
        # Previous month range
        prev_month_start = month_start - relativedelta(months=1)
        prev_month_end = month_start - timedelta(days=1)

        # Check and update dropouts for patients with pending follow-ups in/near this month
        cutoff_start = month_start - timedelta(days=3)  # Catch follow-ups just before
        cutoff_end = month_end + timedelta(days=3)      # Catch follow-ups just after
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

        # Initialize count dictionaries
        bom_counts = {method: {age: 0 for age in age_groups} for method in methods}
        new_counts = {method: {age: 0 for age in age_groups} for method in methods}
        other_counts = {method: {age: 0 for age in age_groups} for method in methods}
        drop_outs_counts = {method: {age: 0 for age in age_groups} for method in methods}
        prev_month_new_counts = {method: {age: 0 for age in age_groups} for method in methods}

        today = timezone.now().date()

        for method in methods:
            for age_group in age_groups:
                # DOB annotation (handles Resident/Transient)
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

                # 1. Get new acceptors from PREVIOUS month (for BOM)
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
                    created_at__range=(prev_month_start, prev_month_end),
                    fp_type__fpt_client_type__iexact='newacceptor',
                    fp_type__fpt_method_used__iexact=method,
                    first_record_date=F('created_at'),
                    has_current=False
                ).filter(
                    age_filter
                ).values('pat__pat_id').distinct().count()
                prev_month_new_counts[method][age_group] = prev_month_new_query

                # 2. BOM: Previous month's active users + previous month's new acceptors
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
                    fprecord_id__isnull=False,
                    fprecord_id=F('latest_fp_record_id'),
                    fp_type__fpt_method_used__iexact=method
                ).filter(
                    age_filter
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
                ).values('pat__pat_id').distinct().count()

                bom_counts[method][age_group] = bom_carryover_query + prev_month_new_query

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
                    created_at__range=(month_start, month_end),
                    fp_type__fpt_client_type__iexact='newacceptor',
                    fp_type__fpt_method_used__iexact=method,
                    first_record_date=F('created_at'),
                    has_current=False
                ).filter(
                    age_filter
                ).values('pat__pat_id').distinct().count()
                new_counts[method][age_group] = new_query

                # 4. OTHER: Current users with previous records in current month
                other_query = FP_Record.objects.annotate(
                    dob=dob_annotation,
                    first_record_date=Min('pat__fp_records__created_at')
                ).filter(
                    created_at__range=(month_start, month_end),
                    fp_type__fpt_client_type__iexact='currentuser',
                    fp_type__fpt_method_used__iexact=method,
                    first_record_date__lt=F('created_at')
                ).filter(
                    age_filter
                ).values('pat__pat_id').distinct().count()
                other_counts[method][age_group] = other_query

                # 5. DROP-OUTS: Dropouts in current month (include auto-detected)
                dropout_query = FP_Assessment_Record.objects.annotate(
                    dob=Case(
                        When(fprecord__pat__pat_type='Resident', then=F('fprecord__pat__rp_id__per__per_dob')),
                        When(fprecord__pat__pat_type='Transient', then=F('fprecord__pat__trans_id__tran_dob')),
                        default=None,
                        output_field=DateField()
                    ),
                    dropout_date=Case(
                        When(followv__followv_status__iexact='Dropout', then=F('followv__followv_date')),
                        When(
                            Q(followv__followv_status__iexact='Pending') & 
                            Q(followv__followv_date__lte=today - timedelta(days=3)),
                            then=F('followv__followv_date') + timedelta(days=3)
                        ),
                        default=None,
                        output_field=DateField()
                    )
                ).filter(
                    Q(followv__followv_status__iexact='Dropout') |
                    Q(followv__followv_status__iexact='Pending', followv__followv_date__lte=today - timedelta(days=3)),
                    dropout_date__range=(month_start, month_end),
                    fprecord__fp_type__fpt_method_used__iexact=method
                ).filter(
                    age_filter
                ).values('fprecord__pat__pat_id').distinct().count()
                drop_outs_counts[method][age_group] = dropout_query

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


class ObstetricalHistoryByPatientView(generics.RetrieveAPIView):
    def get(self, request, pat_id, format=None):
        try:
            # Get the patient first
            patient = get_object_or_404(Patient, pat_id=pat_id)
            
            # Get all patient records for this patient
            patient_records = PatientRecord.objects.filter(pat_id=patient)
            
            # Find obstetrical histories linked to these patient records
            histories = Obstetrical_History.objects.filter(
                patrec_id__in=patient_records
            ).order_by('-patrec_id__created_at')
            
            if histories.exists():
                # Return the most recent one or all of them based on your needs
                latest_history = histories.first()
                serializer = FP_ObstetricalHistorySerializer(latest_history)
                
                response_data = {
                    'obs_id': latest_history.obs_id,
                    'patrec_id': latest_history.patrec_id.patrec_id if latest_history.patrec_id else None,
                    'g_pregnancies': latest_history.obs_gravida or 0,
                    'p_pregnancies': latest_history.obs_para or 0,
                    'fullTerm': latest_history.obs_fullterm or 0,
                    'premature': latest_history.obs_preterm or 0,
                    'abortion': latest_history.obs_abortion or 0,
                    'numOfLivingChildren': latest_history.obs_living_ch or 0,
                    # Add other fields as needed
                }
                
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"detail": "No obstetrical history found for this patient."}, 
                    status=status.HTTP_404_NOT_FOUND
                )
                
        except Patient.DoesNotExist:
            return Response(
                {"detail": f"Patient with ID {pat_id} not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in ObstetricalHistoryByPatientView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"detail": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


def _check_and_update_missed_and_dropouts_for_patient(patient_id):
    try:
        # Get the latest FP_Record for the patient
        latest_fp_record = FP_Record.objects.filter(pat_id=patient_id).order_by('-created_at').first()
        if not latest_fp_record:
            return  # No records, skip

        # Get its FP_type
        fp_type = FP_type.objects.filter(fprecord=latest_fp_record).first()
        if not fp_type:
            return  # No type, skip

        # Get the latest pending FollowUpVisit via PatientRecord
        patient_record = latest_fp_record.patrec
        if not patient_record:
            return

        pending_follow_up = patient_record.follow_up_visits.filter(followv_status="Pending").order_by('-followv_date').first()
        if not pending_follow_up:
            return  # No pending follow-up, skip

        today = timezone.now().date()

        # Check if a new FP_Record (e.g., follow-up record) exists since followv_date
        has_new_record = FP_Record.objects.filter(
            pat_id=patient_id,
            created_at__date__gte=pending_follow_up.followv_date
        ).exists()

        if has_new_record:
            return  # Has new record, don't change status

        # Calculate cutoff for dropout (followv_date + 3 days)
        cutoff_date = pending_follow_up.followv_date + timedelta(days=3)

        with transaction.atomic():
            if today > cutoff_date:
                # Missed by more than 3 days -> Dropout
                pending_follow_up.followv_status = "Dropout"
                pending_follow_up.save()
                fp_type.fpt_subtype = "dropout"  # Or "dropoutrestart" based on your mappings
                fp_type.save()
                logger.info(f"Updated patient {patient_id} follow-up {pending_follow_up.followv_id} to 'Dropout' (missed by >3 days on {pending_follow_up.followv_date})")
            elif today > pending_follow_up.followv_date:
                # Missed but within 3 days -> Missed
                pending_follow_up.followv_status = "Missed"
                pending_follow_up.save()
                # Optional: Update fp_type.fpt_subtype if needed (e.g., to "missed"), but probably not required
                logger.info(f"Updated patient {patient_id} follow-up {pending_follow_up.followv_id} to 'Missed' (missed on {pending_follow_up.followv_date})")

    except Exception as e:
        logger.error(f"Error updating missed/dropout for patient {patient_id}: {str(e)}")
        
# @api_view(['GET'])
# def get_all_fp_records_for_patient(request, patient_id):
#     try:
#         _check_and_update_missed_and_dropouts_for_patient(patient_id)
#         patient = get_object_or_404(Patient, pat_id=patient_id)
        
#         # Initialize contact and religion
#         contact = ""
#         religion = ""
        
#         # For residents: Get from Personal via ResidentProfile
#         if patient.pat_type == "Resident" and patient.rp_id:
#             personal = patient.rp_id.per
#             contact = personal.per_contact or ""
#             religion = personal.per_religion or ""
        
#         # For transients: Get directly from Transient
#         elif patient.pat_type == "Transient" and patient.trans_id:
#             transient = patient.trans_id
#             contact = transient.tran_contact or ""
#             religion = transient.tran_religion or ""
        
#         # Prepare patient info dict
#         patient_info = {
#             "contact": contact,
#             "religion": religion,
#         }
#         # Get all FP records for the patient, ordered from newest to oldest
#         fp_records = FP_Record.objects.filter(pat_id=patient_id).order_by('-created_at')

#         if not fp_records.exists():
#             return Response([], status=status.HTTP_200_OK)

#         all_records_data = []

#         for record in fp_records:
#             record_data = {
#                 'fprecord_id': record.fprecord_id,
#                 'created_at': record.created_at,
#                 'client_id': record.client_id,
#                 'patrec_id': record.patrec_id,
#                 'fp_type': {},
#                 'service_provision': {},
#                 'assessment_records': {},
#             }
            
#             # Fetch and serialize FP_type data
#             try:
#                 fp_type = FP_type.objects.get(fprecord_id=record.fprecord_id)
#                 record_data['fp_type'] = FPTypeSerializer(fp_type).data
#             except FP_type.DoesNotExist:
#                 record_data['fp_type'] = {}

#             # Fetch and serialize FP_Service_Provision data
#             try:
#                 service_provision = FP_Assessment_Record.objects.get(fprecord_id=record.fprecord_id)
#                 record_data['service_provision'] = FPAssessmentSerializer(service_provision).data
#             except FP_Assessment_Record.DoesNotExist:
#                 record_data['service_provision'] = {}
            
#             # Fetch and serialize FP_Assessment_Record data
#             try:
#                 assessment_record = FP_Assessment_Record.objects.get(fprecord_id=record.fprecord_id)
#                 record_data['assessment_records'] = FPAssessmentSerializer(assessment_record).data
#             except FP_Assessment_Record.DoesNotExist:
#                 record_data['assessment_records'] = {}

#             all_records_data.append(record_data)

#         return Response(all_records_data, status=status.HTTP_200_OK)

#     except Exception as e:
#         return Response(
#             {"detail": f"Error fetching patient's FP records: {str(e)}"},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )
        