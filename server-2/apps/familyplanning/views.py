from rest_framework import generics
from .serializers import *


class FP_RecordView(generics.ListCreateAPIView):
    serializer_class = FP_RecordSerializer
    queryset = FP_Record.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class FP_typeView(generics.ListCreateAPIView):
    serializer_class = FP_TypeSerializer
    queryset = FP_type.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)



class RiskStiView(generics.ListCreateAPIView):
    serializer_class = RiskStiSerializer
    queryset = RiskSti.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class RiskVawView(generics.ListCreateAPIView):
    serializer_class = RiskVawSerializer
    queryset = RiskVaw.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class PhysicalExamView(generics.ListCreateAPIView):
    serializer_class = PhysicalExamSerializer
    queryset = Physical_Exam.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class PelvicExamView(generics.ListCreateAPIView):
    serializer_class = PelvicExamSerializer
    queryset = Pelvic_Exam.objects.all()
    
    def create(self, validated_data):
        return super().create(validated_data)

class AssessmentView(generics.ListCreateAPIView):
    serializer_class = AssessmentSerializer
    queryset = Assessment_Record.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class AcknowledgementView(generics.ListCreateAPIView):
    serializer_class = AcknowledgementSerializer
    queryset = Acknowledgement.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class FP_ObstetricalView(generics.ListCreateAPIView):
    serializer_class = ObstetricalSerializer
    queryset = FP_Obstetrical_History.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class FP_PregnancyCheckView(generics.ListCreateAPIView):
    serializer_class = FP_PregnancyCheckSerializer
    queryset = fp_pregnancy_check.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    
