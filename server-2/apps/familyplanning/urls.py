from .views import *
from django.urls import path

urlpatterns = [
    path('fp_record/', FP_RecordView.as_view(), name='fp_record'),
    path('fp_type/', FP_typeView.as_view(), name='FP_type'),
    path('pregnancy_check/', PregnancyCheckView.as_view(), name='PregnancyCheck'),
    path('risk_sti/', RiskStiView.as_view(), name='RiskSti'),
    path('risk_vaw/', RiskVawView.as_view(), name='RiskVaw'),
    path('physical_exam/',PhysicalExamView.as_view(), name="PhysicalExam"),
    path('pelvic_exam/', PelvicExamView.as_view(), name='PelvicExam'),
    path('acknowledgement/',AcknowledgementView.as_view(),name="Acknowledgement"),
    path('obstetrical/', FP_ObstetricalView.as_view(), name='obstetrical'),
    path('findings/', FP_FindingsView.as_view(), name='findings'),
    
    
    
]