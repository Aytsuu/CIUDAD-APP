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
            medicine_records_count = MedicineRecord.objects.count()
            firstaidrecord_count = FirstAidRecord.objects.count()
            medicalcon_count = MedicalConsultation_Record.objects.count()
            vaccnerecord_count = VaccinationRecord.objects.count()
            inv_medicine_count = MedicineInventory.objects.count()
            inv_vaccination = VaccineStock.objects.count()
            inv_immunization = ImmunizationStock.objects.count()
            inv_firstaid_count = FirstAidInventory.objects.count()
            inv_commodity_count = CommodityInventory.objects.count()
        
        
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
                    'medicine_records_count': medicine_records_count,
                    'firstaid_records_count': firstaidrecord_count,
                    'medicalconsultation_records_count': medicalcon_count,
                    'vaccination_records_count': vaccnerecord_count,
                    'inv_medicine_count': inv_medicine_count,
                    'inv_antigen_count': inv_antigen_count,
                    'inv_firstaid_count': inv_firstaid_count,
                    'inv_commodity_count': inv_commodity_count,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=statuus.HTTP_500_INTERNAL_SERVER_ERROR)