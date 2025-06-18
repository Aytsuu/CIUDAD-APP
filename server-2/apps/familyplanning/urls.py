from django.urls import path
from .views import (
    FP_RecordListCreateView, FP_RecordDetailView,
    PatientRecordCreateView, # Assuming this is shared
    FP_TypeListCreateView, FP_TypeDetailView,
    RiskStiListCreateView, RiskStiDetailView,
    RiskVawListCreateView, RiskVawDetailView,
    PhysicalExamListCreateView, PhysicalExamDetailView,
    FPAssessmentListCreateView, FPAssessmentDetailView, # Added Assessment views
    PelvicExamListCreateView, PelvicExamDetailView,
    AcknowledgementListCreateView, AcknowledgementDetailView,
    FP_ObstetricalListCreateView, FP_ObstetricalDetailView,
    FP_PregnancyCheckListCreateView, FP_PregnancyCheckDetailView,
    get_complete_fp_record, delete_complete_fp_record,
    PatientListForOverallTable, # New view for overall table
    get_fp_records_for_patient, # New view for individual patient FP records
    FamilyPlanningCreateUpdateView # New composite create/update view
)


urlpatterns = [
    # NEW: Composite endpoint for creating/updating a complete FP record (all pages in one go)
    path('complete-record/', FamilyPlanningCreateUpdateView.as_view(), name='fp_complete_record_create_update'),

    # FP Record CRUD (Individual FP_Record, if needed separately from composite)
    path('fp_record/', FP_RecordListCreateView.as_view(), name='fp_record_list_create'),
    path('fp_record/<int:fprecord_id>/', FP_RecordDetailView.as_view(), name='fp_record_detail'),

    # PatientRecord creation (if applicable, possibly shared with other apps)
    path('patient-record/', PatientRecordCreateView.as_view(), name='patientrecord_create'),

    # FP Type CRUD
    path('fp_type/', FP_TypeListCreateView.as_view(), name='fp_type_list_create'),
    path('fp_type/<int:fpt_id>/', FP_TypeDetailView.as_view(), name='fp_type_detail'),

    # Risk STI CRUD
    path('risk_sti/', RiskStiListCreateView.as_view(), name='risk_sti_list_create'),
    path('risk_sti/<int:sti_id>/', RiskStiDetailView.as_view(), name='risk_sti_detail'),

    # Risk VAW CRUD
    path('risk_vaw/', RiskVawListCreateView.as_view(), name='risk_vaw_list_create'),
    path('risk_vaw/<int:vaw_id>/', RiskVawDetailView.as_view(), name='risk_vaw_detail'),

    # Physical Exam CRUD
    path('physical_exam/', PhysicalExamListCreateView.as_view(), name='physical_exam_list_create'),
    path('physical_exam/<int:fp_pe_id>/', PhysicalExamDetailView.as_view(), name='physical_exam_detail'),

    # Assessment CRUD 
    path('assessment/', FPAssessmentListCreateView.as_view(), name='fp_assessment_list_create'),
    path('assessment/<int:assessment_id>/', FPAssessmentDetailView.as_view(), name='fp_assessment_detail'), # Corrected lookup_field

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

    path('fp-records-by-patient/<str:patient_id>/', get_fp_records_for_patient, name='fp_records_by_patient'),
]