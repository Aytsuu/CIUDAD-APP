from django.shortcuts import render
from rest_framework import generics, status
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializer import *
from datetime import datetime

# Create your views here.

# **Prenatal Record**
# class PrenatalFormView(generics.ListCreateAPIView):
#     serializer_class = PrenatalFormSerializer
#     queryset = Prenatal_Form.objects.all()

#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
class PrenatalRecordCreateView(generics.CreateAPIView):
    serializer_class = PrenatalFormSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        prenatal_record = serializer.save()
        
        return Response({
            'pf_id': prenatal_record.pf_id,
            'message': 'Prenatal record created successfully'
        }, status=status.HTTP_201_CREATED)
    
# **Previous Hospitalization
class PreviousHospitalizationView(generics.ListCreateAPIView):
    serializer_class = PreviousHospitalizationSerializer
    queryset = Previous_Hospitalization.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
# **Previous Pregnancy**
class PreviousPregnancyView(generics.ListCreateAPIView):
    serializer_class = PreviousPregnancySerializer
    queryset = Previous_Pregnancy.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

# **TT Status**
class TTStatusView(generics.ListCreateAPIView):
    serializer_class = TTStatusSerializer
    queryset = TT_Status.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
# **Lab Result Dates**
# class LabResultDatesView(generics.ListCreateAPIView):
#     serializer_class = LabResultDatesSerializer
#     queryset = Lab_Result_Dates.objects.all()

#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
    
class Guide4ANCVisitView(generics.ListCreateAPIView):
    serializer_class = Guide4ANCVisitSerializer
    queryset = Guide4ANCVisit.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class ChecklistView(generics.ListCreateAPIView):
    serializer_class = ChecklistSerializer
    queryset = Checklist.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
# class BirthPlanView(generics.ListCreateAPIView):
#     serializer_class = BirthPlanSerializer
#     queryset = BirthPlan.objects.all()

#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)