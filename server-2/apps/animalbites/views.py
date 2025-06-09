from django.shortcuts import render
from django.test import TransactionTestCase
from rest_framework import generics, status
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response

class AnimalbiteRecordsView(generics.ListAPIView):
    serializer_class = AnimalBiteRecordSerializer
    queryset = AnimalBite_Referral.objects.all()
    
class AnimalbiteDetailsView(generics.ListCreateAPIView):
    serializer_class = AnimalBiteDetailsSerializer
    queryset = AnimalBite_Details.objects.all()
    
    def get(self, request):
        animal_bite_patients = AnimalBite_Details.objects.filter(
            referral__patrec__patrec_type="Animal Bites"
        ).select_related(
            'referral', 
            'referral__patrec'
        )
        serializer = AnimalBiteDetailsSerializer(animal_bite_patients, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

# New view for complete patient data
class AnimalbitePatientDetailsView(generics.ListAPIView):
    serializer_class = AnimalBitePatientDetailsSerializer
    
    def get_queryset(self):
        return AnimalBite_Details.objects.filter(
            referral__patrec__patrec_type="Animal Bites"
        ).select_related(
            'referral',
            'referral__patrec', 
            'biting_animal',
            'exposure_site'
        )
    
    def get(self, request):
        queryset = self.get_queryset()
        serializer = AnimalBitePatientDetailsSerializer(queryset, many=True)
        return Response(serializer.data)
    
class AnimalbiteReferralView(generics.ListCreateAPIView):
    serializer_class = AnimalBiteReferralSerializer
    queryset = AnimalBite_Referral.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    

class DeleteAnimalBitePatientView(APIView):
    """
    Delete all animal bite records for a specific patient
    This will cascade delete all referrals and bite details
    """
    def delete(self, request, patient_id):
        try:
            with TransactionTestCase.atomic():
                # Find all patient records for this patient with Animal Bites type
                patient_records = PatientRecord.objects.filter(
                    pat_details__personal_info__pat_id=patient_id,
                    patrec_type="Animal Bites"
                )
                
                if not patient_records.exists():
                    return Response(
                        {"detail": "No animal bite records found for this patient"}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                # Count records before deletion for response
                total_records = patient_records.count()
                
                # Get all referrals for these patient records
                referral_ids = []
                for patient_record in patient_records:
                    referrals = AnimalBite_Referral.objects.filter(patrec=patient_record)
                    referral_ids.extend([ref.referral_id for ref in referrals])
                
                # Delete patient records (this will cascade delete referrals and bite details)
                patient_records.delete()
                
                return Response({
                    "message": f"Successfully deleted {total_records} animal bite record(s) for patient {patient_id}",
                    "deleted_patient_records": total_records,
                    "deleted_referrals": len(referral_ids)
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response(
                {"detail": f"Error deleting patient records: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DeleteAnimalBiteRecordView(APIView):
    """
    Delete a specific animal bite record by bite_id
    This will delete the bite detail and its associated referral
    """
    def delete(self, request, bite_id):
        try:
            with transaction.atomic():
                # Find the bite detail record
                try:
                    bite_detail = AnimalBite_Details.objects.get(bite_id=bite_id)
                except AnimalBite_Details.DoesNotExist:
                    return Response(
                        {"detail": "Animal bite record not found"}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                # Get associated referral
                referral = bite_detail.referral
                referral_id = referral.referral_id
                
                # Delete the bite detail (this will not cascade to referral)
                bite_detail.delete()
                
                # Check if there are other bite details for this referral
                other_bite_details = AnimalBite_Details.objects.filter(referral=referral)
                
                # If no other bite details exist, delete the referral too
                if not other_bite_details.exists():
                    referral.delete()
                    return Response({
                        "message": f"Successfully deleted bite record {bite_id} and its referral {referral_id}",
                        "deleted_bite_id": bite_id,
                        "deleted_referral_id": referral_id
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        "message": f"Successfully deleted bite record {bite_id}",
                        "deleted_bite_id": bite_id,
                        "referral_preserved": referral_id
                    }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response(
                {"detail": f"Error deleting bite record: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AnimalbiteDetailsDeleteView(generics.DestroyAPIView):
    serializer_class = AnimalBiteDetailsSerializer
    queryset = AnimalBite_Details.objects.all()
    lookup_field = 'bite_id'
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            # Get the referral ID before deleting the bite details
            referral_id = instance.referral.referral_id
            
            # Delete the bite details
            self.perform_destroy(instance)
            
            # Now delete the referral
            referral = AnimalBite_Referral.objects.get(referral_id=referral_id)
            patrec_id = referral.patrec.patrec_id
            referral.delete()
            
            # Finally delete the patient record
            PatientRecord.objects.get(patrec_id=patrec_id).delete()
            
            return Response({"message": "Record deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)