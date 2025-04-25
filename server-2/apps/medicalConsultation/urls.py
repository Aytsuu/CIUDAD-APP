from django.urls import path
from .views import *

urlpatterns=[
    path('all-medical-consultation-record/', PatientMedConsultationRecordView.as_view(), name='patient-medical-consultation-record'),
    path('medical-consultation-record/', MedicalConsultationRecordView.as_view(), name='medical-consultation-record'),
 
]