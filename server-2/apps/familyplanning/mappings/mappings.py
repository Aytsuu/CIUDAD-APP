from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics, status



def map_subtype_display(subtype):
    """Map subtype IDs to human-readable labels"""
    subtype_map = {
        "changingmethod": "Changing Method",
        "changingclinic": "Changing Clinic", 
        "dropoutrestart": "Dropout/Restart",
        "medicalcondition": "Medical Condition",
        "sideeffects": "Side Effects",
        # Add more mappings as needed
    }
    return subtype_map.get(subtype)  # Fallback to title case

def map_reason_display(reason):
    """Map reason IDs to human-readable labels"""
    reason_map = {
        "spacing": "Spacing",
        "limiting": "Limiting",
        "fp_others": "Others",
        "medicalcondition": "Medical Condition",
        "sideeffects": "Side Effects",
        # Add more mappings as needed
    }
    return reason_map.get(reason)  # Fallback to title case

def map_client_type(client_type):
    """Map client type to readable labels"""
    if not client_type:
        return ""
    client_type = client_type.lower()
    if client_type == "newacceptor":
        return "New Acceptor"
    elif client_type == "currentuser":
        return "Current User"
    elif client_type == "restart":
        return "Restart"
    else:
        return client_type.title()  # Fallback to title case
    
def map_income_display(income):
    """Map income IDs to human-readable labels"""
    income_map = {
        "lower": "Lower than 5,000",
        "5,000-10,000": "5,000-10,000",
        "10,000-30,000": "10,000-30,000",
        "30,000-50,000": "30,000-50,000",
        "50,000-80,000": "50,000-80,000",
        "80,000-100,000": "80,000-100,000",
        "100,000-200,000": "100,000-200,000",
        "higher": "Higher than 200,000",
    }
    return income_map.get(income, income.title() if income else "")


def map_physical_exam_display_values(data):
    """Convert physical exam field values to human-readable labels"""
    display_map = {
        # Skin Examination
        "normal": "Normal",
        "pale": "Pale",
        "yellowish": "Yellowish",
        "hematoma": "Hematoma",
        "not_applicable": "Not Applicable",
        
        # Conjunctiva Examination
        "normal": "Normal",
        "pale": "Pale",
        "yellowish": "Yellowish",
        
        # Neck Examination
        "normal": "Normal",
        "neck_mass": "Neck Mass",
        "enlarged_lymph_nodes": "Enlarged Lymph Nodes",
        
        # Breast Examination
        "normal": "Normal",
        "mass": "Mass",
        "nipple_discharge": "Nipple Discharge",
        
        # Abdomen Examination
        "normal": "Normal",
        "abdominal_mass": "Abdominal Mass",
        "varicosities": "Varicosities",
        
        # Extremities Examination
        "normal": "Normal",
        "edema": "Edema",
        "varicosities": "Varicosities",
    }
    
    return {
        "skinExamination": display_map.get(data.get("skin_exam")),
        "conjunctivaExamination": display_map.get(data.get("conjunctiva_exam")),
        "neckExamination": display_map.get(data.get("neck_exam")),
        "breastExamination": display_map.get(data.get("breast_exam")),
        "abdomenExamination": display_map.get(data.get("abdomen_exam")),
        "extremitiesExamination": display_map.get(data.get("extremities_exam")),
    }

# @api_view(['GET'])
# def get_illness_list(request):
#     try:
#         illnesses = Illness.objects.all().order_by('ill_id')

#         # NEW: Get ill_code_prefix from query parameters
#         ill_code_prefix = request.query_params.get('ill_code_prefix', None)
#         if ill_code_prefix:
#             illnesses = illnesses.filter(ill_code__startswith=ill_code_prefix)

#         illness_data = []
#         for illness in illnesses:
#             illness_data.append({
#                 'ill_id': illness.ill_id,
#                 'illname': illness.illname,
#                 'ill_description': illness.ill_description,
#                 'ill_code': illness.ill_code
#             })

#         return Response(illness_data, status=status.HTTP_200_OK)
#     except Exception as e:
#         return Response(
#             {'error': f'Error fetching illnesses: {str(e)}'},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )


