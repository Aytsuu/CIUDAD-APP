from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.patientrecords.models import FollowUpVisit, PatientRecord

class MaternalPatientFollowUpVisitsView(APIView):
    def get(self, request, pat_id):
        try:
            patrec_types = ["Prenatal", "Postpartum Care"]
            
            # Get PatientRecords for this patient with specified types
            patient_records = PatientRecord.objects.filter(
                pat_id=pat_id,
                patrec_type__in=patrec_types
            )
            
            if not patient_records.exists():
                return Response({
                    'follow_up_visits': [],
                    'message': f'No Prenatal or Postpartum Care records found for patient {pat_id}',
                    'count': 0
                }, status=status.HTTP_200_OK)
            
            # Get the latest follow-up visit across all prenatal/postpartum records
            latest_followups = FollowUpVisit.objects.filter(
                patrec__patrec_type__in=patrec_types,
                patrec__pat_id=pat_id
            ).select_related(
                'patrec',              # Get PatientRecord data
                'patrec__pat_id'       # Get Patient data
            ).order_by('-followv_date')[:1]
            
            # Transform data for API response
            follow_up_visits_data = []
            for followup in latest_followups:
                follow_up_visits_data.append({
                    'followv_id': followup.followv_id,
                    'followv_date': followup.followv_date,
                    'followv_status': followup.followv_status,
                    'followv_description': followup.followv_description,
                    'completed_at': followup.completed_at,
                    'created_at': followup.created_at,
                    'patrec_id': followup.patrec.patrec_id,
                    'patrec_type': followup.patrec.patrec_type,
                    'pat_id': followup.patrec.pat_id.pat_id,
                })
            
            return Response({
                'follow_up_visits': follow_up_visits_data,
                'count': latest_followups.count()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': str(e),
                'follow_up_visits': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)