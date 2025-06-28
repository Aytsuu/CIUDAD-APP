# import datetime
# from venv import logger
# from django.shortcuts import render, get_object_or_404
# from django.db import transaction, connection
# from rest_framework import generics, status
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from .serializers import *
# from rest_framework.decorators import api_view
# from .models import *
# from apps.patientrecords.models import Patient, PatientRecord 
# # from apps.healthProfiling.models import ResidentProfile, Personal, FamilyComposition, Household, PersonalAddress, Address

# from django.db.models import F 

# class AnimalBitePatientRecordCountView(APIView):
#     def get(self, request):
#         aggregated_data = AnimalBitePatientRecordCountSerializer.get_aggregated_data()
   
#         serializer.is_valid(raise_exception=True)
#         serializer = AnimalBitePatientRecordCountSerializer(aggregated_data, many=True)
#         return Response(serializer.data)
        
# @api_view(['GET'])
# def get_animalbite_count(request, pat_id):
#     try:
#         patient = Patient.objects.get(pat_id=pat_id)
        
#         count = AnimalBite_Referral.objects.filter(
#             patrec__pat_id=patient 
#         ).count()

#         return Response({
#             'pat_id': pat_id,
#             'animalbite_count': count,
#             'patient_name': f"{patient.personal_info.per_fname} {patient.personal_info.per_lname}" if hasattr(patient, 'personal_info') else "Unknown"
#         }, status=status.HTTP_200_OK)
        
#     except Patient.DoesNotExist:
#         return Response(
#             {'error': f'Patient with ID {pat_id} does not exist'},
#             status=status.HTTP_404_NOT_FOUND
#         )
#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         print(f"Error fetching animalbite count for patient {pat_id}: {str(e)}")
#         return Response(
#             {'error': f'Failed to fetch animalbite count: {str(e)}'},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )
        
# class AnimalbitePatientDetailsView(generics.ListAPIView):
#     serializer_class = AnimalBitePatientDetailsSerializer
    
#     def get_queryset(self):
#         patient_id = self.kwargs.get('patient_id') 
#         if not patient_id:
#             patient_id = self.request.query_params.get('patient_id', None)

#         if patient_id:
#             print(f"DEBUG VIEWS: Filtering by specific patient_id: '{patient_id}'.")
#             with connection.cursor() as cursor:
#                 cursor.execute(
#                     """
#                     SELECT abd.bite_id
#                     FROM animalbite_detail abd
#                     JOIN animalbite_referral abr ON abd.referral_id = abr.referral_id
#                     JOIN patient_record pr ON abr.patrec_id = pr.patrec_id
#                     JOIN patient p ON pr.pat_id = p.pat_id
#                     WHERE CAST(p.pat_id AS TEXT) = %s
#                     AND pr.patrec_type = 'Animal Bites' 
#                     """,
#                     [str(patient_id)]
#                 )
#                 bite_ids = [row[0] for row in cursor.fetchall()]
            
#             if bite_ids:
#                 queryset = AnimalBite_Details.objects.filter(bite_id__in=bite_ids)
#                 print(f"DEBUG VIEWS: Raw SQL found {queryset.count()} records for patient_id '{patient_id}'.")
#             else:
#                 queryset = AnimalBite_Details.objects.none() 
#                 print(f"DEBUG VIEWS: Raw SQL found 0 records for patient_id '{patient_id}'. Returning empty queryset.")
#         else:
#             queryset = AnimalBite_Details.objects.filter(
#                 referral__patrec__patrec_type="Animal Bites"
#             )
#             print(f"DEBUG VIEWS: No specific patient_id provided. Returning all 'Animal Bites' records (count: {queryset.count()}).")
        
#         final_queryset = queryset.order_by('-referral__date', '-referral__patrec__created_at')
#         print(f"DEBUG VIEWS: Final queryset count before serialization: {final_queryset.count()}")
#         return final_queryset

# class CreateAnimalBiteRecordView(APIView):
#     def post(self, request):
#         print("🔄 Received request data:", request.data)
        
#         serializer = AnimalBiteCreateSerializer(data=request.data)
        
#         if not serializer.is_valid():
#             print("❌ Serializer validation failed:", serializer.errors)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
#         data = serializer.validated_data
#         print("✅ Validated data:", data)
        
#         try:
#             with transaction.atomic(): 
#                 # 1. Get the Patient instance based on pat_id (which can be Resident or Transient)
#                 pat_id_str = str(data['pat_id']).strip() 
#                 print(f"🔍 Looking for patient with pat_id: '{pat_id_str}'")
                
#                 try:
#                     patient = Patient.objects.get(pk=pat_id_str) # Directly query by CharField PK
#                     print(f"✅ Found patient: {patient} (pat_id: {patient.pat_id}, type: {patient.pat_type})")
                    
#                 except Patient.DoesNotExist:
#                     print(f"❌ Patient with pat_id '{pat_id_str}' not found")
#                     return Response(
#                         {'error': f'Patient with ID {pat_id_str} not found'}, 
#                         status=status.HTTP_404_NOT_FOUND
#                     )
#                 except Exception as e:
#                     print(f"❌ Error finding patient: {str(e)}")
#                     return Response(
#                         {'error': f'Error finding patient: {str(e)}'}, 
#                         status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                     )
                
#                 # 2. Get or Create PatientRecord
#                 print("🏥 Handling patient record...")
#                 try:
#                     existing_patient_record = PatientRecord.objects.filter(
#                         pat_id=patient,
#                         patrec_type="Animal Bites"
#                     ).first()

#                     if existing_patient_record:
#                         patient_record = existing_patient_record
#                         print(f"✅ Found existing patient record: {patient_record.patrec_id}")
#                     else:
#                         patient_record = PatientRecord.objects.create(
#                             pat_id=patient,
#                             patrec_type="Animal Bites"
#                         )
#                         print(f"✅ Created new patient record: {patient_record.patrec_id}")
#                 except Exception as e:
#                     print(f"❌ Error during patient record lookup/creation: {str(e)}")
#                     return Response(
#                         {'error': f'Error creating patient record: {str(e)}'},
#                         status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                     )
                
#                 # 3. Create AnimalBite_Referral (NO 'transient' field here now)
#                 print("📝 Creating referral...")
#                 try:
#                     referral = AnimalBite_Referral.objects.create(
#                         receiver=data['receiver'],
#                         sender=data['sender'],
#                         date=data['date'],
#                         # transient=data['transient'], # REMOVED THIS LINE
#                         patrec=patient_record 
#                     )
#                     print(f"✅ Created AnimalBite_Referral: {referral.referral_id}")
#                 except Exception as e:
#                     print(f"❌ Error creating referral: {str(e)}")
#                     return Response(
#                         {'error': f'Error creating referral: {str(e)}'}, 
#                         status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                     )
                
#                 # 4. Create AnimalBite_Details
#                 print("🦷 Creating bite details...")
#                 try:
#                     exposure_site_value = data.get('exposure_site', '')
#                     biting_animal_value = data.get('biting_animal', '')
                    
#                     if exposure_site_value and str(exposure_site_value).startswith('custom-'):
#                         exposure_site_value = data.get('exposure_site_name', exposure_site_value)
                    
#                     if biting_animal_value and str(biting_animal_value).startswith('custom-'):
#                         biting_animal_value = data.get('biting_animal_name', biting_animal_value)
                    
#                     print(f"📦 Final exposure site to save: {exposure_site_value}")
#                     print(f"📦 Final biting animal to save: {biting_animal_value}")

#                     bite_details = AnimalBite_Details.objects.create(
#                         exposure_type=data['exposure_type'],
#                         exposure_site=exposure_site_value, 
#                         biting_animal=biting_animal_value, 
#                         actions_taken=data.get('actions_taken', ''),
#                         referredby=data.get('referredby', ''),
#                         referral=referral 
#                     )
#                     print(f"✅ Created AnimalBite_Details: {bite_details.bite_id}")
#                 except Exception as e:
#                     print(f"❌ Error creating bite details: {str(e)}")
#                     return Response(
#                         {'error': f'Error creating bite details: {str(e)}'}, 
#                         status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                     )
                
#                 response_data = {
#                     'patrec_id': patient_record.patrec_id,
#                     'referral_id': referral.referral_id,
#                     'bite_id': bite_details.bite_id,
#                     'message': 'Animal bite record created successfully'
#                 }
                
#                 print("✅ Successfully created complete animal bite record:", response_data)
#                 return Response(response_data, status=status.HTTP_201_CREATED)
                
#         except Exception as e:
#             print(f"❌ Transaction failed: {e}")
#             import traceback
#             traceback.print_exc()
#             return Response(
#                 {"detail": f"An unexpected error occurred: {str(e)}"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class AnimalbiteDetailsView(generics.ListCreateAPIView):
#     serializer_class = AnimalBiteDetailsSerializer
#     queryset = AnimalBite_Details.objects.all() 

#     def get_queryset(self):
#         referral_id = self.request.query_params.get('referral', None)
#         if referral_id:
#             return AnimalBite_Details.objects.filter(referral=referral_id)
#         return super().get_queryset() 

# class AnimalbiteReferralView(generics.ListCreateAPIView):
#     serializer_class = AnimalBiteReferralSerializer
#     queryset = AnimalBite_Referral.objects.all()
import datetime
from venv import logger
from django.shortcuts import render, get_object_or_404
from django.db import transaction, connection
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from rest_framework.decorators import api_view
from .models import *
from apps.patientrecords.models import Patient, PatientRecord 
from django.db.models import F, Count, Max, Min

class AnimalBitePatientSummaryView(APIView):
    """
    Returns unique patients with their animal bite record summaries for the overall view
    """
    def get(self, request):
        try:
            # Use raw SQL to get unique patients with aggregated data - FIXED JOINS
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT DISTINCT
                        p.pat_id as patient_id,
                        CASE 
                            WHEN p.pat_type = 'Resident' AND rp.rp_id IS NOT NULL THEN per.per_fname
                            WHEN p.pat_type = 'Transient' AND t.trans_id IS NOT NULL THEN t.tran_fname
                            ELSE 'Unknown'
                        END as patient_fname,
                        CASE 
                            WHEN p.pat_type = 'Resident' AND rp.rp_id IS NOT NULL THEN per.per_lname
                            WHEN p.pat_type = 'Transient' AND t.trans_id IS NOT NULL THEN t.tran_lname
                            ELSE 'Unknown'
                        END as patient_lname,
                        CASE 
                            WHEN p.pat_type = 'Resident' AND rp.rp_id IS NOT NULL THEN per.per_mname
                            WHEN p.pat_type = 'Transient' AND t.trans_id IS NOT NULL THEN t.tran_mname
                            ELSE NULL
                        END as patient_mname,
                        CASE 
                            WHEN p.pat_type = 'Resident' AND rp.rp_id IS NOT NULL THEN per.per_sex
                            WHEN p.pat_type = 'Transient' AND t.trans_id IS NOT NULL THEN t.tran_sex
                            ELSE 'Unknown'
                        END as patient_sex,
                        CASE 
                            WHEN p.pat_type = 'Resident' AND rp.rp_id IS NOT NULL AND per.per_dob IS NOT NULL 
                                THEN EXTRACT(YEAR FROM AGE(per.per_dob))
                            WHEN p.pat_type = 'Transient' AND t.trans_id IS NOT NULL AND t.tran_dob IS NOT NULL 
                                THEN EXTRACT(YEAR FROM AGE(t.tran_dob))
                            ELSE 0
                        END as patient_age,
                        p.pat_type as patient_type,
                        CASE 
                            WHEN p.pat_type = 'Resident' AND pa.add_id IS NOT NULL 
                                THEN CONCAT_WS(', ', pa.add_street, pa.add_barangay, pa.add_city)
                            WHEN p.pat_type = 'Transient' AND ta.tradd_id IS NOT NULL 
                                THEN CONCAT_WS(', ', ta.tradd_street, ta.tradd_barangay, ta.tradd_city)
                            ELSE 'Address Not Available'
                        END as patient_address,
                        COUNT(abd.bite_id) as record_count,
                        MAX(abr.date) as latest_record_date,
                        MIN(abr.date) as first_record_date
                    FROM patient p
                    JOIN patient_record pr ON p.pat_id = pr.pat_id
                    JOIN animalbite_referral abr ON pr.patrec_id = abr.patrec_id
                    JOIN animalbite_detail abd ON abr.referral_id = abd.referral_id
                    LEFT JOIN resident_profile rp ON p.rp_id = rp.rp_id
                    LEFT JOIN personal per ON rp.per_id = per.per_id
                    LEFT JOIN personal_address paddr ON per.per_id = paddr.per_id
                    LEFT JOIN address pa ON paddr.add_id = pa.add_id
                    LEFT JOIN transient t ON p.trans_id = t.trans_id
                    LEFT JOIN transient_address ta ON t.tradd_id = ta.tradd_id
                    WHERE pr.patrec_type = 'Animal Bites'
                    GROUP BY p.pat_id, p.pat_type, per.per_fname, per.per_lname, per.per_mname, 
                             per.per_sex, per.per_dob, t.tran_fname, t.tran_lname, t.tran_mname, 
                             t.tran_sex, t.tran_dob, pa.add_street, pa.add_barangay, pa.add_city,
                             ta.tradd_street, ta.tradd_barangay, ta.tradd_city, rp.rp_id, t.trans_id, pa.add_id, ta.tradd_id
                    ORDER BY latest_record_date DESC
                """)
                
                columns = [col[0] for col in cursor.description]
                unique_patients_data = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            # Convert to proper format for serializer
            formatted_data = []
            for patient in unique_patients_data:
                formatted_data.append({
                    'patient_id': patient['patient_id'],
                    'patient_fname': patient['patient_fname'] or 'Unknown',
                    'patient_lname': patient['patient_lname'] or 'Unknown', 
                    'patient_mname': patient['patient_mname'],
                    'patient_sex': patient['patient_sex'] or 'Unknown',
                    'patient_age': int(patient['patient_age']) if patient['patient_age'] else 0,
                    'patient_type': patient['patient_type'],
                    'patient_address': patient['patient_address'] or 'Address Not Available',
                    'record_count': int(patient['record_count']),
                    'latest_record_date': patient['latest_record_date'],
                    'first_record_date': patient['first_record_date']
                })
            
            serializer = AnimalBitePatientSummarySerializer(formatted_data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error in AnimalBitePatientSummaryView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Failed to fetch patient summary: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AnimalBitePatientSummaryViewORM(APIView):
    """
    Alternative implementation using Django ORM - SAFER APPROACH
    """
    def get(self, request):
        try:
            from django.db.models import Count, Max, Min
            from datetime import date
            
            # Get unique patient data using ORM
            unique_patient_data = []
            
            # Get all animal bite details with related data
            bite_details = AnimalBite_Details.objects.select_related(
                'referral__patrec__pat_id',
                'referral__patrec__pat_id__rp_id__per',
                'referral__patrec__pat_id__trans_id'
            ).filter(
                referral__patrec__patrec_type="Animal Bites"
            )
            
            # Group by patient ID
            patient_groups = {}
            for detail in bite_details:
                patient = detail.referral.patrec.pat_id
                patient_id = patient.pat_id
                
                if patient_id not in patient_groups:
                    patient_groups[patient_id] = {
                        'patient': patient,
                        'records': [],
                        'dates': []
                    }
                
                patient_groups[patient_id]['records'].append(detail)
                patient_groups[patient_id]['dates'].append(detail.referral.date)
            
            # Process each unique patient
            for patient_id, group_data in patient_groups.items():
                patient = group_data['patient']
                records = group_data['records']
                dates = group_data['dates']
                
                # Extract patient information based on your model structure
                if patient.pat_type == 'Resident' and patient.rp_id and patient.rp_id.per:
                    personal = patient.rp_id.per
                    fname = personal.per_fname
                    lname = personal.per_lname
                    mname = personal.per_mname
                    sex = personal.per_sex
                    dob = personal.per_dob
                elif patient.pat_type == 'Transient' and patient.trans_id:
                    transient = patient.trans_id
                    fname = transient.tran_fname
                    lname = transient.tran_lname
                    mname = transient.tran_mname
                    sex = transient.tran_sex
                    dob = transient.tran_dob
                else:
                    fname = "Unknown"
                    lname = "Unknown"
                    mname = None
                    sex = "Unknown"
                    dob = None
                
                # Calculate age
                age = 0
                if dob and isinstance(dob, date):
                    today = date.today()
                    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
                
                # Get address based on your model structure
                address = "Address Not Available"
                if patient.pat_type == 'Resident' and patient.rp_id and patient.rp_id.per:
                    try:
                        from apps.healthProfiling.models import PersonalAddress
                        personal_address = PersonalAddress.objects.select_related('add').filter(per=patient.rp_id.per).first()
                        if personal_address and personal_address.add:
                            address_obj = personal_address.add
                            address_parts = []
                            if address_obj.add_street: address_parts.append(address_obj.add_street)
                            if address_obj.add_barangay: address_parts.append(address_obj.add_barangay)
                            if address_obj.add_city: address_parts.append(address_obj.add_city)
                            if address_parts:
                                address = ", ".join(address_parts)
                    except Exception as addr_error:
                        print(f"Error getting resident address: {addr_error}")
                        pass
                elif patient.pat_type == 'Transient' and patient.trans_id and patient.trans_id.tradd_id:
                    try:
                        transient_address = patient.trans_id.tradd_id
                        address_parts = []
                        if transient_address.tradd_street: address_parts.append(transient_address.tradd_street)
                        if transient_address.tradd_barangay: address_parts.append(transient_address.tradd_barangay)
                        if transient_address.tradd_city: address_parts.append(transient_address.tradd_city)
                        if address_parts:
                            address = ", ".join(address_parts)
                    except Exception as addr_error:
                        print(f"Error getting transient address: {addr_error}")
                        pass
                
                unique_patient_data.append({
                    'patient_id': patient.pat_id,
                    'patient_fname': fname,
                    'patient_lname': lname,
                    'patient_mname': mname,
                    'patient_sex': sex,
                    'patient_age': age,
                    'patient_type': patient.pat_type,
                    'patient_address': address,
                    'record_count': len(records),
                    'latest_record_date': max(dates) if dates else None,
                    'first_record_date': min(dates) if dates else None
                })
            
            # Sort by latest record date (most recent first)
            unique_patient_data.sort(key=lambda x: x['latest_record_date'] or date.min, reverse=True)
            
            print(f"✅ Found {len(unique_patient_data)} unique patients with animal bite records")
            
            serializer = AnimalBitePatientSummarySerializer(unique_patient_data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error in AnimalBitePatientSummaryViewORM: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Failed to fetch patient summary: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AnimalBitePatientRecordCountView(APIView):
    def get(self, request):
        aggregated_data = AnimalBitePatientRecordCountSerializer.get_aggregated_data()
   
        serializer.is_valid(raise_exception=True)
        serializer = AnimalBitePatientRecordCountSerializer(aggregated_data, many=True)
        return Response(serializer.data)
        
@api_view(['GET'])
def get_animalbite_count(request, pat_id):
    try:
        patient = Patient.objects.get(pat_id=pat_id)
        
        count = AnimalBite_Referral.objects.filter(
            patrec__pat_id=patient 
        ).count()

        return Response({
            'pat_id': pat_id,
            'animalbite_count': count,
            'patient_name': f"{patient.personal_info.per_fname} {patient.personal_info.per_lname}" if hasattr(patient, 'personal_info') else "Unknown"
        }, status=status.HTTP_200_OK)
        
    except Patient.DoesNotExist:
        return Response(
            {'error': f'Patient with ID {pat_id} does not exist'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error fetching animalbite count for patient {pat_id}: {str(e)}")
        return Response(
            {'error': f'Failed to fetch animalbite count: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
class AnimalbitePatientDetailsView(generics.ListAPIView):
    serializer_class = AnimalBitePatientDetailsSerializer
    
    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id') 
        if not patient_id:
            patient_id = self.request.query_params.get('patient_id', None)

        if patient_id:
            print(f"DEBUG VIEWS: Filtering by specific patient_id: '{patient_id}'.")
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT abd.bite_id
                    FROM animalbite_detail abd
                    JOIN animalbite_referral abr ON abd.referral_id = abr.referral_id
                    JOIN patient_record pr ON abr.patrec_id = pr.patrec_id
                    JOIN patient p ON pr.pat_id = p.pat_id
                    WHERE CAST(p.pat_id AS TEXT) = %s
                    AND pr.patrec_type = 'Animal Bites' 
                    """,
                    [str(patient_id)]
                )
                bite_ids = [row[0] for row in cursor.fetchall()]
            
            if bite_ids:
                queryset = AnimalBite_Details.objects.filter(bite_id__in=bite_ids)
                print(f"DEBUG VIEWS: Raw SQL found {queryset.count()} records for patient_id '{patient_id}'.")
            else:
                queryset = AnimalBite_Details.objects.none() 
                print(f"DEBUG VIEWS: Raw SQL found 0 records for patient_id '{patient_id}'. Returning empty queryset.")
        else:
            queryset = AnimalBite_Details.objects.filter(
                referral__patrec__patrec_type="Animal Bites"
            )
            print(f"DEBUG VIEWS: No specific patient_id provided. Returning all 'Animal Bites' records (count: {queryset.count()}).")
        
        final_queryset = queryset.order_by('-referral__date', '-referral__patrec__created_at')
        print(f"DEBUG VIEWS: Final queryset count before serialization: {final_queryset.count()}")
        return final_queryset

class CreateAnimalBiteRecordView(APIView):
    def post(self, request):
        print("🔄 Received request data:", request.data)
        
        serializer = AnimalBiteCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            print("❌ Serializer validation failed:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        print("✅ Validated data:", data)
        
        try:
            with transaction.atomic(): 
                # 1. Get the Patient instance based on pat_id (which can be Resident or Transient)
                pat_id_str = str(data['pat_id']).strip() 
                print(f"🔍 Looking for patient with pat_id: '{pat_id_str}'")
                
                try:
                    patient = Patient.objects.get(pk=pat_id_str) # Directly query by CharField PK
                    print(f"✅ Found patient: {patient} (pat_id: {patient.pat_id}, type: {patient.pat_type})")
                    
                except Patient.DoesNotExist:
                    print(f"❌ Patient with pat_id '{pat_id_str}' not found")
                    return Response(
                        {'error': f'Patient with ID {pat_id_str} not found'}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
                except Exception as e:
                    print(f"❌ Error finding patient: {str(e)}")
                    return Response(
                        {'error': f'Error finding patient: {str(e)}'}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                # 2. Get or Create PatientRecord
                print("🏥 Handling patient record...")
                try:
                    existing_patient_record = PatientRecord.objects.filter(
                        pat_id=patient,
                        patrec_type="Animal Bites"
                    ).first()

                    if existing_patient_record:
                        patient_record = existing_patient_record
                        print(f"✅ Found existing patient record: {patient_record.patrec_id}")
                    else:
                        patient_record = PatientRecord.objects.create(
                            pat_id=patient,
                            patrec_type="Animal Bites"
                        )
                        print(f"✅ Created new patient record: {patient_record.patrec_id}")
                except Exception as e:
                    print(f"❌ Error during patient record lookup/creation: {str(e)}")
                    return Response(
                        {'error': f'Error creating patient record: {str(e)}'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                # 3. Create AnimalBite_Referral (NO 'transient' field here now)
                print("📝 Creating referral...")
                try:
                    referral = AnimalBite_Referral.objects.create(
                        receiver=data['receiver'],
                        sender=data['sender'],
                        date=data['date'],
                        # transient=data['transient'], # REMOVED THIS LINE
                        patrec=patient_record 
                    )
                    print(f"✅ Created AnimalBite_Referral: {referral.referral_id}")
                except Exception as e:
                    print(f"❌ Error creating referral: {str(e)}")
                    return Response(
                        {'error': f'Error creating referral: {str(e)}'}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                # 4. Create AnimalBite_Details
                print("🦷 Creating bite details...")
                try:
                    exposure_site_value = data.get('exposure_site', '')
                    biting_animal_value = data.get('biting_animal', '')
                    
                    if exposure_site_value and str(exposure_site_value).startswith('custom-'):
                        exposure_site_value = data.get('exposure_site_name', exposure_site_value)
                    
                    if biting_animal_value and str(biting_animal_value).startswith('custom-'):
                        biting_animal_value = data.get('biting_animal_name', biting_animal_value)
                    
                    print(f"📦 Final exposure site to save: {exposure_site_value}")
                    print(f"📦 Final biting animal to save: {biting_animal_value}")

                    bite_details = AnimalBite_Details.objects.create(
                        exposure_type=data['exposure_type'],
                        exposure_site=exposure_site_value, 
                        biting_animal=biting_animal_value, 
                        actions_taken=data.get('actions_taken', ''),
                        referredby=data.get('referredby', ''),
                        referral=referral 
                    )
                    print(f"✅ Created AnimalBite_Details: {bite_details.bite_id}")
                except Exception as e:
                    print(f"❌ Error creating bite details: {str(e)}")
                    return Response(
                        {'error': f'Error creating bite details: {str(e)}'}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                response_data = {
                    'patrec_id': patient_record.patrec_id,
                    'referral_id': referral.referral_id,
                    'bite_id': bite_details.bite_id,
                    'message': 'Animal bite record created successfully'
                }
                
                print("✅ Successfully created complete animal bite record:", response_data)
                return Response(response_data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            print(f"❌ Transaction failed: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {"detail": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AnimalbiteDetailsView(generics.ListCreateAPIView):
    serializer_class = AnimalBiteDetailsSerializer
    queryset = AnimalBite_Details.objects.all() 

    def get_queryset(self):
        referral_id = self.request.query_params.get('referral', None)
        if referral_id:
            return AnimalBite_Details.objects.filter(referral=referral_id)
        return super().get_queryset() 

class AnimalbiteReferralView(generics.ListCreateAPIView):
    serializer_class = AnimalBiteReferralSerializer
    queryset = AnimalBite_Referral.objects.all()
