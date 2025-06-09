# from django.urls import path
# from .views import *

# urlpatterns = [
#     # FP Record CRUD
#     path('fp_record/', FP_RecordListCreateView.as_view(), name='fp_record_list_create'),
#     path('fp_record/<int:fprecord_id>/', FP_RecordDetailView.as_view(), name='fp_record_detail'),
    
#     # FP Type CRUD
#     path('fp_type/', FP_TypeListCreateView.as_view(), name='fp_type_list_create'),
#     path('fp_type/<int:fpt_id>/', FP_TypeDetailView.as_view(), name='fp_type_detail'),
    
#     # Medical History CRUD
#     path('medical_history/', FP_MedicalHistoryListCreateView.as_view(), name='medical_history_list_create'),
#     path('medical_history/<int:fp_medhistory_id>/', FP_MedicalHistoryDetailView.as_view(), name='medical_history_detail'),
    
#     # Risk STI CRUD
#     path('risk_sti/', RiskStiListCreateView.as_view(), name='risk_sti_list_create'),
#     path('risk_sti/<int:sti_id>/', RiskStiDetailView.as_view(), name='risk_sti_detail'),
    
#     # Risk VAW CRUD
#     path('risk_vaw/', RiskVawListCreateView.as_view(), name='risk_vaw_list_create'),
#     path('risk_vaw/<int:vaw_id>/', RiskVawDetailView.as_view(), name='risk_vaw_detail'),
    
#     # Physical Exam CRUD
#     path('physical_exam/', PhysicalExamListCreateView.as_view(), name='physical_exam_list_create'),
#     path('physical_exam/<int:fp_pe_id>/', PhysicalExamDetailView.as_view(), name='physical_exam_detail'),
    
#     # Pelvic Exam CRUD
#     path('pelvic_exam/', PelvicExamListCreateView.as_view(), name='pelvic_exam_list_create'),
#     path('pelvic_exam/<int:pelvic_id>/', PelvicExamDetailView.as_view(), name='pelvic_exam_detail'),
    
#     # Acknowledgement CRUD
#     path('acknowledgement/', AcknowledgementListCreateView.as_view(), name='acknowledgement_list_create'),
#     path('acknowledgement/<int:ack_id>/', AcknowledgementDetailView.as_view(), name='acknowledgement_detail'),
    
#     # Obstetrical History CRUD
#     path('obstetrical/', FP_ObstetricalListCreateView.as_view(), name='obstetrical_list_create'),
#     path('obstetrical/<int:fpob_id>/', FP_ObstetricalDetailView.as_view(), name='obstetrical_detail'),
    
#     # Pregnancy Check CRUD
#     path('fp_pregnancycheck/', FP_PregnancyCheckListCreateView.as_view(), name='fp_pregnancycheck_list_create'),
#     path('fp_pregnancycheck/<int:fp_pc_id>/', FP_PregnancyCheckDetailView.as_view(), name='fp_pregnancycheck_detail'),
    
#     # Special endpoints
#     path('complete_record/<int:fprecord_id>/', get_complete_fp_record, name='get_complete_fp_record'),
#     # path('records_list/', get_fp_records_list, name='get_fp_records_list'),
#     path('delete_complete/<int:fprecord_id>/', delete_complete_fp_record, name='delete_complete_fp_record'),
# ]


from django.urls import path
from .views import *


urlpatterns = [
    # FP Record CRUD
    path('fp_record/', FP_RecordListCreateView.as_view(), name='fp_record_list_create'),
    path('fp_record/<int:fprecord_id>/', FP_RecordDetailView.as_view(), name='fp_record_detail'),

    path('patient-record/', PatientRecordCreateView.as_view(), name='patientrecord_create'),

    # FP Type CRUD
    path('fp_type/', FP_TypeListCreateView.as_view(), name='fp_type_list_create'),
    path('fp_type/<int:fpt_id>/', FP_TypeDetailView.as_view(), name='fp_type_detail'),

    # Medical History CRUD
    path('medical_history/', FP_MedicalHistoryListCreateView.as_view(), name='medical_history_list_create'),
    path('medical_history/<int:fp_medhistory_id>/', FP_MedicalHistoryDetailView.as_view(), name='medical_history_detail'),

    # Risk STI CRUD
    path('risk_sti/', RiskStiListCreateView.as_view(), name='risk_sti_list_create'),
    path('risk_sti/<int:sti_id>/', RiskStiDetailView.as_view(), name='risk_sti_detail'),

    # Risk VAW CRUD
    path('risk_vaw/', RiskVawListCreateView.as_view(), name='risk_vaw_list_create'),
    path('risk_vaw/<int:vaw_id>/', RiskVawDetailView.as_view(), name='risk_vaw_detail'),

    # Physical Exam CRUD
    path('physical_exam/', PhysicalExamListCreateView.as_view(), name='physical_exam_list_create'),
    path('physical_exam/<int:fp_pe_id>/', PhysicalExamDetailView.as_view(), name='physical_exam_detail'),

    # Assessment CRUD (if this is for FP_Assessment_Record)
    path('assessment/', FPAssessmentListCreateView.as_view(), name='fp_assessment_list_create'),
    path('assessment/<int:fp_assessment_id>/', FPAssessmentDetailView.as_view(), name='fp_assessment_detail'),

    # Pelvic Exam CRUD
    path('pelvic_exam/', PelvicExamListCreateView.as_view(), name='pelvic_exam_list_create'),
    path('pelvic_exam/<int:pelvic_id>/', PelvicExamDetailView.as_view(), name='pelvic_exam_detail'),

    # Acknowledgement CRUD
    path('acknowledgement/', AcknowledgementListCreateView.as_view(), name='acknowledgement_list_create'),
    path('acknowledgement/<int:ack_id>/', AcknowledgementDetailView.as_view(), name='acknowledgement_detail'),

    # Obstetrical History CRUD
    path('obstetrical/', FP_ObstetricalListCreateView.as_view(), name='obstetrical_list_create'),
    path('obstetrical/<int:fpob_id>/', FP_ObstetricalDetailView.as_view(), name='obstetrical_detail'),

    # Pregnancy Check CRUD
    path('fp_pregnancycheck/', FP_PregnancyCheckListCreateView.as_view(), name='fp_pregnancycheck_list_create'),
    path('fp_pregnancycheck/<int:fp_pc_id>/', FP_PregnancyCheckDetailView.as_view(), name='fp_pregnancycheck_detail'),

    # Special endpoints
    path('complete_record/<int:fprecord_id>/', get_complete_fp_record, name='get_complete_fp_record'),
    path('delete_complete/<int:fprecord_id>/', delete_complete_fp_record, name='delete_complete_fp_record'),

    # NEW: Endpoint for the overall table (unique patients with conditional record info)
    path('patients-overview/', PatientListForOverallTable.as_view(), name='patients_overall_table'),

    # NEW: Endpoint to get all FP records for a specific patient (for Individual.tsx)
    path('fp-records-by-patient/<int:patient_id>/', get_fp_records_for_patient, name='fp_records_by_patient'),

    # Removed the old commented out path: # path('records_list/', get_fp_records_list, name='get_fp_records_list'),
]
