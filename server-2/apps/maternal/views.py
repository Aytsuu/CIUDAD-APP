from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.db.models import OuterRef, Exists, Prefetch
from rest_framework.response import Response
from .serializer import (
    MedicalHistorySerializer, ObstetricalHistorySerializer, PostpartumCompleteSerializer,
    PrenatalCompleteSerializer, PregnancyDetailSerializer,BodyMeasurementReadSerializer,
    ObstetricRiskCodeCreateSerializer, PrenatalCareCreateSerializer
) 
# PreviousHospitalizationSerializer, PreviousPregnancySerializer, TTStatusSerializer,
#     Guide4ANCVisitSerializer, ChecklistSerializer,
from apps.patientrecords.serializers.patients_serializers import *
from .models import *

from datetime import datetime
import logging

# Create your views here.

class PrenatalPatientMedHistoryView(generics.RetrieveAPIView):
    def get(self, request, pat_id):
        patient = get_object_or_404(Patient, pat_id=pat_id)

        try:
            all_patrec_w_medhis = PatientRecord.objects.filter(
                pat_id=patient,
                patrec_type__in=['Prenatal', 'Familly Planning', 'Medical Consultation']
            )
            print("Found patient records w/ medical history for patient: ", patient.pat_id)

            if not all_patrec_w_medhis:
                return Response({
                    'patient': patient.pat_id,
                    'medical_history': [],
                    'message': 'No medical history found for this patient'
                })

            medical_history_obj = MedicalHistory.objects.filter(
                patrec_id__in=all_patrec_w_medhis 
            ).select_related('ill_id', 'patrec_id').order_by('-created_at')

            print(f'Found medical history for patient: {patient.pat_id}')

            medhis_data = MedicalHistorySerializer(medical_history_obj, many=True).data
            
            return Response({
                'patient': patient.pat_id,
                'medical_history': medhis_data
            })

        except Exception as e:
            print(f"Error fetching medical history: {e}")
            return Response({
                'patient': patient.pat_id,
                'medical_history': []
            })

class PrenatalPatientObsHistoryView(generics.RetrieveAPIView):
    def get(self, request, pat_id):
        patient = get_object_or_404(Patient, pat_id=pat_id)

        try:
            obstetrical_history_obj = Obstetrical_History.objects.filter(
                patrec_id__pat_id=patient
            ).select_related('patrec_id').order_by('-obs_id').first()

            print(f'Found obstetrical history for patient: {patient.pat_id}')

            obs_data = ObstetricalHistorySerializer(obstetrical_history_obj).data
            
            return Response({
                'patient': patient.pat_id,
                'obstetrical_history': obs_data
            })

        except Exception as e:
            print(f"Error fetching obstetrical history: {e}")
            return Response({
                'patient': patient.pat_id,
                'obstetrical_history': []
            })  


class PrenatalPatientBodyMeasurementView(generics.RetrieveAPIView):
    def get(self, request, pat_id):
        patient = get_object_or_404(Patient, pat_id=pat_id)

        try:
            body_measurement_obj = BodyMeasurement.objects.filter(
                patrec_id__pat_id=patient
            ).select_related('patrec').order_by('-created_at').first()
            print(f'Found body measurement for patient: {patient.pat_id}')

            bm_data = BodyMeasurementReadSerializer(body_measurement_obj).data

            return Response({
                'patient': patient.pat_id,
                'body_measurement': bm_data
            })
        
        except Exception as e:
            print(f'Error fetching body measurement: {e}')
            return Response({
                'patient': patient.pat_id,
                'body_measurement': []
            })


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


# @api_view(['GET'])
# def get_postpartum_records(request):
#     """Get all postpartum records with related data"""
#     try:
#         records = PostpartumRecord.objects.select_related(
#             'patrec_id', 'vital_id', 'spouse_id', 'followv_id', 'pregnancy_id'
#         ).prefetch_related(
#             'postpartum_delivery_record', 'postpartum_assessment'
#         ).all()
        
#         serializer = PostpartumCompleteSerializer(records, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)
        
#     except Exception as e:
#         logger.error(f"Error fetching postpartum records: {str(e)}")
#         return Response(
#             {'error': f'Failed to fetch postpartum records: {str(e)}'},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
        # )


# @api_view(['GET'])
# def get_postpartum_record_detail(request, ppr_id):
#     """Get specific postpartum record with all related data"""
#     try:
#         record = PostpartumRecord.objects.select_related(
#             'patrec_id', 'vital_id', 'spouse_id', 'followv_id'
#         ).prefetch_related(
#             'postpartum_delivery_record', 'postpartum_assessment'
#         ).get(ppr_id=ppr_id)
        
#         serializer = PostpartumCompleteSerializer(record)
#         return Response(serializer.data, status=status.HTTP_200_OK)
        
#     except PostpartumRecord.DoesNotExist:
#         return Response(
#             {'error': f'Postpartum record with ID {ppr_id} does not exist'},
#             status=status.HTTP_404_NOT_FOUND
#         )
#     except Exception as e:
#         logger.error(f"Error fetching postpartum record: {str(e)}")
#         return Response(
#             {'error': f'Failed to fetch postpartum record: {str(e)}'},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )


@api_view(['GET'])
def get_patient_prenatal_count(request, pat_id):
    """"Get count of prenatal records for a specific patient"""
    try:
        patient = Patient.objects.get(pat_id=pat_id)

        pf_count = Prenatal_Form.objects.filter(patrec_id__pat_id=patient).count()

        return Response({
            'pat_id': pat_id,
            'prenatal_count': pf_count,
            'patient_name' : f"{patient.personal_info.per_fname} {patient.personal_info.per_lname}" if hasattr(patient, 'personal_info') else "Unknown"
        }, status=status.HTTP_200_OK) 
    
    except Patient.DoesNotExist:
        return Response({
            'error': f'Patient with ID {pat_id} does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        logger.error(f'Error fetching prenatal count for {pat_id}')
        return Response({
            'error' : f'Failed to fetch prenatal count'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_patient_postpartum_count(request, pat_id):
    """Get count of postpartum records for a specific patient"""
    try:
        # verify patient exists
        patient = Patient.objects.get(pat_id=pat_id)
        
        # count postpartum records for this patient
        count = PostpartumRecord.objects.filter(patrec_id__pat_id=patient).count()
        
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
   
@api_view(['GET'])
def get_patient_pregnancy_records(request, pat_id):
    try:
        patient = Patient.objects.get(pat_id=pat_id)
        
        pregnancies = Pregnancy.objects.filter(pat_id=patient).order_by('-created_at').prefetch_related(
            Prefetch('prenatal_form', queryset=Prenatal_Form.objects.all().order_by('-created_at')),
            Prefetch('postpartum_record', queryset=PostpartumRecord.objects.prefetch_related('postpartum_delivery_record', 'vital_id').order_by('-created_at'))
        )

        serializer = PregnancyDetailSerializer(pregnancies, many=True)
        return Response(
            serializer.data,
            status= status.HTTP_200_OK
        )
    except Patient.DoesNotExist:
        return Response(
            {'error': f'Patient with ID {pat_id} does not exist'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f'Error fetching pregnancy records for patient: {pat_id} - {str(e)}')
        return Response(
            {'error': f'Failed to fetch pregnancy records: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

class PrenatalRecordCreateView(generics.CreateAPIView):
    serializer_class = PrenatalCompleteSerializer # Use the new complete serializer
    queryset = Prenatal_Form.objects.all() # Keep queryset for DRF

    def create(self, request, *args, **kwargs):
        logger.info(f"Creating prenatal record with data: {request.data}")
        
        try:
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                logger.error(f"Serializer validation errors: {serializer.errors}")
                return Response(
                    {
                        'error': 'Validation failed',
                        'details': serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            prenatal_record = serializer.save()
            logger.info(f"Successfully created prenatal record: {prenatal_record.pf_id}")
            
            return Response(
                {
                    'message': 'Prenatal record created successfully',
                    'pf_id': prenatal_record.pf_id,
                    'patrec_id': prenatal_record.patrec_id.patrec_id if prenatal_record.patrec_id else None,
                    'data': serializer.data # Return serialized data for confirmation
                },
                status=status.HTTP_201_CREATED
            )
                
        except Exception as e:
            logger.error(f"Error creating prenatal record: {str(e)}")
            return Response(
                {'error': f'Failed to create prenatal record: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
