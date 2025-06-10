import datetime
from django.shortcuts import render, get_object_or_404
from django.db import transaction, connection
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from .models import *
from apps.patientrecords.models import Patient, PatientRecord

class CreateAnimalBiteRecordView(generics.ListAPIView):
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
                # 1. Get the patient using explicit string casting in SQL
                pat_id = (data['pat_id'])
                print(f"🔍 Looking for patient with pat_id: '{pat_id}' (type: {type(pat_id)})")
                
                try:
                    # Use raw SQL with explicit CAST to handle type mismatch
                    with connection.cursor() as cursor:
                        # First, let's check what columns exist in the patient table
                        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'patient'")
                        columns = [row[0] for row in cursor.fetchall()]
                        print(f"📋 Patient table columns: {columns}")
                        
                        # Now query with explicit casting
                        cursor.execute("SELECT * FROM patient WHERE CAST(pat_id AS TEXT) = %s LIMIT 1", [str(pat_id)])

                        patient_row = cursor.fetchone()
                        
                        if not patient_row:
                            print(f"❌ Patient with pat_id '{pat_id}' not found")
                            return Response(
                                {'error': f'Patient with ID {pat_id} not found'}, 
                                status=status.HTTP_404_NOT_FOUND
                            )
                        
                        print(f"✅ Found patient row: {patient_row}")
                        
                        # Get column names to map the row data
                        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'patient' ORDER BY ordinal_position")
                        column_names = [row[0] for row in cursor.fetchall()]
                        
                        # Create a dictionary from the row data
                        patient_data = dict(zip(column_names, patient_row))
                        print(f"📊 Patient data: {patient_data}")
                        
                        # Get the primary key value (usually the first column or 'id')
                        pk_value = patient_data.get('id') or patient_data.get('patient_id') or patient_row[0]
                        
                        # Get the patient object using the primary key
                        patient = Patient.objects.get(pk=pk_value)
                        print(f"✅ Found patient object: {patient} (pat_id: {patient.pat_id})")
                    
                except Exception as e:
                    print(f"❌ Error finding patient: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    return Response(
                        {'error': f'Error finding patient: {str(e)}'}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                # 2. Create PatientRecord
                print("🏥 Creating patient record...")
                try:
                    patient_record = PatientRecord.objects.create(
                        pat_details=patient,
                        patrec_type="Animal Bites"
                    )
                    print(f"✅ Created patient record with ID: {patient_record.patrec_id}")
                except Exception as e:
                    print(f"❌ Error creating patient record: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    return Response(
                        {'error': f'Error creating patient record: {str(e)}'}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                # 3. Create Referral
                print("📝 Creating referral...")
                try:
                    referral = AnimalBite_Referral.objects.create(
                        receiver=data['receiver'],
                        sender=data['sender'],
                        date=data['date'],
                        transient=data['transient'],
                        patrec=patient_record
                    )
                    print(f"✅ Created referral with ID: {referral.referral_id}")
                except Exception as e:
                    print(f"❌ Error creating referral: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    return Response(
                        {'error': f'Error creating referral: {str(e)}'}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                # 4. Create Bite Details
                print("🦷 Creating bite details...")
                try:
                    # Helper function to get the name from option ID
                    def get_option_name(option_id: str, option_type: str) -> str:
                        exposure_site_map = {
                            "head": "Head", "neck": "Neck", "hand": "Hand",
                            "foot": "Foot", "trunk": "Trunk",
                        }
                        biting_animal_map = {
                            "dog": "Dog", "cat": "Cat", "rodent": "Rodent",
                        }
                        
                        if option_type == "exposure_site":
                            return exposure_site_map.get(option_id, option_id)
                        elif option_type == "biting_animal":
                            return biting_animal_map.get(option_id, option_id)
                        else:
                            return option_id
                    
                    exposure_site_name = get_option_name(data.get('exposure_site', ''), 'exposure_site')
                    biting_animal_name = get_option_name(data.get('biting_animal', ''), 'biting_animal')
                    
                    print(f"📦 Exposure site: {data.get('exposure_site')} -> {exposure_site_name}")
                    print(f"📦 Biting animal: {data.get('biting_animal')} -> {biting_animal_name}")
                    
                    bite_details = AnimalBite_Details.objects.create(
                        exposure_type=data['exposure_type'],
                        exposure_site=exposure_site_name,
                        biting_animal=biting_animal_name,
                        actions_taken=data.get('p_actions', ''),
                        referredby=data.get('p_referred', ''),
                        referral=referral
                    )
                    print(f"✅ Created bite details with ID: {bite_details.bite_id}")
                except Exception as e:
                    print(f"❌ Error creating bite details: {str(e)}")
                    import traceback
                    traceback.print_exc()
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
            print(f"❌ Unexpected error creating animal bite record: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Failed to create animal bite record'}(e), 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Alternative approach using Django ORM with explicit string conversion
class CreateAnimalBiteRecordAlternativeView(generics.ListCreateAPIView):
    def post(self, request):
        print("🔄 Alternative endpoint - Received request data:", request.data)
        
        serializer = AnimalBiteCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            print("❌ Serializer validation failed:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        print("✅ Validated data:", data)
        
        try:
            with transaction.atomic():
                # 1. Get the patient using a different approach
                pat_id = str(data['pat_id']).strip()
                print(f"🔍 Alternative: Looking for patient with pat_id: '{pat_id}'")
                
                try:
                    # Try multiple approaches to find the patient
                    patient = None
                    
                    # Approach 1: Try direct string comparison
                    try:
                        # patient = Patient.objects.get(pat_id=pat_id)
                        Patient.objects.get(str(pat_id=pat_id))
                        print("✅ Found patient with direct string comparison")
                    except Patient.DoesNotExist:
                        print("❌ Direct string comparison failed")
                    except Exception as e:
                        print(f"❌ Direct string comparison error: {e}")
                    
                    # Approach 2: Try with integer conversion if string failed
                    if not patient:
                        try:
                            pat_id_int = int(pat_id)
                            patient = Patient.objects.get(pat_id=pat_id_int)
                            print("✅ Found patient with integer conversion")
                        except (ValueError, Patient.DoesNotExist):
                            print("❌ Integer conversion failed")
                        except Exception as e:
                            print(f"❌ Integer conversion error: {e}")
                    
                    # Approach 3: Use raw SQL as last resort
                    if not patient:
                        with connection.cursor() as cursor:
                            cursor.execute(
                                "SELECT * FROM patient WHERE pat_id::text = %s LIMIT 1", 
                                [pat_id]
                            )
                            patient_row = cursor.fetchone()
                            
                            if patient_row:
                                # Get the primary key (assuming first column)
                                patient = Patient.objects.get(pk=patient_row[0])
                                print("✅ Found patient with raw SQL")
                    
                    if not patient:
                        print(f"❌ Patient with pat_id '{pat_id}' not found with any method")
                        return Response(
                            {'error': f'Patient with ID {pat_id} not found'}, 
                            status=status.HTTP_404_NOT_FOUND
                        )
                    
                    print(f"✅ Found patient: {patient} (pat_id: {patient.pat_id})")
                    
                except Exception as e:
                    print(f"❌ Error finding patient: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    return Response(
                        {'error': f'Error finding patient: {str(e)}'}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                # Rest of the creation process is the same
                print("🏥 Creating patient record...")
                patient_record = PatientRecord.objects.create(
                    pat_details=patient,
                    patrec_type="Animal Bites"
                )
                print(f"✅ Created patient record with ID: {patient_record.patrec_id}")
                
                print("📝 Creating referral...")
                referral = AnimalBite_Referral.objects.create(
                    receiver=data['receiver'],
                    sender=data['sender'],
                    date=data['date'],
                    transient=data['transient'],
                    patrec=patient_record
                )
                print(f"✅ Created referral with ID: {referral.referral_id}")
                
                print("🦷 Creating bite details...")
                def get_option_name(option_id: str, option_type: str) -> str:
                    exposure_site_map = {
                        "head": "Head", "neck": "Neck", "hand": "Hand",
                        "foot": "Foot", "trunk": "Trunk",
                    }
                    biting_animal_map = {
                        "dog": "Dog", "cat": "Cat", "rodent": "Rodent",
                    }
                    
                    if option_type == "exposure_site":
                        return exposure_site_map.get(option_id, option_id)
                    elif option_type == "biting_animal":
                        return biting_animal_map.get(option_id, option_id)
                    else:
                        return option_id
                
                exposure_site_name = get_option_name(data.get('exposure_site', ''), 'exposure_site')
                biting_animal_name = get_option_name(data.get('biting_animal', ''), 'biting_animal')
                
                bite_details = AnimalBite_Details.objects.create(
                    exposure_type=data['exposure_type'],
                    exposure_site=exposure_site_name,
                    biting_animal=biting_animal_name,
                    actions_taken=data.get('p_actions', ''),
                    referredby=data.get('p_referred', ''),
                    referral=referral
                )
                print(f"✅ Created bite details with ID: {bite_details.bite_id}")
                
                response_data = {
                    'patrec_id': patient_record.patrec_id,
                    'referral_id': referral.referral_id,
                    'bite_id': bite_details.bite_id,
                    'message': 'Animal bite record created successfully'
                }
                
                print("✅ Successfully created complete animal bite record:", response_data)
                return Response(response_data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            print(f"❌ Unexpected error creating animal bite record: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Failed to create animal bite record: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Keep the other views the same
class AnimalbiteDetailsView(generics.ListCreateAPIView):
    serializer_class = AnimalBiteDetailsSerializer
    queryset = AnimalBite_Details.objects.all()
    
    def get_queryset(self):
        referral_id = self.request.query_params.get('referral', None)
        if referral_id:
            return AnimalBite_Details.objects.filter(referral=referral_id)
        return AnimalBite_Details.objects.all()

class AnimalbiteReferralView(generics.ListCreateAPIView):
    serializer_class = AnimalBiteReferralSerializer
    queryset = AnimalBite_Referral.objects.all()

class AnimalbitePatientDetailsView(generics.ListAPIView):
    serializer_class = AnimalBitePatientDetailsSerializer
    
    def get_queryset(self):
        return AnimalBite_Details.objects.filter(
            referral__patrec__patrec_type="Animal Bites"
        ).select_related(
            'referral',
            'referral__patrec'
        ).order_by('-referral__date')

class UpdateAnimalBiteRecordView(generics.ListCreateAPIView):
    def put(self, request, bite_id):
        try:
            bite_detail = get_object_or_404(AnimalBite_Details, bite_id=bite_id)
            referral = bite_detail.referral
            
            bite_detail.exposure_type = request.data.get('exposure_type', bite_detail.exposure_type)
            bite_detail.exposure_site = request.data.get('exposure_site', bite_detail.exposure_site)
            bite_detail.biting_animal = request.data.get('biting_animal', bite_detail.biting_animal)
            bite_detail.actions_taken = request.data.get('actions_taken', bite_detail.actions_taken)
            bite_detail.referredby = request.data.get('referredby', bite_detail.referredby)
            bite_detail.save()
            
            if 'receiver' in request.data:
                referral.receiver = request.data['receiver']
            if 'sender' in request.data:
                referral.sender = request.data['sender']
            if 'date' in request.data:
                referral.date = request.data['date']
            if 'transient' in request.data:
                referral.transient = request.data['transient']
            referral.save()
            
            serializer = AnimalBiteDetailsSerializer(bite_detail)
            return Response({
                'message': 'Animal bite record updated successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to update animal bite record: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DeleteAnimalBitePatientView(generics.DestroyAPIView):
    def delete(self, request, patient_id):
        try:
            with transaction.atomic():
                patient_id_str = str(patient_id)
                
                # Use raw SQL for deletion as well
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        DELETE FROM patientrecord 
                        WHERE pat_details_id IN (
                            SELECT id FROM patient WHERE CAST(pat_id AS TEXT) = %s
                        ) AND patrec_type = 'Animal Bites'
                        """, 
                        [patient_id_str]
                    )
                    deleted_count = cursor.rowcount
                
                if deleted_count == 0:
                    return Response(
                        {"detail": "No animal bite records found for this patient"}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                return Response({
                    "message": f"Successfully deleted {deleted_count} animal bite record(s) for patient {patient_id}",
                    "deleted_records": deleted_count
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response(
                {"detail": f"Error deleting patient records: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DeleteAnimalBiteRecordView(APIView):
    def delete(self, request, bite_id):
        try:
            with transaction.atomic():
                bite_detail = get_object_or_404(AnimalBite_Details, bite_id=bite_id)
                referral = bite_detail.referral
                patient_record = referral.patrec
                
                bite_detail.delete()
                referral.delete()
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

class AnimalbiteDetailsDeleteView(generics.DestroyAPIView):
    serializer_class = AnimalBiteDetailsSerializer
    queryset = AnimalBite_Details.objects.all()
    lookup_field = 'bite_id'
    
    def destroy(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                instance = self.get_object()
                referral = instance.referral
                patient_record = referral.patrec
                
                instance.delete()
                referral.delete()
                patient_record.delete()
                
                return Response(
                    {"message": "Record deleted successfully"}, 
                    status=status.HTTP_204_NO_CONTENT
                )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
