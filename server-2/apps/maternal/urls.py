from django.urls import path
from .views import *
from . import views
from .views import (
    PostpartumRecordCreateView,
	get_patient_postpartum_count,
    get_patient_postpartum_records,
	get_patient_pregnancy_records,
	get_patient_prenatal_count,
	get_all_active_pregnancies,
	get_prenatal_followup_visit,
	get_prenatal_prev_hospitalization,
    get_prenatal_prev_pregnancy,
)

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

    path("prenatal-record/", PrenatalRecordCreateView.as_view(), name="prenatal-record"),
	path('patient/<str:pat_id>/prenatal_count/', get_patient_prenatal_count, name='patient-prenatal-count'),
	 
    path('postpartum_record/', PostpartumRecordCreateView.as_view(), name='postpartum-record-create'),
    path('patient/<str:pat_id>/postpartum_count/', get_patient_postpartum_count, name='patient-postpartum-count'),
    path('patient/<str:pat_id>/postpartum_records/', get_patient_postpartum_records, name='patient-postpartum-records'),   
]