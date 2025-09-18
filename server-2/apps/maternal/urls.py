from django.urls import path
from . import views
from .views import *

urlpatterns=[
    path('maternal-patients/', views.get_maternal_patients, name='get-maternal-patients'),
	path('pregnancy_count/', get_all_active_pregnancies, name='active-pregnancies-count'),
    path('pregnancy/<str:pat_id>/details/', get_patient_pregnancy_records, name='pregnancy-records-details' ),

    path('patient/<str:pat_id>/medicalhistory/', PrenatalPatientMedHistoryView.as_view(), name='prenatal-patient-medical-history'),
    path('patient/<str:pat_id>/obstetricalhistory/', PrenatalPatientObsHistoryView.as_view(), name='prenatal-patient-obstetrical-history'),
	path('patient/<str:pat_id>/bodymeasurement/', PrenatalPatientBodyMeasurementView.as_view(), name='prenatal-patient-body-measurement'),
	path('patient/<str:pat_id>/followupvisits/', get_prenatal_followup_visit, name='prenatal-patient-followup-visit'),
    path('patient/<str:pat_id>/previoushospitalization/', get_prenatal_prev_hospitalization, name='prenatal-patient-previous-hospitalization'),
	path('patient/<str:pat_id>/previouspregnancy/', get_prenatal_prev_pregnancy, name='prenatal-patient-previous-pregnancy'),
    path('patient/<str:pat_id>/ttstatus/', get_prenatal_patient_tt_status, name="prenatal-patient-tt-status"),
    path('patient/<str:pat_id>/prenatalcare/', get_prenatal_records_with_care, name='prenatal-patient-care-records'),

    path("prenatal-record/", PrenatalRecordCreateView.as_view(), name="prenatal-record"),
	path('patient/<str:pat_id>/prenatal_count/', get_patient_prenatal_count, name='patient-prenatal-count'),
    path('prenatal/<str:pat_id>/latest/', get_latest_patient_prenatal_record, name='latest-prenatal-record'),
    path('prenatal/<str:pf_id>/complete/', get_prenatal_form_complete, name='prenatal-form-complete'),
    path('prenatal/missed-visits/<str:pregnancy_id>/', views.calculate_missed_visits_by_pregnancy, name='calculated-missed-visits'),
    path('prenatal/illnesses/', get_illness_list, name='illness-list'),
    path('prenatal/illness/create/', IllnessCreateView.as_view(), name='illness-create'),

    path('postpartum_record/', PostpartumRecordCreateView.as_view(), name='postpartum-record-create'),
    path('patient/<str:pat_id>/postpartum_count/', get_patient_postpartum_count, name='patient-postpartum-count'),
    path('postpartum/<str:pat_id>/latest/', get_latest_patient_postpartum_records, name='patient-postpartum-records'),   
]


