from django.shortcuts import render
from django.db.models import OuterRef, Exists, Q
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Count, Prefetch
from django.http import Http404
from apps.pagination import StandardResultsPagination
from apps.healthProfiling.models import PersonalAddress
from apps.healthProfiling.models import ResidentProfile
from apps.healthProfiling.serializers.resident_profile_serializers import ResidentProfileListSerializer
from apps.patientrecords.utils import get_completed_followup_visits, get_pending_followup_visits
from apps.medicalConsultation.models import *
from apps.patientrecords.models import FollowUpVisit

from apps.patientrecords.serializers.followvisits_serializers import FollowUpVisitSerializer, PatientSerializer, FollowUpVisitWithPatientSerializer

      
      
      
class FollowUpVisitView(generics.ListCreateAPIView):
        serializer_class = FollowUpVisitSerializer
        queryset = FollowUpVisit.objects.all()
        
        def create(self, request, *args, **kwargs):
            return super().create(request, *args, **kwargs)

class AllFollowUpVisitsView(generics.ListAPIView):
    """
    API endpoint to get all follow-up visits with patient details
    """
    serializer_class = FollowUpVisitWithPatientSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = FollowUpVisit.objects.select_related(
            'patrec',
            'patrec__pat_id',
            'patrec__pat_id__rp_id',
            'patrec__pat_id__rp_id__per',
            'patrec__pat_id__trans_id'
        ).all( )

        # filtering options 
        params = self.request.query_params
        status = params.get('status')
        search = params.get('search')
        time_frame = params.get('time_frame')

        filters = Q()

        if status and status.lower() not in ['all', '']:
            filters &= Q(followv_status__iexact=status)

        if search:
            search = search.strip()
            if search:
                search_filters = Q()

                search_filters |= (
                    Q(patrec__pat_id__rp_id__per__per_fname__icontains=search) |
                    Q(patrec__pat_id__rp_id__per__per_lname__icontains=search) 
                )

                search_filters |= (
                    Q(patrec__pat_id__trans_id__tran_fname__icontains=search) |
                    Q(patrec__pat_id__trans_id__tran_lname__icontains=search) 
                )

                search_filters |= Q(followv_description__icontains=search)

                filters &= search_filters
        
        if time_frame:
            today = timezone.now().date()
            date_filters = None

            if time_frame == 'today':
                date_filters = Q(followv_date=today)
                
            elif time_frame == 'thisWeek':
                date_filters = Q(
                    followv_date__week=today.isocalendar()[1],
                    followv_date__year=today.year
                )

            elif time_frame == 'thisMonth':
                date_filters = Q(
                    followv_date__month=today.month,
                    followv_date__year=today.year
                )
            if date_filters:
                filters &= date_filters

        if filters:
            queryset = queryset.filter(filters)

        return queryset.order_by('followv_date')


class DeleteUpdateFollowUpVisitView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FollowUpVisitSerializer
    queryset = FollowUpVisit.objects.all()
    lookup_field = 'followv_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Follow-up visit record not found."}, status=status.HTTP_404_NOT_FOUND)


class GetCompletedFollowUpVisits(APIView):
    def get(self, request, pat_id):
        try:
            # Get completed visits using the utility function
            visits = get_completed_followup_visits(pat_id)
            
            # Serialize the data
            serialized_visits = [{
                'id': visit.followv_id,
                'date': visit.followv_date.isoformat(),
                'description': visit.followv_description,
                'status': visit.followv_status,
                'patrec_id': visit.patrec_id,
                'created_at': visit.created_at.isoformat() if visit.created_at else None,
                'completed_at': visit.completed_at.isoformat() if visit.completed_at else None
            } for visit in visits]
            
            response_data = {
                'count': visits.count(),
                'results': serialized_visits
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        


class GetPendingFollowUpVisits(APIView):
    def get(self, request, pat_id):
        try:
            # Get completed visits using the utility function
            visits = get_pending_followup_visits(pat_id)
            
            # Serialize the data
            serialized_visits = [{
                'id': visit.followv_id,
                'date': visit.followv_date.isoformat(),
                'description': visit.followv_description,
                'status': visit.followv_status,
                'patrec_id': visit.patrec_id,
                'created_at': visit.created_at.isoformat() if visit.created_at else None
            } for visit in visits]
            
            response_data = {
                'count': visits.count(),
                'results': serialized_visits
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#For combine appointments / follow up visits

class AllAppointmentsView(APIView):
    """
    Combined view for all appointment types: Follow-up visits, Medical Consultations, and Prenatal
    """
    pagination_class = StandardResultsPagination
    
    def get(self, request):
        try:
            # Get query parameters
            search_query = request.query_params.get('search', '').strip()
            status_filter = request.query_params.get('status', 'all').strip()
            appointment_type = request.query_params.get('type', 'all').strip()
            time_frame = request.query_params.get('time_frame', '').strip()
            
            combined_appointments = []
            
            # 1. Fetch Follow-up Visits
            if appointment_type in ['all', 'follow-up']:
                follow_up_queryset = FollowUpVisit.objects.select_related(
                    'patrec__pat_id__rp_id__per',
                    'patrec__pat_id__trans_id__tradd_id'
                ).filter(patrec__patrec_type="Follow-up Visit")
                
                # Apply status filter
                if status_filter != 'all':
                    follow_up_queryset = follow_up_queryset.filter(followv_status=status_filter)
                
                # Apply search filter
                if search_query:
                    follow_up_queryset = follow_up_queryset.filter(
                        Q(patrec__pat_id__rp_id__per__per_fname__icontains=search_query) |
                        Q(patrec__pat_id__rp_id__per__per_lname__icontains=search_query) |
                        Q(patrec__pat_id__trans_id__tran_fname__icontains=search_query) |
                        Q(patrec__pat_id__trans_id__tran_lname__icontains=search_query) |
                        Q(followv_description__icontains=search_query)
                    )
                
                for visit in follow_up_queryset:
                    patient = visit.patrec.pat_id
                    patient_details = self._get_patient_details(patient)
                    
                    combined_appointments.append({
                        'id': visit.followv_id,
                        'type': 'follow-up',
                        'scheduled_date': visit.followv_date.isoformat() if visit.followv_date else None,
                        'purpose': visit.followv_description or 'Follow-up Visit',
                        'status': visit.followv_status or 'pending',
                        'patient_details': patient_details,
                        'created_at': visit.created_at.isoformat() if visit.created_at else None,
                        'original_data': {
                            'followv_id': visit.followv_id,
                            'followv_date': visit.followv_date,
                            'followv_description': visit.followv_description,
                            'followv_status': visit.followv_status,
                        }
                    })
            
            # 2. Fetch Medical Consultation Appointments
            if appointment_type in ['all', 'medical']:
                med_consult_queryset = MedConsultAppointment.objects.select_related(
                    'rp__per'
                ).all()
                
                # Apply status filter
                if status_filter != 'all':
                    med_consult_queryset = med_consult_queryset.filter(status=status_filter)
                
                # Apply search filter
                if search_query:
                    med_consult_queryset = med_consult_queryset.filter(
                        Q(rp__per__per_fname__icontains=search_query) |
                        Q(rp__per__per_lname__icontains=search_query) |
                        Q(chief_complaint__icontains=search_query) |
                        Q(id__icontains=search_query)
                    )
                
                for appointment in med_consult_queryset:
                    patient_details = self._get_med_consult_patient_details(appointment.rp)
                    
                    combined_appointments.append({
                        'id': appointment.id,
                        'type': 'Medical Consultation',
                        'scheduled_date': appointment.scheduled_date.isoformat() if appointment.scheduled_date else None,
                        'purpose': appointment.chief_complaint or 'Medical Consultation',
                        'status': appointment.status or 'pending',
                        'patient_details': patient_details,
                        'created_at': appointment.created_at.isoformat() if appointment.created_at else None,
                        'original_data': {
                            'appointment_id': appointment.id,
                            'scheduled_date': appointment.scheduled_date,
                            'chief_complaint': appointment.chief_complaint,
                            'status': appointment.status,
                            'meridiem': appointment.meridiem,
                        }
                    })
            
            # 3. Fetch Prenatal Appointments
            if appointment_type in ['all', 'prenatal']:
                prenatal_queryset = PrenatalAppointmentRequest.objects.select_related(
                    'rp_id__per',
                    'pat_id'
                ).all()
                
                # Apply status filter
                if status_filter != 'all':
                    prenatal_queryset = prenatal_queryset.filter(status=status_filter)
                
                # Apply search filter
                if search_query:
                    prenatal_queryset = prenatal_queryset.filter(
                        Q(rp_id__per__per_fname__icontains=search_query) |
                        Q(rp_id__per__per_lname__icontains=search_query) |
                        Q(reason__icontains=search_query) |
                        Q(par_id__icontains=search_query)
                    )
                
                for appointment in prenatal_queryset:
                    patient_details = self._get_prenatal_patient_details(appointment.rp_id, appointment.pat_id)
                    
                    combined_appointments.append({
                        'id': appointment.par_id,
                        'type': 'Prenatal',
                        'scheduled_date': appointment.requested_date.isoformat() if appointment.requested_date else None,
                        'purpose': appointment.reason or 'Prenatal Check-up',
                        'status': appointment.status or 'pending',
                        'patient_details': patient_details,
                        'created_at': appointment.requested_at.isoformat() if appointment.requested_at else None,
                        'original_data': {
                            'par_id': appointment.par_id,
                            'requested_date': appointment.requested_date,
                            'reason': appointment.reason,
                            'status': appointment.status,
                            'approved_at': appointment.approved_at,
                        }
                    })
            
            # Apply time frame filter
            if time_frame:
                today = date.today()
                combined_appointments = self._apply_time_frame_filter(combined_appointments, time_frame, today)
            
            # Sort by scheduled date (most recent first)
            combined_appointments.sort(key=lambda x: x['scheduled_date'] or '', reverse=True)
            
            # Manual pagination
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 10))
            
            total_count = len(combined_appointments)
            start_index = (page - 1) * page_size
            end_index = start_index + page_size
            paginated_data = combined_appointments[start_index:end_index]
            
            return Response({
                'count': total_count,
                'next': None if end_index >= total_count else page + 1,
                'previous': None if page == 1 else page - 1,
                'results': paginated_data,
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'error': f'Failed to fetch appointments: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_patient_details(self, patient):
        """Get patient details for follow-up visits"""
        if patient.pat_type == 'Resident' and patient.rp_id and hasattr(patient.rp_id, 'per'):
            per = patient.rp_id.per
            return {
                'pat_id': patient.pat_id,
                'pat_type': patient.pat_type,
                'personal_info': {
                    'per_fname': per.per_fname,
                    'per_lname': per.per_lname,
                    'per_mname': per.per_mname,
                    'per_sex': per.per_sex,
                    'per_dob': per.per_dob.isoformat() if per.per_dob else None,
                },
                'address': self._get_resident_address(patient.rp_id),
            }
        elif patient.pat_type == 'Transient' and patient.trans_id:
            trans = patient.trans_id
            return {
                'pat_id': patient.pat_id,
                'pat_type': patient.pat_type,
                'personal_info': {
                    'per_fname': trans.tran_fname,
                    'per_lname': trans.tran_lname,
                    'per_mname': trans.tran_mname,
                    'per_sex': trans.tran_sex,
                    'per_dob': trans.tran_dob.isoformat() if trans.tran_dob else None,
                },
                'address': self._get_transient_address(trans),
            }
        return {}
    
    def _get_med_consult_patient_details(self, resident_profile):
        """Get patient details for medical consultation appointments"""
        if resident_profile and hasattr(resident_profile, 'per'):
            per = resident_profile.per
            return {
                'pat_id': resident_profile.rp_id,
                'pat_type': 'Resident',
                'personal_info': {
                    'per_fname': per.per_fname,
                    'per_lname': per.per_lname,
                    'per_mname': per.per_mname,
                    'per_sex': per.per_sex,
                    'per_dob': per.per_dob.isoformat() if per.per_dob else None,
                },
                'address': self._get_resident_address(resident_profile),
            }
        return {}
    
    def _get_prenatal_patient_details(self, resident_profile, patient):
        """Get patient details for prenatal appointments"""
        if resident_profile and hasattr(resident_profile, 'per'):
            per = resident_profile.per
            return {
                'pat_id': patient.pat_id if patient else resident_profile.rp_id,
                'pat_type': 'Resident',
                'personal_info': {
                    'per_fname': per.per_fname,
                    'per_lname': per.per_lname,
                    'per_mname': per.per_mname,
                    'per_sex': per.per_sex,
                    'per_dob': per.per_dob.isoformat() if per.per_dob else None,
                },
                'address': self._get_resident_address(resident_profile),
            }
        return {}
    
    def _get_resident_address(self, resident_profile):
        """Get address for resident patients"""
        try:
            personal_address = PersonalAddress.objects.filter(per=resident_profile.per).first()
            if personal_address and personal_address.add:
                address = personal_address.add
                return {
                    'add_street': address.add_street or '',
                    'add_sitio': address.sitio.sitio_name if address.sitio else address.add_external_sitio or '',
                    'add_barangay': address.add_barangay or '',
                    'add_city': address.add_city or '',
                    'add_province': address.add_province or '',
                    'full_address': f"{address.add_street or ''}, {address.sitio.sitio_name if address.sitio else address.add_external_sitio or ''}, {address.add_barangay or ''}, {address.add_city or ''}, {address.add_province or ''}".strip(', '),
                }
        except Exception:
            pass
        return {}
    
    def _get_transient_address(self, transient):
        """Get address for transient patients"""
        if hasattr(transient, 'tradd_id') and transient.tradd_id:
            address = transient.tradd_id
            return {
                'add_street': address.tradd_street or '',
                'add_sitio': address.tradd_sitio or '',
                'add_barangay': address.tradd_barangay or '',
                'add_city': address.tradd_city or '',
                'add_province': address.tradd_province or '',
                'full_address': f"{address.tradd_street or ''}, {address.tradd_sitio or ''}, {address.tradd_barangay or ''}, {address.tradd_city or ''}, {address.tradd_province or ''}".strip(', '),
            }
        return {}
    
    def _apply_time_frame_filter(self, appointments, time_frame, today):
        """Apply time frame filter to appointments"""
        filtered_appointments = []
        
        for appointment in appointments:
            if not appointment['scheduled_date']:
                continue
                
            try:
                appointment_date = datetime.fromisoformat(appointment['scheduled_date'].replace('Z', '+00:00')).date()
                
                if time_frame == 'today' and appointment_date == today:
                    filtered_appointments.append(appointment)
                elif time_frame == 'this-week':
                    start_of_week = today - timedelta(days=today.weekday())
                    if appointment_date >= start_of_week:
                        filtered_appointments.append(appointment)
                elif time_frame == 'this-month':
                    start_of_month = today.replace(day=1)
                    if appointment_date >= start_of_month:
                        filtered_appointments.append(appointment)
                elif time_frame == 'upcoming' and appointment_date >= today:
                    filtered_appointments.append(appointment)
                elif time_frame == 'past' and appointment_date < today:
                    filtered_appointments.append(appointment)
            except ValueError:
                # Skip appointments with invalid date format
                continue
        
        return filtered_appointments    