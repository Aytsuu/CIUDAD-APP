from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from apps.patientrecords.models import Patient
from apps.healthProfiling.models import ResidentProfile as Resident

class ResidentToPatientView(APIView):
    def get(self, request, rp_id):
        try:
            resident = Resident.objects.get(rp_id=rp_id)
            patient = Patient.objects.get(resident=resident)  # Assuming a relationship
            return Response({"pat_id": patient.pat_id}, status=status.HTTP_200_OK)
        except (Resident.DoesNotExist, Patient.DoesNotExist):
            return Response({"detail": "Patient or Resident not found"}, status=status.HTTP_404_NOT_FOUND)