from django.urls import path
from .views import *
from . import views
from .views import (
    PostpartumRecordCreateView,
	get_patient_postpartum_count,
    get_patient_postpartum_records,
	get_patient_pregnancy_records,
	get_patient_prenatal_count
)

urlpatterns=[
    path('maternal-patients/', views.get_maternal_patients, name='get-maternal-patients'),
    path('pregnancy/<str:pat_id>/details/', get_patient_pregnancy_records, name='pregnancy-records-details' ),
    path('patient/<str:pat_id>/medicalhistory', PrenatalPatientMedHistoryView.as_view(), name='prenatal-patient-medical-history'),
    path('patient/<str:pat_id>/obstetricalhistory', PrenatalPatientObsHistoryView.as_view(), name='prenatal-patient-obstetrical-history'),
	path('patient/<str:pat_id>/bodymeasurement', PrenatalPatientBodyMeasurementView.as_view(), name='prenatal-patient-body-measurement'),

    path("prenatal-record/", PrenatalRecordCreateView.as_view(), name="prenatal-record"),
	path('patient/<str:pat_id>/prenatal_count/', get_patient_prenatal_count, name='patient-prenatal-count'),
	 
    path('postpartum_record/', PostpartumRecordCreateView.as_view(), name='postpartum-record-create'),
    path('patient/<str:pat_id>/postpartum_count/', get_patient_postpartum_count, name='patient-postpartum-count'),
    path('patient/<str:pat_id>/postpartum_records/', get_patient_postpartum_records, name='patient-postpartum-records'),   
]


