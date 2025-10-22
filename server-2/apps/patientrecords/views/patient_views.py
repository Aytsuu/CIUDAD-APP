from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from datetime import datetime
from django.db.models import Count, Prefetch, Q
from django.http import Http404
from apps.healthProfiling.models import PersonalAddress
from apps.healthProfiling.models import ResidentProfile
from ..serializers.patients_serializers import *
from ..serializers.followvisits_serializers import *
from ..models import   Patient, PatientRecord, Transient, TransientAddress
from ...pagination import StandardResultsPagination
from apps.medicalConsultation.models import *
from apps.medicalConsultation.serializers import *
from apps.maternal.models import *
from apps.maternal.serializers.prenatal_serializer import *

@api_view(['GET'])
def get_resident_profile_list(request):
    residents = ResidentProfile.objects.filter(
        patients__isnull=True
    ).select_related(
        'per'
    ).prefetch_related(
        'per__personal_addresses__add__sitio'
    )

    serializer = ResidentProfileSerializer(residents, many=True)
    return Response(serializer.data)

class TransientAddressView(generics.ListAPIView):
    serializer_class = TransientAddressSerializer
    queryset = TransientAddress.objects.all()

    def get_queryset(self):
        return TransientAddress.objects.all().order_by('-tradd_id')
    
# for displaying patients in comobox
class PatientListView(generics.ListAPIView):
    serializer_class = PatientSerializer
    queryset = Patient.objects.all()

    def get_queryset(self):
        return Patient.objects.select_related(
            'rp_id__per',
        ).prefetch_related(
            Prefetch(
                'rp_id__per__personal_addresses',
                queryset=PersonalAddress.objects.select_related('add', 'add__sitio')
            ),
            'rp_id__household_set',
        ).filter(pat_status='Active')

class PatientView(generics.ListCreateAPIView):
    serializer_class = PatientSerializer
    pagination_class = StandardResultsPagination
    queryset = Patient.objects.all()

    def create(self, request, *args, **kwargs):
        print("Creating patient with data:", request.data)
        
        # Initialize patient variable to avoid scope issues
        patient = None
        
        # Validate required fields
        pat_type = request.data.get('pat_type')
        rp_id = request.data.get('rp_id')
        
        if not pat_type:
            return Response(
                {'error': 'pat_type is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
                
        try:
            if pat_type  == 'Resident':
                rp_id = request.data.get('rp_id')
                if not rp_id:
                    return Response(
                        {'error': 'rp_id is required for Resident type'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                try:
                    resident_profile = ResidentProfile.objects.get(rp_id=rp_id)
                except ResidentProfile.DoesNotExist:
                    return Response(
                        {'error': f'Resident profile with rp_id {rp_id} does not exist'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
        
                # check if patient already exists for this resident
                existing_patient = Patient.objects.filter(rp_id=rp_id, pat_status='Active').first()
                if existing_patient:
                    return Response(
                        {'error': 'A patient record already exists for this resident'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                patient_data = {
                    'pat_type': pat_type,
                    'rp_id': resident_profile,
                    'pat_status': 'Active' 
                }

                patient = Patient.objects.create(**patient_data)
        
                
            elif pat_type == 'Transient':
                # Handle Transient Patient using extracted method
                result = self._handle_transient_patient(request.data)
                if isinstance(result, Response):  # Error response
                    return result
                patient = result
            
            else:
                return Response(
                    {'error': f'Invalid patient type: {pat_type}. Must be either "Resident" or "Transient"'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            serializer = self.get_serializer(patient)
            print(f"Patient created successfully: {patient.pat_id}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            print(f"Error creating patient: {str(e)}")  
            return Response(
                {'error': f'Failed to create patient: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_queryset(self):
        # Base queryset: include resident and transient address relations to avoid extra queries
        queryset = Patient.objects.select_related(
            'rp_id__per',
            'trans_id__tradd_id',
        ).prefetch_related(
            Prefetch(
                'rp_id__per__personal_addresses',
                queryset=PersonalAddress.objects.select_related('add', 'add__sitio')
            ),
            'rp_id__household_set',
        ).filter(pat_status='Active')

        params = self.request.query_params
        status = params.get('status')
        search = params.get('search')

        from django.db.models import Q
        filters = Q()

        # Filter by pat_type when a specific status is requested (and not 'all')
        if status and status.lower() not in ["all", ""]:
            filters &= Q(pat_type=status)

        # If a search term is provided, build a set of ORed search conditions
        if search:
            search = search.strip()
            if search:
                search_filters = Q()

                # Resident name fields
                search_filters |= (
                    Q(rp_id__per__per_fname__icontains=search) |
                    Q(rp_id__per__per_mname__icontains=search) |
                    Q(rp_id__per__per_lname__icontains=search)
                )

                # Resident address fields (sitio name and street)
                search_filters |= (
                    Q(rp_id__per__personal_addresses__add__sitio__sitio_name__icontains=search) |
                    Q(rp_id__per__personal_addresses__add__add_street__icontains=search)
                )

                # Transient name fields
                search_filters |= (
                    Q(trans_id__tran_fname__icontains=search) |
                    Q(trans_id__tran_mname__icontains=search) |
                    Q(trans_id__tran_lname__icontains=search)
                )

                # Transient address fields (street and sitio)
                search_filters |= (
                    Q(trans_id__tradd_id__tradd_street__icontains=search) |
                    Q(trans_id__tradd_id__tradd_sitio__icontains=search)
                )

                filters &= search_filters

        # apply filters and ensure distinct results when joins are present
        if filters:
            queryset = queryset.filter(filters).distinct()

        return queryset

    def _handle_transient_patient(self, request_data):
        """
        Extracted method to handle transient patient creation/update
        Returns either a Patient object or an error Response
        """
        transient_data = request_data.get('transient_data')
        
        if not transient_data:
            return Response(
                {'error': 'transient_data is required for transient patients'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate required transient fields
        required_fields = [
            'tran_lname', 'tran_fname', 'tran_dob', 'tran_sex', 
            'tran_status', 'tran_ed_attainment', 'tran_religion', 'tran_contact'
        ]
        
        for field in required_fields:
            if not transient_data.get(field):
                return Response(
                    {'error': f'{field} is required for transient patients'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Handle date parsing
        try:
            dob_str = transient_data['tran_dob']
            if isinstance(dob_str, str):
                tran_dob = datetime.strptime(dob_str, '%Y-%m-%d').date()
                transient_data['tran_dob'] = tran_dob
        except ValueError as e:
            return Response(
                {'error': f'Invalid date format for tran_dob. Expected YYYY-MM-DD: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Handle address
        transient_address = self._handle_transient_address(transient_data)
        if isinstance(transient_address, Response):  # Error response
            return transient_address
        
        # Handle transient creation/update
        trans_id = transient_data.get('trans_id')
        if trans_id:
            transient = self._update_existing_transient(trans_id, transient_data, transient_address)
        else:
            transient = self._create_new_transient(transient_data, transient_address)
        
        if isinstance(transient, Response):  # Error response
            return transient
        
        # Create or get patient
        try:
            patient = Patient.objects.get(trans_id=transient)
            print(f'Found existing patient: {patient.pat_id} for transient: {transient.trans_id}')
        except Patient.DoesNotExist:
            patient_data = {
                'pat_type': 'Transient',
                'trans_id': transient,
                'pat_status': 'Active'
            }
            patient = Patient.objects.create(**patient_data)
            print(f'Created new patient: {patient.pat_id} for transient: {transient.trans_id}')
        
        return patient

    def _handle_transient_address(self, transient_data):
        """Handle transient address creation/update logic"""
        tradd_id_frontend = transient_data.get('tradd_id')
        address_data = transient_data.get('address')

        if tradd_id_frontend:
            try:
                return TransientAddress.objects.get(tradd_id=tradd_id_frontend)
            except TransientAddress.DoesNotExist:
                return Response(
                    {'error': f'TransientAddress with tradd_id {tradd_id_frontend} does not exist'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        elif address_data:
            required_address_fields = ['tradd_province', 'tradd_city', 'tradd_barangay', 'tradd_street']
            
            for field in required_address_fields:
                if not address_data.get(field):
                    return Response(
                        {'error': f'{field} is required in address data'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Check for existing address
            existing_address = TransientAddress.objects.filter(
                tradd_province=address_data['tradd_province'],
                tradd_city=address_data['tradd_city'],
                tradd_barangay=address_data['tradd_barangay'],
                tradd_street=address_data['tradd_street'],
                tradd_sitio=address_data.get('tradd_sitio', '')
            ).first()

            if existing_address:
                print(f'Using existing address: {existing_address.tradd_id}')
                return existing_address
            else:
                return TransientAddress.objects.create(
                    tradd_province=address_data['tradd_province'],
                    tradd_city=address_data['tradd_city'],
                    tradd_barangay=address_data['tradd_barangay'],
                    tradd_street=address_data['tradd_street'],
                    tradd_sitio=address_data.get('tradd_sitio', '')
                )
        
        return None

    def _create_new_transient(self, transient_data, transient_address):
        """Create a new transient record"""
        try:
            # Generate unique trans_id
            year = datetime.now().year
            prefix = f'T{year}'
            
            existing_transients = Transient.objects.filter(
                trans_id__startswith=prefix
            ).values_list('trans_id', flat=True)
            
            existing_numbers = []
            for trans_id in existing_transients:
                try:
                    number_part = trans_id[len(prefix):]
                    existing_numbers.append(int(number_part))
                except (ValueError, IndexError):
                    continue
            
            next_number = max(existing_numbers, default=0) + 1
            trans_id = f'{prefix}{str(next_number).zfill(4)}'
            
            return Transient.objects.create(
                trans_id=trans_id,
                tran_lname=transient_data['tran_lname'],
                tran_fname=transient_data['tran_fname'],
                tran_mname=transient_data.get('tran_mname', ''),
                tran_suffix=transient_data.get('tran_suffix', ''),
                tran_dob=transient_data['tran_dob'],
                tran_sex=transient_data['tran_sex'],
                tran_status=transient_data['tran_status'],
                tran_ed_attainment=transient_data['tran_ed_attainment'],
                tran_religion=transient_data['tran_religion'],
                tran_contact=transient_data['tran_contact'],
                philhealth_id=transient_data.get('philhealth_id', ''),
                tradd_id=transient_address
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to create transient: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _update_existing_transient(self, trans_id, transient_data, transient_address):
        """Update an existing transient record"""
        try:
            transient = Transient.objects.get(trans_id=trans_id)
            
            # Update fields only if they have changed
            update_fields = {
                'tran_lname': transient_data['tran_lname'],
                'tran_fname': transient_data['tran_fname'],
                'tran_mname': transient_data.get('tran_mname', ''),
                'tran_suffix': transient_data.get('tran_suffix', ''),
                'tran_dob': transient_data['tran_dob'],
                'tran_sex': transient_data['tran_sex'],
                'tran_contact': transient_data['tran_contact'],
                'tran_status': transient_data['tran_status'],
                'tran_ed_attainment': transient_data['tran_ed_attainment'],
                'tran_religion': transient_data['tran_religion'],
                'philhealth_id': transient_data.get('philhealth_id', ''),
            }

            has_changes = False
            for field_name, new_value in update_fields.items():
                if getattr(transient, field_name) != new_value:
                    setattr(transient, field_name, new_value)
                    has_changes = True
            
            # Update address if changed
            if transient_address and transient.tradd_id != transient_address:
                transient.tradd_id = transient_address
                has_changes = True
            
            if has_changes:
                transient.save()
                print(f"Transient {trans_id} updated successfully")
            else:
                print(f'No changes detected for Transient {trans_id}')
            
            return transient
            
        except Transient.DoesNotExist:
            return Response(
                {'error': f'Transient {trans_id} does not exist'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to update transient: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    

class PatientDetailView(generics.RetrieveAPIView):
    serializer_class = PatientSerializer
    lookup_field = 'pat_id'

    def get_queryset(self):
        return Patient.objects.select_related(
            'rp_id__per'
        ).prefetch_related(
            'rp_id__per__personal_addresses__add__sitio'
        ).prefetch_related(
            'rp_id__household_set'
        )
    
    def get_object(self):
        """
        Override to add better error handling
        """
        try:
            return super().get_object()
        except Patient.DoesNotExist:
            raise Http404("Patient not found")



class PatientUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = PatientSerializer
    queryset = Patient.objects.all()
    lookup_field = 'pat_id'

    def patch(self, request, *args, **kwargs):
        try: 
            patient = self.get_object()

            if patient.pat_type == 'Transient' and patient.trans_id:
                transient_data = request.data.get('transient_data', {})
                transient = patient.trans_id
                
                # Handle address updates if provided
                address_data = transient_data.get('address')
                if address_data and transient.tradd_id:
                    address = transient.tradd_id
                    address.tradd_street = address_data.get('tradd_street', address.tradd_street)
                    address.tradd_sitio = address_data.get('tradd_sitio', address.tradd_sitio)
                    address.tradd_barangay = address_data.get('tradd_barangay', address.tradd_barangay)
                    address.tradd_city = address_data.get('tradd_city', address.tradd_city)
                    address.tradd_province = address_data.get('tradd_province', address.tradd_province)
                    address.save()

                # Handle date parsing for tran_dob
                tran_dob = transient_data.get('tran_dob')
                if tran_dob and isinstance(tran_dob, str):
                    try:
                        tran_dob = datetime.strptime(tran_dob, '%Y-%m-%d').date()
                    except ValueError:
                        return Response(
                            {'error': 'Invalid date format for tran_dob. Expected YYYY-MM-DD'}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )

                # Update transient fields
                update_fields = {
                    'tran_lname': transient_data.get('tran_lname'),
                    'tran_fname': transient_data.get('tran_fname'),
                    'tran_mname': transient_data.get('tran_mname'),
                    'tran_suffix': transient_data.get('tran_suffix'),
                    'tran_dob': tran_dob,
                    'tran_sex': transient_data.get('tran_sex'),
                    'tran_contact': transient_data.get('tran_contact'),
                    'philhealth_id': transient_data.get('philhealth_id', ''),
                }

                # Only update fields that have changed
                has_changes = False
                for field, value in update_fields.items():
                    if value is not None and getattr(transient, field) != value:
                        setattr(transient, field, value)
                        has_changes = True
                
                if has_changes:
                    transient.save()
                    
                    # Explicitly save the patient to trigger updated_at update
                    patient.save()
                    
                    # Return updated patient data
                    serializer = self.get_serializer(patient)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                else:
                    return Response(
                        {'message': 'No changes detected'}, 
                        status=status.HTTP_200_OK
                    )
            
            elif patient.pat_type == 'Resident':
                return Response(
                    {'error': 'Resident patient updates not implemented'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            else:
                return Response(
                    {'error': 'Invalid patient type or missing transient data'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        except Exception as e:
            print(f"Error updating transient patient: {str(e)}")
            return Response(
                {'error': f'Failed to update transient patient: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PatientRecordView(generics.ListCreateAPIView):
    serializer_class = PatientRecordSerializer
    queryset = PatientRecord.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
#Update delete
class DeleteUpdatePatientRecordView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PatientRecordSerializer
    queryset = PatientRecord.objects.all()
    lookup_field = 'patrec_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Patient record not found."}, status=status.HTTP_404_NOT_FOUND)


class UpdateTransientView(generics.RetrieveUpdateAPIView):
    serializer_class = TransientSerializer
    queryset = Transient.objects.all()
    lookup_field = 'trans_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Transient patient not found."}, status=status.HTTP_404_NOT_FOUND)

# MOBILE VIEWS KURT
@api_view(['GET'])
def get_patient_by_resident_id(request, rp_id):
    try:
        patient = Patient.objects.get(rp_id=rp_id)
        serializer = PatientSerializer(patient)
        return Response(serializer.data)
    except Patient.DoesNotExist:
        return Response(
            {"detail": "Patient not found for this resident ID."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"detail": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def check_or_create_patient(request):
    """
    Check if a patient exists for the given rp_id.
    If not, automatically create one.
    Returns the patient data in both cases.
    """
    rp_id = request.data.get('rp_id')
    
    if not rp_id:
        return Response(
            {'error': 'rp_id is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Check if resident profile exists
        try:
            resident_profile = ResidentProfile.objects.get(rp_id=rp_id)
        except ResidentProfile.DoesNotExist:
            return Response(
                {'error': f'Resident profile with rp_id {rp_id} does not exist'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if patient already exists for this resident
        existing_patient = Patient.objects.filter(
            rp_id=rp_id, 
            pat_status='Active'
        ).select_related('rp_id__per').first()
        
        if existing_patient:
            # Patient exists, return it
            serializer = PatientSerializer(existing_patient)
            return Response({
                'exists': True,
                'created': False,
                'patient': serializer.data,
                'message': 'Patient record already exists'
            }, status=status.HTTP_200_OK)
        
        # Patient doesn't exist, create new one
        patient_data = {
            'pat_type': 'Resident',
            'rp_id': resident_profile,
            'pat_status': 'Active'
        }
        
        new_patient = Patient.objects.create(**patient_data)
        
        # Fetch the created patient with relationships
        created_patient = Patient.objects.select_related('rp_id__per').get(pat_id=new_patient.pat_id)
        serializer = PatientSerializer(created_patient)
        
        return Response({
            'exists': False,
            'created': True,
            'patient': serializer.data,
            'message': 'Patient record created successfully'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Error in check_or_create_patient: {str(e)}")
        return Response(
            {'error': f'Failed to process request: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
@api_view(['GET'])
def get_appointments_by_resident_id(request, rp_id):
    try:
        try:
            resident = ResidentProfile.objects.get(rp_id=rp_id)
        except ResidentProfile.DoesNotExist:
            return Response(
                {"detail": "Resident not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get follow-up visits with select_related to optimize queries
        follow_up_appointments = FollowUpVisit.objects.filter(
            patrec__pat_id__rp_id=rp_id
        ).select_related('patrec').order_by('-followv_date', '-created_at')

        # Get medical consultation appointments
        med_consult_appointments = MedConsultAppointment.objects.filter(
            rp__rp_id=rp_id
        ).select_related('rp').order_by('-scheduled_date', '-created_at')

        # Get prenatal appointments
        prenatal_appointments = PrenatalAppointmentRequest.objects.filter(
            rp_id=rp_id
        ).order_by('-requested_at')

        # Check if any appointments exist
        has_appointments = any([
            follow_up_appointments.exists(),
            med_consult_appointments.exists(), 
            prenatal_appointments.exists()
        ])

        if not has_appointments:
            return Response({
                "follow_up_appointments": [],
                "med_consult_appointments": [],
                "prenatal_appointments": [],
                "detail": "No appointments found for this resident."
            }, status=status.HTTP_200_OK)

        # Serialize data with error handling for each serializer
        try:
            follow_up_data = FollowUpVisitSerializer(follow_up_appointments, many=True).data
        except Exception as e:
            print(f"Error serializing follow-up appointments: {str(e)}")
            follow_up_data = []

        try:
            med_consult_data = MedConsultAppointmentSerializer(med_consult_appointments, many=True).data
        except Exception as e:
            print(f"Error serializing med consult appointments: {str(e)}")
            med_consult_data = []

        # Manual serialization for prenatal appointments to avoid date serialization issues
        try:
            prenatal_data = []
            for appointment in prenatal_appointments:
                prenatal_data.append({
                    'par_id': appointment.par_id,
                    'requested_at': appointment.requested_at.isoformat() if appointment.requested_at else None,
                    'requested_date': appointment.requested_date.isoformat() if appointment.requested_date else None,
                    'approved_at': appointment.approved_at.isoformat() if appointment.approved_at else None,
                    'cancelled_at': appointment.cancelled_at.isoformat() if appointment.cancelled_at else None,
                    'completed_at': appointment.completed_at.isoformat() if appointment.completed_at else None,
                    'rejected_at': appointment.rejected_at.isoformat() if appointment.rejected_at else None,
                    'missed_at': appointment.missed_at.isoformat() if appointment.missed_at else None,
                    'reason': appointment.reason,
                    'status': appointment.status,
                    'status_display': appointment.get_status_display(),
                    'is_overdue': appointment.is_overdue(),
                    'rp_id': appointment.rp_id_id,
                    'pat_id': appointment.pat_id_id if appointment.pat_id else None
                })
        except Exception as e:
            print(f"Error serializing prenatal appointments: {str(e)}")
            prenatal_data = []

        return Response({
            "follow_up_appointments": follow_up_data,
            "med_consult_appointments": med_consult_data,
            "prenatal_appointments": prenatal_data,
            "resident_info": {
                "rp_id": resident.rp_id,
                "name": f"{resident.per.per_fname} {resident.per.per_lname}"
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Unexpected error in get_appointments_by_resident_id: {str(e)}")
        return Response(
            {"detail": "An internal server error occurred."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
class AllAppointmentsView(generics.ListAPIView):
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        return FollowUpVisit.objects.none()  # Placeholder; we handle in list()

    def list(self, request, *args, **kwargs):
        params = request.query_params
        status_param = params.get('status')
        search = params.get('search')
        time_frame = params.get('time_frame')

        # Fetch and filter each queryset with prefetching for efficiency
        follow_qs = FollowUpVisit.objects.select_related(
            'patrec__pat_id__rp_id__per',
            'patrec__pat_id__trans_id',
            'patrec__pat_id__trans_id__tradd_id'
        ).prefetch_related(
            Prefetch('patrec__pat_id__rp_id__per__personal_addresses', 
                     queryset=PersonalAddress.objects.select_related('add__sitio'))
        )

        prenatal_qs = PrenatalAppointmentRequest.objects.select_related(
            'rp_id__per',
            'pat_id__rp_id__per',
            'pat_id__trans_id',
            'pat_id__trans_id__tradd_id'
        ).prefetch_related(
            Prefetch('rp_id__per__personal_addresses', 
                     queryset=PersonalAddress.objects.select_related('add__sitio')),
            Prefetch('pat_id__rp_id__per__personal_addresses', 
                     queryset=PersonalAddress.objects.select_related('add__sitio'))
        )

        med_qs = MedConsultAppointment.objects.select_related(
            'rp__per'
        ).prefetch_related(
            Prefetch('rp__per__personal_addresses', 
                     queryset=PersonalAddress.objects.select_related('add__sitio'))
        )

        if status_param and status_param.lower() != 'all':
            normalized_status = status_param.lower()
            follow_qs = follow_qs.filter(followv_status__iexact=normalized_status)
            prenatal_qs = prenatal_qs.filter(status__iexact=normalized_status)
            med_qs = med_qs.filter(status__iexact=normalized_status)

        if search:
            search = search.strip()
            if search:
                follow_qs = follow_qs.filter(
                    Q(patrec__pat_id__rp_id__per__per_fname__icontains=search) |
                    Q(patrec__pat_id__rp_id__per__per_lname__icontains=search) |
                    Q(patrec__pat_id__trans_id__tran_fname__icontains=search) |
                    Q(patrec__pat_id__trans_id__tran_lname__icontains=search) |
                    Q(followv_description__icontains=search) |
                    Q(patrec__pat_id__pat_id__icontains=search)
                )
                prenatal_qs = prenatal_qs.filter(
                    Q(rp_id__per__per_fname__icontains=search) |
                    Q(rp_id__per__per_lname__icontains=search) |
                    Q(pat_id__trans_id__tran_fname__icontains=search) |
                    Q(pat_id__trans_id__tran_lname__icontains=search) |
                    Q(reason__icontains=search) |
                    Q(rp_id__rp_id__icontains=search) |
                    Q(pat_id__pat_id__icontains=search)
                )
                med_qs = med_qs.filter(
                    Q(rp__per__per_fname__icontains=search) |
                    Q(rp__per__per_lname__icontains=search) |
                    Q(chief_complaint__icontains=search) |
                    Q(rp__rp_id__icontains=search)
                )

        if time_frame:
            today = timezone.now().date()
            if time_frame == 'today':
                follow_qs = follow_qs.filter(followv_date=today)
                prenatal_qs = prenatal_qs.filter(requested_date=today)
                med_qs = med_qs.filter(scheduled_date=today)
            elif time_frame == 'thisWeek':
                start_of_week = today - timedelta(days=today.weekday())
                end_of_week = start_of_week + timedelta(days=6)
                follow_qs = follow_qs.filter(followv_date__range=[start_of_week, end_of_week])
                prenatal_qs = prenatal_qs.filter(requested_date__range=[start_of_week, end_of_week])
                med_qs = med_qs.filter(scheduled_date__range=[start_of_week, end_of_week])
            elif time_frame == 'thisMonth':
                start_of_month = today.replace(day=1)
                end_of_month = (today.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
                follow_qs = follow_qs.filter(followv_date__range=[start_of_month, end_of_month])
                prenatal_qs = prenatal_qs.filter(requested_date__range=[start_of_month, end_of_month])
                med_qs = med_qs.filter(scheduled_date__range=[start_of_month, end_of_month])
            # Add more time_frames as needed (e.g., 'tomorrow', 'upcoming', 'past')

        # Normalize data into list of dicts (matching ScheduleRecord)
        all_appointments = []
        all_appointments.extend(self.normalize_appointments(follow_qs, 'follow_up'))
        all_appointments.extend(self.normalize_appointments(prenatal_qs, 'prenatal'))
        all_appointments.extend(self.normalize_appointments(med_qs, 'Medical Consultation'))

        # Sort by scheduledDate descending
        all_appointments.sort(key=lambda x: x['scheduledDate'], reverse=True)

        # Paginate the combined list
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(all_appointments, request)

        # Return paginated response
        return paginator.get_paginated_response(page)

    def normalize_appointments(self, qs, appt_type):
        data = []
        for appt in qs:
            # Determine patient object
            if appt_type == 'follow_up':
                patient = appt.patrec.pat_id
                purpose = appt.followv_description
                status = appt.followv_status
                scheduled_date = appt.followv_date
            elif appt_type == 'prenatal':
                patient = appt.pat_id if appt.pat_id else appt.rp_id  # Prefer pat_id for transients
                purpose = appt.reason or 'Prenatal Checkup'
                status = appt.status
                scheduled_date = appt.requested_date
            else:  # med_consult
                patient = appt.rp  # ResidentProfile
                purpose = appt.chief_complaint
                status = appt.status
                scheduled_date = appt.scheduled_date

            # Normalize patient details (use serializer for consistency)
            if isinstance(patient, ResidentProfile):
                patient_data = UnifiedPatientSerializer(patient).data
                patient_data['patientId'] = patient.rp_id
                pat_type = 'Resident'
            elif hasattr(patient, 'rp_id') and patient.rp_id:  # Patient with rp_id
                patient_data = UnifiedPatientSerializer(patient.rp_id).data
                patient_data['patientId'] = patient.pat_id
                pat_type = 'Resident'
            else:  # Transient
                patient_data = {
                    'firstName': patient.trans_id.tran_fname if patient.trans_id else '',
                    'lastName': patient.trans_id.tran_lname if patient.trans_id else '',
                    'middleName': patient.trans_id.tran_mname if patient.trans_id else '',
                    'gender': patient.trans_id.tran_sex if patient.trans_id else '',
                    'age': self.calculate_age(patient.trans_id.tran_dob) if patient.trans_id else 0,
                    'ageTime': 'years',  # Simplify or calculate properly
                    'patientId': patient.pat_id if hasattr(patient, 'pat_id') else patient.trans_id.trans_id
                }
                pat_type = 'Transient'

            # Get sitio (from first address)
            sitio = ''
            # if pat_type == 'Resident' and patient.per.personal_addresses.exists():
            #     addr = patient.per.personal_addresses.first().add
            #     sitio = addr.sitio.sitio_name if addr.sitio else addr.add_external_sitio or ''
            # elif pat_type == 'Transient' and patient.trans_id and patient.trans_id.tradd_id:
            #     sitio = patient.trans_id.tradd_id.tradd_sitio or ''

            # Normalize status to frontend values
            normalized_status = status.capitalize()
            if status.lower() in ['approved', 'pending']:
                normalized_status = 'Pending'
            elif status.lower() == 'completed':
                normalized_status = 'Completed'
            elif status.lower() == 'missed':
                normalized_status = 'Missed'
            elif status.lower() in ['cancelled', 'rejected']:
                normalized_status = 'Cancelled'

            data.append({
                'id': appt.pk,
                'patient': patient_data,
                'scheduledDate': scheduled_date.isoformat() if scheduled_date else '',
                'purpose': purpose,
                'status': normalized_status,
                'sitio': sitio,
                'type': pat_type,
                'patrecType': appt.patrec.patrec_type if appt_type == 'follow_up' and hasattr(appt, 'patrec') else appt_type  # Or derive
            })
        return data

    def calculate_age(self, dob):
        if not dob:
            return 0
        today = date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        return age

class ChildPatientsWithoutRecordsView(generics.ListAPIView):
    serializer_class = PatientSerializer
    
    def get_queryset(self):
        from apps.healthProfiling.models import PersonalAddress
        from django.db.models import Prefetch, Q
        from datetime import date, timedelta
        
        # Around 5 years old (0-6 years range)
        today = date.today()
        six_years_ago = today - timedelta(days=6 * 365.25)
        
        # Get patients with existing child health records
        patients_with_records = PatientRecord.objects.filter(
            child_health_records__isnull=False
        ).values_list('pat_id', flat=True)
        
        return Patient.objects.select_related(
            'rp_id__per',
            'trans_id'
        ).prefetch_related(
            Prefetch(
                'rp_id__per__personal_addresses',
                queryset=PersonalAddress.objects.select_related('add', 'add__sitio')
            ),
            'rp_id__household_set',
        ).filter(
            Q(
                pat_type='Resident',
                pat_status='Active',
                rp_id__per__per_dob__gt=six_years_ago
            ) | Q(
                pat_type='Transient',
                pat_status='Active', 
                trans_id__tran_dob__gt=six_years_ago
            )
        ).exclude(
            pat_id__in=patients_with_records
        ).order_by('rp_id__per__per_dob', 'trans_id__tran_dob')