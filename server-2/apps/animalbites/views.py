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
# from apps.healthProfiling.models import ResidentProfile, Personal, FamilyComposition, Household, PersonalAddress, Address
from django.db.models import Count, Max, Subquery, OuterRef, F, Q
from django.db.models.functions import Concat, Cast
from rest_framework.pagination import PageNumberPagination
from django.db.models.fields import CharField


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'limit'  # Matches your frontend pageSize
    max_page_size = 100


class UniqueAnimalBitePatientsView(generics.ListAPIView):
    serializer_class = AnimalBiteUniquePatientSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        queryset = PatientRecord.objects.filter(patrec_type="Animal Bites")

        # Annotate latest referral and details from latest referral
        latest_referral_pk = Subquery(
            AnimalBite_Referral.objects.filter(patrec=OuterRef('pk')).order_by('-date').values('pk')[:1]
        )
        queryset = queryset.annotate(
            latest_referral_pk=latest_referral_pk,
            bite_count=Count('referrals', distinct=True),
            latest_date=Max('referrals__date'),
            latest_exposure=Subquery(
                AnimalBite_Details.objects.filter(referral=OuterRef('latest_referral_pk')).values('exposure_type')[:1]
            ),
            latest_site=Subquery(
                AnimalBite_Details.objects.filter(referral=OuterRef('latest_referral_pk')).values('exposure_site')[:1]
            ),
            latest_animal=Subquery(
                AnimalBite_Details.objects.filter(referral=OuterRef('latest_referral_pk')).values('biting_animal')[:1]
            ),
            latest_actions=Subquery(
                AnimalBite_Details.objects.filter(referral=OuterRef('latest_referral_pk')).values('actions_taken')[:1]
            ),
            latest_referredby=Subquery(
                AnimalBite_Details.objects.filter(referral=OuterRef('latest_referral_pk')).values('referredby')[:1]
            ),
        )

        # Apply filter
        filter_value = self.request.query_params.get('filter', 'all')
        if filter_value != 'all':
            if filter_value == 'bite':
                queryset = queryset.filter(latest_exposure='Bite')
            elif filter_value == 'non-bite':
                queryset = queryset.filter(latest_exposure='Non-bite')
            elif filter_value == 'resident':
                queryset = queryset.filter(pat_id__pat_type='Resident')
            elif filter_value == 'transient':
                queryset = queryset.filter(pat_id__pat_type='Transient')

        # Apply search - CORRECTED RELATIONSHIP PATHS
        search = self.request.query_params.get('search', '')
        if search:
            # Create Q objects for both resident and transient patient name searches
            resident_name_q = Q(
                Q(pat_id__rp_id__per__per_fname__icontains=search) |
                Q(pat_id__rp_id__per__per_lname__icontains=search) |
                Q(pat_id__rp_id__per__per_mname__icontains=search)
            )
            
            transient_name_q = Q(
                Q(pat_id__trans_id__tran_fname__icontains=search) |
                Q(pat_id__trans_id__tran_lname__icontains=search) |
                Q(pat_id__trans_id__tran_mname__icontains=search)
            )
            
            # Combine resident and transient name searches
            name_q = resident_name_q | transient_name_q
            
            # Other field searches
            other_fields_q = Q(
                Q(pat_id__rp_id__per__per_sex__icontains=search) |
                Q(pat_id__trans_id__tran_sex__icontains=search) |
                Q(pat_id__pat_type__icontains=search) |
                Q(latest_exposure__icontains=search) |
                Q(latest_site__icontains=search) |
                Q(latest_animal__icontains=search)
            )
            
            # Combine all search conditions
            queryset = queryset.filter(name_q | other_fields_q)

        # Apply ordering (for sorting)
        ordering = self.request.query_params.get('ordering')
        if ordering:
            if ordering == 'patient':
                # Order by resident last name first, then transient last name
                queryset = queryset.annotate(
                    resident_lname=F('pat_id__rp_id__per__per_lname'),
                    resident_fname=F('pat_id__rp_id__per__per_fname'),
                    transient_lname=F('pat_id__trans_id__tran_lname'),
                    transient_fname=F('pat_id__trans_id__tran_fname')
                ).order_by(
                    F('resident_lname').asc(nulls_last=True),
                    F('resident_fname').asc(nulls_last=True),
                    F('transient_lname').asc(nulls_last=True),
                    F('transient_fname').asc(nulls_last=True)
                )
            elif ordering == '-patient':
                queryset = queryset.annotate(
                    resident_lname=F('pat_id__rp_id__per__per_lname'),
                    resident_fname=F('pat_id__rp_id__per__per_fname'),
                    transient_lname=F('pat_id__trans_id__tran_lname'),
                    transient_fname=F('pat_id__trans_id__tran_fname')
                ).order_by(
                    F('resident_lname').desc(nulls_last=True),
                    F('resident_fname').desc(nulls_last=True),
                    F('transient_lname').desc(nulls_last=True),
                    F('transient_fname').desc(nulls_last=True)
                )
            elif ordering == 'patientType':
                queryset = queryset.order_by('pat_id__pat_type')
            elif ordering == '-patientType':
                queryset = queryset.order_by(F('pat_id__pat_type').desc())
            elif ordering == 'recordCount':
                queryset = queryset.order_by('bite_count')
            elif ordering == '-recordCount':
                queryset = queryset.order_by(F('bite_count').desc())
        else:
            # Default ordering
            queryset = queryset.order_by('-latest_date')

        return queryset
    
    def list(self, request, *args, **kwargs):
        if request.query_params.get('export'):
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        return super().list(request, *args, **kwargs)
    
class AnimalBiteStatsView(APIView):
    def get(self, request):
        qs = PatientRecord.objects.filter(patrec_type="Animal Bites")
        total = qs.count()
        residents = qs.filter(pat_id__pat_type="Resident").count()
        transients = qs.filter(pat_id__pat_type="Transient").count()
        resident_percentage = round((residents / total) * 100) if total > 0 else 0
        transient_percentage = round((transients / total) * 100) if total > 0 else 0
        return Response({
            'total': total,
            'residents': residents,
            'transients': transients,
            'residentPercentage': resident_percentage,
            'transientPercentage': transient_percentage
        })    
    

            
class AnimalBiteReferralCountView(APIView):
    def get(self, request, pat_id=None):
        try:
            if pat_id:
                # Count referrals for a specific patient through patrec
                count = AnimalBite_Referral.objects.filter(patrec__pat_id=pat_id).count()
                return Response({
                    'count': count,
                    'pat_id': pat_id,
                    'message': f'Animal bite referrals for patient {pat_id}: {count}'
                }, status=status.HTTP_200_OK)
            else:
                # Count all referrals if no pat_id provided
                count = AnimalBite_Referral.objects.count()
                return Response({
                    'count': count,
                    'message': f'Total animal bite referrals: {count}'
                }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AnimalBitePatientRecordCountView(APIView):
    def get(self, request):
        # Get the serialized data
        serialized_data = AnimalBitePatientRecordCountSerializer.get_patient_record_counts()
        
        # Validate and return the data
        serializer = AnimalBitePatientRecordCountSerializer(data=serialized_data, many=True)
        serializer.is_valid(raise_exception=True)
        
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
