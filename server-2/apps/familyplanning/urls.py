# from .views import *
# from django.urls import path

# urlpatterns = [
#     path('fp_record/', FP_RecordView.as_view(), name='fp_record'),
#     path('fp_type/', FP_typeView.as_view(), name='fp_type'),
#     path('pregnancy_check/', PregnancyCheckView.as_view(), name='PregnancyCheck'),
#     path('risk_sti/', RiskStiView.as_view(), name='RiskSti'),
#     path('risk_vaw/', RiskVawView.as_view(), name='RiskVaw'),
#     path('physical_exam/',PhysicalExamView.as_view(), name="PhysicalExam"),
#     path('pelvic_exam/', PelvicExamView.as_view(), name='PelvicExam'),
#     path('acknowledgement/',AcknowledgementView.as_view(),name="Acknowledgement"),
#     path('obstetrical/', FP_ObstetricalView.as_view(), name='obstetrical'),
#     path('findings/', FP_FindingsView.as_view(), name='findings'),
    
    
    
# ]
from django.urls import path
from .views import *

urlpatterns = [
   # List routes
   path('fp_record/', FP_RecordView.as_view(), name='fp_record_list'),
   path('fp_type/', FP_typeView.as_view(), name='fp_type_list'),
   path('risk_sti/', RiskStiView.as_view(), name='risk_sti_list'),
   path('risk_vaw/', RiskVawView.as_view(), name='risk_vaw_list'),
   path('physical_exam/', PhysicalExamView.as_view(), name='physical_exam_list'),
   path('pelvic_exam/', PelvicExamView.as_view(), name='pelvic_exam_list'),
   path('assessment/', AssessmentView.as_view(), name='assessment_list'),
   path('acknowledgement/', AcknowledgementView.as_view(), name='acknowledgement_list'),
   path('obstetrical/', FP_ObstetricalView.as_view(), name='obstetrical_list'),
   path('fp_findings/', FP_FindingsView.as_view(), name='fp_findings_list'),
   
   # Detail routes for GET, PUT, DELETE operations
   path('fp_record/<int:pk>/', FP_RecordView.as_view(), name='fp_record_detail'),
   path('fp_type/<int:pk>/', FP_typeView.as_view(), name='fp_type_detail'),
   path('risk_sti/<int:pk>/', RiskStiView.as_view(), name='risk_sti_detail'),
   path('risk_vaw/<int:pk>/', RiskVawView.as_view(), name='risk_vaw_detail'),
   path('physical_exam/<int:pk>/', PhysicalExamView.as_view(), name='physical_exam_detail'),
   path('pelvic_exam/<int:pk>/', PelvicExamView.as_view(), name='pelvic_exam_detail'),
   path('assessment/<int:pk>/', AssessmentView.as_view(), name='assessment_detail'),
   path('acknowledgement/<int:pk>/', AcknowledgementView.as_view(), name='acknowledgement_detail'),
   path('obstetrical/<int:pk>/', FP_ObstetricalView.as_view(), name='obstetrical_detail'),
   path('fp_findings/<int:pk>/', FP_FindingsView.as_view(), name='fp_findings_detail'),
   
]
