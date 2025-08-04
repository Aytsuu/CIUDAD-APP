from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.db.models import OuterRef, Exists, Prefetch
from rest_framework.response import Response
from .serializer import (
    MedicalHistorySerializer, ObstetricalHistorySerializer, PostpartumCompleteSerializer,
    PrenatalCompleteSerializer, PregnancyDetailSerializer,BodyMeasurementReadSerializer,
    PreviousPregnancyCreateSerializer, ObstetricRiskCodeCreateSerializer, PrenatalCareCreateSerializer,
    PrenatalDetailSerializer, PrenatalCareDetailSerializer, PrenatalFormCompleteViewSerializer
) 
# PreviousHospitalizationSerializer, PreviousPregnancySerializer, TTStatusSerializer,
#     Guide4ANCVisitSerializer, ChecklistSerializer,
from apps.patientrecords.serializers.patients_serializers import *
from .models import *

from datetime import datetime
import logging


# medical history GET
class PrenatalPatientMedHistoryView(generics.RetrieveAPIView):
    def get(self, request, pat_id):
        patient = get_object_or_404(Patient, pat_id=pat_id)

        try:
            all_patrec_w_medhis = PatientRecord.objects.filter(
                pat_id=patient,
                patrec_type__in=['Prenatal', 'Family Planning', 'Medical Consultation']
            )
            print("Found patient records w/ medical history for patient: ", patient.pat_id)

            if not all_patrec_w_medhis:
                return Response({
                    'patient': patient.pat_id,
                    'medical_history': [],
                    'message': 'No medical history found for this patient'
                })

            medical_history_obj = MedicalHistory.objects.filter(
                patrec__in=all_patrec_w_medhis 
            ).select_related('ill', 'patrec').order_by('-created_at')

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

# obstetrical history GET
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


# body measurement GET
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


@api_view(['GET'])
def get_all_active_pregnancies(request):
    """Get all active pregnancies with related prenatal and postpartum records"""
    try:
        pregnancies = Pregnancy.objects.filter(
            status="active"
        ).count()

        return Response({
            'success': True,
            'active_pregnancy_count': pregnancies
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error fetching active pregnancies: {str(e)}")
        return Response(
            {'error': f'Failed to fetch active pregnancies: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


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
def get_latest_patient_prenatal_record(request, pat_id):
    try:
        patient = Patient.objects.get(pat_id=pat_id)

        active_pregnancy = Pregnancy.objects.filter(
            pat_id=patient,
            status='active'
        ).order_by('-created_at').first()

        if not active_pregnancy:
            return Response({
                'pat_id': pat_id,
                'message': 'No active pregnancy',
                'latest_prenatal_form': None
            }, status=status.HTTP_200_OK)

        latest_pf = Prenatal_Form.objects.filter(
            pregnancy_id=active_pregnancy
        ).select_related(
            'pregnancy_id', 'patrec_id', 'vital_id', 'spouse_id', 'followv_id', 'bm_id', 'staff_id'
        ).prefetch_related(
            'pf_previous_hospitalization', 'tt_status', 'lab_result__lab_result_img',
            'pf_anc_visit', 'pf_checklist', 'pf_birth_plan', 
            'pf_obstetric_risk_code', 'pf_prenatal_care'
        ).order_by('-created_at').first()

        if not latest_pf:
            return Response({
                'pat_id': pat_id,
                'pregnancy_id': active_pregnancy.pregnancy_id,
                'message': 'No prenatal forms found for this pregnancy',
                'latest_prenatal_form': None
            }, status=status.HTTP_200_OK)

        serializer = PrenatalDetailSerializer(latest_pf)

        return Response({
            'pat_id': pat_id,
            'pregnancy_id': active_pregnancy.pregnancy_id,
            'latest_prenatal_form': serializer.data
        }, status=status.HTTP_200_OK)
    
    except Patien.DoesNotExist:
        return Response({
            'error': f'Patient does not exist'
        }, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        logger.error(f"Error fetching latest prenatal form for patient {pat_id}: {str(e)}")
        return Response({
            'error': f'Failed to fetch latest prenatal form: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
    

@api_view(['GET'])
def get_prenatal_followup_visit(request, pat_id):
    try:
        patient = Patient.objects.get(pat_id=pat_id)

        # check for latest active pregnancy with prenatal records
        active_pregnancy = Pregnancy.objects.filter(
            pat_id=patient,
            status="active"
        ).order_by('-created_at').first()

        if not active_pregnancy:
            return Response({
                'error': 'No active pregnancy found for this patient'
            }, status=status.HTTP_200_OK)


        # get all prenatal records
        prenatal_records = Prenatal_Form.objects.filter(pregnancy_id=active_pregnancy)
        if not prenatal_records.exists():
            return Response({
                'message': 'No prenatal records found for this pregnancy'
            }, status=status.HTTP_200_OK)

        response_data = {
            'pat_id': patient.pat_id,
            'pregnancy': {
                'pregnancy_id': active_pregnancy.pregnancy_id,
                'status': active_pregnancy.status,
                'created_at': active_pregnancy.created_at,
            },
            'prenatal_records': []
        }

        for prenatal in prenatal_records: 
            prenatal_data = {
                'prenatal_id': prenatal.pf_id,
                'created_at': prenatal.created_at,
                'followup_visits': None,
            }

            if prenatal.followv_id:
                try:
                    fu_visits = prenatal.followv_id
                    prenatal_data['followup_visits'] = {
                        'followv_id': fu_visits.followv_id,
                        'followv_date': fu_visits.followv_date,
                        'followv_status': fu_visits.followv_status,
                    }
                except FollowUpVisit.DoesNotExist:
                    prenatal_data['followup_visits'] = None

            response_data['prenatal_records'].append(prenatal_data)
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    except Patient.DoesNotExist:
        return Response({
            'error': f'Patient with ID {pat_id} does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f'Error fetching prenatal follow-up visits for patient {pat_id}: {str(e)}')
        return Response({
            'error': f'Failed to fetch prenatal follow-up visits: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['GET'])
def get_prenatal_prev_hospitalization(request, pat_id):
    """Get previous hospitalization records for a specific patient"""
    try:
        patient = Patient.objects.get(pat_id=pat_id)

        pf_records = Prenatal_Form.objects.filter(
            patrec_id__pat_id=patient
        ).select_related('patrec_id')

        if not pf_records.exists():
            return Response({
                'pat_id': pat_id,
                'message': 'No prenatal forms found for this patient',
                'previous_hospitalization': []
            }, status=status.HTTP_200_OK)
        
        prev_hospitalization = Previous_Hospitalization.objects.filter(
            pf_id__in=pf_records
        ).select_related('pf_id', 'pf_id__patrec_id').order_by('-pfph_id')

        if not prev_hospitalization.exists():
            return Response({
                'pat_id': pat_id,
                'message': 'No previous hospitalization records found for this patient',
                'previous_hospitalization': []
            }, status=status.HTTP_200_OK)

        prev_hospitalization_data = []
        for prev_hosp in prev_hospitalization:
            prev_hospitalization_data.append({
                'pf_id': prev_hosp.pf_id.pf_id,
                'pfph_id': prev_hosp.pfph_id,
                'prev_hospitalization': prev_hosp.prev_hospitalization,
                'prev_hospitalization_year': prev_hosp.prev_hospitalization_year
            })

        return Response({
            'pat_id': pat_id,
            'previous_hospitalization': prev_hospitalization_data
        }, status=status.HTTP_200_OK)

    except Patient.DoesNotExist:
        return Response({
            'error': f'Patient with ID {pat_id} does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f'Error fetching previous hospitalization records for patient {pat_id}: {str(e)}')
        return Response({
            'error': f'Failed to fetch previous hospitalization records: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_prenatal_prev_pregnancy(request, pat_id):
    try:
        patient = Patient.objects.get(pat_id=pat_id)

        latest_prev_pregnancy = Previous_Pregnancy.objects.filter(
            patrec_id__pat_id=patient,
        ).select_related('patrec_id').order_by('-pfpp_id').first()
        print(f'Found latest previous pregnancy record')

        if not latest_prev_pregnancy:
            return Response({
                'patient': patient.pat_id,
                'message': 'No previous pregnancy records found for this patient'
            }, status=status.HTTP_200_OK)

        prev_preg_data = PreviousPregnancyCreateSerializer(latest_prev_pregnancy).data

        return Response({
            'patient': patient.pat_id,
            'previous_pregnancy': prev_preg_data
        })

    except Exception as e:
        return Response({
            'error': f'Failed to fetch previous pregnancy records: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_prenatal_patient_tt_status(request, pat_id):
    try:
        patient = Patient.objects.get(pat_id=pat_id)

        tt_status = TTStatus.objects.filter(
            patrec_id__pat_id=patient
        ).select_related('patrec_id').order_by('-tt_id').first()

        if not tt_status:
            return Response({
                'patient': patient.pat_id,
                'message': 'No TT status records found for this patient'
            }, status=status.HTTP_200_OK)

        tt_data = {
            'tt_id': tt_status.tt_id,
            'tt_status': tt_status.tt_status,
            'tt_date': tt_status.tt_date.isoformat() if tt_status.tt_date else None,
            'patrec_id': tt_status.patrec_id.patrec_id if tt_status.patrec_id else None
        }

        return Response({
            'patient': patient.pat_id,
            'tt_status': tt_data
        }, status=status.HTTP_200_OK)

    except Patient.DoesNotExist:
        return Response({
            'error': f'Patient with ID {pat_id} does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f'Error fetching TT status for patient {pat_id}: {str(e)}')
        return Response({
            'error': f'Failed to fetch TT status: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_prenatal_records_with_care(request, pat_id):
    """Get all prenatal records with their prenatal care entries for a specific pregnancy"""
    try:
        patient = Patient.objects.get(pat_id=pat_id)
        
        # Get the pregnancy_id from query parameters
        pregnancy_id = request.GET.get('pregnancy_id')
        
        if not pregnancy_id:
            return Response({
                'error': 'pregnancy_id parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the pregnancy exists and belongs to this patient
        try:
            pregnancy = Pregnancy.objects.get(
                pregnancy_id=pregnancy_id,
                pat_id=patient
            )
        except Pregnancy.DoesNotExist:
            return Response({
                'error': f'Pregnancy with ID {pregnancy_id} not found for patient {pat_id}'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get all prenatal records for this specific pregnancy (regardless of status)
        prenatal_records = Prenatal_Form.objects.filter(
            pregnancy_id=pregnancy
        ).select_related(
            'patrec_id', 'pregnancy_id'
        ).prefetch_related(
            Prefetch('pf_prenatal_care', queryset=PrenatalCare.objects.select_related('pf_id__vital_id', 'pf_id__bm_id').order_by('pfpc_date'))
        ).order_by('created_at')
        
        if not prenatal_records.exists():
            return Response({
                'patient_id': pat_id,
                'pregnancy_id': pregnancy_id,
                'pregnancy_status': pregnancy.status,
                'message': 'No prenatal records found for this pregnancy',
                'prenatal_records': []
            }, status=status.HTTP_200_OK)
        
        records_data = []
        for i, record in enumerate(prenatal_records):
            prenatal_care_entries = record.pf_prenatal_care.all().order_by('pfpc_date')
            
            records_data.append({
                'pf_id': record.pf_id,
                'visit_number': i + 1,
                'created_at': record.created_at,
                'pregnancy_id': record.pregnancy_id.pregnancy_id,
                'prenatal_care_entries': PrenatalCareDetailSerializer(prenatal_care_entries, many=True).data
            })
        
        return Response({
            'patient_id': pat_id,
            'pregnancy_id': pregnancy_id,
            'pregnancy_status': pregnancy.status,
            'prenatal_records': records_data
        }, status=status.HTTP_200_OK)
        
    except Patient.DoesNotExist:
        return Response({
            'error': f'Patient with ID {pat_id} does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f'Error fetching prenatal records with care for patient {pat_id}: {str(e)}')
        return Response({
            'error': f'Failed to fetch prenatal records with care: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_prenatal_form_complete(request, pf_id):
    """Get complete prenatal form data by prenatal form ID"""
    try:
        # Get the prenatal form with all related data - fixed select_related
        prenatal_form = Prenatal_Form.objects.select_related(
            'patrec_id__pat_id__rp_id__per',
            'patrec_id__pat_id__trans_id', 
            'pregnancy_id',
            'vital_id',
            'bm_id',
            'spouse_id',
            'followv_id',
            'staff_id'
        ).prefetch_related(
            'pf_prenatal_care',
            'pf_previous_hospitalization',
            'lab_result',   
            'pf_anc_visit', 
            'pf_checklist', 
            'pf_birth_plan',
            'pf_obstetric_risk_code'
        ).get(pf_id=pf_id)
        
        # Serialize the complete prenatal form data
        serializer = PrenatalFormCompleteViewSerializer(prenatal_form)  # Use PrenatalFormCompleteViewSerializer instead

        return Response({
            'prenatal_form': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Prenatal_Form.DoesNotExist:
        return Response({
            'error': f'Prenatal form with ID {pf_id} does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f'Error fetching complete prenatal form {pf_id}: {str(e)}')
        return Response({
            'error': f'Failed to fetch prenatal form: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)