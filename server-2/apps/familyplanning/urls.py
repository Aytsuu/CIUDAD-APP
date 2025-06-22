from django.urls import path
from .views import *

urlpatterns = [
    # NEW: Composite endpoint for creating/updating a complete FP record (all pages in one go)
    path('complete-record/', FamilyPlanningCreateUpdateView.as_view(), name='fp_complete_record_create'),
    path('complete-record/<int:fprecord_id>/', FamilyPlanningCreateUpdateView.as_view(), name='fp_complete_record_update'), # For PUT requests

    # NEW: Endpoint for fetching comprehensive patient details (for Page 1 auto-fill)
    path('patient-details/<str:patient_id>/', get_patient_details, name='get_patient_details'),

    # NEW: Endpoint for fetching a complete FP record (for edit/view mode)
    path('complete-fp-record/<int:fprecord_id>/', get_complete_fp_record, name='get_complete_fp_record'),
    # NEW: Endpoints for overall table and individual patient FP records
    # path('patients-with-fp-records/', get_patients_with_fp_records, name='patients_with_fp_records'),
    path('fp-records-by-patient/<str:patient_id>/', get_fp_records_for_patient, name='get_fp_records_by_patient'),


    # FP Record CRUD (Individual FP_Record, if needed separately from composite)
    path('fp_record/', FP_RecordListCreateView.as_view(), name='fp_record_list_create'),
    path('fp_record/<int:fprecord_id>/', FP_RecordDetailView.as_view(), name='fp_record_detail'),

    # Patient Record CRUD (if needed separately)
    path('patient-record/', PatientRecordCreateView.as_view(), name='patient_record_create'), # Ensure this is compatible or remove if composite handles it

    # FP Type CRUD
    path('fp_type/', FP_TypeListCreateView.as_view(), name='fp_type_list_create'),
    path('fp_type/<int:fpt_id>/', FP_TypeDetailView.as_view(), name='fp_type_detail'),

    # Risk STI CRUD
    path('risk_sti/', RiskStiListCreateView.as_view(), name='risk_sti_list_create'),
    path('risk_sti/<int:sti_id>/', RiskStiDetailView.as_view(), name='risk_sti_detail'),

    # Risk VAW CRUD
    path('risk_vaw/', RiskVawListCreateView.as_view(), name='risk_vaw_list_create'),
    path('risk_vaw/<int:vaw_id>/', RiskVawDetailView.as_view(), name='risk_vaw_detail'),
    # path('overall-records/',FamilyPlanninOverallListView.as_view(), name='fp-overall-list'),
    # Physical Exam CRUD
    path('physical_exam/', PhysicalExamListCreateView.as_view(), name='physical_exam_list_create'),
    path('physical_exam/<int:fp_pe_id>/', PhysicalExamDetailView.as_view(), name='physical_exam_detail'),

    # Assessment CRUD
    path('assessment/', FPAssessmentListCreateView.as_view(), name='assessment_list_create'),
    path('assessment/<int:fpassessment_id>/', FPAssessmentDetailView.as_view(), name='assessment_detail'), # Corrected lookup field

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
    # path('complete_record/<int:fprecord_id>/', get_complete_fp_record, name='get_complete_fp_record'), # Replaced by new get_complete_fp_record
    path('delete_complete/<int:fprecord_id>/', delete_complete_fp_record, name='delete_complete_fp_record'),

    # Patient list for overall table - assuming this is distinct patients, not FP_Records
    # path('patients-for-overall-table/', PatientListForOverallTable.as_view(), name='patients_for_overall_table'), # Replaced by get_patients_with_fp_records
]
