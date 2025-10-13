from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import *
from datetime import datetime
from django.db.models import Count, Max, Subquery, OuterRef, Q, F, Prefetch
from django.db.models.functions import TruncMonth,Coalesce
from apps.patientrecords.models import Patient,PatientRecord
from apps.patientrecords.serializers.patients_serializers import PatientSerializer,PatientRecordSerializer
from apps.patientrecords.models import VitalSigns
from rest_framework.views import APIView
from .utils import *
from apps.childhealthservices.models import ChildHealthImmunizationHistory
from apps.childhealthservices.serializers import ChildHealthImmunizationHistorySerializer
from rest_framework.decorators import api_view
from datetime import timedelta
from dateutil.relativedelta import relativedelta
from django.utils.timezone import now
from apps.patientrecords.models import *
from apps.inventory.models import AntigenTransaction,VaccineStock, VaccineList, Inventory
from pagination import *
from apps.healthProfiling.models import ResidentProfile, PersonalAddress
from apps.medicalConsultation.utils import *


class VaccineRecordView(generics.ListCreateAPIView):
    serializer_class = VaccinationRecordSerializer
    queryset  =VaccinationRecord.objects.all()
    
   
class VitalSignsView(generics.ListCreateAPIView):
    serializer_class = VitalSignsSerializer
    queryset  =VitalSigns.objects.all()
   
   
class VaccinationHistoryView(generics.ListCreateAPIView):
    serializer_class = VaccinationHistorySerializer
    queryset  =VaccinationHistory.objects.all()
    

class PatientVaccinationRecordsView(generics.ListAPIView):
    serializer_class = PatientVaccinationRecordSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        # Subquery to get the latest vaccination date for each patient
        latest_vaccination_subquery = VaccinationHistory.objects.filter(
            vacrec__patrec_id__pat_id=OuterRef('pat_id'),
            vachist_status__in=['completed', 'partially vaccinated']
        ).order_by('-date_administered').values('date_administered')[:1]

        # Base queryset with annotations for vaccination count and latest date
        queryset = Patient.objects.annotate(
            vaccination_count=Count(
                'patient_records__vaccination_records__vaccination_histories',
                filter=Q(
                    patient_records__vaccination_records__vaccination_histories__vachist_status__in=['completed', 'partially vaccinated']
                ),
                distinct=True
            ),
            latest_vaccination_date=Subquery(latest_vaccination_subquery)
        ).filter(
            Q(patient_records__patrec_type='Vaccination Record'),
            Q(patient_records__vaccination_records__vaccination_histories__vachist_status__in=['completed', 'partially vaccinated'])
        ).select_related(
            'rp_id__per',         
            'trans_id',             
            'trans_id__tradd_id'   
        ).distinct()

        # Default ordering by latest vaccination date (most recent first)
        queryset = queryset.order_by('-latest_vaccination_date', '-vaccination_count')
        
        # Track if any filter is applied
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = apply_patient_search_filter(queryset, search_query)
        
        # Patient type filter
        patient_type_search = self.request.query_params.get('patient_type', '').strip()
        if patient_type_search and patient_type_search != 'all':
            queryset = apply_patient_type_filter(queryset, patient_type_search)
        
        return queryset
    
# Fixed version of your TobeAdministeredVaccinationView
class TobeAdministeredVaccinationView(generics.ListAPIView):
    serializer_class = VaccinationHistorySerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        # Get assigned_to from URL parameters
        assigned_to = self.kwargs.get('assigned_to')
        
        queryset = VaccinationHistory.objects.filter(
            vachist_status='in queue',
            assigned_to=assigned_to  # Add the assigned_to filter
        ).order_by('-created_at')
        
        # Get query parameters
        search_query = self.request.query_params.get('search', '')
        patient_type = self.request.query_params.get('patient_type', 'all')
        
        # Apply search filter - FIXED: Use pat_id instead of pat
        if search_query:
            queryset = queryset.filter(
                Q(vacrec__patrec_id__pat_id__rp_id__per__per_fname__icontains=search_query) |
                Q(vacrec__patrec_id__pat_id__rp_id__per__per_lname__icontains=search_query) |
                Q(vacrec__patrec_id__pat_id__trans_id__tran_fname__icontains=search_query) |
                Q(vacrec__patrec_id__pat_id__trans_id__tran_lname__icontains=search_query) |
                Q(vacStck_id__vac_id__vac_name__icontains=search_query) |
                Q(vacStck_id__batch_number__icontains=search_query)
            )
        
        # Apply patient type filter - FIXED: Use pat_id instead of pat
        if patient_type != 'all':
            if patient_type == 'resident':
                queryset = queryset.filter(vacrec__patrec_id__pat_id__pat_type='Resident')
            elif patient_type == 'transient':
                queryset = queryset.filter(vacrec__patrec_id__pat_id__pat_type='Transient')
        
        return queryset
        
class CountScheduledVaccinationView(APIView):
    def get(self, request):
        try:
            count = VaccinationHistory.objects.filter(
                vachist_status='in queue'
            ).count()
            return Response({"count": count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# INDIVIDUAL RECORDS VIEW
class VaccinationHistorRecordView(generics.ListAPIView):
    serializer_class = VaccinationHistorySerializer
    def get_queryset(self):
        pat_id = self.kwargs['pat_id']
        return VaccinationHistory.objects.filter(
            vacrec__patrec_id__pat_id=pat_id
        ).exclude(
            vachist_status='forwarded'
        ).order_by('-created_at')  
    

class ForwardedVaccinationHistoryView(generics.ListAPIView):
    serializer_class = VaccinationHistorySerializer

    def get_queryset(self):
        return VaccinationHistory.objects.filter(
            vachist_status__iexact='forwarded'
        ).order_by('-created_at')


    # UPDATE DELETE
class DeleteUpdateVaccinationRecordView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VaccinationRecordSerializer
    queryset = VaccinationRecord.objects.all()
    lookup_field = 'vacrec_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Vaccination record not found."}, status=status.HTTP_404_NOT_FOUND)
    

class DeleteUpdateVaccinationHistoryView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VaccinationHistorySerializer
    queryset = VaccinationHistory.objects.all()
    lookup_field = 'vachist_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Vaccination history record not found."}, status=status.HTTP_404_NOT_FOUND)
        
        
# DISPLAY
class UnvaccinatedVaccinesView(APIView):
    def get(self, request, pat_id):
        unvaccinated_vaccines = get_unvaccinated_vaccines_for_patient(pat_id)
        serializer = VacccinationListSerializer(unvaccinated_vaccines, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
class GetAllResidentsNotVaccinated(APIView):
    def get(self, request):
        try:
            data = get_all_residents_not_vaccinated()
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        



class UnvaccinatedVaccinesDetailsView(APIView):
    """
    Second endpoint: Get paginated list of unvaccinated residents for a specific vaccine and age group
    """
    pagination_class = StandardResultsPagination
    
    def get(self, request, vac_id):
        try:
            # Get query parameters
            age_group_id = request.GET.get('age_group_id')
            search = request.GET.get('search', '')
            
            # Get the vaccine
            try:
                vaccine = VaccineList.objects.get(vac_id=vac_id)
            except VaccineList.DoesNotExist:
                return Response({'error': 'Vaccine not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Get unvaccinated residents for this vaccine
            unvaccinated_residents = self.get_unvaccinated_residents_for_vaccine(
                vac_id, age_group_id, search
            )
            
            # Apply pagination
            paginator = self.pagination_class()
            page_size = int(request.GET.get('page_size', paginator.page_size))
            paginator.page_size = page_size
            
            page_data = paginator.paginate_queryset(unvaccinated_residents, request)
            
            if page_data is not None:
                response = paginator.get_paginated_response(page_data)
                return Response({
                    'success': True,
                    'vaccine_info': {
                        'vac_id': vaccine.vac_id,
                        'vac_name': vaccine.vac_name,
                        'vac_description': getattr(vaccine, 'vac_description', '')
                    },
                    'results': response.data['results'],
                    'count': response.data['count'],
                    'next': response.data.get('next'),
                    'previous': response.data.get('previous')
                })
            
            return Response({
                'success': True,
                'vaccine_info': {
                    'vac_id': vaccine.vac_id,
                    'vac_name': vaccine.vac_name,
                    'vac_description': getattr(vaccine, 'vac_description', '')
                },
                'results': unvaccinated_residents,
                'count': len(unvaccinated_residents)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Error fetching unvaccinated residents: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def calculate_age_in_time_unit(self, birth_date, time_unit):
        """Calculate age in the specified time unit"""
        if not birth_date:
            return None
            
        today = date.today()
        
        if time_unit.lower() == 'days':
            return (today - birth_date).days
        elif time_unit.lower() == 'weeks':
            return (today - birth_date).days // 7
        elif time_unit.lower() == 'months':
            return relativedelta(today, birth_date).months + (relativedelta(today, birth_date).years * 12)
        elif time_unit.lower() == 'years':
            return relativedelta(today, birth_date).years
        else:
            # Default to years
            return relativedelta(today, birth_date).years

    def is_resident_in_age_group(self, resident, age_group):
        """Check if resident falls within the specified age group"""
        if not age_group:
            return True
            
        # Get birth date from personal info
        birth_date = getattr(resident.per, 'per_dob', None) if hasattr(resident, 'per') and resident.per else None
        
        if not birth_date:
            return False  # Skip residents without birth date
            
        # Calculate age in the time unit specified by the age group
        age = self.calculate_age_in_time_unit(birth_date, age_group.time_unit)
        
        if age is None:
            return False
            
        # Check if age falls within the range
        return age_group.min_age <= age <= age_group.max_age

    def get_unvaccinated_residents_for_vaccine(self, vac_id, age_group_id=None, search=''):
        # Get the vaccine and its age group if specified
        vaccine = VaccineList.objects.get(vac_id=vac_id)
        age_group = None
        
        if age_group_id and age_group_id != 'null':
            try:
                age_group = Agegroup.objects.get(agegrp_id=age_group_id)
            except Agegroup.DoesNotExist:
                pass
        elif vaccine.ageGroup:
            # Use the vaccine's default age group if no specific age group is provided
            age_group = vaccine.ageGroup
        
        # Get pat_ids of residents who already got this vaccine
        vaccinated_ids = VaccinationHistory.objects.filter(
            Q(vacStck_id__vac_id=vac_id) | Q(vac__vac_id=vac_id),
            vachist_status="completed"
        ).values_list('vacrec__patrec_id__pat_id', flat=True).distinct()
        
        # Get all residents with related data for better performance
        # Use the correct relationship for addresses - prefetch PersonalAddress with add and sitio
        all_residents = ResidentProfile.objects.select_related('per').prefetch_related(
            Prefetch(
                'per__personal_addresses',
                queryset=PersonalAddress.objects.select_related('add', 'add__sitio'),
                to_attr='prefetched_personal_addresses'
            )
        ).filter(per__per_dob__isnull=False)
        
        # Get all resident-type, active patients
        patients = Patient.objects.filter(
            pat_type="Resident", 
            pat_status="Active"
        ).select_related('rp_id', 'rp_id__per')
        
        # Map rp_id -> patient
        patient_map = {p.rp_id.rp_id: p for p in patients if p.rp_id}
        
        unvaccinated_residents = []
        vaccine_data = VacccinationListSerializer(vaccine).data
        
        for resident in all_residents:
            rp_id = resident.rp_id
            # Use the serializer to get personal info with addresses
            personal_info = ResidentPersonalInfoSerializer(resident).data
            patient = patient_map.get(rp_id)
            
            # Apply age group filter first (most restrictive)
            if age_group and not self.is_resident_in_age_group(resident, age_group):
                continue
            
            is_unvaccinated = False
            resident_data = None
            
            if patient:
                # Has patient — check if vaccinated
                if patient.pat_id not in vaccinated_ids:
                    is_unvaccinated = True
                    resident_data = {
                        "status": "Has patient, not vaccinated for this vaccine",
                        "pat_id": patient.pat_id,
                        "rp_id": rp_id,
                        "personal_info": personal_info,
                        "vaccine_not_received": vaccine_data,
                        "age_info": self.get_age_info(resident, age_group) if age_group else None
                    }
            else:
                # No patient — definitely not vaccinated for this vaccine
                is_unvaccinated = True
                resident_data = {
                    "status": "No patient record",
                    "pat_id": None,
                    "rp_id": rp_id,
                    "personal_info": personal_info,
                    "vaccine_not_received": vaccine_data,
                    "age_info": self.get_age_info(resident, age_group) if age_group else None
                }
            
            if is_unvaccinated and resident_data:
                # Apply search filter if provided
                if search:
                    search_lower = search.lower()
                    searchable_fields = [
                        str(resident_data.get('pat_id', '')),
                        str(resident_data.get('rp_id', '')),
                        personal_info.get('per_fname', ''),
                        personal_info.get('per_lname', ''),
                        personal_info.get('per_mname', ''),
                        personal_info.get('per_sex', ''),
                    ]
                    
                    # Add address fields using the correct relationship
                    if hasattr(resident.per, 'prefetched_personal_addresses'):
                        for addr in resident.per.prefetched_personal_addresses:
                            if addr.add:
                                searchable_fields.extend([
                                    addr.add.add_external_sitio or '',
                                    addr.add.add_street or '',
                                    addr.add.add_barangay or '',
                                    addr.add.add_city or '',
                                    addr.add.add_province or '',
                                ])
                                if addr.add.sitio:
                                    searchable_fields.append(addr.add.sitio.sitio_name or '')
                    
                    # Create searchable text
                    searchable_text = ' '.join(filter(None, searchable_fields)).lower()
                    
                    if search_lower not in searchable_text:
                        continue
                
                unvaccinated_residents.append(resident_data)
        
        return unvaccinated_residents

    def get_age_info(self, resident, age_group):
        """Get age information for the resident"""
        if not age_group:
            return None
            
        birth_date = getattr(resident.per, 'per_dob', None) if hasattr(resident, 'per') and resident.per else None
        
        if not birth_date:
            return {"error": "No birth date available"}
            
        age = self.calculate_age_in_time_unit(birth_date, age_group.time_unit)
        
        return {
            "birth_date": birth_date.isoformat(),
            "age": age,
            "time_unit": age_group.time_unit,
            "age_group_range": f"{age_group.min_age}-{age_group.max_age} {age_group.time_unit}"
        }
    


class UnvaccinatedVaccinesSummaryView(APIView):
    """
    First endpoint: Get all vaccines with their unvaccinated resident counts and age ranges
    """
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            # Get all vaccines
            vaccines = VaccineList.objects.select_related('ageGroup').all()
            result = []
            
            # Get total count of all residents
            total_residents_count = self.get_total_residents_count()
            
            for vaccine in vaccines:
                # Get age groups for this vaccine first
                age_groups = self.get_age_groups_for_vaccine(vaccine)
                
                # Calculate total unvaccinated as sum of all age groups
                total_unvaccinated = sum(age_group['unvaccinated_count'] for age_group in age_groups)
                
                vaccine_data = {
                    'vac_id': vaccine.vac_id,
                    'vac_name': vaccine.vac_name,
                    'vac_description': getattr(vaccine, 'vac_description', ''),
                    'total_unvaccinated': total_unvaccinated,
                    'age_groups': age_groups,
                    'total_residents_count': total_residents_count
                }
                result.append(vaccine_data)
            
            # Apply pagination
            paginator = self.pagination_class()
            page_size = int(request.GET.get('page_size', paginator.page_size))
            paginator.page_size = page_size
            
            page_data = paginator.paginate_queryset(result, request)
            
            if page_data is not None:
                response = paginator.get_paginated_response(page_data)
                return Response({
                    'success': True,
                    'results': response.data['results'],
                    'count': response.data['count'],
                    'next': response.data.get('next'),
                    'previous': response.data.get('previous'),
                    'total_residents_count': total_residents_count
                })
            
            return Response({
                'success': True,
                'results': result,
                'count': len(result),
                'total_residents_count': total_residents_count
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Error fetching vaccines: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_total_residents_count(self):
        """Get total count of all residents"""
        return ResidentProfile.objects.count()

    def get_residents_count_for_age_group(self, age_group=None):
        """Get total count of residents in a specific age group"""
        all_residents = ResidentProfile.objects.select_related('per').all()
        
        if not age_group:
            return len(all_residents)
            
        count = 0
        for resident in all_residents:
            if self.is_resident_in_age_group(resident, age_group):
                count += 1
                
        return count

    def calculate_age_in_time_unit(self, birth_date, time_unit):
        """Calculate age in the specified time unit"""
        if not birth_date:
            return None
            
        today = date.today()
        
        if time_unit.lower() == 'days':
            return (today - birth_date).days
        elif time_unit.lower() == 'weeks':
            return (today - birth_date).days // 7
        elif time_unit.lower() == 'months':
            return relativedelta(today, birth_date).months + (relativedelta(today, birth_date).years * 12)
        elif time_unit.lower() == 'years':
            return relativedelta(today, birth_date).years
        else:
            # Default to years
            return relativedelta(today, birth_date).years

    def get_unvaccinated_count_for_vaccine(self, vac_id, age_group=None):
        # Get pat_ids of residents who already got this vaccine
        vaccinated_ids = VaccinationHistory.objects.filter(
            Q(vacStck_id__vac_id=vac_id) | Q(vac__vac_id=vac_id),
            vachist_status="completed"
        ).values_list('vacrec__patrec_id__pat_id', flat=True).distinct()
        
        # Get all residents
        all_residents = ResidentProfile.objects.select_related('per').all()
        
        # Get all resident-type, active patients
        patients = Patient.objects.filter(
            pat_type="Resident", 
            pat_status="Active"
        ).select_related('rp_id', 'rp_id__per')
        
        # Map rp_id -> patient
        patient_map = {p.rp_id.rp_id: p for p in patients if p.rp_id}
        
        unvaccinated_count = 0
        
        for resident in all_residents:
            # Apply age group filter if specified
            if age_group and not self.is_resident_in_age_group(resident, age_group):
                continue
                
            patient = patient_map.get(resident.rp_id)
            
            if patient:
                # Has patient — check if not vaccinated
                if patient.pat_id not in vaccinated_ids:
                    unvaccinated_count += 1
            else:
                # No patient — definitely not vaccinated
                unvaccinated_count += 1
        
        return unvaccinated_count

    def is_resident_in_age_group(self, resident, age_group):
        """Check if resident falls within the specified age group"""
        if not age_group:
            return True
            
        # Get birth date from personal info
        birth_date = getattr(resident.per, 'per_dob', None) if hasattr(resident, 'per') and resident.per else None
        
        if not birth_date:
            return False  # Skip residents without birth date
            
        # Calculate age in the time unit specified by the age group
        age = self.calculate_age_in_time_unit(birth_date, age_group.time_unit)
        
        if age is None:
            return False
            
        # Check if age falls within the range
        return age_group.min_age <= age <= age_group.max_age

    def get_age_groups_for_vaccine(self, vaccine):
        """Get age groups associated with this vaccine"""
        age_groups = []
        
        if vaccine.ageGroup:
            # Single age group associated with vaccine
            age_group = vaccine.ageGroup
            unvaccinated_count = self.get_unvaccinated_count_for_vaccine(vaccine.vac_id, age_group)
            total_residents_count = self.get_residents_count_for_age_group(age_group)
            
            age_groups.append({
                'age_group_id': age_group.agegrp_id,
                'age_group_name': age_group.agegroup_name,
                'min_age': age_group.min_age,
                'max_age': age_group.max_age,
                'time_unit': age_group.time_unit,
                'age_range_display': f"{age_group.min_age}-{age_group.max_age} {age_group.time_unit}",
                'unvaccinated_count': unvaccinated_count,
                'total_residents_count': total_residents_count
            })
        else:
            # No specific age group - show all ages
            all_ages_unvaccinated_count = self.get_unvaccinated_count_for_vaccine(vaccine.vac_id)
            all_ages_total_residents_count = self.get_residents_count_for_age_group()
            
            age_groups.append({
                'age_group_id': None,
                'age_group_name': 'All Ages',
                'min_age': 0,
                'max_age': 999,
                'time_unit': 'years',
                'age_range_display': 'All Ages',
                'unvaccinated_count': all_ages_unvaccinated_count,
                'total_residents_count': all_ages_total_residents_count
            })
        
        return age_groups
    
class CheckVaccineExistsView(APIView):
    def get(self, request, pat_id, vac_id):
        exists = has_existing_vaccine_history(pat_id, vac_id)
        return Response({'exists': exists}, status=status.HTTP_200_OK)
    
class PatientVaccineFollowUpView(APIView):
    def get(self, request, pat_id):
        data = get_patient_vaccines_with_followups(pat_id)
        if data:
            return Response(data, status=status.HTTP_200_OK)
        return Response({"detail": "No vaccine or follow-up visit data found for this patient."}, status=status.HTTP_404_NOT_FOUND)

class ChildHealthVaccineFollowUpView(APIView):
    def get(self, request, pat_id):
        data = get_child_followups(pat_id)
        if data:
            return Response(data, status=status.HTTP_200_OK)
        return Response({"detail": "No vaccine or follow-up visit data found for this patient."}, status=status.HTTP_404_NOT_FOUND)
    

class GetPatientInfoFromVaccinationRecord(APIView):
    def get(self, request, patrec_pat_id):
        data = get_patient_info_from_vaccination_record(patrec_pat_id)

        if "message" in data:
            return Response(data, status=status.HTTP_404_NOT_FOUND)

        return Response(data, status=status.HTTP_200_OK)
class GetVaccinationCountView(APIView):
    
    def get(self, request, pat_id):
        try:
            count = get_vaccination_record_count(pat_id)
            return Response({'pat_id': pat_id, 'vaccination_count': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        


class CountVaccinatedByPatientTypeView(APIView):
    def get(self, request):
        try:
            data = count_vaccinated_by_patient_type()
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ForwardedVaccinationHistoryView(generics.ListAPIView):
    serializer_class = VaccinationHistorySerializer

    def get_queryset(self):
        return VaccinationHistory.objects.filter(
            vachist_status__iexact='forwarded'
        ).order_by('-created_at')



class ForwardedVaccinationCountView(APIView):
    def get(self, request, *args, **kwargs):
        count = (
            VaccinationHistory.objects
            .filter(vachist_status__iexact='forwarded')
            .count()
        )
        return Response({"count": count})




# ======SCHEDULES VACCINATION LAST STEP======

import logging
logger = logging.getLogger(__name__)
class VaccinationCompletionAPIView(APIView):
    @transaction.atomic
    def post(self, request):
        try:
            data = request.data
            logger.info(f"Vaccination completion request received: {data}")
            
            # Extract required data
            vaccination_id = data.get('vachist_id')
            follow_up_data = data.get('followUpData')  # This will be None if not provided
            patient_id = data.get('patientId')
            patrec_id = data.get('patrec_id')
            
            if not vaccination_id:
                return Response(
                    {"error": "vachist_id is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the vaccination history record
            try:
                vaccination = VaccinationHistory.objects.select_related(
                    'followv', 'vacrec', 'vacrec__patrec_id'
                ).get(vachist_id=vaccination_id)
            except VaccinationHistory.DoesNotExist:
                return Response(
                    {"error": f"Vaccination history with id {vaccination_id} not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Create a savepoint for potential rollback
            sid = transaction.savepoint()
            
            try:
                # 1. Handle previous vaccination's follow-up if exists
                previous_vaccination = VaccinationHistory.objects.filter(
                    vacrec=vaccination.vacrec,
                    vachist_status='completed'
                ).exclude(vachist_id=vaccination_id).order_by('-date_administered').first()
                
                if previous_vaccination and previous_vaccination.followv:
                    logger.info(f"Updating previous follow-up visit: {previous_vaccination.followv.followv_id}")
                    previous_vaccination.followv.followv_status = 'completed'
                    previous_vaccination.followv.completed_at = timezone.now().date()
                    previous_vaccination.followv.save()
                
                # 2. Handle current vaccination follow-up - ONLY if we have valid data
                follow_up_visit = None
                
                # Check if we have follow_up_data and it contains a valid date
                if (follow_up_data and 
                    follow_up_data.get('followv_date') and 
                    isinstance(follow_up_data.get('followv_date'), str) and
                    follow_up_data.get('followv_date').strip()):
                    
                    try:
                        formatted_date = datetime.strptime(follow_up_data.get('followv_date'), '%Y-%m-%d').date()
                        
                        # Check if we have an existing follow-up to update
                        if vaccination.followv:
                            logger.info(f"Updating existing follow-up visit: {vaccination.followv.followv_id}")
                            vaccination.followv.followv_date = formatted_date
                            if follow_up_data.get('followv_status'):
                                vaccination.followv.followv_status = follow_up_data.get('followv_status')
                            if follow_up_data.get('followv_description'):
                                vaccination.followv.followv_description = follow_up_data.get('followv_description', '')
                            vaccination.followv.save()
                            follow_up_visit = vaccination.followv
                        else:
                            # Create new follow-up
                            logger.info("Creating new follow-up visit")
                            follow_up_visit = FollowUpVisit.objects.create(
                                followv_date=formatted_date,
                                followv_status=follow_up_data.get('followv_status', 'pending'),
                                followv_description=follow_up_data.get('followv_description', 'No description provided'),
                                patrec_id=patrec_id or vaccination.vacrec.patrec_id_id
                            )
                    except (ValueError, TypeError):
                        # If date parsing fails, just log it and continue without follow-up
                        logger.warning("Invalid date format in follow-up data, skipping follow-up processing")
                
                # 3. Update vaccination status to completed (this always happens)
                logger.info(f"Updating vaccination status to completed: {vaccination_id}")
                vaccination.vachist_status = 'completed'
                if follow_up_visit:
                    vaccination.followv = follow_up_visit
                vaccination.save()
                
                # Commit the transaction
                transaction.savepoint_commit(sid)
                logger.info("Vaccination completion processed successfully")
                
                return Response({
                    "success": True,
                    "patientId": patient_id,
                    "vaccinationId": vaccination_id,
                    "followUpVisitId": follow_up_visit.followv_id if follow_up_visit else None
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                # Rollback to savepoint on error
                transaction.savepoint_rollback(sid)
                logger.error(f"Error processing vaccination completion: {str(e)}")
                return Response(
                    {"error": f"Failed to process vaccination: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except Exception as e:
            logger.error(f"Unexpected error in vaccination completion: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


 
# BULK FOR CHILDHEALTH IMMUNIZATION
class BulkVaccinationCreateView(APIView):
    def post(self, request):
        data = request.data
        try:
            with transaction.atomic():
                # Step 1: Create VaccinationRecord
                patient_id = data.get("patrec_id")
                total_dose = data.get("vacrec_totaldose", 0)

                vac_record = VaccinationRecord.objects.create(
                    patrec_id_id=patient_id,
                    vacrec_totaldose=total_dose
                )

                vac_histories_data = data.get("vaccination_histories", [])
                chhist_id = data.get("chhist_id")

                response_data = {
                    "vacrec_id": vac_record.vacrec_id,
                    "vaccination_histories": [],
                    "immunization_links": []
                }

                for hist_data in vac_histories_data:
                    hist_data['vacrec'] = vac_record.vacrec_id  # Link to VaccinationRecord
                    serializer = VaccinationHistorySerializerBase(data=hist_data)
                    serializer.is_valid(raise_exception=True)
                    vac_hist = serializer.save()

                    # Step 3: Create ChildHealthImmunizationHistory for each history
                    child_imm = ChildHealthImmunizationHistory.objects.create(
                        vachist=vac_hist,
                        chhist_id=chhist_id,
                        hasExistingVaccination=False
                    )

                    response_data["vaccination_histories"].append(serializer.data)
                    response_data["immunization_links"].append({
                        "imt_id": child_imm.imt_id,
                        "vachist_id": vac_hist.vachist_id
                    })

                return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def bulk_create_vaccination_records(request):
    serializer = VaccinationRecordSerializer(data=request.data, many=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def bulk_create_vaccination_histories(request):
    serializer = VaccinationHistorySerializer(data=request.data, many=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def bulk_create_immunization_histories(request):
    serializer = ChildHealthImmunizationHistorySerializer(data=request.data, many=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ======================================================================================#

class VaccinationSubmissionView(APIView):
    @transaction.atomic
    def post(self, request):
        try:
            data = request.data
            
            # Extract data from request - fixed structure
            form_data = data.get('form_data', {})
            signature = data.get('signature')
            vacStck_id = data.get('vacStck_id')
            vac_id = data.get('vac_id')
            vac_name = data.get('vac_name')
            expiry_date = data.get('expiry_date')
            follow_up_data = data.get('follow_up_data', {})
            vaccination_history = data.get('vaccination_history', [])
            assigned_to_id=form_data.get("selectedStaffId")  # This can be None
            print("staff",form_data.get("staff_id"))
            print("form",form_data)
            
            # Get staff_id from request user
            staff_id = form_data.get("staff_id") or None
            if not staff_id:
                return Response(
                    {'error': 'Staff ID not found'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            assigned_to_instance = None
            if assigned_to_id:
                try:
                    assigned_to_instance = Staff.objects.get(staff_id=assigned_to_id)
                except Staff.DoesNotExist:
                    return Response(
                        {'error': 'Assigned staff not found'}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Get vaccine stock
            try:
                vaccine_stock = VaccineStock.objects.select_related('vac_id').get(vacStck_id=vacStck_id)
            except VaccineStock.DoesNotExist:
                return Response(
                    {'error': 'Vaccine stock not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            vac_type = vaccine_stock.vac_id.vac_type_choices
            
            # Update vaccine stock quantity
            if vaccine_stock.vacStck_qty_avail < 1:
                return Response(
                    {'error': 'Insufficient vaccine stock available'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            vaccine_stock.vacStck_qty_avail -= 1
            vaccine_stock.save()
            
            # Create antigen transaction with appropriate unit
            if vaccine_stock.solvent == 'diluent':
                antt_qty = "1 container"
            else:
                antt_qty = "1 dose"
            
            AntigenTransaction.objects.create(
                antt_qty=antt_qty,
                antt_action="Vaccination administered",
                vacStck_id=vaccine_stock,
                staff_id=staff_id
            )
            
            # Update inventory timestamp
            if vaccine_stock.inv_id:
                inventory = vaccine_stock.inv_id
                inventory.updated_at = timezone.now()
                inventory.save()
            
            # Determine status - removed assignment_option since it's not in frontend
            status_val = "in queue"  # Default to completed since no assignment option
            
            # Get patient ID from request or data - you need to determine how this is passed
            pat_id = form_data.get("pat_id")  # You need to ensure this is passed from frontend
            
            if not pat_id:
                return Response(
                    {'error': 'Patient ID is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Process based on vaccine type
            if vac_type == "routine":
                result = self.process_routine_vaccination(
                    data, form_data, signature, pat_id,
                    vaccine_stock, status_val, follow_up_data, vac_name, staff_id,assigned_to_instance
                )
            elif vac_type == "primary":
                result = self.process_primary_vaccination(
                    data, form_data, signature, pat_id,
                    vaccine_stock, status_val, follow_up_data, vac_name, staff_id,
                    vaccination_history,assigned_to_instance
                )
            elif vac_type == "conditional":
                result = self.process_conditional_vaccination(
                    data, form_data, signature, pat_id,
                    vaccine_stock, status_val, follow_up_data, vac_name, staff_id,
                    vaccination_history,assigned_to_instance
                )
            else:
                return Response(
                    {'error': f'Unknown vaccine type: {vac_type}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(result, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def process_routine_vaccination(self, data, form_data, signature, pat_id, 
                                  vaccine_stock, status_val, follow_up_data, 
                                  vac_name, staff_id,assigned_to_instance):
    
        # Check if there's an existing vaccination record for this patient and vaccine
        existing_vacrec = None
        try:
            # First find patient records for this patient
            patient_records = PatientRecord.objects.filter(pat_id_id=pat_id, patrec_type="Vaccination Record")
            
            # Look for a vaccination record that has history with the same vaccine
            for patrec in patient_records:
                try:
                    vacrec = VaccinationRecord.objects.get(patrec_id=patrec.patrec_id)
                    # Check if this vacrec has any history with the same vaccine
                    if VaccinationHistory.objects.filter(
                        vacrec=vacrec, 
                        vacStck_id__vac_id=vaccine_stock.vac_id,
                        
                    ).exists():
                        existing_vacrec = vacrec
                        existing_patrec = patrec
                        break
                except VaccinationRecord.DoesNotExist:
                    continue
                    
        except (PatientRecord.DoesNotExist, VaccinationRecord.DoesNotExist):
            existing_vacrec = None
        
        # Create or use existing patient record
        if existing_vacrec:
            patient_record = existing_patrec
            vaccination_record = existing_vacrec
        else:
            # Create new patient record if no existing record found
            patient_record = PatientRecord.objects.create(
                pat_id_id=pat_id,
                patrec_type="Vaccination Record",
            )
            
            # Create new vaccination record
            vaccination_record = VaccinationRecord.objects.create(
                patrec_id=patient_record,
                vacrec_totaldose=int(form_data.get('vacrec_totaldose', 1))
            )
        
        # Create vital signs - always create if data is available
        vital = None
        if form_data:  # Check if form_data exists
            vital = VitalSigns.objects.create(
                vital_bp_systolic=form_data.get('bpsystolic', ''),
                vital_bp_diastolic=form_data.get('bpdiastolic', ''),
                vital_temp=form_data.get('temp', ''),
                vital_o2=form_data.get('o2', ''),
                vital_pulse=form_data.get('pr', ''),
                vital_RR=form_data.get('vital_RR', ''),
                staff_id=staff_id,
                patrec=patient_record
            )
        
        # Create follow-up visit if needed
        followv = None
        if follow_up_data:
            followv = FollowUpVisit.objects.create(
                followv_date=follow_up_data.get('followv_date'),
                followv_status='pending',
                followv_description=follow_up_data.get('followv_description') or 
                                f"Follow-up visit for {vac_name}",
                patrec=patient_record
            )
        
        # Create vaccination history - convert to integer
        vachist = VaccinationHistory.objects.create(
            vacrec=vaccination_record,
            vacStck_id=vaccine_stock,  # Removed assigned_to field
            vachist_doseNo=int(form_data.get('vachist_doseNo', 1)),
            vachist_status=status_val,
            staff_id=staff_id,
            vital=vital,
            followv=followv,
            signature=signature,
            date_administered=timezone.now().date(),
            assigned_to= assigned_to_instance
        )
        
        return {
            'patrec_id': patient_record.patrec_id,
            'vacrec_id': vaccination_record.vacrec_id,
            'vachist_id': vachist.vachist_id,
            'vital_id': vital.vital_id if vital else None,
            'followv_id': followv.followv_id if followv else None,
            'is_new_record': not existing_vacrec
        }

    def process_primary_vaccination(self, data, form_data, signature, pat_id, 
                                   vaccine_stock, status_val, follow_up_data, 
                                   vac_name, staff_id, vaccination_history,assigned_to_instance):
        # Convert to integers for comparison
        dose_no = int(form_data.get('vachist_doseNo', 1))
        total_dose = int(form_data.get('vacrec_totaldose', 0))
        
        if dose_no == 1:
            # First dose - create new records
            patient_record = PatientRecord.objects.create(
                pat_id_id=pat_id,
                patrec_type="Vaccination Record",
            )
            
            vital = None
            if form_data:
                vital = VitalSigns.objects.create(
                    vital_bp_systolic=form_data.get('bpsystolic', ''),
                    vital_bp_diastolic=form_data.get('bpdiastolic', ''),
                    vital_temp=form_data.get('temp', ''),
                    vital_o2=form_data.get('o2', ''),
                    vital_pulse=form_data.get('pr', ''),
                    vital_RR=form_data.get('vital_RR', ''),
                    staff_id=staff_id,
                    patrec=patient_record
                )
            
            vaccination_record = VaccinationRecord.objects.create(
                patrec_id=patient_record,
                vacrec_totaldose=total_dose
            )
            
            followv = None
            if follow_up_data:
                followv = FollowUpVisit.objects.create(
                    followv_date=follow_up_data.get('followv_date'),
                    followv_status='pending',
                    followv_description=follow_up_data.get('followv_description') or 
                                      f"Follow-up visit for {vac_name}",
                    patrec=patient_record
                )
            
            vachist = VaccinationHistory.objects.create(
                vacrec=vaccination_record,
                vacStck_id=vaccine_stock,  # Removed assigned_to
                vachist_doseNo=dose_no,
                vachist_status=status_val,
                staff_id=staff_id,
                vital=vital,
                followv=followv,
                signature=signature,
                date_administered=timezone.now().date(),
                assigned_to= assigned_to_instance
            )
            
            return {
                'patrec_id': patient_record.patrec_id,
                'vacrec_id': vaccination_record.vacrec_id,
                'vachist_id': vachist.vachist_id,
                'vital_id': vital.vital_id if vital else None,
                'followv_id': followv.followv_id if followv else None
            }
            
        else:
            # Subsequent doses - use existing records
            if not vaccination_history:
                raise Exception("Previous vaccination history not found for subsequent dose")
            
            # Get the latest vaccination history record
            latest_history = vaccination_history[0] if isinstance(vaccination_history, list) and vaccination_history else vaccination_history
            
            old_vacrec_id = latest_history.get('vacrec_id') or latest_history.get('vacrec')
            if not old_vacrec_id:
                raise Exception("Previous vaccination record ID not found")
            
            try:
                old_vaccination_record = VaccinationRecord.objects.get(vacrec_id=old_vacrec_id)
            except VaccinationRecord.DoesNotExist:
                raise Exception("Previous vaccination record not found")
            
            vital = None
            if form_data:
                vital = VitalSigns.objects.create(
                    vital_bp_systolic=form_data.get('bpsystolic', ''),
                    vital_bp_diastolic=form_data.get('bpdiastolic', ''),
                    vital_temp=form_data.get('temp', ''),
                    vital_o2=form_data.get('o2', ''),
                    vital_pulse=form_data.get('pr', ''),
                    vital_RR=form_data.get('vital_RR', ''),
                    staff_id=staff_id,
                    patrec=old_vaccination_record.patrec_id
                )
            
            followv = None
            # FIXED: Use integer comparison
            if dose_no < total_dose and follow_up_data:
                followv = FollowUpVisit.objects.create(
                    followv_date=follow_up_data.get('followv_date'),
                    followv_status='pending',
                    followv_description=follow_up_data.get('followv_description') or 
                                      f"Follow-up visit for {vac_name}",
                    patrec=old_vaccination_record.patrec_id
                )
            
            vachist = VaccinationHistory.objects.create(
                vacrec=old_vaccination_record,
                vacStck_id=vaccine_stock,  # Removed assigned_to
                vachist_doseNo=dose_no,
                vachist_status=status_val,
                staff_id=staff_id,
                vital=vital,
                followv=followv,
                signature=signature,
                date_administered=timezone.now().date(),
                assigned_to= assigned_to_instance
            )
            
            return {
                'vachist_id': vachist.vachist_id,
                'vital_id': vital.vital_id if vital else None,
                'followv_id': followv.followv_id if followv else None
            }

    def process_conditional_vaccination(self, data, form_data, signature, pat_id, 
                                      vaccine_stock, status_val, follow_up_data, 
                                      vac_name, staff_id, vaccination_history,assigned_to_instance):
        # Convert to integer
        dose_no = int(form_data.get('vachist_doseNo', 1))
        
        if dose_no == 1:
            # First dose
            patient_record = PatientRecord.objects.create(
                pat_id_id=pat_id,
                patrec_type="Vaccination Record",
            )
            
            vital = None
            if form_data:
                vital = VitalSigns.objects.create(
                    vital_bp_systolic=form_data.get('bpsystolic', ''),
                    vital_bp_diastolic=form_data.get('bpdiastolic', ''),
                    vital_temp=form_data.get('temp', ''),
                    vital_o2=form_data.get('o2', ''),
                    vital_pulse=form_data.get('pr', ''),
                    vital_RR=form_data.get('vital_RR', ''),
                    staff_id=staff_id,
                    patrec=patient_record
                )
            
            # Convert to integer for the vaccination record
            vaccination_record = VaccinationRecord.objects.create(
                patrec_id=patient_record,
                vacrec_totaldose=int(form_data.get('vacrec_totaldose', 0))
            )
            
            # Create follow-up visit if needed for first dose
            followv = None
            if follow_up_data:
                followv = FollowUpVisit.objects.create(
                    followv_date=follow_up_data.get('followv_date'),
                    followv_status='pending',
                    followv_description=follow_up_data.get('followv_description') or 
                                      f"Follow-up visit for {vac_name}",
                    patrec=patient_record
                )
            
            vachist = VaccinationHistory.objects.create(
                vacrec=vaccination_record,
                vacStck_id=vaccine_stock,  # Removed assigned_to
                vachist_doseNo=dose_no,
                vachist_status=status_val,
                staff_id=staff_id,
                vital=vital,
                followv=followv,
                signature=signature,
                date_administered=timezone.now().date(),
                assigned_to=assigned_to_instance
            )
            
            return {
                'patrec_id': patient_record.patrec_id,
                'vacrec_id': vaccination_record.vacrec_id,
                'vachist_id': vachist.vachist_id,
                'vital_id': vital.vital_id if vital else None,
                'followv_id': followv.followv_id if followv else None
            }
            
        else:
            # Subsequent doses
            if not vaccination_history:
                raise Exception("Previous vaccination history not found for subsequent dose")
            
            # Get the latest vaccination history record
            latest_history = vaccination_history[0] if isinstance(vaccination_history, list) and vaccination_history else vaccination_history
            
            old_vacrec_id = latest_history.get('vacrec_id') or latest_history.get('vacrec')
            if not old_vacrec_id:
                raise Exception("Previous vaccination record ID not found")
            
            try:
                old_vaccination_record = VaccinationRecord.objects.get(vacrec_id=old_vacrec_id)
            except VaccinationRecord.DoesNotExist:
                raise Exception("Previous vaccination record not found")
            
            vital = None
            if form_data:
                vital = VitalSigns.objects.create(
                    vital_bp_systolic=form_data.get('bpsystolic', ''),
                    vital_bp_diastolic=form_data.get('bpdiastolic', ''),
                    vital_temp=form_data.get('temp', ''),
                    vital_o2=form_data.get('o2', ''),
                    vital_pulse=form_data.get('pr', ''),
                    vital_RR=form_data.get('vital_RR', ''),
                    staff_id=staff_id,
                    patrec=old_vaccination_record.patrec_id
                )
            
            followv = None
            if follow_up_data:
                followv = FollowUpVisit.objects.create(
                    followv_date=follow_up_data.get('followv_date'),
                    followv_status='pending',
                    followv_description=follow_up_data.get('followv_description') or 
                                      f"Follow-up visit for {vac_name}",
                    patrec=old_vaccination_record.patrec_id
                )
            
            vachist = VaccinationHistory.objects.create(
                vacrec=old_vaccination_record,
                vacStck_id=vaccine_stock,  # Removed assigned_to
                vachist_doseNo=dose_no,
                vachist_status=status_val,
                staff_id=staff_id,
                vital=vital,
                followv=followv,
                signature=signature,
                date_administered=timezone.now().date(),
                assigned_to= assigned_to_instance
            )
            
            return {
                'vachist_id': vachist.vachist_id,
                'vital_id': vital.vital_id if vital else None,
                'followv_id': followv.followv_id if followv else None
            }

# ======================== Monthly Vaccination REPORTS ========================
            
class MonthlyVaccinationSummariesAPIView(APIView):
    def get(self, request):
        try:
            queryset = VaccinationHistory.objects.select_related(
                'staff',
                'vital',
                'vacrec',
                'vacrec__patrec_id',
                'vacStck_id',
                'vacStck_id__inv_id',
                'vacStck_id__vac_id',
                'vac',
                'followv'
            ).order_by('-created_at')

            year_param = request.GET.get('year')  # '2025' or '2025-07'

            if year_param and year_param != 'all':
                try:
                    if '-' in year_param:
                        year, month = map(int, year_param.split('-'))
                        queryset = queryset.filter(
                            created_at__year=year,
                            created_at__month=month
                        )
                    else:
                        year = int(year_param)
                        queryset = queryset.filter(
                            created_at__year=year
                        )
                except ValueError:
                    return Response({
                        'success': False,
                        'error': 'Invalid format for year. Use YYYY or YYYY-MM.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Annotate and count records by month
            monthly_data = queryset.annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                record_count=Count('vachist_id')
            ).order_by('-month')

            formatted_data = [{
                'month': item['month'].strftime('%Y-%m'),
                'record_count': item['record_count']
            } for item in monthly_data]

            return Response({
                'success': True,
                'data': formatted_data,
                'total_months': len(formatted_data)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MonthlyVaccinationRecordsDetailAPIView(APIView):
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

            # Get records for the specified month
            queryset = VaccinationHistory.objects.select_related(
                'staff',
                'vital',
                'vacrec',
                'vacrec__patrec_id',
                'vacStck_id',
                'vacStck_id__inv_id',
                'vacStck_id__vac_id',
                'vac',
                'followv'
            ).filter(
                created_at__year=year,
                created_at__month=month_num
            ).order_by('-created_at')

            serialized_records = [
                VaccinationHistorySerializer(record).data for record in queryset
            ]

            return Response({
                'success': True,
                'data': {
                    'month': month,
                    'record_count': len(serialized_records),
                    'records': serialized_records
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)     

            

class MonthlyVaccinationChart(APIView):
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

            # Get vaccination counts for the specified month
            queryset = VaccinationHistory.objects.filter(
                created_at__year=year,
                created_at__month=month_num
            ).values(
                'vacStck_id__vac_id__vac_name'  # Path to vaccine name
            ).annotate(
                count=Count('vacStck_id__vac_id')
            ).order_by('-count')

            # Convert to dictionary format {vaccine_name: count}
            vaccine_counts = {
                item['vacStck_id__vac_id__vac_name']: item['count'] 
                for item in queryset
            }

            return Response({
                'success': True,
                'month': month,
                'vaccine_counts': vaccine_counts,
                'total_records': sum(vaccine_counts.values())
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
class VaccinationTotalCountAPIView(APIView):
    def get(self, request):
        try:
            # Count records connected to vacStck_id (and not vac_id)
            total_records = VaccinationHistory.objects.filter(
                vacStck_id__isnull=False,
                vac__isnull=True  # Exclude records with vac_id
            ).count()

            # Count records grouped by vaccine name from vacStck_id
            items_count = VaccinationHistory.objects.filter(
                vacStck_id__isnull=False,
                vac__isnull=True
            ).values(
                'vacStck_id__vac_id__vac_name'  # Adjust based on your model relationships
            ).annotate(
                count=Count('vachist_id')
            ).order_by('-count')

            return Response({
                'success': True,
                'total_records': total_records,
                'items_count': items_count
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
            
            
class MaternalVaccinationSubmissionView(APIView):
    @transaction.atomic
    def post(self, request):
        try:
            data = request.data
            
            # Extract data from request - fixed structure
            form_data = data.get('form_data', {})
            signature = data.get('signature')
            vacStck_id = data.get('vacStck_id')
            vac_id = data.get('vac_id')
            vac_name = data.get('vac_name')
            expiry_date = data.get('expiry_date')
            follow_up_data = data.get('follow_up_data', {})
            vaccination_history = data.get('vaccination_history', [])
            assigned_to_id=form_data.get("selectedStaffId")  # This can be None
            print("staff",form_data.get("staff_id"))
            print("form",form_data)
            
            # Get staff_id from request user
            staff_id = form_data.get("staff_id") or None
            if not staff_id:
                return Response(
                    {'error': 'Staff ID not found'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            assigned_to_instance = None
            if assigned_to_id:
                try:
                    assigned_to_instance = Staff.objects.get(staff_id=assigned_to_id)
                except Staff.DoesNotExist:
                    return Response(
                        {'error': 'Assigned staff not found'}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Get vaccine stock
            try:
                vaccine_stock = VaccineStock.objects.select_related('vac_id').get(vacStck_id=vacStck_id)
            except VaccineStock.DoesNotExist:
                return Response(
                    {'error': 'Vaccine stock not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            vac_type = vaccine_stock.vac_id.vac_type_choices
            
            # Update vaccine stock quantity
            if vaccine_stock.vacStck_qty_avail < 1:
                return Response(
                    {'error': 'Insufficient vaccine stock available'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            vaccine_stock.vacStck_qty_avail -= 1
            vaccine_stock.save()
            
            # Create antigen transaction with appropriate unit
            if vaccine_stock.solvent == 'diluent':
                antt_qty = "1 container"
            else:
                antt_qty = "1 dose"
            
            AntigenTransaction.objects.create(
                antt_qty=antt_qty,
                antt_action="Vaccination administered",
                vacStck_id=vaccine_stock,
                staff_id=staff_id
            )
            
            # Update inventory timestamp
            if vaccine_stock.inv_id:
                inventory = vaccine_stock.inv_id
                inventory.updated_at = timezone.now()
                inventory.save()
            
            # Determine status - removed assignment_option since it's not in frontend
            status_val = "completed"  # Default to completed since no assignment option
            
            # Get patient ID from request or data - you need to determine how this is passed
            pat_id = form_data.get("pat_id")  # You need to ensure this is passed from frontend
            
            if not pat_id:
                return Response(
                    {'error': 'Patient ID is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Process based on vaccine type
            if vac_type == "routine":
                result = self.process_routine_vaccination(
                    data, form_data, signature, pat_id,
                    vaccine_stock, status_val, follow_up_data, vac_name, staff_id,assigned_to_instance
                )
            elif vac_type == "primary":
                result = self.process_primary_vaccination(
                    data, form_data, signature, pat_id,
                    vaccine_stock, status_val, follow_up_data, vac_name, staff_id,
                    vaccination_history,assigned_to_instance
                )
            elif vac_type == "conditional":
                result = self.process_conditional_vaccination(
                    data, form_data, signature, pat_id,
                    vaccine_stock, status_val, follow_up_data, vac_name, staff_id,
                    vaccination_history,assigned_to_instance
                )
            else:
                return Response(
                    {'error': f'Unknown vaccine type: {vac_type}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(result, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def process_routine_vaccination(self, data, form_data, signature, pat_id, 
                                  vaccine_stock, status_val, follow_up_data, 
                                  vac_name, staff_id,assigned_to_instance):
    
        # Check if there's an existing vaccination record for this patient and vaccine
        existing_vacrec = None
        try:
            # First find patient records for this patient
            patient_records = PatientRecord.objects.filter(pat_id_id=pat_id, patrec_type="Vaccination Record")
            
            # Look for a vaccination record that has history with the same vaccine
            for patrec in patient_records:
                try:
                    vacrec = VaccinationRecord.objects.get(patrec_id=patrec.patrec_id)
                    # Check if this vacrec has any history with the same vaccine
                    if VaccinationHistory.objects.filter(
                        vacrec=vacrec, 
                        vacStck_id__vac_id=vaccine_stock.vac_id,
                        
                    ).exists():
                        existing_vacrec = vacrec
                        existing_patrec = patrec
                        break
                except VaccinationRecord.DoesNotExist:
                    continue
                    
        except (PatientRecord.DoesNotExist, VaccinationRecord.DoesNotExist):
            existing_vacrec = None
        
        # Create or use existing patient record
        if existing_vacrec:
            patient_record = existing_patrec
            vaccination_record = existing_vacrec
        else:
            # Create new patient record if no existing record found
            patient_record = PatientRecord.objects.create(
                pat_id_id=pat_id,
                patrec_type="Vaccination Record",
            )
            
            # Create new vaccination record
            vaccination_record = VaccinationRecord.objects.create(
                patrec_id=patient_record,
                vacrec_totaldose=int(form_data.get('vacrec_totaldose', 1))
            )
        
        # Create vital signs - always create if data is available
        vital = None
        if form_data:  # Check if form_data exists
            vital = VitalSigns.objects.create(
                vital_bp_systolic=form_data.get('bpsystolic', ''),
                vital_bp_diastolic=form_data.get('bpdiastolic', ''),
                vital_temp=form_data.get('temp', ''),
                vital_o2=form_data.get('o2', ''),
                vital_pulse=form_data.get('pr', ''),
                vital_RR=form_data.get('vital_RR', ''),
                staff_id=staff_id,
                patrec=patient_record
            )
        
        # Create follow-up visit if needed
        followv = None
        if follow_up_data:
            followv = FollowUpVisit.objects.create(
                followv_date=follow_up_data.get('followv_date'),
                followv_status='pending',
                followv_description=follow_up_data.get('followv_description') or 
                                f"Follow-up visit for {vac_name}",
                patrec=patient_record
            )
        
        # Create vaccination history - convert to integer
        vachist = VaccinationHistory.objects.create(
            vacrec=vaccination_record,
            vacStck_id=vaccine_stock,  # Removed assigned_to field
            vachist_doseNo=int(form_data.get('vachist_doseNo', 1)),
            vachist_status=status_val,
            staff_id=staff_id,
            vital=vital,
            followv=followv,
            signature=signature,
            date_administered=timezone.now().date(),
            assigned_to= assigned_to_instance
        )
        
        return {
            'patrec_id': patient_record.patrec_id,
            'vacrec_id': vaccination_record.vacrec_id,
            'vachist_id': vachist.vachist_id,
            'vital_id': vital.vital_id if vital else None,
            'followv_id': followv.followv_id if followv else None,
            'is_new_record': not existing_vacrec
        }

    def process_primary_vaccination(self, data, form_data, signature, pat_id, 
                                   vaccine_stock, status_val, follow_up_data, 
                                   vac_name, staff_id, vaccination_history,assigned_to_instance):
        # Convert to integers for comparison
        dose_no = int(form_data.get('vachist_doseNo', 1))
        total_dose = int(form_data.get('vacrec_totaldose', 0))
        
        if dose_no == 1:
            # First dose - create new records
            patient_record = PatientRecord.objects.create(
                pat_id_id=pat_id,
                patrec_type="Vaccination Record",
            )
            
            vital = None
            if form_data:
                vital = VitalSigns.objects.create(
                    vital_bp_systolic=form_data.get('bpsystolic', ''),
                    vital_bp_diastolic=form_data.get('bpdiastolic', ''),
                    vital_temp=form_data.get('temp', ''),
                    vital_o2=form_data.get('o2', ''),
                    vital_pulse=form_data.get('pr', ''),
                    vital_RR=form_data.get('vital_RR', ''),
                    staff_id=staff_id,
                    patrec=patient_record
                )
            
            vaccination_record = VaccinationRecord.objects.create(
                patrec_id=patient_record,
                vacrec_totaldose=total_dose
            )
            
            followv = None
            if follow_up_data:
                followv = FollowUpVisit.objects.create(
                    followv_date=follow_up_data.get('followv_date'),
                    followv_status='pending',
                    followv_description=follow_up_data.get('followv_description') or 
                                      f"Follow-up visit for {vac_name}",
                    patrec=patient_record
                )
            
            vachist = VaccinationHistory.objects.create(
                vacrec=vaccination_record,
                vacStck_id=vaccine_stock,  # Removed assigned_to
                vachist_doseNo=dose_no,
                vachist_status=status_val,
                staff_id=staff_id,
                vital=vital,
                followv=followv,
                signature=signature,
                date_administered=timezone.now().date(),
                assigned_to= assigned_to_instance
            )
            
            return {
                'patrec_id': patient_record.patrec_id,
                'vacrec_id': vaccination_record.vacrec_id,
                'vachist_id': vachist.vachist_id,
                'vital_id': vital.vital_id if vital else None,
                'followv_id': followv.followv_id if followv else None
            }
            
        else:
            # Subsequent doses - use existing records
            if not vaccination_history:
                raise Exception("Previous vaccination history not found for subsequent dose")
            
            # Get the latest vaccination history record
            latest_history = vaccination_history[0] if isinstance(vaccination_history, list) and vaccination_history else vaccination_history
            
            old_vacrec_id = latest_history.get('vacrec_id') or latest_history.get('vacrec')
            if not old_vacrec_id:
                raise Exception("Previous vaccination record ID not found")
            
            try:
                old_vaccination_record = VaccinationRecord.objects.get(vacrec_id=old_vacrec_id)
            except VaccinationRecord.DoesNotExist:
                raise Exception("Previous vaccination record not found")
            
            vital = None
            if form_data:
                vital = VitalSigns.objects.create(
                    vital_bp_systolic=form_data.get('bpsystolic', ''),
                    vital_bp_diastolic=form_data.get('bpdiastolic', ''),
                    vital_temp=form_data.get('temp', ''),
                    vital_o2=form_data.get('o2', ''),
                    vital_pulse=form_data.get('pr', ''),
                    vital_RR=form_data.get('vital_RR', ''),
                    staff_id=staff_id,
                    patrec=old_vaccination_record.patrec_id
                )
            
            followv = None
            # FIXED: Use integer comparison
            if dose_no < total_dose and follow_up_data:
                followv = FollowUpVisit.objects.create(
                    followv_date=follow_up_data.get('followv_date'),
                    followv_status='pending',
                    followv_description=follow_up_data.get('followv_description') or 
                                      f"Follow-up visit for {vac_name}",
                    patrec=old_vaccination_record.patrec_id
                )
            
            vachist = VaccinationHistory.objects.create(
                vacrec=old_vaccination_record,
                vacStck_id=vaccine_stock,  # Removed assigned_to
                vachist_doseNo=dose_no,
                vachist_status=status_val,
                staff_id=staff_id,
                vital=vital,
                followv=followv,
                signature=signature,
                date_administered=timezone.now().date(),
                assigned_to= assigned_to_instance
            )
            
            return {
                'vachist_id': vachist.vachist_id,
                'vital_id': vital.vital_id if vital else None,
                'followv_id': followv.followv_id if followv else None
            }

    def process_conditional_vaccination(self, data, form_data, signature, pat_id, 
                                      vaccine_stock, status_val, follow_up_data, 
                                      vac_name, staff_id, vaccination_history,assigned_to_instance):
        # Convert to integer
        dose_no = int(form_data.get('vachist_doseNo', 1))
        
        if dose_no == 1:
            # First dose
            patient_record = PatientRecord.objects.create(
                pat_id_id=pat_id,
                patrec_type="Vaccination Record",
            )
            
            vital = None
            if form_data:
                vital = VitalSigns.objects.create(
                    vital_bp_systolic=form_data.get('bpsystolic', ''),
                    vital_bp_diastolic=form_data.get('bpdiastolic', ''),
                    vital_temp=form_data.get('temp', ''),
                    vital_o2=form_data.get('o2', ''),
                    vital_pulse=form_data.get('pr', ''),
                    vital_RR=form_data.get('vital_RR', ''),
                    staff_id=staff_id,
                    patrec=patient_record
                )
            
            # Convert to integer for the vaccination record
            vaccination_record = VaccinationRecord.objects.create(
                patrec_id=patient_record,
                vacrec_totaldose=int(form_data.get('vacrec_totaldose', 0))
            )
            
            # Create follow-up visit if needed for first dose
            followv = None
            if follow_up_data:
                followv = FollowUpVisit.objects.create(
                    followv_date=follow_up_data.get('followv_date'),
                    followv_status='pending',
                    followv_description=follow_up_data.get('followv_description') or 
                                      f"Follow-up visit for {vac_name}",
                    patrec=patient_record
                )
            
            vachist = VaccinationHistory.objects.create(
                vacrec=vaccination_record,
                vacStck_id=vaccine_stock,  # Removed assigned_to
                vachist_doseNo=dose_no,
                vachist_status=status_val,
                staff_id=staff_id,
                vital=vital,
                followv=followv,
                signature=signature,
                date_administered=timezone.now().date(),
                assigned_to=assigned_to_instance
            )
            
            return {
                'patrec_id': patient_record.patrec_id,
                'vacrec_id': vaccination_record.vacrec_id,
                'vachist_id': vachist.vachist_id,
                'vital_id': vital.vital_id if vital else None,
                'followv_id': followv.followv_id if followv else None
            }
            
        else:
            # Subsequent doses
            if not vaccination_history:
                raise Exception("Previous vaccination history not found for subsequent dose")
            
            # Get the latest vaccination history record
            latest_history = vaccination_history[0] if isinstance(vaccination_history, list) and vaccination_history else vaccination_history
            
            old_vacrec_id = latest_history.get('vacrec_id') or latest_history.get('vacrec')
            if not old_vacrec_id:
                raise Exception("Previous vaccination record ID not found")
            
            try:
                old_vaccination_record = VaccinationRecord.objects.get(vacrec_id=old_vacrec_id)
            except VaccinationRecord.DoesNotExist:
                raise Exception("Previous vaccination record not found")
            
            vital = None
            if form_data:
                vital = VitalSigns.objects.create(
                    vital_bp_systolic=form_data.get('bpsystolic', ''),
                    vital_bp_diastolic=form_data.get('bpdiastolic', ''),
                    vital_temp=form_data.get('temp', ''),
                    vital_o2=form_data.get('o2', ''),
                    vital_pulse=form_data.get('pr', ''),
                    vital_RR=form_data.get('vital_RR', ''),
                    staff_id=staff_id,
                    patrec=old_vaccination_record.patrec_id
                )
            
            followv = None
            if follow_up_data:
                followv = FollowUpVisit.objects.create(
                    followv_date=follow_up_data.get('followv_date'),
                    followv_status='pending',
                    followv_description=follow_up_data.get('followv_description') or 
                                      f"Follow-up visit for {vac_name}",
                    patrec=old_vaccination_record.patrec_id
                )
            
            vachist = VaccinationHistory.objects.create(
                vacrec=old_vaccination_record,
                vacStck_id=vaccine_stock,  # Removed assigned_to
                vachist_doseNo=dose_no,
                vachist_status=status_val,
                staff_id=staff_id,
                vital=vital,
                followv=followv,
                signature=signature,
                date_administered=timezone.now().date(),
                assigned_to= assigned_to_instance
            )
            
            return {
                'vachist_id': vachist.vachist_id,
                'vital_id': vital.vital_id if vital else None,
                'followv_id': followv.followv_id if followv else None
            }
