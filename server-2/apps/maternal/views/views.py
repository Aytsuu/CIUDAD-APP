from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.views import APIView
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

logger = logging.getLogger(__name__)

# for charts 
class MaternalPatientsListView(APIView):
    def get(self, request, month):
        try:
            # Validate month format (YYYY-MM)
            try:
                year, month_num = map(int, month.split('-'))
                if month_num < 1 or month_num > 12:
                    raise ValueError
            except ValueError:
                return Response({
                    'success': False,
                    'error': 'Invalid month format. Use YYYY-MM.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get maternal patients with records created in the specified month
            queryset = Patient.objects.filter(
                Exists(PatientRecord.objects.filter(
                    pat_id=OuterRef('pat_id'),
                    patrec_type__in=['Prenatal', 'Postpartum Care'],
                    created_at__year=year,
                    created_at__month=month_num
                ))
            ).annotate(
                completed_pregnancy_count=Count('pregnancy', filter=Q(pregnancy__status='active'))
            ).distinct()

            # Serialize the data
            serializer = PatientSerializer(queryset, many=True)
            
            # Count prenatal and postpartum records for the month
            prenatal_count = PatientRecord.objects.filter(
                patrec_type='Prenatal',
                created_at__year=year,
                created_at__month=month_num
            ).count()
            
            postpartum_count = PatientRecord.objects.filter(
                patrec_type='Postpartum Care',
                created_at__year=year,
                created_at__month=month_num
            ).count()

            return Response({
                'success': True,
                'month': month,
                'patients': serializer.data,
                'total_patients': queryset.count(),
                'prenatal_records': prenatal_count,
                'postpartum_records': postpartum_count,
                'total_records': prenatal_count + postpartum_count
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching maternal patients for month {month}: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# medical history GET
class PrenatalPatientMedHistoryView(generics.RetrieveAPIView):
    def get(self, request, pat_id):
        patient = get_object_or_404(Patient, pat_id=pat_id)
        
        # Get search parameter from query string
        search_query = request.GET.get('search', '').strip()
        
        try:
            all_patrec_w_medhis = PatientRecord.objects.filter(
                pat_id=patient
            )
            print("Found patient records w/ medical history for patient: ", patient.pat_id)

            if not all_patrec_w_medhis:
                return Response({
                    'patient': patient.pat_id,
                    'medical_history': [],
                    'message': 'No medical history found for this patient',
                    'search_query': search_query if search_query else None
                })

            medical_history_obj = MedicalHistory.objects.filter(
                patrec__in=all_patrec_w_medhis 
            ).select_related('ill', 'patrec').order_by('-created_at')
            
            # Apply search filter if search query is provided
            if search_query:
                medical_history_obj = medical_history_obj.filter(
                    models.Q(ill__illname__icontains=search_query) |
                    models.Q(ill__ill_code__icontains=search_query) |
                    models.Q(ill__ill_description__icontains=search_query)
                )
                print(f"Applied search filter: '{search_query}'")

            print(f'Found medical history for patient: {patient.pat_id}')

            medhis_data = MedicalHistorySerializer(medical_history_obj, many=True).data
            
            return Response({
                'patient': patient.pat_id,
                'medical_history': medhis_data,
                'search_query': search_query if search_query else None,
                'search_results_count': len(medhis_data)
            })

        except Exception as e:
            print(f"Error fetching medical history: {e}")
            return Response({
                'patient': patient.pat_id,
                'medical_history': [],
                'search_query': search_query if search_query else None,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            


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
            }, status=status.HTTP_200_OK)

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
                pat_id=patient
            ).select_related('pat').order_by('-created_at').first()
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

# prenatal form CREATE
class PrenatalRecordCreateView(generics.CreateAPIView):
    serializer_class = PrenatalCompleteSerializer
    queryset = Prenatal_Form.objects.all()

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

# illness CREATE
class IllnessCreateView(generics.CreateAPIView):
    serializer_class = IllnessCreateSerializer
    queryset = Illness.objects.all()

    def create(self, request, *args, **kwargs):
        logger.info(f"Creating illness record with data: {request.data}")

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

            illness_record = serializer.save()
            logger.info(f"Successfully created illness: {illness_record.ill_id}")

            return Response({
                'message': 'Illness record created successfully',
                'ill_id': illness_record.ill_id,
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': f'Failed to create illness record: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        
class MaternalPatientListView(generics.ListAPIView):
    serializer_class = PatientSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = Patient.objects.filter(
            Exists(PatientRecord.objects.filter(
                pat_id=OuterRef('pat_id'),
                patrec_type__in=['Prenatal', 'Postpartum Care']
            ))
        ).annotate(
            completed_pregnancy_count=Count('pregnancy', filter=Q(pregnancy__status='active'))
        ).distinct()


        params = self.request.query_params
        status = params.get('status')
        search = params.get('search')

        filters = Q()

        if status and status.lower() not in ["all", ""]:
            filters &= Q(pat_type=status)

        if search:
            search = search.strip()
            if search:
                search_filters = Q()

                search_filters |= (
                    Q(rp_id__per__per_fname__icontains=search) |
                    Q(rp_id__per__per_mname__icontains=search) |
                    Q(rp_id__per__per_lname__icontains=search) 
                ) 

                search_filters |= (
                    Q(trans_id__tran_fname__icontains=search) |
                    Q(trans_id__tran_lname__icontains=search) |
                    Q(trans_id__tran_mname__icontains=search)
                )
                
                filters &= search_filters
        
        if filters:
            queryset = queryset.filter(filters)
            
        return queryset


# Counts
class MaternalCountView(generics.ListAPIView):
    def get(self, request):
        try:
            # Get all unique pat_ids from Pregnancy
            pregnancy_pat_ids = Pregnancy.objects.values_list('pat_id', flat=True)
            resident_set = set()
            transient_set = set()
            for pat_id in pregnancy_pat_ids:
                pat_id_str = str(pat_id)
                if pat_id_str.startswith('PR'):
                    resident_set.add(pat_id_str)
                elif pat_id_str.startswith('PT'):
                    transient_set.add(pat_id_str)

            resident_patients = len(resident_set)
            transient_patients = len(transient_set)
            total_patients = resident_patients + transient_patients
            active_pregnancy_count = Pregnancy.objects.filter(status='active').count()

            return Response({
                'total_records': total_patients,
                'active_pregnancies': active_pregnancy_count,
                'resident_patients': resident_patients,
                'transient_patients': transient_patients,
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Error fetching counts: {str(e)}")
            return Response({
                'error': 'Failed to fetch counts'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['GET'])
def get_patient_prenatal_count(request, pat_id):
    """"Get count of prenatal records for a specific patient"""
    try:
        patient = Patient.objects.get(pat_id=pat_id)

        pregnancies = Pregnancy.objects.filter(
            pat_id=patient
        )

        pf_count = Prenatal_Form.objects.filter(
            pregnancy_id__in=pregnancies
        ).values('pregnancy_id').distinct().count()

        pregnancies = Pregnancy.objects.filter(
            pat_id=patient
        )

        pf_count = Prenatal_Form.objects.filter(
            pregnancy_id__in=pregnancies
        ).values('pregnancy_id').distinct().count()


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
def get_latest_patient_prenatal_record(request, pat_id):

    try:
        patient = Patient.objects.get(pat_id=pat_id)

        active_pregnancy = Pregnancy.objects.filter(
            pat_id=patient,
            status='active'
        ).order_by('-created_at').first()

        spouse_data = None

        if patient.pat_type == 'Resident' and patient.rp_id:
            from apps.healthProfiling.models import FamilyComposition
            # Find current family composition for this resident
            current_composition = FamilyComposition.objects.filter(
                rp=patient.rp_id
            ).order_by('-fam__fam_date_registered', '-fc_id').first()
            if current_composition and current_composition.fc_role.lower() == 'mother':
                # Find Father in same family
                father_comp = FamilyComposition.objects.filter(
                    fam=current_composition.fam,
                    fc_role__iexact='Father'
                ).select_related('rp__per').first()
                if father_comp and father_comp.rp and hasattr(father_comp.rp, 'per') and father_comp.rp.per:
                    father_personal = father_comp.rp.per
                    spouse_data = {
                        'fam_id': str(current_composition.fam.fam_id),
                        'fc_role': 'Father',
                        'fc_id': father_comp.fc_id,
                        'spouse_info': {
                            'per_fname': father_personal.per_fname,
                            'per_mname': father_personal.per_mname,
                            'per_lname': father_personal.per_lname,
                            'per_suffix': father_personal.per_suffix,
                            'per_dob': father_personal.per_dob,
                            'per_sex': father_personal.per_sex,
                            'per_contact': father_personal.per_contact,
                            'per_status': father_personal.per_status,
                            'per_religion': father_personal.per_religion,
                            'per_edAttainment': father_personal.per_edAttainment,
                        }
                    }

        if not active_pregnancy:
            latest_completed_or_pregloss = Pregnancy.objects.filter(
                pat_id=patient,
                status__in=['completed', 'pregnancy loss']
            ).order_by('-created_at').first()

            # Get latest occupation from any prenatal form for this patient
            latest_occupation = None
            latest_pf_with_occupation = Prenatal_Form.objects.filter(
                patrec_id__pat_id=patient,
                pf_occupation__isnull=False
            ).exclude(pf_occupation='').order_by('-created_at').first()
            
            if latest_pf_with_occupation:
                latest_occupation = latest_pf_with_occupation.pf_occupation

            if not spouse_data and latest_completed_or_pregloss:
                latest_pf_spouse = Prenatal_Form.objects.filter(
                    pregnancy_id=latest_completed_or_pregloss
                ).select_related('spouse_id').order_by('created_at').first()
                if latest_pf_spouse:
                    spouse_serializer = SpouseCreateSerializer(latest_pf_spouse.spouse_id)
                    spouse_data = spouse_serializer.data
            
            return Response({
                'pat_id': pat_id,
                'message': 'No active pregnancy',
                'latest_prenatal_form': {
                    'spouse_details': spouse_data,
                    'pf_occupation': latest_occupation
                }
            }, status=status.HTTP_200_OK)

        latest_pf = Prenatal_Form.objects.filter(
            pregnancy_id=active_pregnancy
        ).select_related(
            'pregnancy_id', 'patrec_id', 'vital_id', 'spouse_id', 'followv_id', 'bm_id', 'staff'
        ).prefetch_related(
            'pf_previous_hospitalization', 'lab_result__lab_result_img',
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
        # Attach spouse info if available
        result_data = serializer.data
        if spouse_data:
            result_data['spouse_details'] = spouse_data

        return Response({
            'pat_id': pat_id,
            'pregnancy_id': active_pregnancy.pregnancy_id,
            'latest_prenatal_form': result_data
        }, status=status.HTTP_200_OK)

    except Patient.DoesNotExist:
        return Response({
            'error': f'Patient does not exist'
        }, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        logger.error(f"Error fetching latest prenatal form for patient {pat_id}: {str(e)}")
        return Response({
            'error': f'Failed to fetch latest prenatal form: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

   

# Converted to ListAPIView for pagination, searching, filtering
class PatientPregnancyRecordsListView(generics.ListAPIView):
    serializer_class = PregnancyDetailSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        pat_id = self.kwargs.get('pat_id')
        try:
            patient = Patient.objects.get(pat_id=pat_id)
        except Patient.DoesNotExist:
            return Pregnancy.objects.none()

        params = self.request.query_params
        status_param = params.get('status')
        search = params.get('search')

        pregnancies = Pregnancy.objects.filter(pat_id=patient)

        filters = Q()
        if status_param and status_param.lower() not in ["all", ""]:
            filters &= Q(status=status_param)

        if search:
            search = search.strip()
            if search:
                search_filters = Q()
                search_filters |= Q(pregnancy_id__icontains=search)
                search_filters |= Q(pat_id__pat_id__icontains=search)
                search_filters |= Q(pat_id__rp_id__per__per_fname__icontains=search)
                search_filters |= Q(pat_id__rp_id__per__per_lname__icontains=search)
                search_filters |= Q(pat_id__trans_id__tran_fname__icontains=search)
                search_filters |= Q(pat_id__trans_id__tran_lname__icontains=search)
                filters &= search_filters

        if filters:
            pregnancies = pregnancies.filter(filters)

        pregnancies = pregnancies.order_by('-created_at').prefetch_related(
            Prefetch('prenatal_form', queryset=Prenatal_Form.objects.all().order_by('-created_at')),
            Prefetch('postpartum_record', queryset=PostpartumRecord.objects.prefetch_related('postpartum_delivery_record', 'vital_id').order_by('-created_at'))
        )
        return pregnancies
    

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

        # TT_Status now links directly to Patient (pat_id). Fetch records by patient and
        # return only the core TT fields. We intentionally avoid any pf_id-derived metadata
        # because `pf_id` is no longer a reliable FK on TT_Status.
        tt_statuses = TT_Status.objects.filter(pat_id=patient).order_by('-tts_date_given')

        if not tt_statuses.exists():
            return Response({
                'patient': patient.pat_id,
                'message': 'No TT status records found for this patient'
            }, status=status.HTTP_200_OK)

        tt_data = [
            {
                'tts_id': t.tts_id,
                'tts_status': t.tts_status,
                'tts_date_given': t.tts_date_given,
                'tts_tdap': t.tts_tdap,
            }
            for t in tt_statuses
        ]

        return Response({'patient': patient.pat_id, 'tt_status': tt_data}, status=status.HTTP_200_OK)

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
        prenatal_form = Prenatal_Form.objects.select_related(
            'patrec_id__pat_id__rp_id__per',
            'patrec_id__pat_id__trans_id', 
            'pregnancy_id',
            'vital_id',
            'bm_id',
            'spouse_id',
            'followv_id',
            'staff'
        ).prefetch_related(
            'pf_prenatal_care',
            'pf_previous_hospitalization',
            'lab_result',   
            'pf_anc_visit', 
            'pf_checklist', 
            'pf_birth_plan',
            'pf_obstetric_risk_code'
        ).get(pf_id=pf_id)
        
        serializer = PrenatalFormCompleteViewSerializer(prenatal_form)  

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


@api_view(['GET'])
def calculate_missed_visits_by_pregnancy(request, pregnancy_id):
    """Calculate missed visits for a specific pregnancy - GET method"""
    try:
        # query parameters from URL
        current_aog_weeks = request.GET.get('aog_weeks', 0)
        current_aog_days = request.GET.get('aog_days', 0)
        
        # convert to integers with defaults
        current_aog_weeks = int(current_aog_weeks) if current_aog_weeks else 0
        current_aog_days = int(current_aog_days) if current_aog_days else 0
        
        if not pregnancy_id:
            return Response(
                {'error': 'Pregnancy ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = calculate_missed_visits(pregnancy_id, current_aog_weeks, current_aog_days)
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Error calculating missed visits: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_illness_list(request):
    """Get list of illnesses for prenatal form"""
    try:
        illnesses = Illness.objects.all().order_by('created_at')
        serializer = IllnessCreateSerializer(illnesses, many=True)
        
        return Response({
            'illnesses': serializer.data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f'Error fetching illness list: {str(e)}')
        return Response({
            'error': f'Failed to fetch illness list: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)