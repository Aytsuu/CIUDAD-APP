from django.urls import path
from .views import *

urlpatterns=[
    path("prenatal_record/", PrenatalFormView.as_view(), name="prenatal-record"),
    path("previous_hospitalization/", PreviousHospitalizationView.as_view(), name="previous-hospitalization"),
    path("previous_pregnancy/", PreviousPregnancyView.as_view(), name="previous-pregnancy"),
    path("tt_status/", TTStatusView.as_view(), name="tt-status"),
    path("lab_result_dates/", LabResultDatesView.as_view(), name="lab-result"),
]