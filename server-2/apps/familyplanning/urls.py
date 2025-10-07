from django import views
from django import views
from django.urls import path
from .views import *
from .mappings.mappings import *

urlpatterns = [
    # path('monthly-list/', get_monthly_fp_list, name='monthly-fp-list'),
    path('illnesses/create_or_get/', get_or_create_illness, name='create_or_get_illness'),
    # path('familyplanning/illnesses/by_ids/', get_illnesses_by_ids, name='get_illnesses_by_ids'),
    path('last-previous-pregnancy/<str:patient_id>/', get_last_previous_pregnancy, name='last-pregnancy'),
    path('patient-details/<str:patient_id>/', get_patient_details_data, name='get_patient_details'),
    path('monthly-report/<int:year>/<int:month>/', get_detailed_monthly_fp_report, name='monthly-fp-report'),
    path('body-measurements/<str:pat_id>/', get_body_measurements, name='body-measurements'),
    path('obstetrical-history/<str:pat_id>/', get_obstetrical_history, name='obstetrical-history'),
    path('commodity-stock/<str:commodity_name>/', get_commodity_stock, name='get_commodity_stock'),
    path('complete-fp-record/<int:fprecord_id>/', get_complete_fp_record, name='get_complete_fp_record'),
    path('latest-fp-record-by-patient/<str:patient_id>/', get_latest_fp_record_for_patient, name='get_latest_fp_record_for_patient'),
    path('overall-records/', PatientListForOverallTable.as_view(), name='fp-overall-list'), # Overall table with counts
    path('fp-records-by-patient/<str:patient_id>/', get_fp_records_for_patient, name='get_fp_records_by_patient'), # All records for one patient
    path('patient-counts/', get_fp_patient_counts, name='fp-patient-counts'),
    # Individual FP Record CRUD (if needed separately from composite)
    path('fp_record/', FP_RecordListCreateView.as_view(), name='fp_record_list_create'),
    # path('fp_record/<int:fprecord_id>/', FP_RecordDetailView.as_view(), name='fp_record_detail'),

  
    # Patient Record CRUD (if needed separately)
    path('patient-record/', PatientRecordCreateView.as_view(), name='patient_record_create'), 
    path('commodities/filtered/',get_filtered_commodity_list, name='filtered_commodity_list'),

    path('submit-full-form/', submit_full_family_planning_form, name='submit_full_family_planning_form'),
    path('commodity-stock/<str:commodity_name>/', get_commodity_stock, name='get_commodity_stock'),
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
    path('assessment/', FPAssessmentListCreateView.as_view(), name='assessment_list_create'),
    path('assessment/<int:fpassessment_id>/', FPAssessmentDetailView.as_view(), name='assessment_detail'), 

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
    
    path('illnesses/', get_illness_list, name='get_illness_list'),
    # path('medical-history/create/', create_medical_history_records, name='create_medical_history'),
    path('medical-history/<str:patrec_id>/', get_patient_medical_history, name='get_patient_medical_history'),
    
    path('submit-full-form/', submit_full_family_planning_form, name='submit_full_family_planning_form'),
    
    # NEW: Path for submitting a follow-up record
    path('submit-follow-up-form/', submit_follow_up_family_planning_form, name='submit_follow_up_family_planning_form'),
    path('overall-records/', PatientListForOverallTable.as_view(), name='fp-overall-list'),
    path('fp-records/', PatientListForOverallTable.as_view(), name='fp-records-paginated'),
    # path('familyplanning/submit-followup/', submit_followup_family_planning_form, name='submit_followup_family_planning_form'),
    # path('count/<str:pat_id>/', FPRecordCountView.as_view(), name='fp-records-count-by-patient'),

]
