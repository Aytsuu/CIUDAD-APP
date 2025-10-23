from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.inventory.models import *
from apps.childhealthservices.models import *
from apps. medicineservices.models import *
from apps.medicalConsultation.models import *
from apps.firstaid.models import *
from apps.maternal.models import *
from apps.vaccination.models import *
from apps.familyplanning.models import *
from apps.animalbites.models import *

class ReportsCount(APIView):
    def get(self, request):
        try:
            # Count all unique items in each category
            medicine_count = Medicinelist.objects.count()
            commodity_count = CommodityList.objects.count()
            firstaid_count = FirstAidList.objects.count()
            vaccine_count = VaccineList.objects.count()
            immunization_count = ImmunizationSupplies.objects.count()
            child_count =ChildHealthrecord.objects.count()
            medicine_records_count = MedicineRecord.objects.distinct('patrec_id__pat_id').count()
            firstaidrecord_count = FirstAidRecord.objects.count()
            medicalcon_count = MedicalConsultation_Record.objects.filter(medrec_status='completed').count()
            vaccnerecord_count =vaccination_completed_count = VaccinationHistory.objects.filter(vachist_status='completed').count()
            inv_medicine_count = MedicineInventory.objects.count()
            inv_vaccination = VaccineStock.objects.count()
            inv_immunization = ImmunizationStock.objects.count()
            inv_firstaid_count = FirstAidInventory.objects.count()
            inv_commodity_count = CommodityInventory.objects.count()
            pregnancy_count = Pregnancy.objects.distinct().count()
            family_planning_count = FP_Record.objects.filter(patrec__patrec_type='Family Planning').distinct().count()
            animabites_count = AnimalBite_Referral.objects.count()
            medrequest_count = MedicineRequestItem.objects.filter(status='confirmed').distinct('medreq_id').count()
            apprequest_count = MedicineRequest.objects.filter(
                mode='app',
                items__status='pending'
            ).distinct().count()
            
            pending_appointments_count = MedConsultAppointment.objects.filter(status='pending').count()
            confirmed_appointments_count = MedConsultAppointment.objects.filter(status='confirmed').count()
            total_appointments_count = pending_appointments_count + confirmed_appointments_count
            total_medicine_requests =  medrequest_count + apprequest_count
        
            # Total count
            antigen_count =  vaccine_count + immunization_count
            inv_antigen_count = inv_vaccination + inv_immunization
            
            return Response({
                'success': True,
                'data': {
                    'antigen_count': antigen_count,
                    'medicine_count': medicine_count,
                    'commodity_count': commodity_count,
                    'firstaid_count': firstaid_count,
                    'vaccine_count': vaccine_count,
                    'immunization_count': immunization_count,
                    'child_count': child_count,
                    'inv_medicine_count': inv_medicine_count,
                    'inv_antigen_count': inv_antigen_count,
                    'inv_firstaid_count': inv_firstaid_count,
                    'inv_commodity_count': inv_commodity_count,
                    'medicine_records_count': medicine_records_count,
                    'firstaid_records_count': firstaidrecord_count,
                    'medicalconsultation_records_count': medicalcon_count,
                    'vaccination_records_count': vaccnerecord_count,
                    'pregnancy_count': pregnancy_count,
                    'family_planning_count': family_planning_count,
                    'animal_bites_count': animabites_count,
                    'medrequest_count': medrequest_count,
                    'apprequest_count': apprequest_count,
                    'total_medicine_requests': total_medicine_requests,
                    'pending_appointments_count': pending_appointments_count,
                    'confirmed_appointments_count': confirmed_appointments_count,
                    'total_appointments_count': total_appointments_count,
                    
                    
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 