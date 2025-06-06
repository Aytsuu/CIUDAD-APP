from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import *
from datetime import datetime
from django.db.models import Count
 
class PatientView(generics.ListCreateAPIView):
    serializer_class = PatientSerializer
    queryset = Patient.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

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