from django.urls import path
from .views import *
from .views import (
    PostpartumRecordCreateView,
    get_postpartum_records,
    get_postpartum_record_detail
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
]