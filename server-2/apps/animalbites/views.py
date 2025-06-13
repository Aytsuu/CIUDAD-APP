# import datetime
# from django.shortcuts import render, get_object_or_404
# from django.db import transaction, connection
# from rest_framework import generics, status
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from .serializers import *
# from .models import *
# from apps.patientrecords.models import Patient, PatientRecord # Assuming Patient and PatientRecord models exist here


# class CreateAnimalBiteRecordView(generics.ListAPIView):
#     def post(self, request):
#         print("🔄 Received request data:", request.data)

#         serializer = AnimalBiteCreateSerializer(data=request.data) # Assuming AnimalBiteCreateSerializer is defined elsewhere

#         if not serializer.is_valid():
#             print("❌ Serializer validation failed:", serializer.errors)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#         data = serializer.validated_data
#         print("✅ Validated data:", data)

#         try:
#             with transaction.atomic():
#                 # 1. Get the patient using explicit string casting in SQL
#                 pat_id_from_request = data['pat_id'] # Get the patient ID from validated data
#                 print(f"🔍 Looking for patient with pat_id: '{pat_id_from_request}' (type: {type(pat_id_from_request)})")

#                 # Ensure you are using the correct Patient model
#                 # This Patient should be from apps.healthProfiling.models or wherever your actual Patient model is defined
#                 try:
#                     patient_instance = Patient.objects.get(pk=pat_id_from_request) # Use pk for primary key lookup
#                     print(f"✅ Found existing patient: {patient_instance.pk}")
#                 except Patient.DoesNotExist:
#                     print(f"⚠️ Patient with pat_id '{pat_id_from_request}' not found. Please ensure the patient exists before creating a record.")
#                     return Response(
#                         {"pat_id": ["Patient with this ID does not exist."]},
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
#                 except Exception as e:
#                     print(f"❌ Error fetching patient: {e}")
#                     return Response(
#                         {"pat_id": [f"Error retrieving patient: {str(e)}"]},
#                         status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                     )

#                 # --- THIS IS THE CRITICAL CHANGE ---
#                 # Now, create or get the PatientRecord using 'pat_id'
#                 try:
#                     patient_record, created = PatientRecord.objects.get_or_create(
#                         pat_id=patient_instance, # <--- CHANGED FROM pat_details to pat_id
#                         patrec_type="Animal Bites"
#                     )
#                     if created:
#                         print(f"✅ Created new patient record: {patient_record.patrec_id}")
#                     else:
#                         print(f"✅ Found existing patient record: {patient_record.patrec_id}")
#                 except Exception as e:
#                     print(f"❌ Error creating/getting patient record: {e}")
#                     return Response(
#                         {"patient_record_creation": [f"Error during patient record operation: {str(e)}"]},
#                         status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                     )
#                 # --- END CRITICAL CHANGE ---

#                 # 2. Create AnimalBite_Referral
#                 referral = AnimalBite_Referral.objects.create(
#                     receiver=data['receiver'],
#                     sender=data['sender'],
#                     date=data['date'], # <--- Removed fromisoformat()
#                     transient=data['transient'],
#                     patrec=patient_record
#                 )
#                 print(f"✅ Created AnimalBite_Referral: {referral.referral_id}")

#                 # 3. Create AnimalBite_Details
#                 bite_detail = AnimalBite_Details.objects.create(
#                     exposure_type=data['exposure_type'],
#                     actions_taken=data.get('actions_taken', ''),
#                     referredby=data.get('referredby', ''),
#                     biting_animal=data['biting_animal'],
#                     exposure_site=data['exposure_site'],
#                     referral=referral # This is correct
#                 )
#                 print(f"✅ Created AnimalBite_Details: {bite_detail.bite_id}")

#                 # Success response
#                 return Response(
#                     {"message": "Animal bite record created successfully!",
#                      "patient_record_id": patient_record.patrec_id,
#                      "referral_id": referral.referral_id,
#                      "bite_detail_id": bite_detail.bite_id
#                     },
#                     status=status.HTTP_201_CREATED
#                 )

#         except Exception as e:
#             # Catch any unexpected errors during the entire transaction
#             print(f"❌ Transaction failed: {e}")
#             return Response(
#                 {"detail": f"An unexpected error occurred: {str(e)}"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# # Alternative approach (updated to use ORM directly for patient lookup)
# # class CreateAnimalBiteRecordAlternativeView(generics.ListCreateAPIView):
# #     def post(self, request):
# #         print("🔄 Alternative endpoint - Received request data:", request.data)
        
# #         serializer = AnimalBiteCreateSerializer(data=request.data)
        
# #         if not serializer.is_valid():
# #             print("❌ Serializer validation failed:", serializer.errors)
# #             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
# #         data = serializer.validated_data
# #         print("✅ Validated data:", data)
        
# #         try:
# #             with transaction.atomic():
# #                 pat_id_from_request = data['pat_id']
# #                 print(f"🔍 Alternative: Looking for patient with pat_id: '{pat_id_from_request}'")
                
# #                 try:
# #                     patient = Patient.objects.get(pat_id=pat_id_from_request)
# #                     print(f"✅ Found patient: {patient} (pat_id: {patient.pat_id})")
                    
# #                 except Patient.DoesNotExist:
# #                     print(f"❌ Patient with pat_id '{pat_id_from_request}' not found")
# #                     return Response(
# #                         {'error': f'Patient with ID {pat_id_from_request} not found'}, 
# #                         status=status.HTTP_404_NOT_FOUND
# #                     )
# #                 except Exception as e:
# #                     print(f"❌ Error finding patient: {str(e)}")
# #                     import traceback
# #                     traceback.print_exc()
# #                     return Response(
# #                         {'error': f'Error finding patient: {str(e)}'}, 
# #                         status=status.HTTP_500_INTERNAL_SERVER_ERROR
# #                     )
                
# #                 # Rest of the creation process is the same
# #                 print("🏥 Creating patient record...")
# #                 patient_record = PatientRecord.objects.create(
# #                     pat_details=patient,
# #                     patrec_type="Animal Bites"
# #                 )
# #                 print(f"✅ Created patient record with ID: {patient_record.patrec_id}")
                
# #                 print("📝 Creating referral...")
# #                 referral = AnimalBite_Referral.objects.create(
# #                     receiver=data['receiver'],
# #                     sender=data['sender'],
# #                     date=data['date'],
# #                     transient=data['transient'],
# #                     patrec=patient_record
# #                 )
# #                 print(f"✅ Created referral with ID: {referral.referral_id}")
                
# #                 print("🦷 Creating bite details...")
# #                 def get_option_name(option_id: str, option_type: str) -> str:
# #                     exposure_site_map = {
# #                         "head": "Head", "neck": "Neck", "hand": "Hand",
# #                         "foot": "Foot", "trunk": "Trunk", "others": "Others", 
# #                     }
# #                     biting_animal_map = {
# #                         "dog": "Dog", "cat": "Cat", "rodent": "Rodent", "others": "Others",
# #                     }
                    
# #                     if option_type == "exposure_site":
# #                         return exposure_site_map.get(option_id, option_id)
# #                     elif option_type == "biting_animal":
# #                         return biting_animal_map.get(option_id, option_id)
# #                     else:
# #                         return option_id
                
# #                 exposure_site_name = get_option_name(data.get('exposure_site', ''), 'exposure_site')
# #                 biting_animal_name = get_option_name(data.get('biting_animal', ''), 'biting_animal')
                
# #                 bite_details = AnimalBite_Details.objects.create(
# #                     exposure_type=data['exposure_type'],
# #                     exposure_site=exposure_site_name,
# #                     biting_animal=biting_animal_name,
# #                     actions_taken=data.get('actions_taken', ''), # Using 'actions_taken' as key from serializer
# #                     referredby=data.get('referredby', ''),       # Using 'referredby' as key from serializer
# #                     referral=referral
# #                 )
# #                 print(f"✅ Created bite details with ID: {bite_details.bite_id}")
                
# #                 response_data = {
# #                     'patrec_id': patient_record.patrec_id,
# #                     'referral_id': referral.referral_id,
# #                     'bite_id': bite_details.bite_id,
# #                     'message': 'Animal bite record created successfully'
# #                 }
                
# #                 print("✅ Successfully created complete animal bite record:", response_data)
# #                 return Response(response_data, status=status.HTTP_201_CREATED)
                
# #         except Exception as e:
# #             print(f"❌ Unexpected error creating animal bite record: {str(e)}")
# #             import traceback
# #             traceback.print_exc()
# #             return Response(
# #                 {'error': f'Failed to create animal bite record: {str(e)}'}, 
# #                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
# #             )




# class AnimalbiteDetailsView(generics.ListCreateAPIView):
#     serializer_class = AnimalBiteDetailsSerializer
#     queryset = AnimalBite_Details.objects.all()
    
#     def get_queryset(self):
#         referral_id = self.request.query_params.get('referral', None)
#         if referral_id:
#             return AnimalBite_Details.objects.filter(referral=referral_id)
#         return AnimalBite_Details.objects.all()

# class AnimalbiteReferralView(generics.ListCreateAPIView):
#     serializer_class = AnimalBiteReferralSerializer
#     queryset = AnimalBite_Referral.objects.all()

# class AnimalbitePatientDetailsView(generics.ListAPIView):
#     serializer_class = AnimalBitePatientDetailsSerializer
    
#     def get_queryset(self):
#         queryset = AnimalBite_Details.objects.filter(
#             referral__patrec__patrec_type="Animal Bites"
#         # ).select_related(
#         #     'referral',
#         #     'referral_patrec',
#         #     'referral_patrec_pat_details_personal_info'
#         # ).order_by('-referral_date', 'referral_patrec_pat_details_personal_info_pat_id')

#         # patient_id = self.request.query_params.get('patient_id', None)
#         # if patient_id:
#         #     queryset = queryset.filter(referral_patrec_pat_details_personal_info_pat_id=patient_id)
#         )
#         return queryset

# class UpdateAnimalBiteRecordView(generics.ListCreateAPIView):
#     def put(self, request, bite_id):
#         try:
#             bite_detail = get_object_or_404(AnimalBite_Details, bite_id=bite_id)
#             referral = bite_detail.referral
            
#             bite_detail.exposure_type = request.data.get('exposure_type', bite_detail.exposure_type)
#             bite_detail.exposure_site = request.data.get('exposure_site', bite_detail.exposure_site)
#             bite_detail.biting_animal = request.data.get('biting_animal', bite_detail.biting_animal)
#             bite_detail.actions_taken = request.data.get('actions_taken', bite_detail.actions_taken)
#             bite_detail.referredby = request.data.get('referredby', bite_detail.referredby)
#             bite_detail.save()
            
#             if 'receiver' in request.data:
#                 referral.receiver = request.data['receiver']
#             if 'sender' in request.data:
#                 referral.sender = request.data['sender']
#             if 'date' in request.data:
#                 referral.date = request.data['date']
#             if 'transient' in request.data:
#                 referral.transient = request.data['transient']
#             referral.save()
            
#             serializer = AnimalBiteDetailsSerializer(bite_detail)
#             return Response({
#                 'message': 'Animal bite record updated successfully',
#                 'data': serializer.data
#             }, status=status.HTTP_200_OK)
            
#         except Exception as e:
#             return Response(
#                 {'error': f'Failed to update animal bite record: {str(e)}'}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class DeleteAnimalBitePatientView(generics.DestroyAPIView):
#     def delete(self, request, patient_id): # patient_id here is the pat_id (varchar) from the frontend
#         try:
#             with transaction.atomic():
#                 pat_id_to_delete = str(patient_id) # Ensure it's treated as string
                
#                 # Find the Patient object first
#                 try:
#                     patient = Patient.objects.get(pat_id=pat_id_to_delete)
#                 except Patient.DoesNotExist:
#                     return Response(
#                         {"detail": f"Patient with ID {pat_id_to_delete} not found."},
#                         status=status.HTTP_404_NOT_FOUND
#                     )
                
#                 # Get all PatientRecord instances for this patient where patrec_type is "Animal Bites"
#                 patient_records_to_delete = PatientRecord.objects.filter(
#                     pat_details=patient, 
#                     patrec_type="Animal Bites"
#                 )
                
#                 deleted_count = patient_records_to_delete.count()
                
#                 if deleted_count == 0:
#                     return Response(
#                         {"detail": "No animal bite records found for this patient to delete."}, 
#                         status=status.HTTP_404_NOT_FOUND
#                     )
                
#                 # Deleting PatientRecord objects will cascade delete related AnimalBite_Referral and AnimalBite_Details
#                 patient_records_to_delete.delete()
                
#                 return Response({
#                     "message": f"Successfully deleted {deleted_count} animal bite record(s) for patient {pat_id_to_delete}",
#                     "deleted_records": deleted_count
#                 }, status=status.HTTP_200_OK)
                
#         except Exception as e:
#             return Response(
#                 {"detail": f"Error deleting patient records: {str(e)}"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class DeleteAnimalBiteRecordView(APIView):
#     def delete(self, request, bite_id):
#         try:
#             with transaction.atomic():
#                 bite_detail = get_object_or_404(AnimalBite_Details, bite_id=bite_id)
#                 referral = bite_detail.referral
#                 patient_record = referral.patrec
                
#                 bite_detail.delete()
#                 referral.delete()
#                 patient_record.delete()
                
#                 return Response({
#                     "message": f"Successfully deleted bite record {bite_id}",
#                     "deleted_bite_id": bite_id
#                 }, status=status.HTTP_200_OK)
                
#         except Exception as e:
#             return Response(
#                 {"detail": f"Error deleting bite record: {str(e)}"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class AnimalbiteDetailsDeleteView(generics.DestroyAPIView):
#     serializer_class = AnimalBiteDetailsSerializer
#     queryset = AnimalBite_Details.objects.all()
#     lookup_field = 'bite_id'
    
#     def destroy(self, request, *args, **kwargs):
#         try:
#             with transaction.atomic():
#                 instance = self.get_object()
#                 referral = instance.referral
#                 patient_record = referral.patrec
                
#                 instance.delete()
#                 referral.delete()
#                 patient_record.delete()
                
#                 return Response(
#                     {"message": "Record deleted successfully"}, 
#                     status=status.HTTP_204_NO_CONTENT
#                 )
#         except Exception as e:
#             return Response(
#                 {"error": str(e)}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )


import datetime
from django.shortcuts import render, get_object_or_404
from django.db import transaction, connection
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from .models import *
# Ensure Patient and PatientRecord models are correctly imported from their app
from apps.patientrecords.models import Patient, PatientRecord 
from django.db.models import F # Import F object for database expressions

class AnimalbitePatientDetailsView(generics.ListAPIView):
    """
    API view to list all animal bite records, including comprehensive patient details.
    Supports filtering by patient_id and orders results by the latest referral date.
    """
    serializer_class = AnimalBitePatientDetailsSerializer
    
    def get_queryset(self):
        # Get patient_id from URL kwargs (for /patient-details/<str:patient_id>/)
        # This is how individual patient view passes the ID.
        patient_id = self.kwargs.get('patient_id') 
        # Fallback to query_params for cases like /patient-details/?patient_id=X (less common for this view)
        if not patient_id:
            patient_id = self.request.query_params.get('patient_id', None)

        print(f"DEBUG VIEWS: get_queryset called. Received patient_id: '{patient_id}'")

        if patient_id:
            # If a patient_id is provided, use raw SQL to precisely filter.
            # This ensures correct behavior with CharField primary keys and complex joins.
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
                    AND pr.patrec_type = 'Animal Bites' -- Explicitly filter by patient record type
                    """,
                    [str(patient_id)] # Ensure the ID is treated as a string for comparison
                )
                # Fetch all bite_ids that match the patient_id
                bite_ids = [row[0] for row in cursor.fetchall()]
            
            if bite_ids:
                # Construct the queryset using the filtered bite_ids
                queryset = AnimalBite_Details.objects.filter(bite_id__in=bite_ids)
                print(f"DEBUG VIEWS: Raw SQL found {queryset.count()} records for patient_id '{patient_id}'.")
            else:
                # If raw SQL finds no bite_ids for the patient, return an empty queryset
                queryset = AnimalBite_Details.objects.none() 
                print(f"DEBUG VIEWS: Raw SQL found 0 records for patient_id '{patient_id}'. Returning empty queryset.")
        else:
            # If no patient_id is provided (this path should be for the overall list view),
            # return all "Animal Bites" records without patient-specific filtering.
            queryset = AnimalBite_Details.objects.filter(
                referral__patrec__patrec_type="Animal Bites"
            )
            print(f"DEBUG VIEWS: No specific patient_id provided. Returning all 'Animal Bites' records (count: {queryset.count()}).")
        
        # Finally, order the results to show the latest records first
        final_queryset = queryset.order_by('-referral__date', '-referral__patrec__created_at')
        print(f"DEBUG VIEWS: Final queryset count before serialization: {final_queryset.count()}")
        return final_queryset

class CreateAnimalBiteRecordView(APIView):
    """
    API view to handle the creation of a new Animal Bite record.
    It orchestrates the creation of PatientRecord, AnimalBite_Referral, and AnimalBite_Details.
    """
    def post(self, request):
        print("🔄 Received request data:", request.data)
        
        serializer = AnimalBiteCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            print("❌ Serializer validation failed:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        print("✅ Validated data:", data)
        
        try:
            with transaction.atomic(): # Ensures atomicity of the database operations
                # 1. Get the Patient instance
                pat_id_str = str(data['pat_id']).strip() # Ensure pat_id is a string and strip whitespace
                print(f"🔍 Looking for patient with pat_id: '{pat_id_str}'")
                
                try:
                    # Use raw SQL to query the Patient model's pat_id (CharField)
                    # This avoids potential ORM issues with CharField primary keys
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "SELECT * FROM patient WHERE CAST(pat_id AS TEXT) = %s LIMIT 1", 
                            [pat_id_str]
                        )
                        patient_row = cursor.fetchone()
                    
                    if not patient_row:
                        print(f"❌ Patient with pat_id '{pat_id_str}' not found")
                        return Response(
                            {'error': f'Patient with ID {pat_id_str} not found'}, 
                            status=status.HTTP_404_NOT_FOUND
                        )
                    
                    # Reconstruct the Patient object from the fetched row (assuming row[0] is the primary key)
                    patient = Patient.objects.get(pk=patient_row[0])
                    print(f"✅ Found patient: {patient} (pat_id: {patient.pat_id})")
                    
                except Exception as e:
                    print(f"❌ Error finding patient: {str(e)}")
                    return Response(
                        {'error': f'Error finding patient: {str(e)}'}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                # 2. Create PatientRecord
                print("🏥 Handling patient record...")
                try:
                    # Attempt to get the latest PatientRecord for "Animal Bites" for this patient
                    # If multiple exist, .first() will pick the latest one due to PatientRecord's default ordering.
                    existing_patient_record = PatientRecord.objects.filter(
                        pat_id=patient,
                        patrec_type="Animal Bites"
                    ).first()

                    if existing_patient_record:
                        patient_record = existing_patient_record
                        print(f"✅ Found existing patient record: {patient_record.patrec_id}")
                    else:
                        # If no existing record, create a new one
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
                
                # 3. Create AnimalBite_Referral
                print("📝 Creating referral...")
                try:
                    referral = AnimalBite_Referral.objects.create(
                        receiver=data['receiver'],
                        sender=data['sender'],
                        date=data['date'],
                        transient=data['transient'],
                        patrec=patient_record # Link to the PatientRecord
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
                    # Handle custom exposure sites and biting animals by using the actual name
                    # sent from the frontend if a "custom-" ID was selected.
                    exposure_site_value = data.get('exposure_site', '')
                    biting_animal_value = data.get('biting_animal', '')
                    
                    # If the selected option was a custom one, use the provided name field
                    if exposure_site_value and str(exposure_site_value).startswith('custom-'):
                        exposure_site_value = data.get('exposure_site_name', exposure_site_value)
                    
                    if biting_animal_value and str(biting_animal_value).startswith('custom-'):
                        biting_animal_value = data.get('biting_animal_name', biting_animal_value)
                    
                    print(f"📦 Final exposure site to save: {exposure_site_value}")
                    print(f"📦 Final biting animal to save: {biting_animal_value}")

                    bite_details = AnimalBite_Details.objects.create(
                        exposure_type=data['exposure_type'],
                        exposure_site=exposure_site_value, # Use the resolved value
                        biting_animal=biting_animal_value, # Use the resolved value
                        actions_taken=data.get('actions_taken', ''),
                        referredby=data.get('referredby', ''),
                        referral=referral # Link to the AnimalBite_Referral
                    )
                    print(f"✅ Created AnimalBite_Details: {bite_details.bite_id}")
                except Exception as e:
                    print(f"❌ Error creating bite details: {str(e)}")
                    return Response(
                        {'error': f'Error creating bite details: {str(e)}'}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                # Success response
                response_data = {
                    'patrec_id': patient_record.patrec_id,
                    'referral_id': referral.referral_id,
                    'bite_id': bite_details.bite_id,
                    'message': 'Animal bite record created successfully'
                }
                
                print("✅ Successfully created complete animal bite record:", response_data)
                return Response(response_data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            # Catch any unexpected errors during the entire transaction
            print(f"❌ Transaction failed: {e}")
            import traceback
            traceback.print_exc() # Print full traceback for debugging
            return Response(
                {"detail": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AnimalbiteDetailsView(generics.ListCreateAPIView):
    """
    API view for listing and creating AnimalBite_Details.
    Can be filtered by referral ID.
    """
    serializer_class = AnimalBiteDetailsSerializer
    queryset = AnimalBite_Details.objects.all() # Base queryset

    def get_queryset(self):
        # Allow filtering by referral_id if provided in query parameters
        referral_id = self.request.query_params.get('referral', None)
        if referral_id:
            return AnimalBite_Details.objects.filter(referral=referral_id)
        return super().get_queryset() # Return all if no filter

class AnimalbiteReferralView(generics.ListCreateAPIView):
    """
    API view for listing and creating AnimalBite_Referral objects.
    """
    serializer_class = AnimalBiteReferralSerializer
    queryset = AnimalBite_Referral.objects.all()

class UpdateAnimalBiteRecordView(APIView):
    """
    API view to update an existing Animal Bite record (details and related referral).
    """
    def put(self, request, bite_id):
        try:
            # Retrieve the AnimalBite_Details instance or return 404
            bite_detail = get_object_or_404(AnimalBite_Details, bite_id=bite_id)
            referral = bite_detail.referral # Get the related referral object
            
            # Update fields of AnimalBite_Details from request data
            # Use .get() with default to keep existing value if not provided
            bite_detail.exposure_type = request.data.get('exposure_type', bite_detail.exposure_type)
            bite_detail.exposure_site = request.data.get('exposure_site', bite_detail.exposure_site)
            bite_detail.biting_animal = request.data.get('biting_animal', bite_detail.biting_animal)
            bite_detail.actions_taken = request.data.get('actions_taken', bite_detail.actions_taken)
            bite_detail.referredby = request.data.get('referredby', bite_detail.referredby)
            bite_detail.save() # Save changes to bite details
            
            # Update fields of AnimalBite_Referral from request data
            if 'receiver' in request.data:
                referral.receiver = request.data['receiver']
            if 'sender' in request.data:
                referral.sender = request.data['sender']
            if 'date' in request.data:
                referral.date = request.data['date']
            if 'transient' in request.data:
                referral.transient = request.data['transient']
            referral.save() # Save changes to referral
            
            # Serialize the updated bite_detail and return success response
            serializer = AnimalBiteDetailsSerializer(bite_detail)
            return Response({
                'message': 'Animal bite record updated successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Handle any exceptions during the update process
            return Response(
                {'error': f'Failed to update animal bite record: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DeleteAnimalBitePatientView(APIView):
    """
    API view to delete all animal bite records associated with a specific patient.
    Deletes PatientRecord, which cascades to AnimalBite_Referral and AnimalBite_Details.
    """
    def delete(self, request, patient_id): # patient_id here is the pat_id (varchar) from the frontend
        try:
            with transaction.atomic(): # Ensures atomicity
                patient_id_str = str(patient_id).strip() # Ensure it's treated as string
                
                # Use raw SQL to find patrec_ids for "Animal Bites" records belonging to the patient
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        SELECT pr.patrec_id 
                        FROM patient_record pr
                        JOIN patient p ON pr.pat_id_id = p.pat_id
                        WHERE CAST(p.pat_id AS TEXT) = %s AND pr.patrec_type = 'Animal Bites'
                        """, 
                        [patient_id_str]
                    )
                    patient_record_ids = [row[0] for row in cursor.fetchall()]
                
                if not patient_record_ids:
                    return Response(
                        {"detail": "No animal bite records found for this patient to delete."}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                # Delete all identified PatientRecord instances
                # This will trigger CASCADE deletes for related AnimalBite_Referral and AnimalBite_Details
                for patrec_id in patient_record_ids:
                    PatientRecord.objects.filter(patrec_id=patrec_id).delete()
                
                return Response({
                    "message": f"Successfully deleted {len(patient_record_ids)} animal bite record(s) for patient {patient_id_str}",
                    "deleted_records": len(patient_record_ids)
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            # Handle any exceptions during the deletion process
            return Response(
                {"detail": f"Error deleting patient records: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DeleteAnimalBiteRecordView(APIView):
    """
    API view to delete a single Animal Bite record by its bite_id.
    It deletes the AnimalBite_Details, its associated AnimalBite_Referral,
    and the PatientRecord if it's the only one for that patient and type.
    """
    def delete(self, request, bite_id):
        try:
            with transaction.atomic():
                bite_detail = get_object_or_404(AnimalBite_Details, bite_id=bite_id)
                referral = bite_detail.referral
                patient_record = referral.patrec
                
                bite_detail.delete()
                referral.delete()
                
                # Check if this patient_record is now orphaned or if other referrals exist
                # If no other referrals link to this patient_record, delete the patient_record too.
                if not AnimalBite_Referral.objects.filter(patrec=patient_record).exists():
                    patient_record.delete()
                
                return Response({
                    "message": f"Successfully deleted bite record {bite_id}",
                    "deleted_bite_id": bite_id
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response(
                {"detail": f"Error deleting bite record: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# This class seems redundant given DeleteAnimalBiteRecordView
class AnimalbiteDetailsDeleteView(generics.DestroyAPIView):
    """
    Alternative API view for deleting a single AnimalBite_Details record.
    This one uses Django REST Framework's DestroyAPIView for standard behavior.
    """
    serializer_class = AnimalBiteDetailsSerializer
    queryset = AnimalBite_Details.objects.all()
    lookup_field = 'bite_id'
    
    def destroy(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                instance = self.get_object() # Gets the AnimalBite_Details instance
                referral = instance.referral
                patient_record = referral.patrec
                
                instance.delete() # Deletes AnimalBite_Details
                referral.delete() # Deletes AnimalBite_Referral
                patient_record.delete() # Deletes PatientRecord
                
                return Response(
                    {"message": "Record deleted successfully"}, 
                    status=status.HTTP_204_NO_CONTENT
                )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
