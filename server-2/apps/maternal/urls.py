from django import views
from django.urls import path
from .views.views import *
from apps.maternal.views import *
from .views.postpartum_views import *
from .views.prenatal_views import *
from .views.pregnancy_views import *

urlpatterns=[
    # Maternal
    path('maternal-patients/charts/<str:month>/', MaternalPatientsListView.as_view(), name='maternal-patients-charts'),
    path('maternal-patients/', MaternalPatientListView.as_view(), name='get-maternal-patients'),
	path('counts/', MaternalCountView.as_view(), name='maternal-count'),
   
    # Prenatal Appointment Request URLs
    path('prenatal/appointment/request/', PrenatalAppointmentRequestCreateListView.as_view(), name='prenatal-appointment-request'),
    path('prenatal/appointment/requests/all/', PrenatalAppointmentRequestViewAll.as_view(), name='prenatal-appointment-requests-all'),
    path('prenatal/appointment/requests/<str:rp_id>/', PrenatalAppointmentRequestView.as_view(), name='prenatal-appointment-requests-list'),
    path('prenatal/appointment/cancel/<str:par_id>/', PrenatalAppointmentCancellationView.as_view(), name='prenatal-appointment-cancel'),
    path('prenatal/appointment/requests/<str:rp_id>/', PrenatalAppointmentRequestView.as_view(), name='prenatal-appointment-requests-detail-list'),
    path('prenatal/appointment/request/<int:par_id>/approve/', PrenatalAppointmentRequestApproveView.as_view(), name='prenatal-appointment-approve'),
    path('prenatal/appointment/request/<int:par_id>/reject/', PrenatalAppointmentRequestRejectView.as_view(), name='prenatal-appointment-reject'),
    
    # Pregnancy URLs
    path('pregnancy/<str:pat_id>/details/', PatientPregnancyRecordsListView.as_view(), name='pregnancy-records-details' ),
    path('pregnancy/complete/', CompletePregnancyView.as_view(), name='pregnancy-complete'),
    path('pregnancy/loss/', PregLossPregnancyView.as_view(), name='pregnancy-loss'),

    # Prenatal URLs
    path('patient/<str:pat_id>/medicalhistory/', PrenatalPatientMedHistoryView.as_view(), name='prenatal-patient-medical-history'),
    path('patient/<str:pat_id>/obstetricalhistory/', PrenatalPatientObsHistoryView.as_view(), name='prenatal-patient-obstetrical-history'),
	path('patient/<str:pat_id>/bodymeasurement/', PrenatalPatientBodyMeasurementView.as_view(), name='prenatal-patient-body-measurement'),
	path('patient/<str:pat_id>/followupvisits/', get_prenatal_followup_visit, name='prenatal-patient-followup-visit'),
    path('patient/<str:pat_id>/previoushospitalization/', get_prenatal_prev_hospitalization, name='prenatal-patient-previous-hospitalization'),
	path('patient/<str:pat_id>/previouspregnancy/', get_prenatal_prev_pregnancy, name='prenatal-patient-previous-pregnancy'),
    path('patient/<str:pat_id>/ttstatus/', get_prenatal_patient_tt_status, name="prenatal-patient-tt-status"),
    path('patient/<str:pat_id>/prenatalcare/', get_prenatal_records_with_care, name='prenatal-patient-care-records'),
    path('patient/<str:pat_id>/ttstatus/', get_prenatal_patient_tt_status, name="prenatal-patient-tt-status"),
    path('patient/<str:pat_id>/prenatalcare/', get_prenatal_records_with_care, name='prenatal-patient-care-records'),

    path("prenatal-record/", PrenatalRecordCreateView.as_view(), name="prenatal-record-create"),
    path('prenatal/records/', PrenatalRecordsListView.as_view(), name='prenatal-records-list'),
	path('patient/<str:pat_id>/prenatal_count/', get_patient_prenatal_count, name='patient-prenatal-count'),
    path('prenatal/<str:pat_id>/latest/', get_latest_patient_prenatal_record, name='latest-prenatal-record'),
    path('prenatal/<str:pf_id>/complete/', get_prenatal_form_complete, name='prenatal-form-complete'),
    path('prenatal/missed-visits/<str:pregnancy_id>/', views.calculate_missed_visits_by_pregnancy, name='calculated-missed-visits'),
    path('prenatal/illnesses/', get_illness_list, name='illness-list'),
    path('prenatal/illness/create/', IllnessCreateView.as_view(), name='illness-create'),

    # Postpartum URLs
    path('postpartum_record/', PostpartumRecordCreateView.as_view(), name='postpartum-record-create'),
    path('patient/<str:pat_id>/postpartum_count/', get_patient_postpartum_count, name='patient-postpartum-count'),
    path('postpartum/<str:pat_id>/latest/', get_latest_patient_postpartum_records, name='patient-postpartum-records'),   
    path('postpartum/<str:pregnancy_id>/all/', PostpartumRecordsListView.as_view(), name='all-postpartum-records'),
    path('postpartum/<str:ppr_id>/complete/', PostpartumPartumFormView.as_view(), name='postpartum-form-complete'),
    path('postpartum/<str:pat_id>/postpartum-assessments/', PostpartumAssessmentsWithVitalsListView.as_view(), name='postpartum-assessment-care'),
]