from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.db.models import OuterRef, Exists
from rest_framework.response import Response
from .serializer import *
from apps.patientrecords.serializers.patients_serializers import *

from datetime import datetime
import logging

# Create your views here.

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

@api_view(['GET'])
def get_maternal_patients(request):
    try:
        maternal_patients = Patient.objects.filter(
            Exists(PatientRecord.objects.filter(
                pat_id=OuterRef('pat_id'),
                patrec_type__in=['Prenatal', 'Postpartum Care']
            ))
        ).distinct()

        serializer = PatientSerializer(maternal_patients, many=True)

        return Response({
            'success': True,
            'patients': serializer.data,
            'count': maternal_patients.count()
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
            
        }, status=500)


@api_view(['GET'])
def get_postpartum_records(request):
    """Get all postpartum records with related data"""
    try:
        records = PostpartumRecord.objects.select_related(
            'patrec_id', 'vital_id', 'spouse_id', 'followv_id', 'pregnancy_id'
        ).prefetch_related(
            'postpartum_delivery_record', 'postpartum_assessment'
        ).all()
        
        serializer = PostpartumCompleteSerializer(records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error fetching postpartum records: {str(e)}")
        return Response(
            {'error': f'Failed to fetch postpartum records: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_postpartum_record_detail(request, ppr_id):
    """Get specific postpartum record with all related data"""
    try:
        record = PostpartumRecord.objects.select_related(
            'patrec_id', 'vital_id', 'spouse_id', 'followv_id'
        ).prefetch_related(
            'postpartum_delivery_record', 'postpartum_assessment'
        ).get(ppr_id=ppr_id)
        
        serializer = PostpartumCompleteSerializer(record)
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


@api_view(['GET'])
def get_patient_postpartum_count(request, pat_id):
    """Get count of postpartum records for a specific patient"""
    try:
        # verify patient exists
        patient = Patient.objects.get(pat_id=pat_id)
        
        # count postpartum records for this patient
        count = PostpartumRecord.objects.filter(
            patrec_id__pat_id=patient
        ).count()
        
        return Response({
            'pat_id': pat_id,
            'postpartum_count': count,
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


@api_view(['GET'])
def get_patient_postpartum_records(request, pat_id):
    """Get all postpartum records for a specific patient"""
    try:
        patient = Patient.objects.get(pat_id=pat_id)
        
        # get postpartum records for this patient
        records = PostpartumRecord.objects.filter(
            patrec_id__pat_id=patient
        ).select_related(
            'patrec_id', 'vital_id', 'spouse_id', 'followv_id'
        ).prefetch_related(
            'postpartum_delivery_record', 'postpartum_assessment'
        ).order_by('-created_at')  # Most recent first
        
        serializer = PostpartumCompleteSerializer(records, many=True)
        return Response({
            'pat_id': pat_id,
            'count': records.count(),
            'records': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Patient.DoesNotExist:
        return Response(
            {'error': f'Patient with ID {pat_id} does not exist'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error fetching postpartum records for patient {pat_id}: {str(e)}")
        return Response(
            {'error': f'Failed to fetch postpartum records: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class PrenatalRecordCreateView(generics.CreateAPIView):
    serializer_class = PrenatalFormSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        prenatal_record = serializer.save()
        
        return Response({
            'pf_id': prenatal_record.pf_id,
            'message': 'Prenatal record created successfully'
        }, status=status.HTTP_201_CREATED)
    
# **Previous Hospitalization
class PreviousHospitalizationView(generics.ListCreateAPIView):
    serializer_class = PreviousHospitalizationSerializer
    queryset = Previous_Hospitalization.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
# **Previous Pregnancy**
class PreviousPregnancyView(generics.ListCreateAPIView):
    serializer_class = PreviousPregnancySerializer
    queryset = Previous_Pregnancy.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

# **TT Status**
class TTStatusView(generics.ListCreateAPIView):
    serializer_class = TTStatusSerializer
    queryset = TT_Status.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
# **Lab Result Dates**
# class LabResultDatesView(generics.ListCreateAPIView):
#     serializer_class = LabResultDatesSerializer
#     queryset = Lab_Result_Dates.objects.all()

#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
    
class Guide4ANCVisitView(generics.ListCreateAPIView):
    serializer_class = Guide4ANCVisitSerializer
    queryset = Guide4ANCVisit.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class ChecklistView(generics.ListCreateAPIView):
    serializer_class = ChecklistSerializer
    queryset = Checklist.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
# class BirthPlanView(generics.ListCreateAPIView):
#     serializer_class = BirthPlanSerializer
#     queryset = BirthPlan.objects.all()

#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)