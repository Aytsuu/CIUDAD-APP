from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import *
from datetime import datetime
from django.db.models import Count, Prefetch
from apps.healthProfiling.models import PersonalAddress
 
class PatientView(generics.ListCreateAPIView):
    serializer_class = PatientSerializer
    queryset = Patient.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        return Patient.objects.select_related(
            'rp_id__per',
        ).prefetch_related(
            Prefetch(
                'rp_id__per__personaladdress_set',
                queryset=PersonalAddress.objects.select_related('add', 'add__sitio')
            )
        ).filter(pat_status='Active')

class PatientDetailView(generics.RetrieveAPIView):
    serializer_class = PatientSerializer
    lookup_field = 'pat_id'

    def get_queryset(self):
        return Patient.objects.select_related(
            'rp_id__per'
        ).prefetch_related(
            'rp_id__per__personaladdress_set__add__sitio'
        )

class PatientRecordView(generics.ListCreateAPIView):
    serializer_class = PatientRecordSerializer
    queryset = PatientRecord.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
#Update delete
class DeleteUpdatePatientRecordView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PatientRecordSerializer
    queryset = PatientRecord.objects.all()
    lookup_field = 'patrec_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Patient record not found."}, status=status.HTTP_404_NOT_FOUND)

class VitalSignsView(generics.ListCreateAPIView):
    serializer_class = VitalSignsSerializer
    queryset  =VitalSigns.objects.all()
   
class  DeleteUpdateVitalSignsView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VitalSignsSerializer
    queryset = VitalSigns.objects.all()
    lookup_field = 'vital_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Vital signs record not found."}, status=status.HTTP_404_NOT_FOUND)
        
# # **Obstetrical History**
class ObstetricalHistoryView(generics.ListCreateAPIView):
    serializer_class = ObstetricalHistorySerializer
    queryset = Obstetrical_History.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


# **Spouse**
# class SpouseView(generics.ListCreateAPIView):
#     serializer_class = SpouseSerializer
#     queryset = Spouse.objects.all()

#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)

class SpouseCreateView(generics.CreateAPIView):
    serializer_class = SpouseCreateSerializer

    def create(self, request, *args, **kwargs):
        required_fields = ['spouse_lname', 'spouse_fname', 'spouse_occupation', 'pat_id']

        for field in required_fields:
            if not request.data.get(field):
                return Response(
                    {'error': 'f{field} is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if 'spouse_dob' not in request.data:
            request.data['spouse_dob'] = None
        
        return super().create(request, *args, **kwargs)

class SpouseListView(generics.ListAPIView):
    serializer_class = SpouseSerializer

    def get_queryset(self):
        pat_id = self.request.query_params.get('pat_id')

        if pat_id:
            return Spouse.objects.filter(pat_id=pat_id)
        return Spouse.objects.all()

class SpouseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SpouseSerializer
    queryset = Spouse.objects.all()
    lookup_field = 'spouse_id'
    
# class SpouseRetrieveDeleteUpdate(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = SpouseSerializer
#     queryset = Spouse.objects.all()
#     lookup_field = 'spouse_id'

#     def get_object(self):
#         spouse_id = self.kwargs.get('spouse_id')
#         return get_object_or_404(Spouse, spouse_id=spouse_id)

        
class FollowUpVisitView(generics.ListCreateAPIView):
        serializer_class = FollowUpVisitSerializer
        queryset = FollowUpVisit.objects.all()
        
        def create(self, request, *args, **kwargs):
            return super().create(request, *args, **kwargs)

        
class DeleteUpdateFollowUpVisitView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FollowUpVisitSerializer
    queryset = FollowUpVisit.objects.all()
    lookup_field = 'followv_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Follow-up visit record not found."}, status=status.HTTP_404_NOT_FOUND)


class BodyMeasurementView(generics.ListCreateAPIView):
    serializer_class = BodyMeasurementSerializer
    queryset = BodyMeasurement.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
class DeleteUpdateBodyMeasurementView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BodyMeasurementSerializer
    queryset = BodyMeasurement.objects.all()
    lookup_field = 'bmi_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Body measurement record not found."}, status=status.HTTP_404_NOT_FOUND)

class IllnessView(generics.ListCreateAPIView):
    serializer_class = IllnessSerializer
    queryset = Illness.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class DeleteUpdateIllnessView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IllnessSerializer
    queryset = Illness.objects.all()
    lookup_field = 'ill_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Illness record not found."}, status=status.HTTP_404_NOT_FOUND)

class FindingView(generics.ListCreateAPIView):
    serializer_class = FindingSerializer
    queryset = Finding.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class DeleteUpdateFindingView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FindingSerializer
    queryset = Finding.objects.all()
    lookup_field = 'find_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Finding record not found."}, status=status.HTTP_404_NOT_FOUND)

class PhysicalExaminationView(generics.ListCreateAPIView):
    serializer_class = PhysicalExaminationSerializer
    queryset = PhysicalExamination.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class DeleteUpdatePhysicalExaminationView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PhysicalExaminationSerializer
    queryset = PhysicalExamination.objects.all()
    lookup_field = 'pe_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Physical examination record not found."}, status=status.HTTP_404_NOT_FOUND)
        
class PhysicalExamListView(generics.ListCreateAPIView):
    serializer_class = PhysicalExamListSerializer
    queryset = PhysicalExamList.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class DeleteUpdatePhysicalExamListView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PhysicalExamListSerializer
    queryset = PhysicalExamList.objects.all()
    lookup_field = 'pel_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Physical examination list record not found."}, status=status.HTTP_404_NOT_FOUND)
        
        
class DiagnosisView(generics.ListCreateAPIView):
    serializer_class = DiagnosisSerializer
    queryset = Diagnosis.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class  DeleteUpdateDiagnosisView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DiagnosisSerializer
    queryset = Diagnosis.objects.all()
    lookup_field = 'diag_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Diagnosis record not found."}, status=status.HTTP_404_NOT_FOUND)