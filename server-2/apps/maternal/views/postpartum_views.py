from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.db.models import OuterRef, Exists, Prefetch, Q, Count
from rest_framework.response import Response

from apps.maternal.serializers.serializer import *
from apps.maternal.serializers.postpartum_serializer import *
from apps.maternal.serializers.prenatal_serializer import *
from apps.maternal.serializers.pregnancy_serializer import *

from apps.patientrecords.serializers.patients_serializers import *
from apps.pagination import StandardResultsPagination
from ..models import *
from ..utils import *

import logging

# postpartum create
logger = logging.getLogger(__name__)
class PostpartumRecordCreateView(generics.CreateAPIView):
    serializer_class = PostpartumCompleteSerializer
    queryset = PostpartumRecord.objects.all()

    def create(self, request, *args, **kwargs):
        logger.info(f"Creating postpartum record with data: {request.data}")
        
        try:
            serializer = self.get_serializer(data=request.data)
            
            # Add detailed validation error logging
            if not serializer.is_valid():
                logger.error(f"Serializer validation errors: {serializer.errors}")
                return Response(
                    {
                        'error': 'Validation failed',
                        'details': serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            postpartum_record = serializer.save()
            logger.info(f"Successfully created postpartum record: {postpartum_record.ppr_id}")
            
            return Response(
                {
                    'message': 'Postpartum record created successfully',
                    'ppr_id': postpartum_record.ppr_id,
                    'patrec_id': postpartum_record.patrec_id.patrec_id if postpartum_record.patrec_id else None,
                    'data': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
                
        except Exception as e:
            logger.error(f"Error creating postpartum record: {str(e)}")
            return Response(
                {'error': f'Failed to create postpartum record: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

# postpartum detail retrieve
class PostpartumRecordDetailView(generics.RetrieveAPIView):
    queryset = PostpartumRecord.objects.all()
    serializer_class = PostpartumCompleteSerializer

    def get(self, request, *args, **kwargs):
        ppr_id = kwargs.get('ppr_id')
        try:
            record = self.get_object()
            serializer = self.get_serializer(record)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except PostpartumRecord.DoesNotExist:
            return Response(
                {'error': f'Postpartum record with ID {ppr_id} does not exist'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error fetching postpartum record: {str(e)}")
            return Response(
                {'error': f'Failed to fetch postpartum record: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

# postpartum count
@api_view(['GET'])
def get_patient_postpartum_count(request, pat_id):
    """Get count of postpartum records for a specific patient"""
    try:
        patient = Patient.objects.get(pat_id=pat_id)

        pregnancies = Pregnancy.objects.filter(pat_id=patient)
        
        ppr_count = PostpartumRecord.objects.filter(
            pregnancy_id__in=pregnancies
        ).values('pregnancy_id').distinct().count()
        
        return Response({
            'pat_id': pat_id,
            'postpartum_count': ppr_count,
            'patient_name': f"{patient.personal_info.per_fname} {patient.personal_info.per_lname}" if hasattr(patient, 'personal_info') else "Unknown"
        }, status=status.HTTP_200_OK)
        
    except Patient.DoesNotExist:
        return Response(
            {'error': f'Patient with ID {pat_id} does not exist'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error fetching postpartum count for patient {pat_id}: {str(e)}")
        return Response(
            {'error': f'Failed to fetch postpartum count: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

# postpartum latest record retrieve
@api_view(['GET'])
def get_latest_patient_postpartum_records(request, pat_id):
    def get_spouse_info_for_resident_mother(patient):
        # Returns spouse info if patient is Resident and role is Mother
        spouse_details = None
        try:
            # Get ResidentProfile
            rp = getattr(patient, 'rp_id', None)
            if not rp:
                return None
            # Find FamilyComposition where rp == patient.rp_id and fc_role == 'Mother'
            from apps.healthProfiling.models import FamilyComposition
            mother_fc = FamilyComposition.objects.filter(rp=rp, fc_role__iexact='Mother').first()
            if not mother_fc:
                return None
            fam = getattr(mother_fc, 'fam', None)
            if not fam:
                return None
            # Find FamilyComposition in same family where fc_role == 'Father'
            father_fc = FamilyComposition.objects.filter(fam=fam, fc_role__iexact='Father').first()
            if not father_fc:
                return None
            father_rp = getattr(father_fc, 'rp', None)
            if not father_rp:
                return None
            personal_info = getattr(father_rp, 'per', None)
            spouse_details = {
                "fam_id": getattr(fam, 'fam_id', None),
                "fc_role": getattr(father_fc, 'fc_role', None),
                "fc_id": getattr(father_fc, 'fc_id', None),
                "spouse_info": {
                    "per_fname": getattr(personal_info, 'per_fname', None),
                    "per_mname": getattr(personal_info, 'per_mname', None),
                    "per_lname": getattr(personal_info, 'per_lname', None),
                    "per_suffix": getattr(personal_info, 'per_suffix', None),
                    "per_dob": getattr(personal_info, 'per_dob', None),
                    "per_sex": getattr(personal_info, 'per_sex', None),
                    "per_contact": getattr(personal_info, 'per_contact', None),
                    "per_status": getattr(personal_info, 'per_status', None),
                    "per_religion": getattr(personal_info, 'per_religion', None),
                    "per_edAttainment": getattr(personal_info, 'per_edAttainment', None)
                } if personal_info else None
            }
        except Exception as e:
            logger.error(f"Error fetching spouse info for resident mother: {str(e)}")
        return spouse_details

    # Main function logic
    try:
        patient = Patient.objects.get(pat_id=pat_id)
        latest_record = PostpartumRecord.objects.filter(
            patrec_id__pat_id=patient
        ).select_related(
            'patrec_id', 'vital_id', 'spouse_id', 'followv_id', 'pregnancy_id'
        ).prefetch_related(
            'postpartum_delivery_record', 'postpartum_assessment'
        ).order_by('-created_at').first()

        if not latest_record:
            # Try to get spouse info from prenatal records if no postpartum record exists
            spouse_info = None
            try:
                latest_prenatal = Prenatal_Form.objects.filter(
                    patrec_id__pat_id=patient,
                    spouse_id__isnull=False
                ).select_related('spouse_id').order_by('-created_at').first()

                if latest_prenatal and latest_prenatal.spouse_id:
                    spouse_info = {
                        "spouse_lname": latest_prenatal.spouse_id.spouse_lname,
                        "spouse_fname": latest_prenatal.spouse_id.spouse_fname,
                        "spouse_mname": latest_prenatal.spouse_id.spouse_mname,
                        "spouse_dob": latest_prenatal.spouse_id.spouse_dob,
                    }
                elif getattr(patient, 'pat_type', None) == 'Resident':
                    spouse_info = get_spouse_info_for_resident_mother(patient)
            except Exception as e:
                logger.error(f"Error fetching spouse info from prenatal: {str(e)}")

            return Response({
                'pat_id': pat_id,
                'message': 'No postpartum records found for this patient',
                'latest_postpartum_record': None,
                'spouse_info': spouse_info
            }, status=status.HTTP_200_OK)

        # If postpartum record exists, get spouse info from it
        spouse_info = None
        if latest_record.spouse_id:
            spouse_info = {
                "spouse_lname": latest_record.spouse_id.spouse_lname,
                "spouse_fname": latest_record.spouse_id.spouse_fname,
                "spouse_mname": latest_record.spouse_id.spouse_mname,
                "spouse_dob": latest_record.spouse_id.spouse_dob,
            }
        elif getattr(patient, 'pat_type', None) == 'Resident':
            spouse_info = get_spouse_info_for_resident_mother(patient)

        serializer = PostpartumCompleteSerializer(latest_record)

        return Response({
            'pat_id': pat_id,
            'latest_postpartum_record': serializer.data,
            'spouse_info': spouse_info
        }, status=status.HTTP_200_OK)

    except Patient.DoesNotExist:
        return Response(
            {'error': f'Patient with ID {pat_id} does not exist'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error fetching latest postpartum record for patient {pat_id}: {str(e)}")
        return Response(
            {'error': f'Failed to fetch latest postpartum record: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

class PostpartumRecordsListView(generics.ListAPIView):
    serializer_class = PostpartumCompleteSerializer

    def get_queryset(self):
        pat_id = self.kwargs.get('pat_id')
        return PostpartumRecord.objects.filter(
            patrec_id__pat_id__pat_id=pat_id
        ).order_by('-created_at')
    

class PostpartumPartumFormView(generics.RetrieveAPIView):
    serializer_class = PostpartumCompleteSerializer
    queryset = PostpartumRecord.objects.all()
    lookup_field = 'ppr_id'