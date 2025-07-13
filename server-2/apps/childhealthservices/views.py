from rest_framework import generics
from rest_framework.views import APIView
from .serializers import *
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound
from .utils import get_childhealth_record_count
from .models import *


class ChildHealthRecordsView(generics.ListCreateAPIView):
    queryset = ChildHealthrecord.objects.all()
    serializer_class = ChildHealthrecordSerializer


class ChildHealthHistoryView(generics.ListCreateAPIView):
    queryset = ChildHealth_History.objects.all()
    serializer_class = ChildHealthHistorySerializer


class ChildHealthNotesView(generics.ListCreateAPIView):
    queryset = ChildHealthNotes.objects.all()
    serializer_class = ChildHealthNotesSerializer

class ChildHealthNotesUpdateView(generics.RetrieveUpdateAPIView):
    queryset = ChildHealthNotes.objects.all()
    serializer_class = ChildHealthNotesSerializer
 
    def get_object(self):
        chnotes_id = self.kwargs.get("chnotes_id")
        if not chnotes_id:
            raise NotFound(detail="Child health notes ID not provided", code=status.HTTP_400_BAD_REQUEST)
        return get_object_or_404(ChildHealthNotes, chnotes_id=chnotes_id)
class ChildHealthSupplementsView(generics.ListCreateAPIView):
    queryset = ChildHealthSupplements.objects.all()
    serializer_class = ChildHealthSupplementsSerializer
    
class ChildHealthSupplementStatusView(generics.ListCreateAPIView):
    queryset = ChildHealthSupplementsStatus.objects.all()
    serializer_class = ChildHealthSupplementStatusSerializer


class NutritionalStatusView(generics.ListCreateAPIView):
    queryset = NutritionalStatus.objects.all()
    serializer_class = NutritionalStatusSerializer

class ChildHealthVitalSignsView(generics.ListCreateAPIView):
    queryset = ChildHealthVitalSigns.objects.all()
    serializer_class = ChildHealthVitalSignsSerializer
    
class ExclusiveBFCheckView(generics.ListCreateAPIView):
    queryset = ExclusiveBFCheck.objects.all()
    serializer_class = ExclusiveBFCheckSerializer

    def create(self, request, *args, **kwargs):
        chhist_id = request.data.get("chhist")
        bf_dates = request.data.get("BFdates", [])

        if not chhist_id or not isinstance(bf_dates, list):
            return Response({"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)

        instances = []
        for date in bf_dates:
            instances.append(ExclusiveBFCheck(ebf_date=date, chhist_id=chhist_id))

        ExclusiveBFCheck.objects.bulk_create(instances)

        serializer = self.get_serializer(instances, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ChildHealthImmunizationHistoryView(generics.ListCreateAPIView):
    queryset = ChildHealthImmunizationHistory.objects.all()
    serializer_class = ChildHealthImmunizationHistorySerializer

# class ChildHealthHistoryByPatientView(generics.ListAPIView):
#     serializer_class = ChildHealthHistoryFullSerializer

#     def get_queryset(self):
#         pat_id = self.kwargs.get("pat_id")
#         return ChildHealth_History.objects.filter(
#             chrec__patrec__pat_id=pat_id
#         )
class EditIndivChildHealthHistoryView(generics.ListAPIView):
    serializer_class = ChildHealthHistoryFullSerializer

    def get_queryset(self):
        chhist_id = self.kwargs['chhist_id']
        return ChildHealth_History.objects.filter(chhist_id=chhist_id).order_by('-created_at')  # Optional: most recent first
    
    
    
class IndivChildHealthHistoryView(generics.ListAPIView):
    serializer_class = ChildHealthrecordSerializerFull

    def get_queryset(self):
        chrec_id = self.kwargs['chrec_id']
        return ChildHealthrecord.objects.filter(chrec_id=chrec_id).order_by('-created_at')  # Optional: most recent first
    
    
class GeChildHealthRecordCountView(APIView):
    def get(self, request, pat_id):
        try:
            count = get_childhealth_record_count(pat_id)
            return Response({'pat_id': pat_id, 'childhealthrecord_count': count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ChildHealthRecordByPatIDView(APIView):
    def get(self, request, pat_id):
        """
        GET /api/child-health-records/by-patient/<pat_id>/
        """
        try:
            chrec = ChildHealthrecord.objects.get(
                patrec__pat_id=pat_id,
                patrec__patrec_type="Child Health Record"
            )
        except ChildHealthrecord.DoesNotExist:
            return Response({"detail": "Child health record not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ChildHealthrecordSerializerFull(chrec)
        return Response(serializer.data)
    
    
class ChildHealthImmunizationStatusView(generics.ListAPIView):
    serializer_class = ChildHealthImmunizationHistorySerializer

    def get_queryset(self):
        pat_id = self.kwargs['pat_id']
        return ChildHealthImmunizationHistory.objects.filter(
            chrec__patrec__pat_id=pat_id,
            status="immunization"
        ).order_by('-created_at')  # Optional: most recent first
