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
from .serializers import *
from apps.patientrecords.serializers.patients_serializers import PatientSerializer, PatientRecordSerializer
from apps.patientrecords.models import *
from apps.healthProfiling.models import *
from apps.healthProfiling.serializers.base import *
# Re-import if needed for other serializers
# from apps.patientrecords.serializers import *
from apps.maternal.models import *
from apps.patientrecords.serializers.bodymesurement_serializers import *
from apps.patientrecords.serializers.vitalsigns_serializers import *
from apps.patientrecords.serializers.followvisits_serializers import *
from apps.patientrecords.serializers.obstetrical_serializers import *
from apps.maternal.serializer import PreviousPregnancySerializer
from apps.patientrecords.serializers.spouse_serializers import *
from apps.inventory.models import CommodityList, CommodityInventory # Import CommodityList and CommodityInventory

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
        MedicalHistory.objects.filter(patrec=patient_record).delete()
        
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
    """Helper function to calculate age from date of birth string"""
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
        
# @api_view(['POST'])
# def create_or_get_illness(request):
#     """
#     Creates a new illness or returns an existing one based on its name.
#     Useful for 'Other' or 'Disability' inputs where users can define new terms.
#     """
#     illname = request.data.get('illname')
#     ill_description = request.data.get('ill_description', '')
#     ill_code = request.data.get('ill_code', 'CUSTOM') # Default code for custom entries

#     if not illname:
#         return Response({'error': 'Illness name is required.'}, status=status.HTTP_400_BAD_REQUEST)

#     try:
#         # Try to find an existing illness with the same name (case-insensitive)
#         illness, created = Illness.objects.get_or_create(
#             illname__iexact=illname,
#             defaults={
#                 'illname': illname,
#                 'ill_description': ill_description,
#                 'ill_code': ill_code
#             }
#         )
#         if not created:
#             # If found, update description and code if they are provided and different
#             if ill_description and illness.ill_description != ill_description:
#                 illness.ill_description = ill_description
#             if ill_code and illness.ill_code != ill_code:
#                 illness.ill_code = ill_code
#             illness.save()

#         return Response({
#             'ill_id': illness.ill_id,
#             'illname': illness.illname,
#             'ill_description': illness.ill_description,
#             'ill_code': illness.ill_code,
#             'created': created
#         }, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

#     except Exception as e:
#         return Response({'error': f'Error creating or getting illness: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        "cervicalTenderness": "Yes" if data.get("cervicalTenderness") else "No",
        "cervicalAdnexal": "Yes" if data.get("cervicalAdnexal") else "No",
        "uterinePosition": data.get("uterinePosition"),
        "uterineDepth": data.get("uterineDepth"),  
    }    

@api_view(["GET"])
def get_last_previous_pregnancy(request, patient_id):
    """
    Fetches the most recent previous pregnancy record (date and type of delivery)
    for a given patient.
    """
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
        
# @api_view(["GET"])
# def get_patient_details(request, patient_id):
#     try:
#         patient = get_object_or_404(Patient, pat_id=patient_id)
#         serializer = PatientSerializer(patient)
#         patient_data = serializer.data
#         personal_info = patient_data.get("personal_info")
        
#         philhealth_id = ""
        
#         try:
#             if patient.pat_type == "Resident" and patient.rp_id:
#                 personal = patient.rp_id.per 
#                 # 8
#                 hrd = HealthRelatedDetails.objects.filter(per=personal.per_id).first()
#                 if hrd:
#                     philhealth_id = hrd.hrd_philhealth_id or ""
#                     print(f"✓ PhilHealth ID: {philhealth_id}")
#         except Exception as e:
#             print(f"Error fetching health details 1: {e}")


#         fp_form_data = {
#             "pat_id": patient_data.get("pat_id", ""),
#             "clientID": patient_data.get("clientID", ""),
#             "philhealthNo": philhealth_id,
#             "nhts_status": False,
#             "pantawid_4ps": False,
#             "lastName": "",
#             "givenName": "",
#             "middleInitial": "",
#             "dateOfBirth": "",
#             "age": 0,
#             'educationalAttainment': personal_info.get('per_edAttainment', ''),
#             "occupation": patient_data.get("occupation",""),
#             "address": {
#                 "houseNumber": "",
#                 "street": "",
#                 "barangay": "",
#                 "municipality": "",
#                 "province": "",
#             },
#             "spouse": {
#                 "s_lastName": "",
#                 "s_givenName": "",
#                 "s_middleInitial": "",
#                 "s_dateOfBirth": "",
#                 "s_age": 0,
#                 "s_occupation": "",
#             },
#             "numOfLivingChildren": 0,
#             "planToHaveMoreChildren": plan_more_children,
#             "averageMonthlyIncome": "",
#             "weight": 0,  # Default to 0, will try to fetch
#             "height": 0,  # Default to 0, will try to fetch
#             "bodyMeasurementRecordedAt": None,
#             "obstetricalHistory": {  # Default obstetrical history values
#                 "g_pregnancies": 0,
#                 "p_pregnancies": 0,
#                 "fullTerm": 0,
#                 "premature": 0,
#                 "abortion": 0,
#                 "livingChildren": 0,
#                 "lastDeliveryDate": "",
#                 "typeOfLastDelivery": "",
#                 "lastMenstrualPeriod": "",
#                 "previousMenstrualPeriod": "",
#                 "menstrualFlow": "Scanty",
#                 "dysmenorrhea": False,
#                 "hydatidiformMole": False,
#                 "ectopicPregnancyHistory": False,
#             },
#         }

#         personal_info = patient_data.get("personal_info")
#         if personal_info:
#             fp_form_data.update(
#                 {
#                     "lastName": personal_info.get("per_lname", ""),
#                     "givenName": personal_info.get("per_fname", ""),
#                     "middleInitial": (
#                         personal_info.get("per_mname", "")[:1]
#                         if personal_info.get("per_mname")
#                         else ""
#                     ),
#                     "dateOfBirth": personal_info.get("per_dob", ""),
#                     "age": (
#                         calculate_age_from_dob(personal_info.get("per_dob"))
#                         if personal_info.get("per_dob")
#                         else 0
#                     ),
#                     'educationalAttainment': personal_info.get('per_edAttainment', ''),
#                     "occupation": personal_info.get("per_occupation", ""),
#                 }
#             )

#         address_info = patient_data.get("address")
#         if address_info:
#             fp_form_data["address"] = {
#                 "houseNumber": address_info.get("add_houseno", "")
#                 or "",  # Assuming add_houseno exists
#                 "street": address_info.get("add_street", ""),
#                 "barangay": address_info.get("add_barangay", ""),
#                 "municipality": address_info.get("add_city", ""),
#                 "province": address_info.get("add_province", ""),
#             }
        
#         try:
#             body_measurement = (
#                 BodyMeasurement.objects.filter(pat=patient)
#                 .order_by("-created_at")
#                 .first()
#             )
#             if body_measurement:
#                 fp_form_data.update(
#                     {
#                         "weight": (
#                             (body_measurement.weight)
#                             if body_measurement.weight
#                             else 0
#                         ),
#                         "height": (
#                             (body_measurement.height)
#                             if body_measurement.height
#                             else 0
#                         ),
#                         "bodyMeasurementRecordedAt": ( # Add this line
#                             body_measurement.created_at.isoformat()
#                             if body_measurement.created_at
#                             else None
#                         ),
#                     }
#                 )
#         except Exception as e:
#             print(f"Error fetching body measurements: {e}")

#         try:
#             obstetrical_history = Obstetrical_History.objects.filter(
#             patrec_id__in=patient_records).order_by('-patrec_id__created_at').first()

#             if obstetrical_history:
#                 fp_form_data["obstetricalHistory"] = {
#                     "g_pregnancies": obstetrical_history.obs_gravida or 0,
#                     "p_pregnancies": obstetrical_history.obs_para or 0,
#                     "fullTerm": obstetrical_history.obs_fullterm or 0,
#                     "premature": obstetrical_history.obs_preterm or 0,
#                     "abortion": obstetrical_history.obs_abortion or 0,
#                     "numOfLivingChildren": obstetrical_history.obs_living_ch or 0,
#                     "lastDeliveryDate": (
#                         obstetrical_history.obs_last_delivery.isoformat()
#                         if obstetrical_history.obs_last_delivery
#                         else None
#                     ),
#                     "typeOfLastDelivery": obstetrical_history.obs_type_last_delivery or "",
#                     "lastMenstrualPeriod": (
#                         obstetrical_history.obs_last_period.isoformat()
#                         if obstetrical_history.obs_last_period
#                         else ""
#                     ),
#                     "previousMenstrualPeriod": (
#                         obstetrical_history.obs_previous_period.isoformat()
#                         if obstetrical_history.obs_previous_period
#                         else ""
#                     ),
#                     "menstrualFlow": obstetrical_history.obs_mens_flow or "Scanty",
#                     "dysmenorrhea": obstetrical_history.obs_dysme or False,
#                     "hydatidiformMole": obstetrical_history.obs_hydatidiform or False,
#                     "ectopicPregnancyHistory": obstetrical_history.obs_ectopic_pregnancy or False,
#                 }
#                 print("Complete obstetrical history:", fp_form_data["obstetricalHistory"])
                
#                 # Also try to get FP-specific obstetrical history if it exists
#                 try:
#                     fp_record = FP_Record.objects.filter(pat=patient).order_by('-created_at').first()
#                     if fp_record:
#                         fp_obs_history = FP_Obstetrical_History.objects.filter(fprecord=latest_fp_record).select_related('obs_record').first()
                        
#                         if fp_obs_history:
#                             fp_form_data["obstetricalHistory"].update({
#                                 "lastDeliveryDate": (
#                                     fp_obs_history.fpob_last_delivery.isoformat()
#                                     if fp_obs_history.fpob_last_delivery
#                                     else fp_form_data["obstetricalHistory"]["lastDeliveryDate"]
#                                 ),
#                                 "typeOfLastDelivery": fp_obs_history.fpob_type_last_delivery or fp_form_data["obstetricalHistory"]["typeOfLastDelivery"],
#                                 "lastMenstrualPeriod": (
#                                     fp_obs_history.fpob_last_period.isoformat()
#                                     if fp_obs_history.fpob_last_period
#                                     else fp_form_data["obstetricalHistory"]["lastMenstrualPeriod"]
#                                 ),
#                                 "previousMenstrualPeriod": (
#                                     fp_obs_history.fpob_previous_period.isoformat()
#                                     if fp_obs_history.fpob_previous_period
#                                     else fp_form_data["obstetricalHistory"]["previousMenstrualPeriod"]
#                                 ),
#                                 "menstrualFlow": fp_obs_history.fpob_mens_flow or fp_form_data["obstetricalHistory"]["menstrualFlow"],
#                                 "dysmenorrhea": fp_obs_history.fpob_dysme or fp_form_data["obstetricalHistory"]["dysmenorrhea"],
#                                 "hydatidiformMole": fp_obs_history.fpob_hydatidiform or fp_form_data["obstetricalHistory"]["hydatidiformMole"],
#                                 "ectopicPregnancyHistory": fp_obs_history.fpob_ectopic_pregnancy or fp_form_data["obstetricalHistory"]["ectopicPregnancyHistory"],
#                             })
#                 except Exception as e:
#                     print(f"Error fetching FP-specific obstetrical history: {e}")
                
#         except Exception as e:
#             print(f"Error fetching obstetrical history: {e}")

#         try:
#             if patient.pat_type == "Resident" and patient.rp_id:
#                 print("🔍 Patient RP ID:", patient.rp_id.pk)
#                 hrd = HealthRelatedDetails.objects.filter(rp_id=patient.rp_id.pk).first()
#                 if hrd:
#                     fp_form_data["philhealthNo"] = hrd.hrd_philhealth_id or ""
#         except Exception as e:
#             print(f"Error fetching health details: {e}")

#         try:
#             if patient.pat_type == "Resident" and patient.rp_id:
#                 household = Household.objects.filter(rp=patient.rp_id).first()
#                 if household:
#                     fp_form_data["nhts_status"] = household.hh_nhts == "Yes"
#         except Exception as e:
#             print(f"Error fetching household: {e}")

#         # try:
#         #     if patient.pat_type == "Resident" and patient.rp_id:
#         #         spouse = Spouse.objects.filter(rp_id=patient.rp_id).first()
#         #         if spouse:
#         #             fp_form_data["spouse"] = {
#         #                 "s_lastName": spouse.spouse_lname or "",
#         #                 "s_givenName": spouse.spouse_fname or "",
#         #                 "s_middleInitial": (
#         #                     spouse.spouse_mname[:1] if spouse.spouse_mname else ""
#         #                 ),
#         #                 "s_dateOfBirth": (
#         #                     spouse.spouse_dob.isoformat() if spouse.spouse_dob else ""
#         #                 ),
#         #                 "s_age": (
#         #                     calculate_age_from_dob(
#         #                         spouse.spouse_dob.isoformat())
#         #                     if spouse.spouse_dob
#         #                     else 0
#         #                 ),
#         #                 "s_occupation": spouse.spouse_occupation or "",
#         #             }
#         # except Exception as e:
#         #     print(f"Error fetching spouse information: {e}")

#         return Response(fp_form_data, status=status.HTTP_200_OK)

#     except Patient.DoesNotExist:
#         return Response(
#             {"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND
#         )
#     except Exception as e:
#         import traceback

#         traceback.print_exc()
#         return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- NEW: Endpoint for the Overall Table to get patient list with FP record counts ---
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

            if patient_id not in patient_data_map:
                patient_data_map[patient_id] = {
                    "patient_id": patient_id,
                    "patient_name": "",
                    "patient_age": None,
                    "sex": "",
                    "client_type": "N/A",
                    "method_used": "N/A",
                    "created_at": (
                        record.created_at.isoformat() if record.created_at else None
                    ),
                    "fprecord": record.fprecord_id,
                    "record_count": 0,
                    "has_multiple_records": False,
                }

            patient_data_map[patient_id]["record_count"] += 1

            # FIXED: Handle Resident Patient
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
                    "averageMonthlyIncome": record.avg_monthly_income or "N/A",
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

# def get_patient_details_data(patient_id):
#     """
#     Utility function to get patient details without requiring a request object.
#     This is used internally by other functions.
#     """
#     try:
#         patient = get_object_or_404(Patient, pat_id=patient_id)
#         serializer = PatientSerializer(patient)
#         patient_data = serializer.data
#         personal_info = patient_data.get("personal_info")
        
#         philhealth_id = ""
        
#         try:
#             if patient.pat_type == "Resident" and patient.rp_id:
#                 personal = patient.rp_id.per 
#                 hrd = HealthRelatedDetails.objects.filter(per=personal.per_id).first()
#                 if hrd:
#                     philhealth_id = hrd.hrd_philhealth_id or ""
#                     print(f"✓ PhilHealth ID: {philhealth_id}")
#         except Exception as e:
#             print(f"Error fetching health details 1: {e}")

#         fp_form_data = {
#             "pat_id": patient_data.get("pat_id", ""),
#             "clientID": patient_data.get("clientID", ""),
#             "philhealthNo": philhealth_id,
#             "nhts_status": False,
#             "pantawid_4ps": False,
#             "lastName": "",
#             "givenName": "",
#             "middleInitial": "",
#             "dateOfBirth": "",
#             "age": 0,
#             'educationalAttainment': personal_info.get('per_edAttainment', ''),
#             "occupation": patient_data.get("occupation",""),
#             "address": {
#                 "houseNumber": "",
#                 "street": "",
#                 "barangay": "",
#                 "municipality": "",
#                 "province": "",
#             },
#             "spouse": {
#                 "s_lastName": "",
#                 "s_givenName": "",
#                 "s_middleInitial": "",
#                 "s_dateOfBirth": "",
#                 "s_age": 0,
#                 "s_occupation": "",
#             },
#             "numOfLivingChildren": 0,
#             "planToHaveMoreChildren": False,
#             "averageMonthlyIncome": "",
#             "weight": 0,
#             "height": 0,
#             "bodyMeasurementRecordedAt": None,
#             "obstetricalHistory": {
#                 "g_pregnancies": 0,
#                 "p_pregnancies": 0,
#                 "fullTerm": 0,
#                 "premature": 0,
#                 "abortion": 0,
#                 "livingChildren": 0,
#                 "lastDeliveryDate": "",
#                 "typeOfLastDelivery": "",
#                 "lastMenstrualPeriod": "",
#                 "previousMenstrualPeriod": "",
#                 "menstrualFlow": "Scanty",
#                 "dysmenorrhea": False,
#                 "hydatidiformMole": False,
#                 "ectopicPregnancyHistory": False,
#             },
#         }

#         personal_info = patient_data.get("personal_info")
#         if personal_info:
#             fp_form_data.update(
#                 {
#                     "lastName": personal_info.get("per_lname", ""),
#                     "givenName": personal_info.get("per_fname", ""),
#                     "middleInitial": (
#                         personal_info.get("per_mname", "")[:1]
#                         if personal_info.get("per_mname")
#                         else ""
#                     ),
#                     "dateOfBirth": personal_info.get("per_dob", ""),
#                     "age": (
#                         calculate_age_from_dob(personal_info.get("per_dob"))
#                         if personal_info.get("per_dob")
#                         else 0
#                     ),
#                     'educationalAttainment': personal_info.get('per_edAttainment', ''),
#                     "occupation": personal_info.get("per_occupation", ""),
#                 }
#             )

#         address_info = patient_data.get("address")
#         if address_info:
#             fp_form_data["address"] = {
#                 "houseNumber": address_info.get("add_houseno", "") or "",
#                 "street": address_info.get("add_street", ""),
#                 "barangay": address_info.get("add_barangay", ""),
#                 "municipality": address_info.get("add_city", ""),
#                 "province": address_info.get("add_province", ""),
#             }
        
#         try:
#             body_measurement = (
#                 BodyMeasurement.objects.filter(pat=patient)
#                 .order_by("-created_at")
#                 .first()
#             )
#             if body_measurement:
#                 fp_form_data.update(
#                     {
#                         "weight": (
#                             (body_measurement.weight)
#                             if body_measurement.weight
#                             else 0
#                         ),
#                         "height": (
#                             (body_measurement.height)
#                             if body_measurement.height
#                             else 0
#                         ),
#                         "bodyMeasurementRecordedAt": (
#                             body_measurement.created_at.isoformat()
#                             if body_measurement.created_at
#                             else None
#                         ),
#                     }
#                 )
#         except Exception as e:
#             print(f"Error fetching body measurements: {e}")

#         try:
#             patient_records = PatientRecord.objects.filter(pat_id=patient)
#             obstetrical_history = Obstetrical_History.objects.filter(
#             patrec_id__in=patient_records).order_by('-patrec_id__created_at').first()

#             if obstetrical_history:
#                 fp_form_data["obstetricalHistory"] = {
#                     "g_pregnancies": obstetrical_history.obs_gravida or 0,
#                     "p_pregnancies": obstetrical_history.obs_para or 0,
#                     "fullTerm": obstetrical_history.obs_fullterm or 0,
#                     "premature": obstetrical_history.obs_preterm or 0,
#                     "abortion": obstetrical_history.obs_abortion or 0,
#                     "numOfLivingChildren": obstetrical_history.obs_living_ch or 0,
#                     "lastDeliveryDate": (
#                         obstetrical_history.obs_last_delivery.isoformat()
#                         if obstetrical_history.obs_last_delivery
#                         else None
#                     ),
#                     "typeOfLastDelivery": obstetrical_history.obs_type_last_delivery or "",
#                     "lastMenstrualPeriod": (
#                         obstetrical_history.obs_last_period.isoformat()
#                         if obstetrical_history.obs_last_period
#                         else ""
#                     ),
#                     "previousMenstrualPeriod": (
#                         obstetrical_history.obs_previous_period.isoformat()
#                         if obstetrical_history.obs_previous_period
#                         else ""
#                     ),
#                     "menstrualFlow": obstetrical_history.obs_mens_flow or "Scanty",
#                     "dysmenorrhea": obstetrical_history.obs_dysme or False,
#                     "hydatidiformMole": obstetrical_history.obs_hydatidiform or False,
#                     "ectopicPregnancyHistory": obstetrical_history.obs_ectopic_pregnancy or False,
#                 }
                
#                 try:
#                     fp_record = FP_Record.objects.filter(pat=patient).order_by('-created_at').first()
#                     if fp_record:
#                         fp_obs_history = FP_Obstetrical_History.objects.filter(fprecord=fp_record).select_related('obs_record').first()
                        
#                         if fp_obs_history:
#                             fp_form_data["obstetricalHistory"].update({
#                                 "lastDeliveryDate": (
#                                     fp_obs_history.fpob_last_delivery.isoformat()
#                                     if fp_obs_history.fpob_last_delivery
#                                     else fp_form_data["obstetricalHistory"]["lastDeliveryDate"]
#                                 ),
#                                 "typeOfLastDelivery": fp_obs_history.fpob_type_last_delivery or fp_form_data["obstetricalHistory"]["typeOfLastDelivery"],
#                                 "lastMenstrualPeriod": (
#                                     fp_obs_history.fpob_last_period.isoformat()
#                                     if fp_obs_history.fpob_last_period
#                                     else fp_form_data["obstetricalHistory"]["lastMenstrualPeriod"]
#                                 ),
#                                 "previousMenstrualPeriod": (
#                                     fp_obs_history.fpob_previous_period.isoformat()
#                                     if fp_obs_history.fpob_previous_period
#                                     else fp_form_data["obstetricalHistory"]["previousMenstrualPeriod"]
#                                 ),
#                                 "menstrualFlow": fp_obs_history.fpob_mens_flow or fp_form_data["obstetricalHistory"]["menstrualFlow"],
#                                 "dysmenorrhea": fp_obs_history.fpob_dysme or fp_form_data["obstetricalHistory"]["dysmenorrhea"],
#                                 "hydatidiformMole": fp_obs_history.fpob_hydatidiform or fp_form_data["obstetricalHistory"]["hydatidiformMole"],
#                                 "ectopicPregnancyHistory": fp_obs_history.fpob_ectopic_pregnancy or fp_form_data["obstetricalHistory"]["ectopicPregnancyHistory"],
#                             })
#                 except Exception as e:
#                     print(f"Error fetching FP-specific obstetrical history: {e}")
                
#         except Exception as e:
#             print(f"Error fetching obstetrical history: {e}")

#         try:
#             if patient.pat_type == "Resident" and patient.rp_id:
#                 hrd = HealthRelatedDetails.objects.filter(rp_id=patient.rp_id.pk).first()
#                 if hrd:
#                     fp_form_data["philhealthNo"] = hrd.hrd_philhealth_id or ""
#         except Exception as e:
#             print(f"Error fetching health details: {e}")

#         try:
#             if patient.pat_type == "Resident" and patient.rp_id:
#                 household = Household.objects.filter(rp=patient.rp_id).first()
#                 if household:
#                     fp_form_data["nhts_status"] = household.hh_nhts == "Yes"
#         except Exception as e:
#             print(f"Error fetching household: {e}")

#         return fp_form_data

#     except Exception as e:
#         print(f"Error in get_patient_details_data: {e}")
#         raise e

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
        personal_info = patient_data.get("personal_info")
        
        philhealth_id = ""
        
        try:
            if patient.pat_type == "Resident" and patient.rp_id:

                hrd = HealthRelatedDetails.objects.filter(rp=patient.rp_id).first()
                if hrd:
                    philhealth_id = hrd.hrd_philhealth_id or ""
                    print(f"✓ PhilHealth ID: {philhealth_id}")
        except Exception as e:
            print(f"Error fetching health details 1: {e}")

        fp_form_data = {
            "pat_id": patient_data.get("pat_id", ""),
            "clientID": patient_data.get("clientID", ""),
            "philhealthNo": philhealth_id,
            "nhts_status": False,
            "pantawid_4ps": False,
            "lastName": "",
            "givenName": "",
            "middleInitial": "",
            "dateOfBirth": "",
            "age": 0,
            'educationalAttainment': personal_info.get('per_edAttainment', ''),
            "occupation": patient_data.get("occupation",""),
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
            "planToHaveMoreChildren": False,
            "averageMonthlyIncome": latest_fp_record.avg_monthly_income if latest_fp_record else "",
            "weight": 0,  # Default to 0, will try to fetch
            "height": 0,  # Default to 0, will try to fetch
            "bodyMeasurementRecordedAt": None,
            "obstetricalHistory": {  # Default obstetrical history values
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

        personal_info = patient_data.get("personal_info")
        if personal_info:
            fp_form_data.update(
                {
                    "lastName": personal_info.get("per_lname", ""),
                    "givenName": personal_info.get("per_fname", ""),
                    "middleInitial": (
                        personal_info.get("per_mname", "")[:1]
                        if personal_info.get("per_mname")
                        else ""
                    ),
                    "dateOfBirth": personal_info.get("per_dob", ""),
                    "age": (
                        calculate_age_from_dob(personal_info.get("per_dob"))
                        if personal_info.get("per_dob")
                        else 0
                    ),
                    'educationalAttainment': personal_info.get('per_edAttainment', ''),
                    "occupation": personal_info.get("per_occupation", ""),
                }
            )

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
        
        try:
            body_measurement = (
                BodyMeasurement.objects.filter(pat=patient)
                .order_by("-created_at")
                .first()
            )
            if body_measurement:
                fp_form_data.update(
                    {
                        "weight": (
                            (body_measurement.weight)
                            if body_measurement.weight
                            else 0
                        ),
                        "height": (
                            (body_measurement.height)
                            if body_measurement.height
                            else 0
                        ),
                         "bodyMeasurementRecordedAt": (
                            body_measurement.created_at.isoformat()
                            if body_measurement.created_at
                            else None
                        ),
                    }
                )
            print("Sending bodyMeasurementRecordedAt:", body_measurement.created_at.strftime("%Y/%m/%d"))
        except Exception as e:
            print(f"Error fetching body measurements: {e}")

        try:
            obstetrical_history = Obstetrical_History.objects.filter(
            patrec_id__in=patient_records).order_by('-patrec_id__created_at').first()


            if obstetrical_history:
                fp_form_data["obstetricalHistory"] = {
                    "g_pregnancies": obstetrical_history.obs_gravida or 0,
                    "p_pregnancies": obstetrical_history.obs_para or 0,
                    "fullTerm": obstetrical_history.obs_fullterm or 0,
                    "premature": obstetrical_history.obs_preterm or 0,
                    "abortion": obstetrical_history.obs_abortion or 0,
                    "numOfLivingChildren": obstetrical_history.obs_living_ch or 0,
                    "lastDeliveryDate": (
                        obstetrical_history.obs_last_delivery.isoformat()
                        if obstetrical_history.obs_last_delivery
                        else None
                    ),
                    "typeOfLastDelivery": obstetrical_history.obs_type_last_delivery or "",
                    "lastMenstrualPeriod": (
                        obstetrical_history.obs_last_period.isoformat()
                        if obstetrical_history.obs_last_period
                        else ""
                    ),
                    "previousMenstrualPeriod": (
                        obstetrical_history.obs_previous_period.isoformat()
                        if obstetrical_history.obs_previous_period
                        else ""
                    ),
                    "menstrualFlow": obstetrical_history.obs_mens_flow or "Scanty",
                    "dysmenorrhea": obstetrical_history.obs_dysme or False,
                    "hydatidiformMole": obstetrical_history.obs_hydatidiform or False,
                    "ectopicPregnancyHistory": obstetrical_history.obs_ectopic_pregnancy or False,
                }
                print("Complete obstetrical history:", fp_form_data["obstetricalHistory"])
                
                # Also try to get FP-specific obstetrical history if it exists
                try:
                    fp_record = FP_Record.objects.filter(pat=patient).order_by('-created_at').first()
                    if fp_record:
                        fp_obs_history = FP_Obstetrical_History.objects.filter(fprecord=latest_fp_record).select_related('obs_record').first()
                        
                        if fp_obs_history:
                            fp_form_data["obstetricalHistory"].update({
                                "lastDeliveryDate": (
                                    fp_obs_history.fpob_last_delivery.isoformat()
                                    if fp_obs_history.fpob_last_delivery
                                    else fp_form_data["obstetricalHistory"]["lastDeliveryDate"]
                                ),
                                "typeOfLastDelivery": fp_obs_history.fpob_type_last_delivery or fp_form_data["obstetricalHistory"]["typeOfLastDelivery"],
                                "lastMenstrualPeriod": (
                                    fp_obs_history.fpob_last_period.isoformat()
                                    if fp_obs_history.fpob_last_period
                                    else fp_form_data["obstetricalHistory"]["lastMenstrualPeriod"]
                                ),
                                "previousMenstrualPeriod": (
                                    fp_obs_history.fpob_previous_period.isoformat()
                                    if fp_obs_history.fpob_previous_period
                                    else fp_form_data["obstetricalHistory"]["previousMenstrualPeriod"]
                                ),
                                "menstrualFlow": fp_obs_history.fpob_mens_flow or fp_form_data["obstetricalHistory"]["menstrualFlow"],
                                "dysmenorrhea": fp_obs_history.fpob_dysme or fp_form_data["obstetricalHistory"]["dysmenorrhea"],
                                "hydatidiformMole": fp_obs_history.fpob_hydatidiform or fp_form_data["obstetricalHistory"]["hydatidiformMole"],
                                "ectopicPregnancyHistory": fp_obs_history.fpob_ectopic_pregnancy or fp_form_data["obstetricalHistory"]["ectopicPregnancyHistory"],
                            })
                except Exception as e:
                    print(f"Error fetching FP-specific obstetrical history: {e}")
                
        except Exception as e:
            print(f"Error fetching obstetrical history: {e}")

        try:
            if patient.pat_type == "Resident" and patient.rp_id:
                print("🔍 Patient RP ID:", patient.rp_id.pk)
                hrd = HealthRelatedDetails.objects.filter(rp_id=patient.rp_id.pk).first()
                if hrd:
                    fp_form_data["philhealthNo"] = hrd.hrd_philhealth_id or ""
        except Exception as e:
            print(f"Error fetching health details: {e}")

        try:
            if patient.pat_type == "Resident" and patient.rp_id:
                household = Household.objects.filter(rp=patient.rp_id).first()
                if household:
                    fp_form_data["nhts_status"] = household.hh_nhts == "Yes"
        except Exception as e:
            print(f"Error fetching household: {e}")

        # try:
        #     if patient.pat_type == "Resident" and patient.rp_id:
        #         spouse = Spouse.objects.filter(rp_id=patient.rp_id).first()
        #         if spouse:
        #             fp_form_data["spouse"] = {
        #                 "s_lastName": spouse.spouse_lname or "",
        #                 "s_givenName": spouse.spouse_fname or "",
        #                 "s_middleInitial": (
        #                     spouse.spouse_mname[:1] if spouse.spouse_mname else ""
        #                 ),
        #                 "s_dateOfBirth": (
        #                     spouse.spouse_dob.isoformat() if spouse.spouse_dob else ""
        #                 ),
        #                 "s_age": (
        #                     calculate_age_from_dob(
        #                         spouse.spouse_dob.isoformat())
        #                     if spouse.spouse_dob
        #                     else 0
        #                 ),
        #                 "s_occupation": spouse.spouse_occupation or "",
        #             }
        # except Exception as e:
        #     print(f"Error fetching spouse information: {e}")

        return Response(fp_form_data, status=status.HTTP_200_OK)

    
    except Exception as e:
        import traceback

        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["GET"])
def get_patient_details(patient_id):
    try:
        fp_form_data = get_patient_details_data(patient_id)
        return Response(fp_form_data, status=status.HTTP_200_OK)
    except Patient.DoesNotExist:
        return Response(
            {"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND
        )
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
        complete_data["planToHaveMoreChildren"] = fp_record.plan_more_children
        complete_data["occupation"] = fp_record.occupation or "N/A"  # Set once
        complete_data["averageMonthlyIncome"] = fp_record.avg_monthly_income or "N/A"
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
                "dateOfBirth": "", "age": 0, "educationalAttainment": "",
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
                "dateOfBirth": "", "age": 0, "educationalAttainment": "",
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
                complete_data["pulseRate"] = vital_signs_data.get("pulse_rate", 0)
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
                "guardianName": acknowledgement_serialized_data.get("guardian_name") or "",
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
                "guardianName": "",
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
                    "pulse_rate": (
                        int(fp_physical_exam.vital.pulse_rate)
                        if fp_physical_exam and fp_physical_exam.vital and fp_physical_exam.vital.pulse_rate and fp_physical_exam.vital.pulse_rate != "N/A"
                        else 0
                    ),
                    "dispensedCommodityItemId": assessment_serialized_data.get("dispensed_commodity_item_id"),
                    "dispensedMedicineItemId": assessment_serialized_data.get("dispensed_medicine_item_id"),
                    "dispensedVaccineItemId": assessment_serialized_data.get("dispensed_vaccine_item_id"),
                    "dispensedItemNameForReport": assessment_serialized_data.get("dispensed_item_name_for_report"),
                }
            ]
            complete_data["follow_up_visit"] = FollowUpVisitSerializer(fp_assessment.followv).data if fp_assessment.followv else None
        except FP_Assessment_Record.DoesNotExist:
            complete_data["fp_assessment"] = None
            complete_data["follow_up_visit"] = None
            complete_data["serviceProvisionRecords"] = []

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
        complete_data["planToHaveMoreChildren"] = fp_record.plan_more_children
        complete_data["occupation"] = fp_record.occupation or "N/A"  # Set once
        complete_data["averageMonthlyIncome"] = fp_record.avg_monthly_income or "N/A"
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
            complete_data["clientID"] = fp_record.client_id
            complete_data["pantawid_4ps"] = fp_record.fourps
            # Initialize default values (exclude occupation)
            complete_data.update({
                "lastName": "", "givenName": "", "middleInitial": "",
                "dateOfBirth": "", "age": 0, "educationalAttainment": "",
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
                "dateOfBirth": "", "age": 0, "educationalAttainment": "",
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
                complete_data["pulseRate"] = vital_signs_data.get("pulse_rate", 0)
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
                "guardianName": acknowledgement_serialized_data.get("guardian_name") or "",
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
                "guardianName": "",
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
                    "pulse_rate": (
                        int(fp_physical_exam.vital.pulse_rate)
                        if fp_physical_exam and fp_physical_exam.vital and fp_physical_exam.vital.pulse_rate and fp_physical_exam.vital.pulse_rate != "N/A"
                        else 0
                    ),
                    # "dispensedCommodityItemId": assessment_serialized_data.get("dispensed_commodity_item_id"),
                    # "dispensedMedicineItemId": assessment_serialized_data.get("dispensed_medicine_item_id"),
                    # "dispensedVaccineItemId": assessment_serialized_data.get("dispensed_vaccine_item_id"),
                    # "dispensedItemNameForReport": assessment_serialized_data.get("dispensed_item_name_for_report"),
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


class FamilyPlanningCreateUpdateView(generics.ListCreateAPIView):
    serializer_class = FamilyPlanningRecordCompositeSerializer
    queryset = FP_Record.objects.all()

    def create(self, request, *args, **kwargs):
        # Use transaction.atomic() for atomicity
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            self.perform_create(serializer)
            
            # Get the created FP_Record instance
            fp_record_instance = serializer.instance
            service_provision_records = request.data.get('serviceProvisionRecords', [])
            
            if service_provision_records:
                # Get the last record, which should contain the method and quantity
                latest_record = service_provision_records[-1]
                method_accepted = latest_record.get('methodAccepted')
                method_quantity_str = latest_record.get('methodQuantity')

                print("Checking stock for:", method_accepted)
                print("Requested quantity:", method_quantity)
                print("Available stock items:", InventoryItem.objects.filter(commodity__name=method_accepted))

                try:
                    method_quantity = int(method_quantity_str)
                except (ValueError, TypeError):
                    raise ValueError("Invalid quantity provided for method deduction.")

                if method_accepted and method_quantity > 0:
                    try:
                        # 1. Find the commodity
                        commodity = CommodityList.objects.get(com_name=method_accepted)
                     

                        commodity_inventory_item = CommodityInventory.objects.filter(
                            com_id=commodity,
                            cinv_qty_avail__gte=method_quantity,
                            inv_id__is_Archived=False # Ensure it's not archived
                        ).order_by('inv_id__expiry_date').first() # Order by expiry date for FIFO
                        
                        if not commodity_inventory_item:
                            raise ValueError(f"Insufficient stock for {method_accepted} or no suitable inventory item found.")

                        # 3. Deduct stock from CommodityInventory
                        commodity_inventory_item.cinv_qty_avail -= method_quantity
                        commodity_inventory_item.save()
                        
                        staff_id_from_request = request.user.id if request.user.is_authenticated else 0 # Example
                        
                        CommodityTransaction.objects.create(
                            cinv_id=commodity_inventory_item,
                            comt_qty=str(method_quantity), # Store quantity as string, as per your model
                            comt_action="Deducted for Family Planning Service",
                            staff_id=staff_id_from_request or None # Use the staff ID
                        )
                        
                        print(f"Successfully deducted {method_quantity} of {method_accepted} and logged transaction.")

                    except CommodityList.DoesNotExist:
                        print(f"Warning: Commodity '{method_accepted}' not found in CommodityList. Stock not deducted.")
                    except ValueError as ve:
                        # Re-raise for HTTP 400 response
                        raise ValueError(f"Stock deduction error: {ve}")
                    except Exception as e:
                        import traceback
                        traceback.print_exc()
                        raise Exception(f"An unexpected error occurred during stock deduction: {str(e)}")

            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    "message": "Family Planning record created successfully and stock updated",
                    "fprecord": fp_record_instance.fprecord_id,
                },
                status=status.HTTP_201_CREATED,
                headers=headers,
            )
            
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


@api_view(['POST'])
def submit_full_family_planning_form(request):
    data = request.data
    staff_id_from_request = request.user.id if request.user.is_authenticated else None
    obstetrical_history_data = data.get('obstetricalHistory', {})
    patrec_id = None
    fprecord_id = None

    try:
        with transaction.atomic():
            logger.info("Starting atomic transaction for full FP form submission.")
            print("\n--- Starting Full FP Form Submission ---") # Debugging line

            # 1. Create PatientRecord first
            print("DEBUG: Preparing PatientRecord data...") # Debugging line
            patient_record_data = {
                "patrec_type": "Family Planning",
                "pat_id": data.get("pat_id"),
            }
            patient_record_serializer = PatientRecordSerializer(data=patient_record_data)
            print("DEBUG: Validating PatientRecordSerializer...") # Debugging line
            patient_record_serializer.is_valid(raise_exception=True)
            patient_record_instance = patient_record_serializer.save()
            patrec_id = patient_record_instance.patrec_id
            logger.info(f"Created PatientRecord with ID: {patrec_id}")
            print(f"DEBUG: PatientRecord created with ID: {patrec_id}") # Debugging line

            # Spouse
            spouse_instance = None
            spouse_data = data.get("spouse", {})

            if any(v for k,v in spouse_data.items() if v not in [None, "", "null", "undefined"]):
                print("DEBUG: Preparing Spouse data...") # Debugging line
                try:
                    spouse_serializer = SpouseSerializer(data={
                        "spouse_lname": spouse_data.get("s_lastName") or None,
                        "spouse_fname": spouse_data.get("s_givenName") or None,
                        "spouse_mname": spouse_data.get("s_middleInitial") or None,
                        "spouse_dob": spouse_data.get("s_dateOfBirth") or None,
                        "spouse_occupation": spouse_data.get("s_occupation") or None,
                    })
                    print("DEBUG: Validating SpouseSerializer...") # Debugging line
                    spouse_serializer.is_valid(raise_exception=True)
                    spouse_instance = spouse_serializer.save()
                    logger.info(f"Created Spouse record with ID: {spouse_instance.pk}")
                    print(f"DEBUG: Spouse record created with ID: {spouse_instance.pk}") # Debugging line
                except Exception as e:
                    logger.error(f"Error creating spouse record: {str(e)}")
                    raise
            else:
                print("DEBUG: No Spouse data provided or data is empty.") # Debugging line


            # 2. Create FP Record
            print("DEBUG: Preparing FP Record data...") # Debugging line
            fp_record_data = {
                "client_id": data.get("clientID") or "",
                "fourps": data.get("pantawid_4ps") or False,
                "plan_more_children": data.get("planToHaveMoreChildren"),
                "avg_monthly_income": data.get("averageMonthlyIncome") or "0",
                "occupation": data.get("occupation") or None,
                "pat": data.get("pat_id"),
                "hrd": data.get("hrd_id") or None,
                "patrec": patient_record_instance.patrec_id,  # Using the ID
                "spouse": spouse_instance.pk if spouse_instance else None,
            }
            print(f"DEBUG: fp_record_data for FPRecordSerializer: {fp_record_data}") # Add this line

            fp_record_serializer = FPRecordSerializer(data=fp_record_data)
            print("DEBUG: Validating FPRecordSerializer...") # Debugging line
            fp_record_serializer.is_valid(raise_exception=True)
            fp_record_instance = fp_record_serializer.save()
            fprecord_id = fp_record_instance.fprecord_id
            logger.info(f"Created FP Record with ID: {fprecord_id}")
            print(f"DEBUG: FP Record created with ID: {fprecord_id}") # Debugging line


            # 3. Create Medical History Records
            print("DEBUG: Handling Medical History records...") # Debugging line
            selected_illness_ids = data.get("selectedIllnessIds", [])
            custom_disability_details = data.get("customDisabilityDetails")

            if custom_disability_details:
                custom_illness_description = f"User-specified disability: {custom_disability_details}"
                # Assuming get_or_create_illness is defined and imported
                custom_illness_instance = get_or_create_illness(
                    illname=custom_disability_details,
                    ill_description=custom_illness_description,
                    ill_code_prefix="FP"
                )
                if custom_illness_instance.ill_id not in selected_illness_ids:
                    selected_illness_ids.append(custom_illness_instance.ill_id)
                logger.info(f"Handled custom disability: {custom_illness_instance.illname}")

            if selected_illness_ids:
                MedicalHistory.objects.filter(patrec=patient_record_instance).delete()
                logger.info(f"Deleted existing medical history for PatientRecord {patient_record_instance.patrec_id}.")
                for illness_id in selected_illness_ids:
                    illness_instance = get_object_or_404(Illness, ill_id=illness_id)
                    # No serializer for MedicalHistory here, direct model creation
                    MedicalHistory.objects.create(
                        ill=illness_instance,
                        patrec=patient_record_instance
                    )
                logger.info(f"Created {len(selected_illness_ids)} medical history records.")
            else:
                MedicalHistory.objects.filter(patrec=patient_record_instance).delete()
                logger.info(f"No illnesses selected, ensuring no medical history records for PatientRecord {patient_record_instance.patrec_id}.")
            
            print("DEBUG: Medical History handled.") # Debugging line


            # 4. Create FP Type
            print("DEBUG: Preparing FP Type data...") # Debugging line
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
            print("DEBUG: Validating FPTypeSerializer...") # Debugging line
            fp_type_serializer.is_valid(raise_exception=True)
            fp_type_instance = fp_type_serializer.save()
            fpt_id = fp_type_instance.fpt_id
            logger.info(f"Created FP_type with ID: {fpt_id}")
            print(f"DEBUG: FP Type created with ID: {fpt_id}") # Debugging line


            #OBS MAIN
            print("DEBUG: Handling Obstetrical History (Main Obstetrical Record)...") # Debugging line
            main_obs_data_from_request = data.get("obstetricalHistory", {})
            main_obs_instance = None

            patient_id = data.get("pat_id")
            # Try to get the LATEST existing Obstetrical_History for this patient
            latest_existing_main_obs = Obstetrical_History.objects.filter(
                patrec_id__pat_id=patient_id
            ).order_by('-patrec_id__created_at').first()

            main_obs_serializer_data = {
                "obs_record_from": "Family Planning",
                "patrec_id": patient_record_instance.patrec_id, # Link to the NEW PatientRecord
                # Default values in case no existing record or no data from request
                "obs_living_ch": 0, "obs_abortion": 0, "obs_gravida": 0, "obs_para": 0,
                "obs_fullterm": 0, "obs_preterm": 0, "obs_ch_born_alive": 0,
                "obs_lg_babies": 0, "obs_still_birth": 0,
            }

            if latest_existing_main_obs:
                # If existing, copy its data
                print(f"DEBUG: Found latest existing Obstetrical_History for pat_id {patient_id} (ID: {latest_existing_main_obs.obs_id}). Copying data.")
                main_obs_serializer_data.update({
                    "obs_living_ch": latest_existing_main_obs.obs_living_ch,
                    "obs_abortion": latest_existing_main_obs.obs_abortion,
                    "obs_gravida": latest_existing_main_obs.obs_gravida,
                    "obs_para": latest_existing_main_obs.obs_para,
                    "obs_fullterm": latest_existing_main_obs.obs_fullterm,
                    "obs_preterm": latest_existing_main_obs.obs_preterm,
                    # "obs_ch_born_alive": latest_existing_main_obs.obs_ch_born_alive,
                    # "obs_lg_babies": latest_existing_main_obs.obs_lg_babies,
                    # "obs_still_birth": latest_existing_main_obs.obs_still_birth,
                })
                # Overlay with any data provided in the current request for potential updates/corrections
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
                print("DEBUG: No existing Obstetrical_History. Creating new from request data.")
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
            else:
                # If no existing and no data from request, leave defaults (all zeros)
                print("DEBUG: No existing Obstetrical_History and no data from request. Creating with default zeros.")


            main_obs_serializer = ObstetricalHistorySerializer(data=main_obs_serializer_data)
            print("DEBUG: Validating ObstetricalHistorySerializer...") # Debugging line
            main_obs_serializer.is_valid(raise_exception=True)
            main_obs_instance = main_obs_serializer.save()
            logger.info(f"Created new Obstetrical_History with ID: {main_obs_instance.obs_id} for PatientRecord {patient_record_instance.patrec_id}")
            print(f"DEBUG: New Obstetrical_History created with ID: {main_obs_instance.obs_id}") # Debugging line

            # 6. Handle FP-specific Obstetrical History (ALWAYS NEW)
            print("DEBUG: Handling FP-specific Obstetrical History (ALWAYS NEW)...") 
            fp_obstetrical_history_data = data.get('obstetricalHistory', {})
            
            print(f"DEBUG: Content of fp_obstetrical_history_data: {fp_obstetrical_history_data}")

            if fp_obstetrical_history_data and fp_record_instance:
                fpob_last_delivery_val = obstetrical_history_data.get('lastDeliveryDate')
                if fpob_last_delivery_val == "":
                    fpob_last_delivery_val = None

                fpob_type_last_delivery_val = obstetrical_history_data.get('typeOfLastDelivery')
                if fpob_type_last_delivery_val == "":
                    fpob_type_last_delivery_val = None
                    
                # Create a NEW FP_Obstetrical_History record
                fp_obs_serializer_data = {
                    # "fpob_last_delivery": fp_obstetrical_history_data.get('lastDeliveryDate') or None, 
                    # "fpob_type_last_delivery": fp_obstetrical_history_data.get('typeOfLastDelivery'), # Assuming this matches your model field
                    "fpob_last_delivery": fpob_last_delivery_val,
                    "fpob_type_last_delivery": fpob_type_last_delivery_val,
                    "fpob_last_period": fp_obstetrical_history_data.get('lastMenstrualPeriod'),
                    "fpob_previous_period": fp_obstetrical_history_data.get('previousMenstrualPeriod'),
                    "fpob_mens_flow": fp_obstetrical_history_data.get('menstrualFlow') or "Normal",
                    "fpob_dysme": fp_obstetrical_history_data.get('dysmenorrhea') or False,
                    "fpob_hydatidiform": fp_obstetrical_history_data.get('hydatidiformMole') or False,
                    "fpob_ectopic_pregnancy": fp_obstetrical_history_data.get('ectopicPregnancyHistory') or False,
                    "fprecord": fp_record_instance.fprecord_id,
                    "obs": main_obs_instance.obs_id if main_obs_instance else None,
                }

                fp_obs_serializer = FP_ObstetricalHistorySerializer(data=fp_obs_serializer_data)
                print("DEBUG: Validating FP_Obstetrical_HistorySerializer (create new)...")
                fp_obs_serializer.is_valid(raise_exception=True)
                fp_obs_instance = fp_obs_serializer.save()
                logger.info(f"Created new FP_Obstetrical_History with ID: {fp_obs_instance.fpob_id} for FPRecord {fp_record_instance.fprecord_id}")
                print(f"DEBUG: New FP_Obstetrical_History created with ID: {fp_obs_instance.fpob_id}")
            else:
                logger.info("No FP-specific obstetrical history data or FP_Record not available. Skipping FP_Obstetrical_History creation.")
            
            if obstetrical_history_data:
                last_delivery_date_for_prev_preg = obstetrical_history_data.get('lastDeliveryDate')
                type_of_last_delivery_for_prev_preg = obstetrical_history_data.get('typeOfLastDelivery')

                    # Only create if valid date and type are provided
                if last_delivery_date_for_prev_preg and type_of_last_delivery_for_prev_preg:
                    if last_delivery_date_for_prev_preg == "":
                        last_delivery_date_for_prev_preg = None
                    if type_of_last_delivery_for_prev_preg == "":
                        type_of_last_delivery_for_prev_preg = None

                if last_delivery_date_for_prev_preg and type_of_last_delivery_for_prev_preg:
                        prev_pregnancy_data = {
                            "date_of_delivery": last_delivery_date_for_prev_preg,
                            "type_of_delivery": type_of_last_delivery_for_prev_preg,
                            "outcome": None,
                            "babys_wt": None,
                            "gender": None,
                            "ballard_score": None,
                            "apgar_score": None,
                            "patrec_id": patient_record_instance.patrec_id, # <--- LINKED HERE
                                
                       }
                        prev_pregnancy_serializer = PreviousPregnancySerializer(data=prev_pregnancy_data)
                        if prev_pregnancy_serializer.is_valid():
                            prev_pregnancy_instance = prev_pregnancy_serializer.save()
                            logger.info(f"Created new Previous_Pregnancy record for last delivery: {prev_pregnancy_instance.pfpp_id}")
                            print(f"Created new Previous_Pregnancy record for last delivery: {prev_pregnancy_instance.pfpp_id}")
                        else:
                            logger.error(f"Error validating Previous_Pregnancy data: {prev_pregnancy_serializer.errors}")
                                # Consider raising an exception here to prevent partial saves if this is critical
                else:
                    logger.info("Skipping Previous_Pregnancy creation: 'lastDeliveryDate' or 'typeOfLastDelivery' not valid or provided.")
                    print("DEBUG: Skipping FP-specific Obstetrical History creation.")

            # 7. Create Risk STI
            print("DEBUG: Preparing Risk STI data...") # Debugging line
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
            print("DEBUG: Validating FPRiskStiSerializer...") # Debugging line
            risk_sti_serializer.is_valid(raise_exception=True)
            risk_sti_serializer.save()
            logger.info("Created FP_RiskSti.")
            print("DEBUG: FP_RiskSti created.") # Debugging line

            # 8. Create Risk VAW
            print("DEBUG: Preparing Risk VAW data...") # Debugging line
            risk_vaw_data = data.get("violenceAgainstWomen", {})
            risk_vaw_payload = {
                "unpleasant_relationship": risk_vaw_data.get("unpleasantRelationship") or False,
                "partner_disapproval": risk_vaw_data.get("partnerDisapproval") or False,
                "domestic_violence": risk_vaw_data.get("domesticViolence") or False,
                "referredTo": risk_vaw_data.get("referredTo") or None,
                "fprecord": fprecord_id,
            }
            risk_vaw_serializer = FPRiskVawSerializer(data=risk_vaw_payload)
            print("DEBUG: Validating FPRiskVawSerializer...") # Debugging line
            risk_vaw_serializer.is_valid(raise_exception=True)
            risk_vaw_serializer.save()
            logger.info("Created FP_RiskVaw.")
            print("DEBUG: FP_RiskVaw created.") # Debugging line

            # 9. Handle Body Measurement (Update or Create)
            print("DEBUG: Handling Body Measurement...") # Debugging line
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
                    print("DEBUG: Validating BodyMeasurementSerializer (update)...") # Debugging line
                    bm_serializer.is_valid(raise_exception=True)
                    updated_bm = bm_serializer.save()
                    bm_id = updated_bm.bm_id
                    logger.info(f"Updated existing BodyMeasurement with ID: {bm_id}")
                    print(f"DEBUG: Updated BodyMeasurement ID: {bm_id}") # Debugging line
                else:
                    bm_id = existing_bm.bm_id
                    logger.info(f"Reusing existing BodyMeasurement with ID: {bm_id} (no changes)")
                    print(f"DEBUG: Reusing existing BodyMeasurement ID: {bm_id} (no changes)") # Debugging line
            else:
                bm_data = {
                    "weight": float(current_weight) if current_weight is not None else 0,
                    "height": float(current_height) if current_height is not None else 0,
                    "age": data.get("age") or 0,
                    "patrec": patrec_id,
                }
                bm_serializer = BodyMeasurementSerializer(data=bm_data)
                print("DEBUG: Validating BodyMeasurementSerializer (create)...") # Debugging line
                bm_serializer.is_valid(raise_exception=True)
                new_bm = bm_serializer.save()
                bm_id = new_bm.bm_id
                logger.info(f"Created new BodyMeasurement with ID: {bm_id}")
                print(f"DEBUG: New BodyMeasurement created with ID: {bm_id}") # Debugging line


            # 10. Create Vital Signs
            print("DEBUG: Preparing Vital Signs data...") # Debugging line
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
                "vital_pulse": "N/A",
                "vital_temp": data.get("temperature") or "N/A",
                "vital_RR": data.get("respiratoryRate") or "N/A",
                "vital_o2": data.get("oxygenSaturation") or "N/A",
                "pulse_rate": data.get("pulseRate") or "N/A",
                "patrec": patrec_id,
                "staff": staff_id_from_request,
            }
            vital_signs_serializer = VitalSignsSerializer(data=vital_signs_data)
            print("DEBUG: Validating VitalSignsSerializer...") # Debugging line
            vital_signs_serializer.is_valid(raise_exception=True)
            vital_signs_instance = vital_signs_serializer.save()
            vital_id = vital_signs_instance.vital_id
            logger.info(f"Created VitalSigns with ID: {vital_id}")
            print(f"DEBUG: VitalSigns created with ID: {vital_id}") # Debugging line


            # 11. Create Physical Exam
            print("DEBUG: Preparing Physical Exam data...") # Debugging line
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
            print("DEBUG: Validating FPPhysicalExamSerializer...") # Debugging line
            physical_exam_serializer.is_valid(raise_exception=True)
            physical_exam_serializer.save()
            logger.info("Created FP_Physical_Exam.")
            print("DEBUG: FP_Physical_Exam created.") # Debugging line

            
            print("DEBUG: Handling Pelvic Exam (IUD method check)...") # Debugging line
            is_iud_selected = "IUD" in (data.get("methodCurrentlyUsed") or "")
            if is_iud_selected:
                print("DEBUG: IUD method detected, creating pelvic exam...") # Debugging line
                
                # Map frontend values to backend expected values
                uterine_position = data.get("uterinePosition", "")
                if uterine_position == "mid":
                    uterine_position = "Middle"
                elif uterine_position == "anteflexed":
                    uterine_position = "anteflexed"
                elif uterine_position == "retroflexed":
                    uterine_position = "retroflexed"
                
                pelvic_exam_data = {
                    "pelvicExamination": data.get("pelvicExamination") or "normal",
                    "cervicalConsistency": data.get("cervicalConsistency") or "firm",
                    "cervicalTenderness": data.get("cervicalTenderness") or False,
                    "cervicalAdnexal": data.get("cervicalAdnexal") or False,
                    "uterinePosition": uterine_position,
                    "uterineDepth": data.get("uterineDepth") or "",
                    "fprecord": fprecord_id,
                }
                
                print(f"DEBUG: Pelvic exam data to be saved: {pelvic_exam_data}") # Debugging line

                pelvic_exam_serializer = PelvicExamSerializer(data=pelvic_exam_data)
                print("DEBUG: Validating PelvicExamSerializer...") # Debugging line
                pelvic_exam_serializer.is_valid(raise_exception=True)
                pelvic_exam_serializer.save()
                logger.info("Created FP_Pelvic_Exam (IUD method).")
                print("DEBUG: FP_Pelvic_Exam (IUD method) created.") # Debugging line
            else:
                logger.info("Skipping FP_Pelvic_Exam (not IUD method).")
                print("DEBUG: Skipping Pelvic Exam.") # Debugging line


            # 13. Create Acknowledgement
            print("DEBUG: Preparing Acknowledgement data...") # Debugging line
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
            print("DEBUG: Validating AcknowledgementSerializer...") # Debugging line
            acknowledgement_serializer.is_valid(raise_exception=True)
            acknowledgement_serializer.save()
            logger.info("Created FP_Acknowledgement.")
            print("DEBUG: FP_Acknowledgement created.") # Debugging line

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
            print("DEBUG: Validating FP_PregnancyCheckSerializer...") # Debugging line
            pregnancy_check_serializer.is_valid(raise_exception=True)
            pregnancy_check_serializer.save()
            logger.info("Created FP_pregnancy_check.")
            print("DEBUG: FP_pregnancy_check created.") # Debugging line


            # 15. Create Assessment and handle stock deduction
            print("DEBUG: Handling Assessment and Stock Deduction...") # Debugging line
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

                # Create Follow-up Visit
                print("DEBUG: Preparing Follow-up Visit data...") # Debugging line
                follow_up_data = {
                    "patrec": patrec_id,
                    "followv_date": latest_record.get("dateOfFollowUp") or None,
                    "followv_status": "pending",
                    "followv_description": "Family Planning Follow up",
                }
                follow_up_serializer = FollowUpVisitSerializer(data=follow_up_data)
                print("DEBUG: Validating FollowUpVisitSerializer...") # Debugging line
                follow_up_serializer.is_valid(raise_exception=True)
                follow_up_instance = follow_up_serializer.save()
                followv_id = follow_up_instance.followv_id
                logger.info(f"Created FollowUpVisit with ID: {followv_id}")
                print(f"DEBUG: FollowUpVisit created with ID: {followv_id}") # Debugging line

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

                        commodity_inventory_item.cinv_qty_avail -= method_quantity
                        commodity_inventory_item.save()

                        CommodityTransaction.objects.create(
                            cinv_id=commodity_inventory_item,
                            comt_qty=str(method_quantity),
                            comt_action="Deducted for FP Service",
                            staff_id=staff_id_from_request,
                        )
                        logger.info(f"Successfully deducted {method_quantity} of {method_accepted} and logged transaction.")
                        print(f"DEBUG: Stock deducted successfully for {method_accepted}.") # Debugging line

                    except CommodityList.DoesNotExist:
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
                print("DEBUG: Preparing FP Assessment data...") # Debugging line
                assessment_data = {
                    "quantity": method_quantity,
                    "as_provider_signature": latest_record.get("serviceProviderSignature") or "",
                    "as_provider_name": latest_record.get("nameOfServiceProvider") or "",
                    "as_findings": latest_record.get("medicalFindings") or "None",
                    "followv": followv_id,
                    "fprecord": fprecord_id,
                    "fpt": fpt_id,
                    "bm": bm_id,
                    "dispensed_commodity_item": latest_record.get("dispensedCommodityItemId") or None,
                    "dispensed_medicine_item": latest_record.get("dispensedMedicineItemId") or None,
                    "dispensed_vaccine_item": latest_record.get("dispensedVaccineItemId") or None,
                    "dispensed_item_name_for_report": latest_record.get("dispensedItemNameForReport") or None,
                }
                assessment_serializer = FPAssessmentSerializer(data=assessment_data)
                print("DEBUG: Validating FPAssessmentSerializer...") # Debugging line
                assessment_serializer.is_valid(raise_exception=True)
                assessment_serializer.save()
                logger.info("Created FP_Assessment_Record.")
                print("DEBUG: FP_Assessment_Record created.") # Debugging line
            else:
                logger.info("No service provision records found, skipping assessment and stock deduction.")
                print("DEBUG: Skipping Assessment and Stock Deduction.") # Debugging line

            logger.info("Full FP form submission completed successfully.")
            print("--- Full FP Form Submission Completed Successfully! ---") # Debugging line
            return Response(
                {"message": "Family Planning record created successfully!", "fprecord": fprecord_id},
                status=status.HTTP_201_CREATED
            )

    except Exception as e:
        logger.error(f"Full FP form submission failed: {e}", exc_info=True)
        print(f"ERROR: Full FP form submission failed. Details: {str(e)}") # Debugging line
        return Response(
            {"detail": f"Failed to submit Family Planning record: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )


# FP Record CRUD
class FP_RecordListCreateView(generics.ListCreateAPIView):
    serializer_class = FPRecordSerializer
    queryset = FP_Record.objects.all()


# class FP_RecordDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = FPRecordSerializer
#     queryset = FP_Record.objects.all()
#     lookup_field = "fprecord_id"


# View for creating PatientRecord instances (if applicable, possibly shared with other apps)
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



class FPRecordsForPatientListView(generics.ListAPIView):
    """
    API view to list all Family Planning records for a specific patient,
    ordered by their creation date (oldest first).
    """
    serializer_class = FamilyPlanningRecordCompositeSerializer

    def get_queryset(self):
        patient_id = self.kwargs['patient_id']
        # Filter by patient's pat_id and order by created_at ascending
        return FP_Record.objects.filter(pat__pat_id=patient_id).order_by('created_at')

