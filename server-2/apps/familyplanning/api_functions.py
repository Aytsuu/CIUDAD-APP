# API functions to handle medical history creation
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from apps.patientrecords.models import Illness, MedicalHistory
from .models import FP_Record 

@api_view(['GET'])
def get_medical_history_illnesses(request):
    try:
        illnesses = Illness.objects.filter(
            ill_code__startswith='FP'
        ).order_by('ill_code')
        
        illness_data = []
        for illness in illnesses:
            illness_data.append({
                'ill_id': illness.ill_id,
                'illname'   : illness.illname,
                'ill_code': illness.ill_code,
                'checkbox_name': get_checkbox_name_from_illness(illness.illname)
            })
        
        return Response(illness_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_checkbox_name_from_illness(illness_name):
    mapping = {
        'Severe headaches / migraine': 'severeHeadaches',
        'History of stroke / heart attack / hypertension': 'strokeHeartAttackHypertension',
        'Non-traumatic hematoma / frequent bruising or gum bleeding': 'hematomaBruisingBleeding',
        'Current or history of breast cancer / breast mass': 'breastCancerHistory',
        'Severe chest pain': 'severeChestPain',
        'Cough for more than 14 days': 'cough',
        'Jaundice': 'jaundice',
        'Unexplained vaginal bleeding': 'unexplainedVaginalBleeding',
        'Abnormal vaginal discharge': 'abnormalVaginalDischarge',
        'Intake of phenobarbital (anti-seizure) or rifampicin (anti-TB)': 'phenobarbitalOrRifampicin',
        'Is this client a SMOKER?': 'smoker',
        'With Disability/Others': 'disability'
    }
    return mapping.get(illness_name, illness_name.lower().replace(' ', '_'))

def create_medical_history_for_fp(fp_record, medical_history_data, other_disability_text=None):
    try:
        with transaction.atomic():
            medical_history = MedicalHistory.objects.create(
                medrec=None
            )
            
            # Get selected illnesses based on checkbox data
            selected_illness_ids = []
            
            for checkbox_name, is_selected in medical_history_data.items():
                if is_selected:
                    # Find the illness by mapping checkbox name back to illness
                    illness = get_illness_by_checkbox_name(checkbox_name)
                    if illness:
                        selected_illness_ids.append(illness.ill_id)
            
            # Link selected illnesses to the medical history
            if selected_illness_ids:
                selected_illnesses = Illness.objects.filter(ill_id__in=selected_illness_ids)
                medical_history.ill.set(selected_illnesses)
            
            # Update FP record with the medical history
            fp_record.medhist = medical_history
            fp_record.save()
            
            # Handle "Other" disability text if provided
            # if other_disability_text and medical_history_data.get('disability', False):
            #     FP_OtherMedicalCondition.objects.create(
            #         condition_name=other_disability_text,
            #         condition_description=f"Other medical condition specified by patient: {other_disability_text}",
            #         fprecord=fp_record
            #     )
            
            return medical_history
            
    except Exception as e:
        print(f"Error creating medical history: {e}")
        raise e

def get_illness_by_checkbox_name(checkbox_name):
    name_mapping = {
        'severeHeadaches': 'Severe headaches / migraine',
        'strokeHeartAttackHypertension': 'History of stroke / heart attack / hypertension',
        'hematomaBruisingBleeding': 'Non-traumatic hematoma / frequent bruising or gum bleeding',
        'breastCancerHistory': 'Current or history of breast cancer / breast mass',
        'severeChestPain': 'Severe chest pain',
        'cough': 'Cough for more than 14 days',
        'jaundice': 'Jaundice',
        'unexplainedVaginalBleeding': 'Unexplained vaginal bleeding',
        'abnormalVaginalDischarge': 'Abnormal vaginal discharge',
        'phenobarbitalOrRifampicin': 'Intake of phenobarbital (anti-seizure) or rifampicin (anti-TB)',
        'smoker': 'Is this client a SMOKER?',
        'disability': 'With Disability/Others'
    }
    
    illness_name = name_mapping.get(checkbox_name)
    if illness_name:
        try:
            return Illness.objects.get(illname=illness_name)
        except Illness.DoesNotExist:
            return None
    return None
