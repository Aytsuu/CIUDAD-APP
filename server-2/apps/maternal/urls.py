from django.urls import path
from .views import *

urlpatterns=[
    path("prenatal_record/", PrenatalFormView.as_view(), name="prenatalrecord"),
    path("obstetrical_history/", ObstetricalHistoryView.as_view, name="obstetricalhistory"),
    path("previous_hospitalization/", PreviousHospitalizationView.as_view(), name="previoushospitalization"),
    path("previous_pregnancy/", PreviousPregnancyView.as_view(), name="previouspregnancy"),
    path("tt_status/", TTStatusView.as_view(), name="ttstatus"),
    path("lab_result_dates/", LabResultDatesView.as_view(), name="labresult"),
]