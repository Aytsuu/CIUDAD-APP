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
from ..models import  *
from ..serializers.illness_serializers import IllnessSerializer

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

class PHIllnessAPIView(APIView):
    """
    API view to get all illnesses with PH-1 to PH-20 codes without serializer
    """
    
    def get(self, request):
        try:
            # Generate the list of PH codes from PH-1 to PH-20
            ph_codes = [f'PH-{i}' for i in range(1, 21)]
            
            # Get illnesses with these specific codes, ordered by ill_code
            illnesses = Illness.objects.filter(ill_code__in=ph_codes).order_by('ill_code')
            
            # Convert queryset to list of dictionaries
            illness_data = []
            for illness in illnesses:
                illness_data.append({
                    'ill_id': illness.ill_id,
                    'illname': illness.illname,
                    'ill_description': illness.ill_description,
                    'ill_code': illness.ill_code,
                    'created_at': illness.created_at.isoformat() if illness.created_at else None
                })
            
            # Return successful response
            return Response({
                'status': 'success',
                'message': 'PH illnesses retrieved successfully',
                'count': len(illness_data),
                'data': illness_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Return error response if something goes wrong
            return Response({
                'status': 'error',
                'message': 'Failed to retrieve PH illnesses',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   
   
   
class PatientPHIllnessCheckSimpleAPIView(APIView):
    """
    API view that only returns other illnesses as comma-separated string
    Uses pat_id in URL parameter (string), but looks up by patient_code or other string field
    """
    
    def get(self, request, pat_id):
        try:
            # First, find the patient using the string ID
            patient = Patient.objects.get(pat_id=pat_id)
            
            # Then get the patient records for this patient
            patient_records = PatientRecord.objects.filter(pat_id=patient.pat_id)
            
            if not patient_records.exists():
                return Response({
                    'status': 'error',
                    'message': 'No patient records found',
                    'error': f'No patient records found for patient ID {pat_id}'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get all PH illnesses (PH-1 to PH-20)
            ph_codes = [f'PH-{i}' for i in range(1, 21)]
            # Get all FP illnesses (FP-1 to FP-11)
            fp_codes = [f'FP-{i}' for i in range(1, 12)]
            # Combine excluded codes
            excluded_codes = ph_codes + fp_codes
            
            ph_illnesses = Illness.objects.filter(ill_code__in=ph_codes).order_by('ill_code')
            
            # Get patient's medical history using the patient records
            patient_record_ids = list(patient_records.values_list('patrec_id', flat=True))
            patient_medical_history = MedicalHistory.objects.filter(
                patrec_id__in=patient_record_ids
            ).select_related('ill')
            
            # Create a set of illness IDs that the patient has
            patient_illness_ids = {history.ill_id for history in patient_medical_history if history.ill_id}
            
            # Prepare PH illnesses data with check if patient has them
            ph_illnesses_data = []
            for illness in ph_illnesses:
                ph_illnesses_data.append({
                    'ill_id': illness.ill_id,
                    'illname': illness.illname,
                    'ill_description': illness.ill_description,
                    'ill_code': illness.ill_code,
                    'has_illness': illness.ill_id in patient_illness_ids,
                    'year': next((history.year for history in patient_medical_history 
                                if history.ill_id == illness.ill_id), None)
                })
            
            # Get other non-PH and non-FP illnesses that patient has and format as comma-separated string
            other_illnesses_names = set()  # Use set to automatically handle duplicates
            
            for history in patient_medical_history:
                if history.ill and history.ill.ill_code not in excluded_codes:
                    other_illnesses_names.add(history.ill.illname)
            
            # Convert set to sorted list and format as comma-separated string
            other_illnesses_list = sorted(list(other_illnesses_names)) if other_illnesses_names else []
            other_illnesses_string = ", ".join(other_illnesses_list) if other_illnesses_list else "None"
            
            return Response({
                'status': 'success',
                'message': 'Patient illness check completed successfully',
                'patient_id': pat_id,  # The original string ID from URL
                'patient_records_count': len(patient_record_ids),
                'ph_illnesses': {
                    'count': len(ph_illnesses_data),
                    'data': ph_illnesses_data
                },
                'other_illnesses': other_illnesses_string
            }, status=status.HTTP_200_OK)
            
        except Patient.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Patient not found',
                'error': f'Patient with ID {pat_id} does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': 'Failed to retrieve patient illness data',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)