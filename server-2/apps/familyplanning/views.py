import traceback
from venv import logger
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.db import transaction  # For atomic operations if needed
from django.db.models import Count, Max, OuterRef, Subquery, Sum # Import Sum for aggregation
from django.utils import timezone
from datetime import date
from .models import *
from django.db.models import Prefetch
from .serializers import *
from apps.patientrecords.serializers.patients_serializers import PatientSerializer, PatientRecordSerializer
from apps.patientrecords.models import *
from apps.healthProfiling.models import *
from apps.healthProfiling.serializers.base import *
from apps.maternal.models import *
from apps.patientrecords.serializers.bodymesurement_serializers import *
from apps.patientrecords.serializers.vitalsigns_serializers import *
from apps.patientrecords.serializers.followvisits_serializers import *
from apps.patientrecords.serializers.obstetrical_serializers import *
from apps.maternal.serializer import PreviousPregnancyCreateSerializer
from apps.patientrecords.serializers.spouse_serializers import *
from apps.inventory.models import CommodityList, CommodityInventory # Import CommodityList and CommodityInventory

@api_view(['GET'])
def get_fp_patient_counts(request):
    """
    API view to get counts of total, resident, and transient Family Planning patients.
    """
    try:
        all_fp_patients = FP_Record.objects.select_related('pat').values('pat__pat_id', 'pat__pat_type').distinct()
        
        total_fp_patients = all_fp_patients.count()
        
        # Count residents among FP patients
        resident_fp_patients = all_fp_patients.filter(pat__pat_type='Resident').count()
        
        # Count transients among FP patients
        transient_fp_patients = all_fp_patients.filter(pat__pat_type='Transient').count()

        response_data = {
            "total_fp_patients": total_fp_patients,
            "resident_fp_patients": resident_fp_patients,
            "transient_fp_patients": transient_fp_patients,
        }
        
        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            {"detail": f"Error fetching FP patient counts: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['GET'])
def get_illness_list(request):
    """
    Fetch all available illnesses for the medical history checkboxes,
    with an option to filter by ill_code prefix.
    """
    try:
        illnesses = Illness.objects.all().order_by('ill_id')

        # NEW: Get ill_code_prefix from query parameters
        ill_code_prefix = request.query_params.get('ill_code_prefix', None)
        if ill_code_prefix:
            illnesses = illnesses.filter(ill_code__startswith=ill_code_prefix)

        illness_data = []
        for illness in illnesses:
            illness_data.append({
                'ill_id': illness.ill_id,
                'illname': illness.illname,
                'ill_description': illness.ill_description,
                'ill_code': illness.ill_code
            })

        return Response(illness_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Error fetching illnesses: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def create_medical_history_records(request):
    """
    Create medical history records for selected illnesses
    """
    try:
        data = request.data
        patrec_id = data.get('patrec_id')
        selected_illness_ids = data.get('selected_illness_ids', [])
        
        if not patrec_id:
            return Response(
                {'error': 'patrec_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the patient record
        try:
            patient_record = PatientRecord.objects.get(patrec_id=patrec_id)
        except PatientRecord.DoesNotExist:
            return Response(
                {'error': 'Patient record not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Clear existing medical history for this patient record (optional)
        # MedicalHistory.objects.filter(patrec=patient_record).delete()
        
        # Create new medical history records for selected illnesses
        created_records = []
        for illness_id in selected_illness_ids:
            try:
                illness = Illness.objects.get(ill_id=illness_id)
                medical_history = MedicalHistory.objects.create(
                    ill=illness,
                    patrec=patient_record
                )
                created_records.append({
                    'medhist_id': medical_history.medhist_id,
                    'illness_name': illness.illname,
                    'illness_code': illness.ill_code
                })
            except Illness.DoesNotExist:
                continue
        
        return Response({
            'message': f'Created {len(created_records)} medical history records',
            'records': created_records
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Error creating medical history: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_patient_medical_history(request, patrec_id):
    """
    Get existing medical history for a patient record
    """
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
        # Get the patient
        patient = get_object_or_404(Patient, pat_id=pat_id)

        # Get all patient records for this patient
        patient_records = PatientRecord.objects.filter(pat_id=patient)

        # Find the most recent body measurement
        body_measurement = (
            BodyMeasurement.objects.filter(patrec__in=patient_records)
            .order_by("-created_at")
            .first()
        )

        if body_measurement:
            data = {
                "height": body_measurement.height,
                "weight": body_measurement.weight,
                "recorded_at": body_measurement.created_at.isoformat() if body_measurement.created_at else None, # Add this line
            }
            return Response(data)
        else:
            return Response({}, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)

def get_or_create_illness(illname, ill_description, ill_code_prefix="FP"):
    try:
        illness = Illness.objects.get(illname=illname)
        return illness
    except Illness.DoesNotExist:
      
        result = Illness.objects.filter(ill_code__startswith=ill_code_prefix).aggregate(Max('ill_code'))
        max_ill_code = result['ill_code__max'] # Corrected key
        # --- FIX ENDS HERE ---
        
        new_code_num = 1
        if max_ill_code:
            try:
                current_num_str = max_ill_code[len(ill_code_prefix):]
                current_num = int(current_num_str)
                new_code_num = current_num + 1
            except (ValueError, IndexError):
                logger.warning(f"Could not parse number from max_ill_code: {max_ill_code}. Starting new_code_num from 1.")
                new_code_num = 1 
        new_ill_code = f"{ill_code_prefix}{str(new_code_num).zfill(3)}"
        illness = Illness.objects.create(
            illname=illname,
            ill_description= "",
            ill_code=new_ill_code
        )
        logger.info(f"Created new Illness: {illness.illname} with code {illness.ill_code}")
        return illness
    
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

def get_physical_exam_display_values(data):
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
        "skinExamination": display_map.get(data.get("skinExamination")),
        "conjunctivaExamination": display_map.get(data.get("conjunctivaExamination")),
        "neckExamination": display_map.get(data.get("neckExamination")),
        "breastExamination": display_map.get(data.get("breastExamination")),
        "abdomenExamination": display_map.get(data.get("abdomenExamination")),
        "extremitiesExamination": display_map.get(data.get("extremitiesExamination")),
    }
        
@api_view(['GET'])
def get_illnesses_by_ids(request):
    """
    Fetches illnesses based on a list of provided IDs.
    """
    illness_ids_str = request.query_params.get('ids', '')
    if not illness_ids_str:
        return Response([], status=status.HTTP_200_OK)

    try:
        illness_ids = [int(id_str) for id_str in illness_ids_str.split(',') if id_str.strip()]
        illnesses = Illness.objects.filter(ill_id__in=illness_ids).order_by('illname')
        
        illness_data = []
        for illness in illnesses:
            illness_data.append({
                'ill_id': illness.ill_id,
                'illname': illness.illname,
                'ill_description': illness.ill_description,
                'ill_code': illness.ill_code
            })
        return Response(illness_data, status=status.HTTP_200_OK)
    except ValueError:
        return Response({'error': 'Invalid illness IDs provided.'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': f'Error fetching illnesses by IDs: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   
    
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
        "pelvicExamination": display_map.get(data.get("pelvicExamination")),
        "cervicalConsistency": data.get("cervicalConsistency"),  # Assuming this is already readable
        "cervicalTenderness": True if data.get("cervicalTenderness") else False,
        "cervicalAdnexal": True if data.get("cervicalAdnexal") else False,
        "uterinePosition": data.get("uterinePosition"),
        "uterineDepth": data.get("uterineDepth"),  
    }    

@api_view(["GET"])
def get_last_previous_pregnancy(request, patient_id):
    try:
        patient = get_object_or_404(Patient, pat_id=patient_id)
        patient_records = PatientRecord.objects.filter(pat_id=patient)

        latest_prenatal_form = Prenatal_Form.objects.filter(
            patrec_id__in=patient_records
        ).order_by('-created_at').first()

        if latest_prenatal_form:
            last_previous_pregnancy = Previous_Pregnancy.objects.filter(
                pf_id=latest_prenatal_form
            ).order_by('date_of_delivery', '-pfpp_id').first()

            if last_previous_pregnancy:
                data = {
                    "last_delivery_date": last_previous_pregnancy.date_of_delivery.isoformat() if last_previous_pregnancy.date_of_delivery else None,
                    "last_delivery_type": last_previous_pregnancy.type_of_delivery,
                }
                return Response(data)
            else:
                # No previous pregnancy records found for the latest prenatal form
                return Response({}, status=status.HTTP_200_OK)
        else:
            # No prenatal forms found for this patient via PatientRecord
            return Response({}, status=status.HTTP_200_OK)

    except Patient.DoesNotExist:
        return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
def get_patient_health_and_nhts_data(request, patient_id):
    try:
        patient = get_object_or_404(Patient, pat_id=patient_id)
        
        philhealth_id = ""
        nhts_status = ""

        if patient.pat_type == "Resident" and patient.rp_id:
            # Fetch PhilHealth ID from HealthRelatedDetails
            # Ensure your HealthRelatedDetails model has a ForeignKey to ResidentProfile named 'rp'
            hrd = HealthRelatedDetails.objects.filter(rp=patient.rp_id).first()
            if hrd:
                philhealth_id = hrd.hrd_philhealth_id or ""
            
            # Fetch NHTS status from Household
            # Ensure your Household model has a ForeignKey to ResidentProfile named 'rp'
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

@api_view(["GET"])
def get_patient_spouse(request, patient_id):
    try:
        print(f"\n=== DEBUG: Starting spouse lookup for patient {patient_id} ===")
        patient = get_object_or_404(Patient, pat_id=patient_id)
        
        # Initialize default empty spouse data
        spouse_data = {
            "spouse_lname": "",
            "spouse_fname": "",
            "spouse_mname": "",
            "spouse_dob": "",
            "spouse_occupation": ""
        }

        # 1. First try to get spouse from FP records
        print("\nDEBUG: Checking FP Records for spouse...")
        fp_record = FP_Record.objects.filter(pat=patient).order_by('-created_at').first()
        
        if fp_record:
            print(f"DEBUG: Found FP Record {fp_record.fprecord_id}")
            if fp_record.spouse:
                spouse = fp_record.spouse
                print(f"DEBUG: Found spouse in FP Record: {spouse.spouse_lname}, {spouse.spouse_fname}")
                print(f"DEBUG: Spouse details - DOB: {spouse.spouse_dob}, Occupation: {spouse.spouse_occupation}")
                
                spouse_data = {
                    "spouse_lname": spouse.spouse_lname or "",
                    "spouse_fname": spouse.spouse_fname or "",
                    "spouse_mname": spouse.spouse_mname or "",
                    "spouse_dob": spouse.spouse_dob.isoformat() if spouse.spouse_dob else "",
                    "spouse_occupation": spouse.spouse_occupation or ""
                }
            else:
                print("DEBUG: No spouse associated with this FP Record")
        else:
            print("DEBUG: No FP Records found for this patient")

        # 2. For resident patients, if no spouse in FP records, check family composition
        if not any(spouse_data.values()) and patient.pat_type == "Resident" and patient.rp_id:
            print("\nDEBUG: Checking family composition for spouse...")
            try:
                household = Household.objects.filter(rp=patient.rp_id).first()
                if household:
                    print(f"DEBUG: Found household {household.hh_id}")
                    
                    spouse_composition = FamilyComposition.objects.filter(
                        fam__hh=household,
                        fc_role='Spouse'
                    ).first()
                    
                    if spouse_composition:
                        print(f"DEBUG: Found spouse in family composition: {spouse_composition.rp_id}")
                        
                        if spouse_composition.rp_id.per:
                            personal_info = spouse_composition.rp_id.per
                            print(f"DEBUG: Spouse personal info - Name: {personal_info.per_lname}, {personal_info.per_fname}")
                            
                            spouse_data = {
                                "spouse_lname": personal_info.per_lname or "",
                                "spouse_fname": personal_info.per_fname or "",
                                "spouse_mname": personal_info.per_mname or "",
                                "spouse_dob": personal_info.per_dob.isoformat() if personal_info.per_dob else "",
                                "spouse_occupation": personal_info.per_occupation or ""
                            }
                        else:
                            print("DEBUG: No personal info for this family composition")
                    else:
                        print("DEBUG: No spouse found in family composition")
                else:
                    print("DEBUG: No household found for this resident")
            except Exception as e:
                print(f"DEBUG ERROR in family composition check: {str(e)}")

        print("\nDEBUG: Final spouse data to return:", spouse_data)
        print("=== DEBUG: End of spouse lookup ===")
        
        return Response(spouse_data, status=status.HTTP_200_OK)

    except Patient.DoesNotExist:
        print(f"DEBUG ERROR: Patient {patient_id} not found")
        return Response(
            {"error": "Patient not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"DEBUG ERROR: {str(e)}")
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class PatientListForOverallTable(generics.ListAPIView):
    serializer_class = FPRecordSerializer

    def get_queryset(self):
        return FP_Record.objects.select_related(
            "pat",
            "pat__rp_id__per",
            "pat__trans_id",
        ).order_by("pat__pat_id", "-created_at")

    def list(self, request, *args, **kwargs):
        all_fp_records = self.get_queryset()
        patient_data_map = {}

        for record in all_fp_records:
            patient_id = record.pat.pat_id
            patient_type = record.pat.pat_type
            
            if patient_id not in patient_data_map:
                patient_data_map[patient_id] = {
                    "patient_id": patient_id,
                    "patient_name": "",
                    "patient_age": None,
                    "sex": "",
                    "client_type": "N/A",
                    "patient_type": patient_type,
                    "method_used": "N/A",
                    "created_at": (
                        record.created_at.isoformat() if record.created_at else None
                    ),
                    "fprecord": record.fprecord_id,
                    "record_count": 0,
                    "has_multiple_records": False,
                }

            patient_data_map[patient_id]["record_count"] += 1

            if (
                record.pat.pat_type == "Resident"
                and record.pat.rp_id
                and record.pat.rp_id.per
            ):
                personal = record.pat.rp_id.per
                patient_data_map[patient_id][
                    "patient_name"
                ] = f"{personal.per_lname}, {personal.per_fname} {personal.per_mname or ''}".strip()
                patient_data_map[patient_id]["patient_age"] = (
                    calculate_age_from_dob(personal.per_dob.isoformat())
                    if personal.per_dob
                    else None
                )
                patient_data_map[patient_id]["sex"] = personal.per_sex
                # ADDED: Assign patient_type for Resident
                patient_data_map[patient_id]["patient_type"] = "Resident" 

            # FIXED: Handle Transient Patient
            elif record.pat.pat_type == "Transient" and record.pat.trans_id:
                transient = record.pat.trans_id
                patient_data_map[patient_id][
                    "patient_name"
                ] = f"{transient.tran_lname}, {transient.tran_fname} {transient.tran_mname or ''}".strip()
                patient_data_map[patient_id]["patient_age"] = (
                    calculate_age_from_dob(transient.tran_dob.isoformat())
                    if transient.tran_dob
                    else None
                )
                patient_data_map[patient_id]["sex"] = transient.tran_sex
                patient_data_map[patient_id]["patient_type"] = "Transient" 

            # Access FP_type via the reverse relationship
            fp_type_instance = record.fp_type_set.first()
            if fp_type_instance:
                patient_data_map[patient_id]["client_type"] = (
                    map_client_type(fp_type_instance.fpt_client_type) if fp_type_instance else "N/A")
                patient_data_map[patient_id]["method_used"] = (
                    fp_type_instance.fpt_method_used or "N/A"
                )

        response_data = list(patient_data_map.values())
        for patient_entry in response_data:
            if patient_entry["record_count"] > 1:
                patient_entry["has_multiple_records"] = True

        return Response(response_data, status=status.HTTP_200_OK)

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
    """
    Fetches the available stock quantity for a given commodity name.
    """
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
        patient = get_object_or_404(Patient, pat_id=patient_id)
        fp_records = FP_Record.objects.filter(pat=patient).order_by("-created_at")

        if not fp_records.exists():
            return Response(
                {"detail": f"No Family Planning records found for patient ID: {patient_id}."},
                status=status.HTTP_404_NOT_FOUND,
            )

        data = []
        for record in fp_records:
            # Get the assessment record to find follow-up date
            assessment = FP_Assessment_Record.objects.filter(fprecord=record).first()
            follow_up_date = assessment.followv.followv_date if assessment and hasattr(assessment, 'followv') else None
            follow_up_status = assessment.followv.followv_status if assessment and hasattr(assessment, 'followv') else None
            patient_name = ""
            patient_age = None
            patient_sex = ""

            # Handle Resident Patient
            if patient.pat_type == "Resident" and patient.rp_id and patient.rp_id.per:
                personal = patient.rp_id.per
                patient_name = f"{personal.per_lname}, {personal.per_fname} {personal.per_mname or ''}".strip()
                patient_age = (
                    calculate_age_from_dob(personal.per_dob.isoformat())
                    if personal.per_dob
                    else None
                )
                patient_sex = personal.per_sex

            # Handle Transient Patient
            elif patient.pat_type == "Transient" and patient.trans_id:
                transient = patient.trans_id
                patient_name = f"{transient.tran_lname}, {transient.tran_fname} {transient.tran_mname or ''}".strip()
                patient_age = (
                    calculate_age_from_dob(transient.tran_dob.isoformat())
                    if transient.tran_dob
                    else None
                )
                patient_sex = transient.tran_sex

            # Access FP_type via the reverse relationship
            fp_type_instance = record.fp_type_set.first()

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
        import traceback
        traceback.print_exc()
        return Response(
            {"error": f"Error fetching FP records for patient: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
        
        
@api_view(["GET"])
def get_obstetrical_history(request, pat_id):
    try:
        patient = get_object_or_404(Patient, pat_id=pat_id)
        patient_records = PatientRecord.objects.filter(pat_id=patient)

        # Get summary obstetrical history
        obstetrical_summary_history = (
            Obstetrical_History.objects.filter(patrec_id__in=patient_records)
            .order_by("-patrec_id__created_at").first()
        )

        latest_previous_pregnancy = (
            Previous_Pregnancy.objects.filter(patrec_id__in=patient_records) # <--- CORRECTED LINE
            .order_by("-date_of_delivery", "-pfpp_id") # Order to get the absolute latest
            .first()
        )

        response_data = {
            "g_pregnancies": 0,
            "p_pregnancies": 0,
            "fullTerm": 0,
            "premature": 0,
            "abortion": 0,
            "livingChildren": 0,
            "lastDeliveryDate": "", # Initialize as None
            "typeOfLastDelivery": "", # Initialize as None
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
                "lastDeliveryDate": latest_previous_pregnancy.date_of_delivery.isoformat() if latest_previous_pregnancy.date_of_delivery else None,
                "typeOfLastDelivery": latest_previous_pregnancy.type_of_delivery,
            })
            
        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in get_obstetrical_history: {str(e)}")
        import traceback # Add traceback for detailed error logging
        traceback.print_exc() # Print traceback to console for debugging
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
def get_patient_details_data(request, patient_id):
    try:
        patient = get_object_or_404(Patient, pat_id=patient_id)
        serializer = PatientSerializer(patient)
        patient_data = serializer.data
        personal_info = patient_data.get("personal_info", {})
        

        # Initialize default form data
        fp_form_data = {
            "pat_id": patient_data.get("pat_id", ""),
            "client_id": patient_data.get("client_id", ""),
            "philhealthNo": "",
            "nhts_status": "",
            "fourps": "",
            "lastName": personal_info.get("per_lname", ""),
            "givenName": personal_info.get("per_fname", ""),
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
            "weight": 0,
            "height": 0,
            "bodyMeasurementRecordedAt": None,
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
                    fp_form_data["philhealthNo"] = hrd.hrd_philhealth_id or ""
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

        # Fetch spouse information
        try:
            if patient.pat_type == "Resident" and patient.rp_id:
                spouse = Spouse.objects.filter(rp_id=patient.rp_id).first()
                if spouse:
                    fp_form_data["spouse"] = {
                        "s_lastName": spouse.spouse_lname or "",
                        "s_givenName": spouse.spouse_fname or "",
                        "s_middleInitial": spouse.spouse_mname[:1] if spouse.spouse_mname else "",
                        "s_dateOfBirth": spouse.spouse_dob.isoformat() if spouse.spouse_dob else "",
                        "s_age": calculate_age_from_dob(spouse.spouse_dob) if spouse.spouse_dob else 0,
                        "s_occupation": spouse.spouse_occupation or None,
                    }
                    print(f"✓ Spouse: {fp_form_data['spouse']['s_lastName']}")
            else:
                print("No spouse data fetched: Patient is not a Resident or no rp_id")
        except Exception as e:
            print(f"Error fetching spouse information: {e}")

        # Fetch body measurements
        try:
            body_measurement = BodyMeasurement.objects.filter(patrec=patient).order_by("-created_at").first()
            if body_measurement:
                fp_form_data.update({
                    "weight": body_measurement.weight or 0,
                    "height": body_measurement.height or 0,
                    "bodyMeasurementRecordedAt": body_measurement.created_at.isoformat() if body_measurement.created_at else None,
                })
                print(f"✓ Body Measurement: Weight={fp_form_data['weight']}, Height={fp_form_data['height']}")
        except Exception as e:
            print(f"Error fetching body measurements: {e}")

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
        complete_data["avg_monthly_income"] = fp_record.avg_monthly_income or "N/A"
        print("Initial occupation set:", complete_data["occupation"])  # Debug
        pat_id = fp_record.pat_id

        # Serialize related data for the current record
        try:
            fp_type = FP_type.objects.get(fprecord_id=fp_record)
            complete_data["fp_type"] = FPTypeSerializer(fp_type).data
            complete_data["typeOfClient"] = map_client_type(fp_type.fpt_client_type)
            complete_data["subTypeOfClient"] = fp_type.fpt_subtype

            if fp_type.fpt_client_type == "newacceptor":
                complete_data["reasonForFP"] = fp_type.fpt_reason_fp
                complete_data["reason"] = fp_type.fpt_reason
                complete_data["otherReasonForFP"] = fp_type.fpt_reason
            elif fp_type.fpt_client_type == "currentuser":
                complete_data["reasonForFP"] = fp_type.fpt_reason_fp
                complete_data["reason"] = fp_type.fpt_reason
                complete_data["otherReasonForFP"] = fp_type.fpt_reason
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
                        philhealth_id = hrd.hrd_philhealth_id or ""
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
                "philhealthNo": "", "nhts_status": False, "spouse": {}
                # Do NOT set occupation here to preserve earlier value
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
                "abnormalDischarge": risk_sti.abnormalDischarge,
                "dischargeFrom": risk_sti.dischargeFrom,
                "sores": risk_sti.sores,
                "pain": risk_sti.pain,
                "history": risk_sti.history,
                "hiv": risk_sti.hiv,
            }
        except FP_RiskSti.DoesNotExist:
            complete_data["risk_sti"] = None
            complete_data["sexuallyTransmittedInfections"] = {}

        # Fetch Risk VAW
        try:
            risk_vaw = FP_RiskVaw.objects.get(fprecord_id=fp_record)
            complete_data["risk_vaw"] = FPRiskVawSerializer(risk_vaw).data
            complete_data["violenceAgainstWomen"] = {
                "unpleasantRelationship": risk_vaw.unpleasant_relationship,
                "partnerDisapproval": risk_vaw.partner_disapproval,
                "domesticViolence": risk_vaw.domestic_violence,
                "referredTo": risk_vaw.referredTo,
            }
        except FP_RiskVaw.DoesNotExist:
            complete_data["risk_vaw"] = None
            complete_data["violenceAgainstWomen"] = {}

        # Fetch FP_Physical_Exam
        try:
            fp_physical_exam = FP_Physical_Exam.objects.get(fprecord_id=fp_record)
            physical_exam_serialized_data = FPPhysicalExamSerializer(fp_physical_exam).data
            display_values = get_physical_exam_display_values(physical_exam_serialized_data)
            complete_data["fp_physical_exam"] = physical_exam_serialized_data
            complete_data.update({
                "skinExamination": display_values["skinExamination"],
                "conjunctivaExamination": display_values["conjunctivaExamination"],
                "neckExamination": display_values["neckExamination"],
                "breastExamination": display_values["breastExamination"],
                "abdomenExamination": display_values["abdomenExamination"],
                "extremitiesExamination": display_values["extremitiesExamination"],
            })
            if fp_physical_exam.bm:
                body_measurement_data = BodyMeasurementSerializer(fp_physical_exam.bm).data
                complete_data["body_measurement"] = body_measurement_data
                complete_data["weight"] = body_measurement_data.get("weight", 0)
                complete_data["height"] = body_measurement_data.get("height", 0)
            else:
                complete_data["body_measurement"] = None
                complete_data["weight"] = 0
                complete_data["height"] = 0
            if fp_physical_exam.vital:
                vital_signs_data = VitalSignsSerializer(fp_physical_exam.vital).data
                complete_data["pulseRate"] = vital_signs_data.get("vital_pulse", 0)
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
            complete_data["fp_pelvic_exam"] = pelvic_exam_serialized_data
            complete_data.update({
                "pelvicExamination": display_values["pelvicExamination"],
                "cervicalConsistency": display_values["cervicalConsistency"],
                "cervicalTenderness": display_values["cervicalTenderness"],
                "cervicalAdnexal": display_values["cervicalAdnexal"],
                "uterinePosition": display_values["uterinePosition"],
                "uterineDepth": display_values["uterineDepth"],
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
                "clientName": acknowledgement_serialized_data.get("client_name") or "",
                # "guardianName": acknowledgement_serialized_data.get("guardian_name") or "",
                "guardianSignature": acknowledgement_serialized_data.get("guardian_signature") or "",
                "guardianSignatureDate": acknowledgement_serialized_data.get("guardian_signature_date") or "",
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
                "breastfeeding": pregnancy_check_serialized_data.get("breastfeeding", False),
                "abstained": pregnancy_check_serialized_data.get("abstained", False),
                "recent_baby": pregnancy_check_serialized_data.get("recent_baby", False),
                "recent_period": pregnancy_check_serialized_data.get("recent_period", False),
                "recent_abortion": pregnancy_check_serialized_data.get("recent_abortion", False),
                "using_contraceptive": pregnancy_check_serialized_data.get("using_contraceptive", False),
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
        try:
            patient_record = fp_record.patrec
            medical_history_records = MedicalHistory.objects.filter(patrec=patient_record).select_related('ill')
            medical_history_data = []
            selected_illness_ids = []
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
            for history in medical_history_records:
                medical_history_data.append({
                    'medhist_id': history.medhist_id,
                    'ill_id': history.ill.ill_id,
                    'illname': history.ill.illname,
                    'ill_code': history.ill.ill_code,
                    'created_at': history.created_at.isoformat() if history.created_at else None
                })
                selected_illness_ids.append(history.ill.ill_id)
                if history.ill.ill_id == 14:
                    complete_data["medicalHistory"]["severeHeadaches"] = True
                elif history.ill.ill_id == 15:
                    complete_data["medicalHistory"]["strokeHeartAttackHypertension"] = True
                elif history.ill.ill_id == 16:
                    complete_data["medicalHistory"]["hematomaBruisingBleeding"] = True
                elif history.ill.ill_id == 17:
                    complete_data["medicalHistory"]["breastCancerHistory"] = True
                elif history.ill.ill_id == 18:
                    complete_data["medicalHistory"]["severeChestPain"] = True
                elif history.ill.ill_id == 19:
                    complete_data["medicalHistory"]["cough"] = True
                elif history.ill.ill_id == 20:
                    complete_data["medicalHistory"]["jaundice"] = True
                elif history.ill.ill_id == 21:
                    complete_data["medicalHistory"]["unexplainedVaginalBleeding"] = True
                elif history.ill.ill_id == 22:
                    complete_data["medicalHistory"]["abnormalVaginalDischarge"] = True
                elif history.ill.ill_id == 23:
                    complete_data["medicalHistory"]["phenobarbitalOrRifampicin"] = True
                elif history.ill.ill_id == 24:
                    complete_data["medicalHistory"]["smoker"] = True
                elif history.ill.ill_id == 25:
                    complete_data["medicalHistory"]["disability"] = True
                    complete_data["medicalHistory"]["disabilityDetails"] = getattr(history, 'disability_details', '') or ""
            complete_data["medical_history_records"] = medical_history_data
            complete_data["selectedIllnessIds"] = selected_illness_ids
        except Exception as e:
            print(f"Error fetching medical history: {e}")
            complete_data["medical_history_records"] = []
            complete_data["selectedIllnessIds"] = []
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

        # Fetch ALL historical FP_Assessment_Records for the patient, filtered by method if not latest
        current_method = fp_type.fpt_method_used if fp_type else None
        is_latest = fp_record.created_at == FP_Record.objects.filter(pat_id=pat_id).aggregate(Max('created_at'))['created_at__max']

        all_fp_records_qs = FP_Record.objects.filter(pat_id=pat_id)
        if not is_latest and current_method:
            all_fp_records_qs = all_fp_records_qs.filter(fp_type__fpt_method_used=current_method)  # Filter by method
        all_fp_records = all_fp_records_qs.order_by('-created_at').prefetch_related(
            Prefetch('fp_assessment_record', queryset=FP_Assessment_Record.objects.select_related('followv')),
            Prefetch('fp_physical_exam', queryset=FP_Physical_Exam.objects.select_related('bm', 'vital')),
            Prefetch('fp_acknowledgement', queryset=FP_Acknowledgement.objects.select_related('type'))
        )

        service_provision_records = []
        for historical_fp_record in all_fp_records:
            assessment = historical_fp_record.fp_assessment_record.first()
            if not assessment:
                continue

            physical_exam = historical_fp_record.fp_physical_exam.first()
            acknowledgement = historical_fp_record.fp_acknowledgement.first()

            service_dict = {
                'dateOfVisit': (
                    assessment.followv.date_of_visit.strftime('%Y-%m-%d')
                    if assessment.followv and hasattr(assessment.followv, 'date_of_visit') and assessment.followv.date_of_visit
                    else historical_fp_record.created_at.strftime('%Y-%m-%d')
                ),
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
                    acknowledgement.type.fpt_method_used if acknowledgement and acknowledgement.type else ''
                ),
                'methodQuantity': assessment.quantity or 0,
                'serviceProviderSignature': assessment.as_provider_signature or '',
                'nameOfServiceProvider': assessment.as_provider_name or '',
            }
            service_provision_records.append(service_dict)

        complete_data["serviceProvisionRecords"] = service_provision_records if service_provision_records else []

        print("Final occupation before response:", complete_data["occupation"])  # Debug
        return Response(complete_data, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            {"error": f"Error fetching complete FP record: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    
# new view to fetch the latest FP record for a patient
@api_view(['GET'])
def get_latest_fp_record_by_patient_id(request, patient_id):
    """
    Fetches the latest complete FP record for a given patient,
    consolidating data from multiple related models.
    """
    try:
        # Find the latest FP_Record for the patient
        latest_fp_record = FP_Record.objects.filter(pat_id=patient_id).order_by('-created_at').first()

        if not latest_fp_record:
            return Response({"detail": "No Family Planning record found for this patient."},
                            status=status.HTTP_404_NOT_FOUND)

        # Initialize a dictionary to hold all the consolidated data
        complete_data = {}

        # Fetch and serialize Patient and PatientRecord data
        patient = latest_fp_record.pat
        pat_record = latest_fp_record.patrec
        
        # Get patient details (Resident or Transient)
        if patient.rp_id:
            resident_info = patient.rp_id
            complete_data.update({
                "lastName": resident_info.res_lname,
                "givenName": resident_info.res_fname,
                "middleInitial": resident_info.res_mname[:1] if resident_info.res_mname else "",
                "dateOfBirth": resident_info.res_dob.isoformat(),
                "age": calculate_age_from_dob(resident_info.res_dob.isoformat()),
                "educationalAttainment": resident_info.res_ed_attainment,
                "philhealthNo": resident_info.philhealthNo,
                "nhts_status": resident_info.hh_id.hh_nhts if resident_info.hh_id else "",
                "address": {
                    "houseNumber": resident_info.res_house_no,
                    "street": resident_info.res_street,
                    "barangay": resident_info.res_barangay,
                    "municipality": resident_info.res_municipality,
                    "province": resident_info.res_province,
                }
            })
        elif patient.trans_id:
            transient_info = patient.trans_id
            complete_data.update({
                "lastName": transient_info.tran_lname,
                "givenName": transient_info.tran_fname,
                "middleInitial": transient_info.tran_mname[:1] if transient_info.tran_mname else "",
                "dateOfBirth": transient_info.tran_dob.isoformat(),
                "age": calculate_age_from_dob(transient_info.tran_dob.isoformat()),
                "educationalAttainment": transient_info.tran_ed_attainment,
                "philhealthNo": "",
                "nhts_status": "",
                "address": {
                    "houseNumber": "",
                    "street": transient_info.tradd_id.tradd_street,
                    "barangay": transient_info.tradd_id.tradd_barangay,
                    "municipality": transient_info.tradd_id.tradd_city,
                    "province": transient_info.tradd_id.tradd_province,
                }
            })
        
        # Fetch Spouse data
        if latest_fp_record.spouse:
            spouse_data = SpouseSerializer(latest_fp_record.spouse).data
            complete_data["spouse"] = {
                "s_lastName": spouse_data.get("spouse_lname", ""),
                "s_givenName": spouse_data.get("spouse_fname", ""),
                "s_middleInitial": spouse_data.get("spouse_mname", "")[:1] if spouse_data.get("spouse_mname") else "",
                "s_dateOfBirth": spouse_data.get("spouse_dob"),
                "s_occupation": spouse_data.get("spouse_occupation", ""),
                "s_educationalAttainment": spouse_data.get("spouse_ed_attainment", "")
            }
        else:
            complete_data["spouse"] = {}

        # Fetch Obstetrical History
        obstetrical_history = Obstetrical_History.objects.filter(patrec=pat_record).first()
        if obstetrical_history:
            complete_data["obstetricalHistory"] = ObstetricalHistorySerializer(obstetrical_history).data
            
        # Fetch Medical History
        medical_history_records = MedicalHistory.objects.filter(patrec=pat_record)
        selected_illness_ids = [mh.ill.ill_id for mh in medical_history_records]
        complete_data["medicalHistory"] = {
            "selected_illness_ids": selected_illness_ids,
            "severeHeadaches": any(ill.ill_id == 14 for ill in [mh.ill for mh in medical_history_records]),
            "strokeHeartAttackHypertension": any(ill.ill_id == 15 for ill in [mh.ill for mh in medical_history_records]),
            "hematomaBruisingBleeding": any(ill.ill_id == 16 for ill in [mh.ill for mh in medical_history_records]),
            "breastCancerHistory": any(ill.ill_id == 17 for ill in [mh.ill for mh in medical_history_records]),
            "severeChestPain": any(ill.ill_id == 18 for ill in [mh.ill for mh in medical_history_records]),
            "cough": any(ill.ill_id == 19 for ill in [mh.ill for mh in medical_history_records]),
            "jaundice": any(ill.ill_id == 20 for ill in [mh.ill for mh in medical_history_records]),
            "unexplainedVaginalBleeding": any(ill.ill_id == 21 for ill in [mh.ill for mh in medical_history_records]),
            "abnormalVaginalDischarge": any(ill.ill_id == 22 for ill in [mh.ill for mh in medical_history_records]),
            "phenobarbitalOrRifampicin": any(ill.ill_id == 23 for ill in [mh.ill for mh in medical_history_records]),
            "smoker": any(ill.ill_id == 24 for ill in [mh.ill for mh in medical_history_records]),
            "disability": any(ill.ill_id == 25 for ill in [mh.ill for mh in medical_history_records]),
            "disabilityDetails": next((mh.mh_details for mh in medical_history_records if mh.ill.ill_id == 25), ""),
        }
        
        # Fetch FP_type
        fp_type = FP_type.objects.filter(fprecord_id=latest_fp_record).first()
        if fp_type:
            complete_data.update({
                "typeOfClient": fp_type.fpt_client_type,
                "subTypeOfClient": fp_type.fpt_sub_client_type,
                "reasonForFP": fp_type.fpt_reason_fp,
                "reason": fp_type.fpt_reason,
                "otherReasonForFP": fp_type.fpt_other_reason,
                "methodCurrentlyUsed": fp_type.fpt_method_used,
            })
            
        # Fetch FP_Service_Provision
        service_provision = FP_Assessment_Record.objects.filter(fprecord_id=latest_fp_record).first()
        if service_provision:
            complete_data.update({
                "serviceProvision": {
                    "counseling": service_provision.counseling,
                    "physicalExam": service_provision.physicalExam,
                    "breastExam": service_provision.breastExam,
                    "pregnancyCheck": service_provision.pregnancyCheck,
                }
            })
            
        # Fetch FP_Assessment_Record
        assessment_record = FP_Assessment_Record.objects.filter(fprecord_id=latest_fp_record).first()
        if assessment_record:
            complete_data.update({
                "assessmentRecord": {
                    "body_weight": assessment_record.body_weight,
                    "height": assessment_record.height,
                    "bmi": assessment_record.bmi,
                    "bloodPressure": assessment_record.bloodPressure,
                    "pulseRate": assessment_record.pulseRate,
                    "temperature": assessment_record.temperature,
                    "skin": assessment_record.skin,
                    "conjunctiva": assessment_record.conjunctiva,
                    "neck": assessment_record.neck,
                    "breast": assessment_record.breast,
                    "abdomen": assessment_record.abdomen,
                    "extremities": assessment_record.extremities,
                }
            })

        return Response(complete_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
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
        complete_data["avg_monthly_income"] = fp_record.avg_monthly_income or "N/A"
        print("Initial occupation set:", complete_data["occupation"])  # Debug
        
        try:
            fp_type = FP_type.objects.get(fprecord_id=fp_record)
            complete_data["fp_type"] = FPTypeSerializer(fp_type).data
            complete_data["typeOfClient"] = map_client_type(fp_type.fpt_client_type)
            complete_data["subTypeOfClient"] = fp_type.fpt_subtype
            if fp_type.fpt_client_type == "newacceptor":
                complete_data["reasonForFP"] = fp_type.fpt_reason_fp
                complete_data["reason"] = fp_type.fpt_reason
                complete_data["otherReasonForFP"] = fp_type.fpt_reason
            elif fp_type.fpt_client_type == "currentuser":
                complete_data["reasonForFP"] = fp_type.fpt_reason_fp
                complete_data["reason"] = fp_type.fpt_reason
                complete_data["otherReasonForFP"] = fp_type.fpt_reason
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
                    "municipality": "", "province": "",
                }
            })

            try:
                if patient.pat_type == "Resident" and patient.rp_id:
                    hrd = HealthRelatedDetails.objects.filter(rp_id=patient.rp_id).first()
                    if hrd:
                        complete_data["philhealthNo"] = hrd.hrd_philhealth_id or ""
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
                "philhealthNo": "", "nhts_status": False, "spouse": {}
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
                "abnormalDischarge": risk_sti.abnormalDischarge,
                "dischargeFrom": risk_sti.dischargeFrom,
                "sores": risk_sti.sores,
                "pain": risk_sti.pain,
                "history": risk_sti.history,
                "hiv": risk_sti.hiv,
            }
        except FP_RiskSti.DoesNotExist:
            complete_data["risk_sti"] = None
            complete_data["sexuallyTransmittedInfections"] = {}

        # Fetch Risk VAW
        try:
            risk_vaw = FP_RiskVaw.objects.get(fprecord_id=fp_record)
            complete_data["risk_vaw"] = FPRiskVawSerializer(risk_vaw).data
            complete_data["violenceAgainstWomen"] = {
                "unpleasantRelationship": risk_vaw.unpleasant_relationship,
                "partnerDisapproval": risk_vaw.partner_disapproval,
                "domesticViolence": risk_vaw.domestic_violence,
                "referredTo": risk_vaw.referredTo,
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
                "skinExamination": physical_exam_serialized_data.get("skinExamination"),
                "conjunctivaExamination": physical_exam_serialized_data.get("conjunctivaExamination"),
                "neckExamination": physical_exam_serialized_data.get("neckExamination"),
                "breastExamination": physical_exam_serialized_data.get("breastExamination"),
                "abdomenExamination": physical_exam_serialized_data.get("abdomenExamination"),
                "extremitiesExamination": physical_exam_serialized_data.get("extremitiesExamination"),
            })
            if fp_physical_exam.bm:
                body_measurement_data = BodyMeasurementSerializer(fp_physical_exam.bm).data
                complete_data["body_measurement"] = body_measurement_data
                complete_data["weight"] = body_measurement_data.get("weight", 0)
                complete_data["height"] = body_measurement_data.get("height", 0)
            else:
                complete_data["body_measurement"] = None
                complete_data["weight"] = 0
                complete_data["height"] = 0
            if fp_physical_exam.vital:
                vital_signs_data = VitalSignsSerializer(fp_physical_exam.vital).data
                complete_data["pulseRate"] = vital_signs_data.get("vital_pulse", 0)
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
            complete_data["fp_pelvic_exam"] = pelvic_exam_serialized_data
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
                "clientName": acknowledgement_serialized_data.get("client_name") or "",
                # "guardianName": acknowledgement_serialized_data.get("guardian_name") or "",
                "guardianSignature": acknowledgement_serialized_data.get("guardian_signature") or "",
                "guardianSignatureDate": acknowledgement_serialized_data.get("guardian_signature_date") or "",
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
                "breastfeeding": pregnancy_check_serialized_data.get("breastfeeding", False),
                "abstained": pregnancy_check_serialized_data.get("abstained", False),
                "recent_baby": pregnancy_check_serialized_data.get("recent_baby", False),
                "recent_period": pregnancy_check_serialized_data.get("recent_period", False),
                "recent_abortion": pregnancy_check_serialized_data.get("recent_abortion", False),
                "using_contraceptive": pregnancy_check_serialized_data.get("using_contraceptive", False),
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
        try:
            patient_record = fp_record.patrec
            medical_history_records = MedicalHistory.objects.filter(patrec=patient_record).select_related('ill')
            medical_history_data = []
            selected_illness_ids = []
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
            for history in medical_history_records:
                medical_history_data.append({
                    'medhist_id': history.medhist_id,
                    'ill_id': history.ill.ill_id,
                    'illname': history.ill.illname,
                    'ill_code': history.ill.ill_code,
                    'created_at': history.created_at.isoformat() if history.created_at else None
                })
                selected_illness_ids.append(history.ill.ill_id)
                if history.ill.ill_id == 14:
                    complete_data["medicalHistory"]["severeHeadaches"] = True
                elif history.ill.ill_id == 15:
                    complete_data["medicalHistory"]["strokeHeartAttackHypertension"] = True
                elif history.ill.ill_id == 16:
                    complete_data["medicalHistory"]["hematomaBruisingBleeding"] = True
                elif history.ill.ill_id == 17:
                    complete_data["medicalHistory"]["breastCancerHistory"] = True
                elif history.ill.ill_id == 18:
                    complete_data["medicalHistory"]["severeChestPain"] = True
                elif history.ill.ill_id == 19:
                    complete_data["medicalHistory"]["cough"] = True
                elif history.ill.ill_id == 20:
                    complete_data["medicalHistory"]["jaundice"] = True
                elif history.ill.ill_id == 21:
                    complete_data["medicalHistory"]["unexplainedVaginalBleeding"] = True
                elif history.ill.ill_id == 22:
                    complete_data["medicalHistory"]["abnormalVaginalDischarge"] = True
                elif history.ill.ill_id == 23:
                    complete_data["medicalHistory"]["phenobarbitalOrRifampicin"] = True
                elif history.ill.ill_id == 24:
                    complete_data["medicalHistory"]["smoker"] = True
                elif history.ill.ill_id == 25:
                    complete_data["medicalHistory"]["disability"] = True
                    complete_data["medicalHistory"]["disabilityDetails"] = getattr(history, 'disability_details', '') or ""
            complete_data["medical_history_records"] = medical_history_data
            complete_data["selectedIllnessIds"] = selected_illness_ids
        except Exception as e:
            print(f"Error fetching medical history: {e}")
            complete_data["medical_history_records"] = []
            complete_data["selectedIllnessIds"] = []
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

        print("Final occupation before return:", complete_data["occupation"])  # Debug
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
    
    # Spouse
    spouse_instance = None
    spouse_data = data.get("spouse", {})
    if any(v for k,v in spouse_data.items() if v not in [None, "", "null", "undefined"]):
        try:
            spouse_serializer = SpouseSerializer(data={
                "spouse_lname": spouse_data.get("s_lastName") or None,
                "spouse_fname": spouse_data.get("s_givenName") or None,
                "spouse_mname": spouse_data.get("s_middleInitial") or None,
                "spouse_dob": spouse_data.get("s_dateOfBirth") or None,
                "spouse_occupation": spouse_data.get("s_occupation") or None,
            })
            spouse_serializer.is_valid(raise_exception=True)
            spouse_instance = spouse_serializer.save()
            logger.info(f"Created Spouse record with ID: {spouse_instance.pk}")
        except Exception as e:
            logger.error(f"Error creating spouse record: {str(e)}")
            raise
    else:
        print("DEBUG: No Spouse data provided or data is empty.")

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
    print(f"DEBUG: FP Record created with ID: {fprecord_id} linked to patrec_id: {patrec_id}")

    # 3. Create Medical History Records
    selected_illness_ids = data.get("selectedIllnessIds", [])
    custom_disability_details = data.get("customDisabilityDetails")

    if custom_disability_details:
        custom_illness_description = f"User-specified disability: {custom_disability_details}"
        custom_illness_instance = get_or_create_illness(
            illname=custom_disability_details,
            ill_description=custom_illness_description,
            ill_code_prefix="FP"
        )
        if custom_illness_instance.ill_id not in selected_illness_ids:
            selected_illness_ids.append(custom_illness_instance.ill_id)
        logger.info(f"Handled custom disability: {custom_illness_instance.illname}")

    if selected_illness_ids:
        # MedicalHistory.objects.filter(patrec=patient_record_instance).delete()
        logger.info(f"Deleted existing medical history for PatientRecord {patient_record_instance.patrec_id}.")
        for illness_id in selected_illness_ids:
            illness_instance = get_object_or_404(Illness, ill_id=illness_id)
            MedicalHistory.objects.create(
                ill=illness_instance,
                patrec=patient_record_instance
            )
        logger.info(f"Created {len(selected_illness_ids)} medical history records.")
    else:
        # MedicalHistory.objects.filter(patrec=patient_record_instance).delete()
        logger.info(f"No illnesses selected, ensuring no medical history records for PatientRecord {patient_record_instance.patrec_id}.")
    
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
        "abnormalDischarge": risk_sti_data.get("abnormalDischarge") or False,
        "dischargeFrom": risk_sti_data.get("dischargeFrom") if risk_sti_data.get("abnormalDischarge") else None,
        "sores": risk_sti_data.get("sores") or False,
        "pain": risk_sti_data.get("pain") or False,
        "history": risk_sti_data.get("history") or False,
        "hiv": risk_sti_data.get("hiv") or False,
        "fprecord": fprecord_id,
    }
    risk_sti_serializer = FPRiskStiSerializer(data=risk_sti_payload)
    risk_sti_serializer.is_valid(raise_exception=True)
    risk_sti_serializer.save()
    logger.info("Created FP_RiskSti.")

    # 8. Create Risk VAW
    risk_vaw_data = data.get("violenceAgainstWomen", {})
    risk_vaw_payload = {
        "unpleasant_relationship": risk_vaw_data.get("unpleasantRelationship") or False,
        "partner_disapproval": risk_vaw_data.get("partnerDisapproval") or False,
        "domestic_violence": risk_vaw_data.get("domesticViolence") or False,
        "referredTo": risk_vaw_data.get("referredTo") or None,
        "fprecord": fprecord_id,
    }
    risk_vaw_serializer = FPRiskVawSerializer(data=risk_vaw_payload)
    risk_vaw_serializer.is_valid(raise_exception=True)
    risk_vaw_serializer.save()
    logger.info("Created FP_RiskVaw.")

    # 9. Handle Body Measurement (Update or Create)
    bm_id = None
    current_weight = data.get("weight")
    current_height = data.get("height")

    existing_bm = BodyMeasurement.objects.filter(patrec=patient_record_instance).order_by('-created_at').first()

    if existing_bm:
        weight_changed = current_weight is not None and float(current_weight) != existing_bm.weight
        height_changed = current_height is not None and float(current_height) != existing_bm.height

        if weight_changed or height_changed:
            bm_data = {
                "weight": float(current_weight) if current_weight is not None else existing_bm.weight,
                "height": float(current_height) if current_height is not None else existing_bm.height,
                "age": data.get("age") or 0,
                "patrec": existing_bm.patrec.patrec_id if existing_bm.patrec else None,
            }
            bm_serializer = BodyMeasurementSerializer(instance=existing_bm, data=bm_data, partial=True)
            bm_serializer.is_valid(raise_exception=True)
            updated_bm = bm_serializer.save()
            bm_id = updated_bm.bm_id
            logger.info(f"Updated existing BodyMeasurement with ID: {bm_id}")
        else:
            bm_id = existing_bm.bm_id
            logger.info(f"Reusing existing BodyMeasurement with ID: {bm_id} (no changes)")
    else:
        bm_data = {
            "weight": float(current_weight) if current_weight is not None else 0,
            "height": float(current_height) if current_height is not None else 0,
            "age": data.get("age") or 0,
            "patrec": patrec_id,
        }
        bm_serializer = BodyMeasurementSerializer(data=bm_data)
        bm_serializer.is_valid(raise_exception=True)
        new_bm = bm_serializer.save()
        bm_id = new_bm.bm_id
        logger.info(f"Created new BodyMeasurement with ID: {bm_id}")

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
        "patrec": patrec_id, # Link to the determined patrec_id
    }
    vital_signs_serializer = VitalSignsSerializer(data=vital_signs_data)
    vital_signs_serializer.is_valid(raise_exception=True)
    vital_signs_instance = vital_signs_serializer.save()
    vital_id = vital_signs_instance.vital_id
    logger.info(f"Created VitalSigns with ID: {vital_id}")

    # 11. Create Physical Exam
    physical_exam_data = {
        "skinExamination": data.get("skinExamination") or "normal",
        "conjunctivaExamination": data.get("conjunctivaExamination") or "normal",
        "neckExamination": data.get("neckExamination") or "normal",
        "breastExamination": data.get("breastExamination") or "normal",
        "abdomenExamination": data.get("abdomenExamination") or "normal",
        "extremitiesExamination": data.get("extremitiesExamination") or "normal",
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
            "pelvicExamination": data.get("pelvicExamination") or "normal",
            "cervicalConsistency": data.get("cervicalConsistency") or "firm",
            "cervicalTenderness": data.get("cervicalTenderness") or False,
            "cervicalAdnexal": data.get("cervicalAdnexal") or False,
            "uterinePosition": uterine_position,
            "uterineDepth": data.get("uterineDepth") or "",
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
        "ack_clientSignature": acknowledgement_data.get("clientSignature") or "",
        "ack_clientSignatureDate": acknowledgement_data.get("clientSignatureDate") or date.today().isoformat(),
        "client_name": client_full_name,
        "guardian_signature": acknowledgement_data.get("guardianSignature") or "",
        "guardian_signature_date": acknowledgement_data.get("guardianSignatureDate") or None,
        "fprecord": fprecord_id,
        "type": fpt_id,
    }
    acknowledgement_serializer = AcknowledgementSerializer(data=acknowledgement_payload)
    acknowledgement_serializer.is_valid(raise_exception=True)
    acknowledgement_serializer.save()
    logger.info("Created FP_Acknowledgement.")

    # 14. Create Pregnancy Check
    print("DEBUG: Preparing Pregnancy Check data...") # Debugging line
    pregnancy_check_data = data.get("pregnancyCheck", {})
    pregnancy_check_payload = {
        "breastfeeding": pregnancy_check_data.get("breastfeeding") or False,
        "abstained": pregnancy_check_data.get("abstained") or False,
        "recent_baby": pregnancy_check_data.get("recent_baby") or False,
        "recent_period": pregnancy_check_data.get("recent_period") or False,
        "recent_abortion": pregnancy_check_data.get("recent_abortion") or False,
        "using_contraceptive": pregnancy_check_data.get("using_contraceptive") or False,
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
        follow_up_data = {
            "patrec": patrec_id, # Link to the determined patrec_id
            "followv_date": latest_record.get("dateOfFollowUp") or None,
            "followv_status": "pending", # New follow-up starts as pending
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
    staff_id_from_request = request.user.id if request.user.is_authenticated else None

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


@api_view(['POST'])
def submit_follow_up_family_planning_form(request):
    data = request.data
    staff_id_from_request = request.user.id if request.user.is_authenticated else None
    
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


@api_view(['GET'])
def get_all_fp_records_for_patient(request, patient_id):
    """
    Fetches all FP records for a given patient, including
    details for service provision and assessment records.
    """
    try:
        # Get all FP records for the patient, ordered from newest to oldest
        fp_records = FP_Record.objects.filter(pat_id=patient_id).order_by('-created_at')

        if not fp_records.exists():
            return Response([], status=status.HTTP_200_OK)

        all_records_data = []

        for record in fp_records:
            record_data = {
                'fprecord_id': record.fprecord_id,
                'created_at': record.created_at,
                'client_id': record.client_id,
                'patrec_id': record.patrec_id,
                'fp_type': {},
                'service_provision': {},
                'assessment_records': {},
            }
            
            # Fetch and serialize FP_type data
            try:
                fp_type = FP_type.objects.get(fprecord_id=record.fprecord_id)
                record_data['fp_type'] = FPTypeSerializer(fp_type).data
            except FP_type.DoesNotExist:
                record_data['fp_type'] = {}

            # Fetch and serialize FP_Service_Provision data
            try:
                service_provision = FP_Assessment_Record.objects.get(fprecord_id=record.fprecord_id)
                record_data['service_provision'] = FPAssessmentSerializer(service_provision).data
            except FP_Assessment_Record.DoesNotExist:
                record_data['service_provision'] = {}
            
            # Fetch and serialize FP_Assessment_Record data
            try:
                assessment_record = FP_Assessment_Record.objects.get(fprecord_id=record.fprecord_id)
                record_data['assessment_records'] = FPAssessmentSerializer(assessment_record).data
            except FP_Assessment_Record.DoesNotExist:
                record_data['assessment_records'] = {}

            all_records_data.append(record_data)

        return Response(all_records_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"detail": f"Error fetching patient's FP records: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
