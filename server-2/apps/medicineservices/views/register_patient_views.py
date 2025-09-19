

from django.shortcuts import render
from rest_framework import generics,status
from django.db.models import Q, Count, Sum
from datetime import timedelta
from django.utils.timezone import now
import json
from dateutil.relativedelta import relativedelta
from django.db.models.functions import TruncMonth
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError


from ..serializers import *
from django.db import transaction
from django.utils.timezone import now
from apps.reports.models import *
from apps.reports.serializers import *
from pagination import *
from django.db.models import Q, Prefetch
from utils import * 



class RegisterPatientAPIView(APIView):
    """
    Combined API view to register a patient and update medicine request in one transaction
    """
    
    def post(self, request):
        try:
            # Extract data from request
            medreq_id = request.data.get('medreq_id')
            patient_data = {
                'pat_status': request.data.get('pat_status', 'active'),
                'rp_id': request.data.get('rp_id'),
                'personal_info': request.data.get('personal_info'),  # This might need to be handled differently based on your model
                'pat_type': request.data.get('pat_type', 'Resident')
            }
            
            # Validate required fields
            if not medreq_id:
                return Response(
                    {'error': 'medreq_id is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not patient_data.get('rp_id'):
                return Response(
                    {'error': 'rp_id is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Use database transaction to ensure both operations succeed or fail together
            with transaction.atomic():
                # Step 1: Create Patient
                # Note: You may need to handle personal_info differently based on your Patient model
                # If personal_info is not a direct field, you might need to process it separately
                
                # Get the ResidentProfile instance
                try:
                    resident_profile = ResidentProfile.objects.get(pk=patient_data['rp_id'])
                except ResidentProfile.DoesNotExist:
                    return Response(
                        {'error': 'ResidentProfile not found'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Create patient instance
                patient = Patient(
                    pat_status=patient_data['pat_status'],
                    rp_id=resident_profile,
                    pat_type=patient_data['pat_type']
                )
                patient.save()  # This will auto-generate pat_id
                
                # Step 2: Update Medicine Request
                try:
                    medicine_request = MedicineRequest.objects.get(medreq_id=medreq_id)
                    medicine_request.rp_id = None  # Clear rp_id
                    medicine_request.pat_id = patient  # Set new pat_id
                    medicine_request.save()
                except MedicineRequest.DoesNotExist:
                    return Response(
                        {'error': 'Medicine request not found'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Step 3: Serialize and return patient data
                serializer = PatientSerializer(patient)
                
                return Response({
                    'success': True,
                    'message': 'Patient registered successfully',
                    'patient': serializer.data,
                    'pat_id': patient.pat_id
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {'error': f'Registration failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class CheckPatientExistsAPIView(APIView):
        """
        API view to check if a patient exists with the given rp_id
        """

        def get(self, request, rp_id):
            """
            Check if patient exists by rp_id using GET method
            URL: /check-patient-exists/<rp_id>/
            """
            try:
                # Check if patient exists with the given rp_id and get pat_id if exists
                patient = Patient.objects.filter(rp_id=rp_id).first()
                patient_exists = patient is not None
                pat_id = patient.pat_id if patient_exists else None
                return Response({
                    'exists': patient_exists,
                    'rp_id': rp_id,
                    'pat_id': pat_id
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(
                    {'error': f'Error checking patient existence: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
