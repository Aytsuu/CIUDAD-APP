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
from apps.inventory.models import *
from django.db.models import Count

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
            medicine_records_count = MedicineRequestItem.objects.filter(status='completed').values('medreq_id', 'med_id').distinct().count()
        
            firstaidrecord_count = FirstAidRecord.objects.count()
            medicalcon_count = MedicalConsultation_Record.objects.filter(medrec_status='completed').count()
            vaccnerecord_count = VaccinationHistory.objects.filter(vachist_status='completed').count()
            inv_medicine_count = MedicineInventory.objects.filter(inv_id__is_Archived=False).count()
            inv_vaccination = VaccineStock.objects.filter(inv_id__is_Archived=False).count()
            inv_immunization = ImmunizationStock.objects.filter(inv_id__is_Archived=False).count()
            inv_firstaid_count = FirstAidInventory.objects.filter(inv_id__is_Archived=False).count()
            inv_commodity_count = CommodityInventory.objects.filter(inv_id__is_Archived=False).count()
            pregnancy_count = Pregnancy.objects.distinct().count()
            family_planning_count = FP_Record.objects.filter(patrec__patrec_type='Family Planning').values('pat').distinct().count()
            animabites_count = AnimalBite_Referral.objects.count()
            medrequest_count = MedicineRequestItem.objects.filter(status='confirmed').distinct('medreq_id').count()
            apprequest_count = MedicineRequestItem.objects.filter(status='pending').distinct('medreq_id').count()
            
            pending_appointments_count = MedConsultAppointment.objects.filter(status='pending').count()
            confirmed_appointments_count = MedConsultAppointment.objects.filter(status='confirmed').count()
            total_appointments_count = pending_appointments_count + confirmed_appointments_count
            total_medicine_requests =  medrequest_count + apprequest_count
            medicinelist_count =  Medicinelist.objects.count()
            commoditylist_count = CommodityList.objects.count()
            firstaidlist_count = FirstAidList.objects.count(),
            vaccinelist_count = VaccineList.objects.count(),
            immunizationlist_count = ImmunizationSupplies.objects.count(),

            antigenlist_count = vaccinelist_count + immunizationlist_count

            
        
            # Total count
            antigen_count =  vaccine_count + immunization_count
            inv_antigen_count = inv_vaccination + inv_immunization
            
            # Count completed consultations by doctor
            doctor_id = request.query_params.get('doctor_id')
            completed_consultations_by_doctor = None
            if doctor_id:
                completed_consultations_by_doctor = count_completed_consultations_by_doctor(doctor_id)
                completed_childconsultations_by_doctor = count_consulted_children_by_assigned(doctor_id)

            # Add the count to the response
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
                    'completed_consultations_by_doctor': completed_consultations_by_doctor,
                    'completed_childconsultations_by_doctor': completed_childconsultations_by_doctor,
                    'vaccnerecord_count': vaccnerecord_count,
                    'medinelist_count': medicinelist_count,
                    'commoditylist_count':commoditylist_count,
                    'firstaidlist_count': firstaidlist_count,
                    'antigenlist_count': antigenlist_count


                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    


def count_completed_consultations_by_doctor(doctor_id):
   
    return MedicalConsultation_Record.objects.filter(
        medrec_status="completed",
        assigned_to_id=doctor_id
    ).count()

def count_consulted_children_by_assigned(doctor_id):
    return ChildHealth_History.objects.filter(
        assigned_doc=doctor_id
    ).count()
