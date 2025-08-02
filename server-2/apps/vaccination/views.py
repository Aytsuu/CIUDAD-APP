from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import *
from datetime import datetime
from django.db.models import Count, Max, Subquery, OuterRef, Q, F
from django.db.models.functions import TruncMonth
from apps.patientrecords.models import Patient,PatientRecord
from apps.patientrecords.serializers.patients_serializers import PatientSerializer,PatientRecordSerializer
from apps.patientrecords.models import VitalSigns
from rest_framework.views import APIView
from .utils import *
from apps.childhealthservices.models import ChildHealthImmunizationHistory
from apps.childhealthservices.serializers import ChildHealthImmunizationHistorySerializer
from rest_framework.decorators import api_view


class VaccineRecordView(generics.ListCreateAPIView):
    serializer_class = VaccinationRecordSerializer
    queryset  =VaccinationRecord.objects.all()
    
   
class VitalSignsView(generics.ListCreateAPIView):
    serializer_class = VitalSignsSerializer
    queryset  =VitalSigns.objects.all()
   
   
class VaccinationHistoryView(generics.ListCreateAPIView):
    serializer_class = VaccinationHistorySerializer
    queryset  =VaccinationHistory.objects.all()
    
# all Vaccination  Display  
class PatientVaccinationRecordsView(generics.ListAPIView):
    serializer_class = PatientVaccinationRecordSerializer

    def get_queryset(self):
        return Patient.objects.filter(
            Q(patient_records__patrec_type='Vaccination Record'),
            Q(patient_records__vaccination_records__vaccination_histories__vachist_status__in=['completed', 'partially vaccinated'])
        ).distinct()


class TobeAdministeredVaccinationView(generics.ListAPIView):
    serializer_class = VaccinationHistorySerializer
    def get_queryset(self):
        return VaccinationHistory.objects.filter(
            vachist_status='in queue',
        ).order_by('-created_at')
        
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
        ).order_by('-created_at')  # Optional: latest first
    

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
        
        
        
class GetAllResidentsNotVaccinated(APIView):
    def get(self, request):
        try:
            data = get_all_residents_not_vaccinated()
            return Response(data, status=status.HTTP_200_OK)
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



class MonthlyVaccinationRecordsAPIView(APIView):
    def get(self, request):
        try:
            # Get base queryset with proper relationships
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
            
            # Filter by year if provided
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
            # Group by month and get counts
            monthly_data = queryset.annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                record_count=Count('vachist_id')
            ).order_by('-month')
            
            # Format the response
            formatted_data = []
            for item in monthly_data:
                month_str = item['month'].strftime('%Y-%m')
                month_records = queryset.filter(
                    created_at__year=item['month'].year,
                    created_at__month=item['month'].month
                )
                
                # Serialize records
                serialized_records = []
                for record in month_records:
                    # Serialize record
                    serialized_record = VaccinationHistorySerializer(record).data
                    serialized_records.append(serialized_record)
                
                formatted_data.append({
                    'month': month_str,
                    'record_count': item['record_count'],
                    'records': serialized_records
                })
            
            return Response({
                'success': True,
                'data': formatted_data,
                'total_records': len(formatted_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
            
 
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