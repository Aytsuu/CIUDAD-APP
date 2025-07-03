from django.urls import path
from .views import *
from . import views
from .views import (
    PostpartumRecordCreateView,
    get_postpartum_records,
    get_postpartum_record_detail,
	get_patient_postpartum_count,
    get_patient_postpartum_records,
)

urlpatterns=[
    path("prenatal_record/", PrenatalRecordCreateView.as_view(), name="prenatal-record"),
    path("previous_hospitalization/", PreviousHospitalizationView.as_view(), name="previous-hospitalization"),
    path("previous_pregnancy/", PreviousPregnancyView.as_view(), name="previous-pregnancy"),
    path("tt_status/", TTStatusView.as_view(), name="tt-status"),
    # path("lab_result_dates/", LabResultDatesView.as_view(), name="lab-result"),
    path("guide4ancvisit/", Guide4ANCVisitView.as_view(), name="guide-4anc-visit"),
    path("checklist/", ChecklistView.as_view(), name="checklist"),
    # path("birthplan/", BirthPlanView.as_view(), name="birth-plan")

    path('postpartum_record/', PostpartumRecordCreateView.as_view(), name='postpartum-record-create'),
    path('postpartum_records/', get_postpartum_records, name='postpartum-records-list'),
    path('postpartum_record/<str:ppr_id>/', get_postpartum_record_detail, name='postpartum-record-detail'),
    path('patient/<str:pat_id>/postpartum_count/', get_patient_postpartum_count, name='patient-postpartum-count'),
    path('patient/<str:pat_id>/postpartum_records/', get_patient_postpartum_records, name='patient-postpartum-records'),
	path('maternal-patients/', views.get_maternal_patients, name='get_maternal_patients'),
]