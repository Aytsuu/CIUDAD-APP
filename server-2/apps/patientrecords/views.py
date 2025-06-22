from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import *
from datetime import datetime
from django.db.models import Count, Prefetch
from django.http import Http404
from apps.healthProfiling.models import PersonalAddress
from apps.healthProfiling.models import ResidentProfile
from apps.healthProfiling.serializers.resident_profile_serializers import ResidentProfileListSerializer
from .utils import *

@api_view(['GET'])
def get_resident_profile_list(request):
    residents = ResidentProfile.objects.filter(
        patients__isnull=True
    ).select_related('per').prefetch_related('per__personaladdress_set__add__sitio')

    serializer = ResidentProfileListSerializer(residents, many=True)
    return Response(serializer.data)


class PatientView(generics.ListCreateAPIView):
    serializer_class = PatientSerializer
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
                address_data = transient_data.get('address')
                if address_data:
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
                        tradd_id=transient_address
                    )
                
                if is_update:
                    try:
                        patient = Patient.objects.get(trans_id=transient)
                        print(f'Found existing patient: {patient.pat_id} for transient: {trans_id}')
                        # if patient.pat_status != "Active":
                        #     patient.pat_status = "Active"
                        #     patient.save()
                    
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
        return Patient.objects.select_related(
            'rp_id__per',
        ).prefetch_related(
            Prefetch(
                'rp_id__per__personaladdress_set',
                queryset=PersonalAddress.objects.select_related('add', 'add__sitio')
            ),
            'rp_id__household_set',
        ).filter(pat_status='Active')

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

class VitalSignsView(generics.ListCreateAPIView):
    serializer_class = VitalSignsSerializer
    queryset  =VitalSigns.objects.all()
   
class  DeleteUpdateVitalSignsView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VitalSignsSerializer
    queryset = VitalSigns.objects.all()
    lookup_field = 'vital_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Vital signs record not found."}, status=status.HTTP_404_NOT_FOUND)
        
# # **Obstetrical History**
class ObstetricalHistoryView(generics.ListCreateAPIView):
    serializer_class = ObstetricalHistorySerializer
    queryset = Obstetrical_History.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)



class SpouseCreateView(generics.CreateAPIView):
    serializer_class = SpouseCreateSerializer

    def create(self, request, *args, **kwargs):
        required_fields = ['spouse_lname', 'spouse_fname', 'spouse_occupation', 'rp_id']

        for field in required_fields:
            if not request.data.get(field):
                return Response(
                    {'error': 'f{field} is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if 'spouse_dob' not in request.data:
            request.data['spouse_dob'] = None
        
        return super().create(request, *args, **kwargs)

class SpouseListView(generics.ListAPIView):
    serializer_class = SpouseSerializer

    def get_queryset(self):
        rp_id = self.request.query_params.get('rp_id')

        if rp_id:
            return Spouse.objects.filter(rp_id=rp_id)
        return Spouse.objects.all()

class SpouseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SpouseSerializer
    queryset = Spouse.objects.all()
    lookup_field = 'spouse_id'
    
# class SpouseRetrieveDeleteUpdate(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = SpouseSerializer
#     queryset = Spouse.objects.all()
#     lookup_field = 'spouse_id'

#     def get_object(self):
#         spouse_id = self.kwargs.get('spouse_id')
#         return get_object_or_404(Spouse, spouse_id=spouse_id)

        
class FollowUpVisitView(generics.ListCreateAPIView):
        serializer_class = FollowUpVisitSerializer
        queryset = FollowUpVisit.objects.all()
        
        def create(self, request, *args, **kwargs):
            return super().create(request, *args, **kwargs)

        
class DeleteUpdateFollowUpVisitView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FollowUpVisitSerializer
    queryset = FollowUpVisit.objects.all()
    lookup_field = 'followv_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Follow-up visit record not found."}, status=status.HTTP_404_NOT_FOUND)


class BodyMeasurementView(generics.ListCreateAPIView):
    serializer_class = BodyMeasurementSerializer
    queryset = BodyMeasurement.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
class DeleteUpdateBodyMeasurementView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BodyMeasurementSerializer
    queryset = BodyMeasurement.objects.all()
    lookup_field = 'bmi_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Body measurement record not found."}, status=status.HTTP_404_NOT_FOUND)

class IllnessView(generics.ListCreateAPIView):
    serializer_class = IllnessSerializer
    queryset = Illness.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class DeleteUpdateIllnessView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IllnessSerializer
    queryset = Illness.objects.all()
    lookup_field = 'ill_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Illness record not found."}, status=status.HTTP_404_NOT_FOUND)

class FindingView(generics.ListCreateAPIView):
    serializer_class = FindingSerializer
    queryset = Finding.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class DeleteUpdateFindingView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FindingSerializer
    queryset = Finding.objects.all()
    lookup_field = 'find_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Finding record not found."}, status=status.HTTP_404_NOT_FOUND)

class PhysicalExaminationView(generics.ListCreateAPIView):
    serializer_class = PhysicalExaminationSerializer
    queryset = PhysicalExamination.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class DeleteUpdatePhysicalExaminationView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PhysicalExaminationSerializer
    queryset = PhysicalExamination.objects.all()
    lookup_field = 'pe_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Physical examination record not found."}, status=status.HTTP_404_NOT_FOUND)
        
class PhysicalExamListView(generics.ListCreateAPIView):
    serializer_class = PhysicalExamListSerializer
    queryset = PhysicalExamList.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class DeleteUpdatePhysicalExamListView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PhysicalExamListSerializer
    queryset = PhysicalExamList.objects.all()
    lookup_field = 'pel_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Physical examination list record not found."}, status=status.HTTP_404_NOT_FOUND)
        
        
class DiagnosisView(generics.ListCreateAPIView):
    serializer_class = DiagnosisSerializer
    queryset = Diagnosis.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class  DeleteUpdateDiagnosisView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DiagnosisSerializer
    queryset = Diagnosis.objects.all()
    lookup_field = 'diag_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Diagnosis record not found."}, status=status.HTTP_404_NOT_FOUND)
        


class GetCompletedFollowUpVisits(APIView):
    """
    API endpoint to get all completed follow-up visits for a specific patient
    """
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
                'updated_at': visit.updated_at.isoformat() if visit.updated_at else None
            } for visit in visits]
            
            response_data = {
                'count': visits.count(),
                'results': serialized_visits
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        


class GetPendingFollowUpVisits(APIView):
    """
    API endpoint to get all completed follow-up visits for a specific patient
    """
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

  
  
