from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from datetime import datetime
from django.db.models import Count, Prefetch
from django.http import Http404
from apps.healthProfiling.models import PersonalAddress
from apps.healthProfiling.models import ResidentProfile
from apps.healthProfiling.serializers.resident_profile_serializers import ResidentProfileListSerializer
from ..serializers.patients_serializers import PatientSerializer, PatientRecordSerializer,TransientSerializer, TransientAddressSerializer
from ..models import   Patient, PatientRecord, Transient, TransientAddress
from ...pagination import StandardResultsPagination


@api_view(['GET'])
def get_resident_profile_list(request):
    residents = ResidentProfile.objects.filter(
        patients__isnull=True
    ).select_related('per').prefetch_related('per__personaladdress_set__add__sitio')

    serializer = ResidentProfileListSerializer(residents, many=True)
    return Response(serializer.data)

class TransientAddressView(generics.ListAPIView):
    serializer_class = TransientAddressSerializer
    queryset = TransientAddress.objects.all()

    def get_queryset(self):
        return TransientAddress.objects.all().order_by('-tradd_id')

class PatientView(generics.ListCreateAPIView):
    serializer_class = PatientSerializer
    pagination_class = StandardResultsPagination
    queryset = Patient.objects.all()

    def create(self, request, *args, **kwargs):
        print("Creating patient with data:", request.data)
        
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
            # Handle Transient Patient
                transient_data = request.data.get('transient_data')
                
                if not transient_data:
                    return Response(
                        {'error': 'transient_data is required for transient patients'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                trans_id = transient_data.get('trans_id')
                is_update = bool(trans_id)
                
                # Validate required transient fields
                required_transient_fields = [
                    'tran_lname', 'tran_fname', 'tran_dob', 'tran_sex', 
                    'tran_status', 'tran_ed_attainment', 'tran_religion', 'tran_contact'
                ]
                
                for field in required_transient_fields:
                    if not transient_data.get(field):
                        return Response(
                            {'error': f'{field} is required for transient patients'}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                philhealth_id = transient_data.get('philhealth_id', '')
                if philhealth_id is None:
                    philhealth_id = ''

                try:    
                    dob_str = transient_data['tran_dob']
                    if isinstance(dob_str, str):
                        tran_dob = datetime.strptime(dob_str, '%Y-%m-%d').date()
                        transient_data['tran_dob'] = tran_dob
                    else:
                        tran_dob = dob_str  
                except ValueError as e:
                    return Response(
                        {'error': f'Invalid date format for tran_dob. Expected YYYY-MM-DD: {str(e)}'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # create TransientAddress if address data is provided
                transient_address = None
                tradd_id_frontend = transient_data.get('tradd_id')
                address_data = transient_data.get('address')

                if tradd_id_frontend:
                    try:
                        transient_address = TransientAddress.objects.get(tradd_id=tradd_id_frontend)
                        print(f"Existing tradd_id found: {transient_address.tradd_id}")
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
                    
                    if is_update: # update if trans_id and tradd_id exist
                        try:
                            existing_transient = Transient.objects.get(trans_id=trans_id)
                            if(existing_transient.tradd_id):
                                transient_address = existing_transient.tradd_id
                                transient_address.tradd_province = address_data['tradd_province']
                                transient_address.tradd_city = address_data['tradd_city']
                                transient_address.tradd_barangay = address_data['tradd_barangay']
                                transient_address.tradd_street = address_data['tradd_street']
                                transient_address.tradd_sitio = address_data.get('tradd_sitio', '')
                                transient_address.save()
                        except Transient.DoesNotExist:
                            return Response(
                                {'error': f'Transient with trans_id {trans_id} does not exist'},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    else: # create new transient address
                        transient_address_exists = TransientAddress.objects.filter(
                            tradd_province=address_data['tradd_province'],
                            tradd_city=address_data['tradd_city'],
                            tradd_barangay=address_data['tradd_barangay'],
                            tradd_street=address_data['tradd_street'],
                            tradd_sitio=address_data.get('tradd_sitio', '')
                        ).first()

                        if transient_address_exists:
                            transient_address = transient_address_exists
                            print(f'Using existing tradd_id: {transient_address.tradd_id}')
                        else:
                            transient_address = TransientAddress.objects.create(
                                tradd_province=address_data['tradd_province'],
                                tradd_city=address_data['tradd_city'],
                                tradd_barangay=address_data['tradd_barangay'],
                                tradd_street=address_data['tradd_street'],
                                tradd_sitio=address_data.get('tradd_sitio', '')
                            )
                
                if is_update:
                    try:
                        transient = Transient.objects.get(trans_id=trans_id)
                        fields_to_check = [
                            ('tran_lname', transient_data['tran_lname']),
                            ('tran_fname', transient_data['tran_fname']),
                            ('tran_mname', transient_data.get('tran_mname', '')),
                            ('tran_suffix', transient_data.get('tran_suffix', '')),
                            ('tran_dob', transient_data['tran_dob']),
                            ('tran_sex', transient_data['tran_sex']),
                            ('tran_contact', transient_data['tran_contact']),
                            ('tran_status', transient_data['tran_status']),
                            ('tran_ed_attainment', transient_data['tran_ed_attainment']),
                            ('tran_religion', transient_data['tran_religion']),
                            ('philhealth_id', transient_data.get('philhealth_id', '')),
                        ]

                        has_changes = False
                        for field_name, new_value in fields_to_check:
                            current_value = getattr(transient, field_name)
                            if current_value != new_value:
                                has_changes = True
                                setattr(transient, field_name, new_value)
                        
                        # check if address has changed
                        if transient_address and transient.tradd_id != transient_address:
                            transient.tradd_id = transient_address
                            has_changes = True
                        
                        if has_changes:
                            transient.save()
                            print(f"Transient {trans_id} updated with changes.")
                        else:
                            print(f'No changes detected therefore no update for Transient {trans_id}');
                    
                    except Transient.DoesNotExist:
                        return Response(
                            {'error': f'Transient {trans_id} does not exist'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                else:
                    # generate unique trans_id
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
                    
                    # Create Transient record
                    transient = Transient.objects.create(
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
                        philhealth_id=philhealth_id,
                        tradd_id=transient_address
                    )
                
                if is_update:
                    try:
                        patient = Patient.objects.get(trans_id=transient)
                        print(f'Found existing patient: {patient.pat_id} for transient: {trans_id}')
                    
                    except Patient.DoesNotExist:
                        patient_data = {
                            'pat_type': pat_type,
                            'trans_id': transient,
                            'pat_status': 'Active'
                        }
                        patient = Patient.objects.create(**patient_data)
                        print(f'Created new patient: {patient.pat_id} for transient')
                        
                        return Response (
                            { 'error': f'Patient record not found for transient {trans_id}' },
                            status=status.HTTP_404_NOT_FOUND
                        )
                else: # Create transient patient
                    patient_data = {
                        'pat_type': pat_type,
                        'trans_id': transient,
                        'pat_status': 'Active'
                    }
                    patient = Patient.objects.create(**patient_data)
                
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
        queryset = Patient.objects.select_related(
            'rp_id__per',
        ).prefetch_related(
            Prefetch(
                'rp_id__per__personaladdress_set',
                queryset=PersonalAddress.objects.select_related('add', 'add__sitio')
            ),
            'rp_id__household_set',
        ).filter(pat_status='Active')

        params = self.request.query_params
        status = params.get('status')
        search = params.get('search')

        from django.db.models import Q
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
    

class PatientDetailView(generics.RetrieveAPIView):
    serializer_class = PatientSerializer
    lookup_field = 'pat_id'

    def get_queryset(self):
        return Patient.objects.select_related(
            'rp_id__per'
        ).prefetch_related(
            'rp_id__per__personaladdress_set__add__sitio'
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

                update_fields = {
                    'tran_lname': transient_data.get('tran_lname'),
                    'tran_fname': transient_data.get('tran_fname'),
                    'tran_mname': transient_data.get('tran_mname'),
                    'tran_suffix': transient_data.get('tran_suffix'),
                    'tran_dob': transient_data.get('tran_dob'),
                    'tran_sex': transient_data.get('tran_sex'),
                    'tran_contact': transient_data.get('tran_contact'),
                    'philhealth_id': transient_data.get('philhealth_id', ''),
                }

                for field, value in update_fields.items():
                    setattr(transient, field, value)
        
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
